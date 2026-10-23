import { createHmac, timingSafeEqual } from "node:crypto";
import { and, count, eq, gte, inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { businesses, improvementActions, leads, memberships, notificationLog, notificationPrefs, users } from "@/db/schema";
import { sendEmail } from "@/lib/auth/mailer";
import type { Ctx } from "./context";
import { visibilitySummary } from "./monitoring/service";

export type PrefKind = "weeklySummary" | "leadAlerts";

function secret() {
  const s = process.env.APP_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("APP_SECRET is required in production");
  return s || "dev-only-app-secret";
}

export function unsubscribeToken(userId: string, workspaceId: string, kind: PrefKind) {
  return createHmac("sha256", secret()).update(`${userId}:${workspaceId}:${kind}`).digest("hex");
}

export function verifyUnsubscribe(userId: string, workspaceId: string, kind: PrefKind, token: string) {
  const want = Buffer.from(unsubscribeToken(userId, workspaceId, kind), "hex");
  const got = Buffer.from(token, "hex");
  return want.length === got.length && timingSafeEqual(want, got);
}

function appUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

function unsubscribeLink(userId: string, workspaceId: string, kind: PrefKind) {
  return `${appUrl()}/unsubscribe?${new URLSearchParams({ u: userId, w: workspaceId, k: kind, t: unsubscribeToken(userId, workspaceId, kind) })}`;
}

export async function getPrefs(db: Db, ctx: Pick<Ctx, "userId" | "workspaceId">) {
  const [p] = await db.select().from(notificationPrefs).where(and(eq(notificationPrefs.userId, ctx.userId), eq(notificationPrefs.workspaceId, ctx.workspaceId)));
  return p ?? { userId: ctx.userId, workspaceId: ctx.workspaceId, weeklySummary: false, leadAlerts: true, updatedAt: new Date() };
}

export async function setPrefs(db: Db, ctx: Pick<Ctx, "userId" | "workspaceId">, values: Partial<Record<PrefKind, boolean>>) {
  await db
    .insert(notificationPrefs)
    .values({ userId: ctx.userId, workspaceId: ctx.workspaceId, ...values })
    .onConflictDoUpdate({ target: [notificationPrefs.userId, notificationPrefs.workspaceId], set: { ...values, updatedAt: new Date() } });
}

/** Sends once per dedupe key; a repeat is a silent no-op. */
async function sendOnce(db: Db, dedupeKey: string, userId: string, kind: string, email: Parameters<typeof sendEmail>[0]) {
  const inserted = await db.insert(notificationLog).values({ dedupeKey, userId, kind }).onConflictDoNothing().returning({ id: notificationLog.id });
  if (inserted.length === 0) return false;
  await sendEmail(email);
  return true;
}

/** New-lead alert to owners and editors who haven't turned alerts off. Contains no lead details. */
export async function notifyNewLead(db: Db, workspaceId: string, leadId: string) {
  const rows = await db
    .select({ userId: users.id, email: users.email, pref: notificationPrefs.leadAlerts })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .leftJoin(notificationPrefs, and(eq(notificationPrefs.userId, users.id), eq(notificationPrefs.workspaceId, workspaceId)))
    .where(and(eq(memberships.workspaceId, workspaceId), inArray(memberships.role, ["owner", "editor"])));
  for (const r of rows) {
    if (r.pref === false) continue;
    await sendOnce(db, `lead:${leadId}:${r.userId}`, r.userId, "lead_alert", {
      to: r.email,
      subject: "New enquiry from your website",
      text: `You have a new enquiry. Open your leads to read and reply:\n${appUrl()}/app/leads\n\nStop these alerts: ${unsubscribeLink(r.userId, workspaceId, "leadAlerts")}`,
    });
  }
}

/** Weekly opt-in summary. */
export async function sendWeeklySummaries(db: Db, weekKey: string) {
  const subscribed = await db
    .select({ userId: notificationPrefs.userId, workspaceId: notificationPrefs.workspaceId, email: users.email, role: memberships.role })
    .from(notificationPrefs)
    .innerJoin(users, eq(users.id, notificationPrefs.userId))
    .innerJoin(memberships, and(eq(memberships.userId, notificationPrefs.userId), eq(memberships.workspaceId, notificationPrefs.workspaceId)))
    .where(eq(notificationPrefs.weeklySummary, true));
  let sent = 0;
  for (const s of subscribed) {
    const ctx = { userId: s.userId, workspaceId: s.workspaceId, role: s.role } as Ctx;
    const [b] = await db.select().from(businesses).where(eq(businesses.workspaceId, s.workspaceId)).limit(1);
    if (!b) continue;
    const weekAgo = new Date(Date.now() - 7 * 86_400_000);
    const [[{ n: newLeads }], [{ n: openTasks }], vis] = await Promise.all([
      db.select({ n: count() }).from(leads).where(and(eq(leads.workspaceId, s.workspaceId), gte(leads.createdAt, weekAgo))),
      db.select({ n: count() }).from(improvementActions).where(and(eq(improvementActions.workspaceId, s.workspaceId), inArray(improvementActions.status, ["proposed", "owner_edited", "approved"]))),
      visibilitySummary(db, ctx, 7),
    ]);
    const m = vis.metrics;
    const visLine = m.valid > 0 && m.mention.rate !== null ? `AI answers mentioning you: ${m.mention.numerator} of ${m.mention.denominator}${m.smallSample ? " (small sample)" : ""}` : "AI visibility: no valid answers collected this week";
    if (
      await sendOnce(db, `weekly:${s.workspaceId}:${s.userId}:${weekKey}`, s.userId, "weekly_summary", {
        to: s.email,
        subject: `Your week at ${b.name}`,
        text: [`New enquiries: ${newLeads}`, visLine, `Improvement tasks waiting: ${openTasks}`, "", `${appUrl()}/app`, "", `Unsubscribe: ${unsubscribeLink(s.userId, s.workspaceId, "weeklySummary")}`].join("\n"),
      })
    )
      sent++;
  }
  return sent;
}

/**
 * Monthly nudge to owners whose details haven't been confirmed in 30 days.
 * Opt-in (same preference as the weekly summary), once per month per owner.
 */
export async function sendConfirmReminders(db: Db, monthKey: string) {
  const cutoff = new Date(Date.now() - 30 * 86_400_000);
  const subscribed = await db
    .select({ userId: notificationPrefs.userId, workspaceId: notificationPrefs.workspaceId, email: users.email })
    .from(notificationPrefs)
    .innerJoin(users, eq(users.id, notificationPrefs.userId))
    .innerJoin(memberships, and(eq(memberships.userId, notificationPrefs.userId), eq(memberships.workspaceId, notificationPrefs.workspaceId)))
    .where(and(eq(notificationPrefs.weeklySummary, true), eq(memberships.role, "owner")));
  let sent = 0;
  for (const s of subscribed) {
    const [b] = await db.select({ name: businesses.name, confirmedAt: businesses.publicContactConfirmedAt }).from(businesses).where(eq(businesses.workspaceId, s.workspaceId)).limit(1);
    if (!b || (b.confirmedAt && b.confirmedAt > cutoff)) continue;
    const ok = await sendOnce(db, `confirm:${s.workspaceId}:${s.userId}:${monthKey}`, s.userId, "confirm_reminder", {
      to: s.email,
      subject: `Are ${b.name}'s details still correct?`,
      text: [
        `A quick monthly check keeps ${b.name} fresh for AI assistants and search engines, which favour recently confirmed details.`,
        "",
        `If nothing changed, one click confirms everything: ${appUrl()}/app`,
        `If something changed, update it here: ${appUrl()}/app/business`,
        "",
        `Unsubscribe: ${unsubscribeLink(s.userId, s.workspaceId, "weeklySummary")}`,
      ].join("\n"),
    });
    if (ok) sent += 1;
  }
  return sent;
}

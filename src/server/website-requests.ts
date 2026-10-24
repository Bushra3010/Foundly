import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { z } from "zod";
import type { Db } from "@/db";
import { auditEvents, businesses, memberships, users, websiteRequests, type WebsiteRequest } from "@/db/schema";
import { sendEmail } from "@/lib/auth/mailer";
import type { websiteRequestSchema } from "@/lib/validation";
import type { AdminCtx } from "./admin";
import { requireBusiness } from "./business";
import { AppError, audit, requireRole, type Ctx } from "./context";

/**
 * Foundly doesn't generate websites. Owners without one send a short brief,
 * the team contacts them and builds it with whatever tool suits the business,
 * and on delivery the address becomes the business's connected website.
 */

export const OPEN_STATUSES = ["new", "contacted", "in_progress"] as const;
export type RequestStatus = WebsiteRequest["status"];

export const STATUS_TEXT: Record<RequestStatus, string> = {
  new: "Request received",
  contacted: "We've been in touch",
  in_progress: "Being built",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const CONTACT_TEXT: Record<WebsiteRequest["contactMethod"], string> = {
  phone: "Phone call",
  whatsapp: "WhatsApp",
  video: "Video call",
};

const isOpen = (s: RequestStatus) => (OPEN_STATUSES as readonly string[]).includes(s);

function appUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
}

/** The workspace's most recent request, open or not. */
export async function latestWebsiteRequest(db: Db, ctx: Ctx) {
  const [r] = await db
    .select()
    .from(websiteRequests)
    .where(eq(websiteRequests.workspaceId, ctx.workspaceId))
    .orderBy(desc(websiteRequests.createdAt))
    .limit(1);
  return r ?? null;
}

export async function createWebsiteRequest(db: Db, ctx: Ctx, input: z.infer<typeof websiteRequestSchema>) {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  if (b.hasWebsite) throw new AppError("conflict", "You already have a website connected. Remove it in My Business first.");
  const [r] = await db
    .insert(websiteRequests)
    .values({ workspaceId: ctx.workspaceId, businessId: b.id, requestedBy: ctx.userId, ...input })
    .onConflictDoNothing()
    .returning();
  if (!r) throw new AppError("conflict", "You already have a website request with us. We'll be in touch soon.");
  await audit(db, ctx, "website_request.created", r.id);

  const to = adminEmails();
  if (to.length) {
    const lines = [
      `${b.name} (${b.category}, ${b.city}) asked Foundly to build their website.`,
      "",
      `Goal: ${r.goal}`,
      r.pages && `Pages: ${r.pages}`,
      r.style && `Style: ${r.style}`,
      r.examples && `Sites they like:\n${r.examples}`,
      "",
      `Contact by ${CONTACT_TEXT[r.contactMethod]}: ${r.contactValue}${r.contactTime ? ` (${r.contactTime})` : ""}`,
      "",
      `Open the request: ${appUrl()}/admin/websites`,
    ];
    for (const email of to) {
      await sendEmail({ to: email, subject: `Website request: ${b.name}`, text: lines.filter((l) => typeof l === "string").join("\n") });
    }
  }
  return r;
}

export async function cancelWebsiteRequest(db: Db, ctx: Ctx) {
  requireRole(ctx, "editor");
  const [r] = await db
    .update(websiteRequests)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(websiteRequests.workspaceId, ctx.workspaceId), inArray(websiteRequests.status, [...OPEN_STATUSES])))
    .returning();
  if (!r) throw new AppError("not_found", "There's no open request to cancel.");
  await audit(db, ctx, "website_request.cancelled", r.id);
}

// ---------- Foundly team ----------

export async function listWebsiteRequests(db: Db, which: "open" | "all" = "open") {
  return db
    .select({
      request: websiteRequests,
      business: businesses.name,
      category: businesses.category,
      city: businesses.city,
      requester: users.email,
    })
    .from(websiteRequests)
    .innerJoin(businesses, eq(businesses.id, websiteRequests.businessId))
    .leftJoin(users, eq(users.id, websiteRequests.requestedBy))
    .where(which === "open" ? inArray(websiteRequests.status, [...OPEN_STATUSES]) : undefined)
    .orderBy(desc(websiteRequests.createdAt))
    .limit(200);
}

async function openRequest(db: Db, id: string) {
  const [r] = await db.select().from(websiteRequests).where(eq(websiteRequests.id, id));
  if (!r) throw new AppError("not_found", "Request not found.");
  if (!isOpen(r.status)) throw new AppError("conflict", "This request is already closed.");
  return r;
}

/** Moves a request along and leaves a note the owner can read. */
export async function updateWebsiteRequest(
  db: Db,
  admin: AdminCtx,
  id: string,
  status: "contacted" | "in_progress" | "cancelled",
  note: string,
) {
  const r = await openRequest(db, id);
  const teamNote = note.trim().slice(0, 1000) || r.teamNote;
  await db.update(websiteRequests).set({ status, teamNote, updatedAt: new Date() }).where(eq(websiteRequests.id, r.id));
  await db.insert(auditEvents).values({ workspaceId: r.workspaceId, actorUserId: admin.userId, action: "admin.website_request_updated", target: r.id, data: { status, admin: admin.email } });
}

/**
 * Hands the finished website over: its address becomes the business's
 * connected website, so audits, fixes and AI tracking work on it.
 */
export async function deliverWebsiteRequest(db: Db, admin: AdminCtx, id: string, url: string, note: string) {
  const r = await openRequest(db, id);
  await db.transaction(async (tx) => {
    const now = new Date();
    await tx
      .update(websiteRequests)
      .set({ status: "delivered", deliveredUrl: url, deliveredAt: now, teamNote: note.trim().slice(0, 1000) || r.teamNote, updatedAt: now })
      .where(eq(websiteRequests.id, r.id));
    await tx
      .update(businesses)
      .set({ hasWebsite: true, websiteUrl: url, version: sql`${businesses.version} + 1`, updatedAt: now })
      .where(eq(businesses.id, r.businessId));
    await tx.insert(auditEvents).values({ workspaceId: r.workspaceId, actorUserId: admin.userId, action: "admin.website_delivered", target: r.id, data: { url, admin: admin.email } });
  });

  const owners = await db
    .select({ email: users.email })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(and(eq(memberships.workspaceId, r.workspaceId), inArray(memberships.role, ["owner", "editor"])));
  for (const o of owners) {
    await sendEmail({
      to: o.email,
      subject: "Your new website is ready",
      text: `Your website is live at ${url}\n\nIt's now connected to Foundly. Check it and track how AI assistants mention you:\n${appUrl()}/app/website`,
    });
  }
}

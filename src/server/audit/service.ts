import { createHash } from "node:crypto";
import { and, desc, eq, inArray, notInArray } from "drizzle-orm";
import type { Db, DbOrTx } from "@/db";
import { audits, businesses, findings, improvementActions, siteVersions, sites, type ImprovementAction } from "@/db/schema";
import { siteContent } from "@/lib/site/content";
import { requireBusiness } from "../business";
import { AppError, audit as auditEvent, requireRole, type Ctx } from "../context";
import { normalizeSiteUrl } from "../safe-fetch";
import { applyToContent, contentReflects, hasPlaceholder, isHostedKind, templateFor, type ApplyKind } from "./actions";
import { CHECKLIST_VERSION, externalChecks, hostedChecks, type CheckResult } from "./checks";
import { crawlSite, type Fetcher } from "./crawl";

const OPEN_STATUSES = ["detected", "proposed", "owner_edited", "approved", "queued", "applied", "failed"] as const;
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

export async function startAudit(db: Db, ctx: Ctx, kind: "external" | "hosted") {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  let target: string;
  if (kind === "external") {
    if (!b.websiteUrl) throw new AppError("invalid", "Add your website address in My Business first.");
    target = normalizeSiteUrl(b.websiteUrl);
  } else {
    const [s] = await db.select().from(sites).where(eq(sites.businessId, b.id));
    if (!s) throw new AppError("invalid", "Create your website first.");
    target = `site:${s.id}`;
  }
  const running = await db
    .select({ id: audits.id })
    .from(audits)
    .where(and(eq(audits.workspaceId, ctx.workspaceId), inArray(audits.status, ["queued", "running"])));
  if (running.length) throw new AppError("conflict", "An audit is already running.");
  const [row] = await db
    .insert(audits)
    .values({ workspaceId: ctx.workspaceId, businessId: b.id, kind, target, checklistVersion: CHECKLIST_VERSION, createdBy: ctx.userId })
    .returning();
  await auditEvent(db, ctx, "audit.started", row.id, { kind });
  return row;
}

/** Runs an audit and turns failed checks into proposed actions (one open action per check). */
export async function runAudit(db: Db, auditId: string, deps: { fetcher?: Fetcher } = {}) {
  const [a] = await db.select().from(audits).where(eq(audits.id, auditId));
  if (!a || a.status === "completed") return a;
  await db.update(audits).set({ status: "running" }).where(eq(audits.id, a.id));
  const [b] = await db.select().from(businesses).where(eq(businesses.id, a.businessId));
  try {
    let results: CheckResult[];
    let pages: { url: string; status: number }[] = [];
    let notRun: { check: string; reason: string }[] = [];
    if (a.kind === "external") {
      const crawl = await crawlSite(a.target, deps.fetcher);
      pages = crawl.pages.map((p) => ({ url: p.url, status: p.status }));
      notRun = crawl.errors.map((e) => ({ check: e.url, reason: e.reason }));
      if (crawl.pages.length === 0) {
        await db
          .update(audits)
          .set({ status: "failed", error: `We couldn't load your website: ${crawl.errors[0]?.reason ?? "no response"}. You can still add details manually.`, notRun, finishedAt: new Date() })
          .where(eq(audits.id, a.id));
        return null;
      }
      results = externalChecks(crawl, b);
    } else {
      const [s] = await db.select().from(sites).where(eq(sites.id, a.target.replace("site:", "")));
      results = hostedChecks(s.draft, b);
      pages = s.draft.pages.map((p) => ({ url: p.key, status: 200 }));
    }

    await db.transaction(async (tx) => {
      const inserted = results.length
        ? await tx.insert(findings).values(results.map((r) => ({ ...r, partial: r.partial ?? false, workspaceId: a.workspaceId, auditId: a.id }))).returning()
        : [];
      const open = await tx
        .select({ checkKey: improvementActions.checkKey })
        .from(improvementActions)
        .where(and(eq(improvementActions.workspaceId, a.workspaceId), inArray(improvementActions.status, [...OPEN_STATUSES])));
      const openKeys = new Set(open.map((o) => o.checkKey));
      const rows = inserted
        .filter((f) => !f.passed && !openKeys.has(f.checkKey))
        .map((f) => ({ f, t: templateFor(f as CheckResult, b, a.kind === "hosted") }))
        .filter((x) => x.t !== null)
        .map(({ f, t }) => ({
          workspaceId: a.workspaceId,
          businessId: a.businessId,
          findingId: f.id,
          checkKey: f.checkKey,
          applyKind: t!.applyKind,
          title: t!.title,
          page: f.page,
          evidence: f.evidence,
          severity: f.severity,
          priority: t!.priority,
          hypothesis: t!.hypothesis,
          proposedChange: t!.proposedChange,
          draft: t!.draft,
        }));
      if (rows.length) await tx.insert(improvementActions).values(rows);
      await tx.update(audits).set({ status: "completed", pagesScanned: pages, notRun, finishedAt: new Date() }).where(eq(audits.id, a.id));
    });
    return a;
  } catch (err) {
    await db.update(audits).set({ status: "failed", error: err instanceof Error ? err.message : String(err), finishedAt: new Date() }).where(eq(audits.id, a.id));
    return null;
  }
}

export async function latestAudit(db: DbOrTx, ctx: Ctx) {
  const [a] = await db.select().from(audits).where(eq(audits.workspaceId, ctx.workspaceId)).orderBy(desc(audits.createdAt)).limit(1);
  if (!a) return null;
  const f = await db.select().from(findings).where(and(eq(findings.auditId, a.id), eq(findings.workspaceId, ctx.workspaceId)));
  return { ...a, findings: f };
}

export async function listActions(db: DbOrTx, ctx: Ctx) {
  return db
    .select()
    .from(improvementActions)
    .where(eq(improvementActions.workspaceId, ctx.workspaceId))
    .orderBy(desc(improvementActions.priority), desc(improvementActions.createdAt));
}

async function getAction(db: DbOrTx, ctx: Ctx, id: string, lock = false) {
  const q = db.select().from(improvementActions).where(and(eq(improvementActions.id, id), eq(improvementActions.workspaceId, ctx.workspaceId)));
  const [a] = lock ? await q.for("update") : await q;
  if (!a) throw new AppError("not_found", "Task not found.");
  return a;
}

/** Editing invalidates any earlier approval. */
export async function editActionDraft(db: Db, ctx: Ctx, id: string, draft: string, expectedRevision: number) {
  requireRole(ctx, "editor");
  return db.transaction(async (tx) => {
    const a = await getAction(tx, ctx, id, true);
    if (a.draftRevision !== expectedRevision) throw new AppError("precondition_failed", "This draft changed in another window. Reload to see it.");
    if (["applied", "verified", "queued"].includes(a.status)) throw new AppError("invalid", "This change has already been applied. Roll it back to edit it.");
    const [u] = await tx
      .update(improvementActions)
      .set({ draft: draft.slice(0, 10_000), draftRevision: a.draftRevision + 1, status: "owner_edited", approvedBy: null, approvedAt: null, approvedRevision: null, approvedHash: null, updatedAt: new Date() })
      .where(eq(improvementActions.id, a.id))
      .returning();
    return u;
  });
}

/** Owner approval binds the exact draft revision and content hash. */
export async function approveAction(db: Db, ctx: Ctx, id: string, expectedRevision: number) {
  requireRole(ctx, "owner");
  return db.transaction(async (tx) => {
    const a = await getAction(tx, ctx, id, true);
    if (a.draftRevision !== expectedRevision) throw new AppError("precondition_failed", "The draft changed after you reviewed it. Review it again.");
    if (!["detected", "proposed", "owner_edited", "failed", "rolled_back"].includes(a.status)) throw new AppError("invalid", "This task can't be approved in its current state.");
    if (a.applyKind !== "manual" && hasPlaceholder(a.draft)) throw new AppError("invalid", "Replace every [bracketed] placeholder with your own words first.");
    const [u] = await tx
      .update(improvementActions)
      .set({ status: "approved", approvedBy: ctx.userId, approvedAt: new Date(), approvedRevision: a.draftRevision, approvedHash: hash(a.draft), updatedAt: new Date() })
      .where(eq(improvementActions.id, a.id))
      .returning();
    await auditEvent(tx, ctx, "action.approved", a.id, { revision: a.draftRevision });
    return u;
  });
}

export async function rejectAction(db: Db, ctx: Ctx, id: string) {
  requireRole(ctx, "editor");
  const a = await getAction(db, ctx, id);
  if (["applied", "verified"].includes(a.status)) throw new AppError("invalid", "Roll this change back instead.");
  await db.update(improvementActions).set({ status: "rejected", updatedAt: new Date() }).where(eq(improvementActions.id, a.id));
}

/**
 * Applies an approved action. Hosted changes go into the website draft (the
 * owner still publishes). Manual tasks are marked done by the owner.
 * The approval must still match the current draft exactly.
 */
export async function applyAction(db: Db, ctx: Ctx, id: string) {
  requireRole(ctx, "owner");
  return db.transaction(async (tx) => {
    const a = await getAction(tx, ctx, id, true);
    if (a.status !== "approved" || a.approvedRevision !== a.draftRevision || a.approvedHash !== hash(a.draft)) {
      throw new AppError("precondition_failed", "This task needs approval of its current draft before it can be applied.");
    }
    if (a.applyKind === "wordpress_append") throw new AppError("invalid", "Apply this through WordPress.");
    await tx.update(improvementActions).set({ status: "queued", updatedAt: new Date() }).where(eq(improvementActions.id, a.id));
    let before: unknown = null;
    if (isHostedKind(a.applyKind)) {
      const [s] = await tx.select().from(sites).where(and(eq(sites.businessId, a.businessId), eq(sites.workspaceId, ctx.workspaceId))).for("update");
      if (!s) throw new AppError("not_found", "Create your website first.");
      const next = applyToContent(a.applyKind as ApplyKind, a.draft, s.draft);
      if (!next) {
        await tx.update(improvementActions).set({ status: "failed", verificationNote: "The draft didn't contain anything we could apply.", updatedAt: new Date() }).where(eq(improvementActions.id, a.id));
        return { ...a, status: "failed" as const };
      }
      before = s.draft;
      await tx.update(sites).set({ draft: siteContent.parse(next), draftRevision: s.draftRevision + 1, updatedAt: new Date() }).where(eq(sites.id, s.id));
    }
    const [u] = await tx
      .update(improvementActions)
      .set({ status: "applied", appliedAt: new Date(), beforeSnapshot: before, updatedAt: new Date() })
      .where(eq(improvementActions.id, a.id))
      .returning();
    await auditEvent(tx, ctx, "action.applied", a.id, { kind: a.applyKind });
    return u;
  });
}

/** Checks the change is live: published content for hosted tasks, a fresh scan for external ones. */
export async function verifyAction(db: Db, ctx: Ctx, id: string, deps: { fetcher?: Fetcher } = {}) {
  requireRole(ctx, "editor");
  const a = await getAction(db, ctx, id);
  if (a.status !== "applied" && a.status !== "failed") throw new AppError("invalid", "Apply this task first.");
  let ok = false;
  let note = "";
  if (isHostedKind(a.applyKind)) {
    const [row] = await db
      .select({ content: siteVersions.content, n: siteVersions.versionNumber })
      .from(sites)
      .innerJoin(siteVersions, eq(siteVersions.id, sites.publishedVersionId))
      .where(and(eq(sites.businessId, a.businessId), eq(sites.workspaceId, ctx.workspaceId)));
    ok = !!row && contentReflects(a.applyKind as ApplyKind, a.draft, row.content);
    note = ok ? `Live in published version ${row!.n}` : "Not live yet — publish your website to make this change public.";
  } else {
    const [b] = await db.select().from(businesses).where(eq(businesses.id, a.businessId));
    if (!b.websiteUrl) throw new AppError("invalid", "No website address to check.");
    const crawl = await crawlSite(normalizeSiteUrl(b.websiteUrl), deps.fetcher);
    const result = externalChecks(crawl, b).find((r) => r.checkKey === a.checkKey);
    ok = !!result?.passed;
    note = result ? `Re-checked ${new Date().toLocaleDateString("en-IN")}: ${result.evidence}` : "We couldn't re-run this check.";
  }
  const [u] = await db
    .update(improvementActions)
    .set({ status: ok ? "verified" : a.status === "applied" && isHostedKind(a.applyKind) ? "applied" : "failed", verifiedAt: ok ? new Date() : null, verificationNote: note, updatedAt: new Date() })
    .where(eq(improvementActions.id, a.id))
    .returning();
  return u;
}

/** Restores the website draft to how it was before this task was applied. */
export async function rollbackAction(db: Db, ctx: Ctx, id: string) {
  requireRole(ctx, "owner");
  return db.transaction(async (tx) => {
    const a = await getAction(tx, ctx, id, true);
    if (!["applied", "verified"].includes(a.status)) throw new AppError("invalid", "Only applied changes can be rolled back.");
    if (a.applyKind === "wordpress_append") throw new AppError("invalid", "Roll this back through WordPress.");
    if (isHostedKind(a.applyKind) && a.beforeSnapshot) {
      const [s] = await tx.select().from(sites).where(and(eq(sites.businessId, a.businessId), eq(sites.workspaceId, ctx.workspaceId))).for("update");
      await tx.update(sites).set({ draft: siteContent.parse(a.beforeSnapshot), draftRevision: s.draftRevision + 1, updatedAt: new Date() }).where(eq(sites.id, s.id));
    }
    const [u] = await tx.update(improvementActions).set({ status: "rolled_back", updatedAt: new Date() }).where(eq(improvementActions.id, a.id)).returning();
    await auditEvent(tx, ctx, "action.rolled_back", a.id);
    return u;
  });
}

export function actionsToText(rows: ImprovementAction[], businessName: string) {
  const lines = [`Website improvements for ${businessName}`, `Exported ${new Date().toISOString().slice(0, 10)}`, ""];
  rows.forEach((r, i) => {
    lines.push(`${i + 1}. ${r.title} [${r.status}]`, `   Page: ${r.page ?? "site-wide"}`, `   Found: ${r.evidence}`, `   Why: ${r.hypothesis}`, `   Do: ${r.proposedChange}`);
    if (r.draft) lines.push("   Draft:", ...r.draft.split("\n").map((l) => `     ${l}`));
    lines.push("");
  });
  lines.push("These suggestions aim to make your pages clearer and more useful. They can't guarantee any search or AI ranking.");
  return lines.join("\n");
}

export async function exportableActions(db: DbOrTx, ctx: Ctx) {
  return db
    .select()
    .from(improvementActions)
    .where(and(eq(improvementActions.workspaceId, ctx.workspaceId), notInArray(improvementActions.status, ["rejected", "rolled_back"])))
    .orderBy(desc(improvementActions.priority));
}

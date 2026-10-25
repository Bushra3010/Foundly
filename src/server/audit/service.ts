import { createHash } from "node:crypto";
import { and, desc, eq, inArray, notInArray } from "drizzle-orm";
import type { Db, DbOrTx } from "@/db";
import { audits, businesses, findings, improvementActions, type ImprovementAction } from "@/db/schema";
import { requireBusiness } from "../business";
import { AppError, audit as auditEvent, requireRole, type Ctx } from "../context";
import { normalizeSiteUrl } from "../safe-fetch";
import { hasPlaceholder, isHostedKind, templateFor } from "./actions";
import { CHECKLIST_VERSION, externalChecks, type CheckResult } from "./checks";
import { crawlSite, type Fetcher } from "./crawl";

const OPEN_STATUSES = ["detected", "proposed", "owner_edited", "approved", "queued", "applied", "failed"] as const;
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

/** Scans the owner's own website. Foundly never needs its login. */
export async function startAudit(db: Db, ctx: Ctx) {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  if (!b.websiteUrl) throw new AppError("invalid", "Connect your website first.");
  const target = normalizeSiteUrl(b.websiteUrl);
  const kind = "external";
  const running = await db
    .select({ id: audits.id })
    .from(audits)
    .where(and(eq(audits.workspaceId, ctx.workspaceId), eq(audits.kind, "external"), inArray(audits.status, ["queued", "running"])));
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
    const crawl = await crawlSite(a.target, deps.fetcher);
    const pages = crawl.pages.map((p) => ({ url: p.url, status: p.status }));
    const notRun = crawl.errors.map((e) => ({ check: e.url, reason: e.reason }));
    if (crawl.pages.length === 0) {
      await db
        .update(audits)
        .set({ status: "failed", error: `We couldn't load your website: ${crawl.errors[0]?.reason ?? "no response"}. You can still add details manually.`, notRun, finishedAt: new Date() })
        .where(eq(audits.id, a.id));
      return null;
    }
    const results: CheckResult[] = externalChecks(crawl, b);

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
        .map((f) => ({ f, t: templateFor(f as CheckResult, b) }))
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

/**
 * The latest finished check of the website that's connected now. A check of
 * an address the owner has since changed doesn't count.
 */
export async function currentWebsiteCheck(db: DbOrTx, ctx: Ctx, websiteUrl: string | null) {
  if (!websiteUrl) return null;
  let target: string;
  try {
    target = normalizeSiteUrl(websiteUrl);
  } catch {
    return null;
  }
  const [a] = await db
    .select()
    .from(audits)
    .where(and(eq(audits.workspaceId, ctx.workspaceId), eq(audits.kind, "external"), eq(audits.target, target), eq(audits.status, "completed")))
    .orderBy(desc(audits.createdAt))
    .limit(1);
  if (!a) return null;
  const f = await db.select().from(findings).where(and(eq(findings.auditId, a.id), eq(findings.workspaceId, ctx.workspaceId)));
  return { audit: a, findings: f, passed: f.filter((x) => x.passed).length, total: f.length };
}

/** Whether a check of this address is queued or running right now. */
export async function websiteCheckRunning(db: DbOrTx, ctx: Ctx, websiteUrl: string | null) {
  if (!websiteUrl) return false;
  let target: string;
  try {
    target = normalizeSiteUrl(websiteUrl);
  } catch {
    return false;
  }
  const rows = await db
    .select({ id: audits.id })
    .from(audits)
    .where(and(eq(audits.workspaceId, ctx.workspaceId), eq(audits.kind, "external"), eq(audits.target, target), inArray(audits.status, ["queued", "running"])))
    .limit(1);
  return rows.length > 0;
}

/** Starts a website check in the background; for use in after(). Never throws. */
export async function checkWebsiteSoon(db: Db, ctx: Ctx) {
  try {
    const a = await startAudit(db, ctx);
    await runAudit(db, a.id);
  } catch (err) {
    if (!(err instanceof AppError)) console.error("[audit] background check failed", err);
  }
}

export async function latestAudit(db: DbOrTx, ctx: Ctx) {
  // Competitor checks live in the same table; this is always the owner's own site.
  const [a] = await db.select().from(audits).where(and(eq(audits.workspaceId, ctx.workspaceId), eq(audits.kind, "external"))).orderBy(desc(audits.createdAt)).limit(1);
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
 * Marks an approved task as done on the owner's website. The approval must
 * still match the current draft exactly.
 */
export async function applyAction(db: Db, ctx: Ctx, id: string) {
  requireRole(ctx, "owner");
  return db.transaction(async (tx) => {
    const a = await getAction(tx, ctx, id, true);
    if (a.status !== "approved" || a.approvedRevision !== a.draftRevision || a.approvedHash !== hash(a.draft)) {
      throw new AppError("precondition_failed", "This task needs approval of its current draft before it can be applied.");
    }
    if (isHostedKind(a.applyKind)) throw new AppError("invalid", "This task was for a website Foundly used to host. Make the change on your own website instead.");
    const [u] = await tx
      .update(improvementActions)
      .set({ status: "applied", appliedAt: new Date(), updatedAt: new Date() })
      .where(eq(improvementActions.id, a.id))
      .returning();
    await auditEvent(tx, ctx, "action.applied", a.id, { kind: a.applyKind });
    return u;
  });
}

/** Checks the change is live with a fresh scan of the owner's website. */
export async function verifyAction(db: Db, ctx: Ctx, id: string, deps: { fetcher?: Fetcher } = {}) {
  requireRole(ctx, "editor");
  const a = await getAction(db, ctx, id);
  if (a.status !== "applied" && a.status !== "failed") throw new AppError("invalid", "Apply this task first.");
  const [b] = await db.select().from(businesses).where(eq(businesses.id, a.businessId));
  if (!b.websiteUrl) throw new AppError("invalid", "No website address to check.");
  const crawl = await crawlSite(normalizeSiteUrl(b.websiteUrl), deps.fetcher);
  const result = externalChecks(crawl, b).find((r) => r.checkKey === a.checkKey);
  const ok = !!result?.passed;
  const note = result ? `Re-checked ${new Date().toLocaleDateString("en-IN")}: ${result.evidence}` : "We couldn't re-run this check.";
  const [u] = await db
    .update(improvementActions)
    .set({ status: ok ? "verified" : "failed", verifiedAt: ok ? new Date() : null, verificationNote: note, updatedAt: new Date() })
    .where(eq(improvementActions.id, a.id))
    .returning();
  return u;
}

/** Reopens an applied task, for when the owner undoes the change on their website. */
export async function rollbackAction(db: Db, ctx: Ctx, id: string) {
  requireRole(ctx, "owner");
  return db.transaction(async (tx) => {
    const a = await getAction(tx, ctx, id, true);
    if (!["applied", "verified"].includes(a.status)) throw new AppError("invalid", "Only applied changes can be rolled back.");
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

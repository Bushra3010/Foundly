import { rm } from "node:fs/promises";
import path from "node:path";
import { and, eq, isNull, lt, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { deletionRequests, memberships, sessions, sites, users, workspaces } from "@/db/schema";
import { AppError, audit, type Ctx } from "./context";
import { refreshPublicPages } from "./public-cache";

export const RECOVERY_DAYS = 14;

export async function pendingDeletions(db: Db, ctx: Ctx) {
  return db
    .select()
    .from(deletionRequests)
    .where(
      and(
        isNull(deletionRequests.cancelledAt),
        isNull(deletionRequests.completedAt),
        sql`(${deletionRequests.userId} = ${ctx.userId} and ${deletionRequests.kind} = 'account') or (${deletionRequests.workspaceId} = ${ctx.workspaceId} and ${deletionRequests.kind} = 'website')`,
      ),
    );
}

/**
 * Account deletion: blocked while the user is the only owner of a workspace
 * that other people use, so a team is never left without an owner.
 */
export async function requestAccountDeletion(db: Db, ctx: Ctx) {
  const owned = await db
    .select({ workspaceId: memberships.workspaceId })
    .from(memberships)
    .where(and(eq(memberships.userId, ctx.userId), eq(memberships.role, "owner")));
  for (const { workspaceId } of owned) {
    const [{ owners, members }] = await db
      .select({
        owners: sql<number>`count(*) filter (where ${memberships.role} = 'owner')::int`,
        members: sql<number>`count(*)::int`,
      })
      .from(memberships)
      .where(eq(memberships.workspaceId, workspaceId));
    if (owners === 1 && members > 1) {
      throw new AppError("precondition_failed", "You're the only owner of a workspace other people use. Transfer ownership in Settings first.");
    }
  }
  const [r] = await db
    .insert(deletionRequests)
    .values({ kind: "account", userId: ctx.userId, requestedBy: ctx.userId, scheduledFor: new Date(Date.now() + RECOVERY_DAYS * 86_400_000) })
    .returning();
  await db.update(sessions).set({ revokedAt: new Date() }).where(and(eq(sessions.userId, ctx.userId), isNull(sessions.revokedAt)));
  await audit(db, ctx, "lifecycle.account_deletion_requested", r.id);
  return r;
}

export async function cancelDeletion(db: Db, ctx: Ctx, requestId: string) {
  const [r] = await db
    .update(deletionRequests)
    .set({ cancelledAt: new Date() })
    .where(
      and(
        eq(deletionRequests.id, requestId),
        isNull(deletionRequests.completedAt),
        sql`(${deletionRequests.userId} = ${ctx.userId} or ${deletionRequests.workspaceId} = ${ctx.workspaceId})`,
      ),
    )
    .returning();
  if (!r) throw new AppError("not_found", "Nothing to cancel.");
  await audit(db, ctx, "lifecycle.deletion_cancelled", r.id);
}

async function deleteWorkspace(db: Db, workspaceId: string) {
  await db.delete(workspaces).where(eq(workspaces.id, workspaceId)); // cascades to every tenant row
  const uploads = process.env.UPLOADS_DIR || path.join(process.cwd(), ".data", "uploads");
  if (/^[0-9a-f-]{36}$/.test(workspaceId)) await rm(path.join(uploads, workspaceId), { recursive: true, force: true });
}

/** Cron: carries out deletions whose recovery window has passed. */
export async function processDueDeletions(db: Db, now = new Date()) {
  const due = await db
    .select()
    .from(deletionRequests)
    .where(and(isNull(deletionRequests.cancelledAt), isNull(deletionRequests.completedAt), lt(deletionRequests.scheduledFor, now)));
  for (const r of due) {
    // Website deletions were for websites Foundly used to host; ones already scheduled still complete.
    if (r.kind === "website" && r.workspaceId) {
      await db.delete(sites).where(eq(sites.workspaceId, r.workspaceId));
    } else if (r.kind === "account" && r.userId) {
      const mine = await db.select({ workspaceId: memberships.workspaceId }).from(memberships).where(eq(memberships.userId, r.userId));
      for (const { workspaceId } of mine) {
        const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(memberships).where(eq(memberships.workspaceId, workspaceId));
        if (n === 1) await deleteWorkspace(db, workspaceId);
      }
      await db.delete(users).where(eq(users.id, r.userId));
    }
    await db.update(deletionRequests).set({ completedAt: now }).where(eq(deletionRequests.id, r.id));
  }
  if (due.length) refreshPublicPages();
  return due.length;
}

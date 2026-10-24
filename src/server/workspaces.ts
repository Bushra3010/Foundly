import { and, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { businesses, memberships, subscriptions, workspaces } from "@/db/schema";
import { billingEnforced, planSpec } from "@/lib/plans";
import { AppError, audit } from "./context";
import { ensureTrialCredits } from "./credits";

/** Every workspace the user belongs to, with its business. */
export async function listUserWorkspaces(db: Db, userId: string) {
  return db
    .select({ id: workspaces.id, name: workspaces.name, role: memberships.role, business: businesses.name, businessId: businesses.id, websiteUrl: businesses.websiteUrl })
    .from(memberships)
    .innerJoin(workspaces, eq(workspaces.id, memberships.workspaceId))
    .leftJoin(businesses, eq(businesses.workspaceId, workspaces.id))
    .where(eq(memberships.userId, userId));
}

/**
 * Each plan allows a number of businesses per owner; Enterprise allows several.
 * Only enforced once billing is on.
 */
export async function assertCanCreateWorkspace(db: Db, userId: string) {
  if (!billingEnforced()) return;
  const owned = await db
    .select({ plan: subscriptions.plan })
    .from(memberships)
    .leftJoin(subscriptions, eq(subscriptions.workspaceId, memberships.workspaceId))
    .where(and(eq(memberships.userId, userId), eq(memberships.role, "owner")));
  const limit = Math.max(1, ...owned.map((o) => planSpec(o.plan ?? "free").maxWorkspaces));
  if (owned.length >= limit) throw new AppError("forbidden", `Your plan allows ${limit} business${limit === 1 ? "" : "es"}. Upgrade to Agency to add more.`);
}

export async function createWorkspace(db: Db, userId: string, name: string) {
  await assertCanCreateWorkspace(db, userId);
  const ws = await db.transaction(async (tx) => {
    const [ws] = await tx.insert(workspaces).values({ name: name.trim().slice(0, 80) || "New workspace" }).returning();
    await tx.insert(memberships).values({ workspaceId: ws.id, userId, role: "owner" });
    await audit(tx, { workspaceId: ws.id, userId }, "workspace.created", ws.id);
    return ws;
  });
  await ensureTrialCredits(db, ws.id);
  return ws;
}

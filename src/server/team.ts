import { randomBytes } from "node:crypto";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { invitations, memberships, users, type Role } from "@/db/schema";
import { hashToken } from "./auth";
import { AppError, audit, requireRole, type Ctx } from "./context";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function listMembers(db: Db, ctx: Ctx) {
  return db
    .select({ userId: users.id, email: users.email, role: memberships.role })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.workspaceId, ctx.workspaceId));
}

export async function listPendingInvites(db: Db, ctx: Ctx) {
  return db
    .select({ id: invitations.id, email: invitations.email, role: invitations.role, expiresAt: invitations.expiresAt })
    .from(invitations)
    .where(
      and(
        eq(invitations.workspaceId, ctx.workspaceId),
        isNull(invitations.acceptedAt),
        isNull(invitations.revokedAt),
        gt(invitations.expiresAt, new Date()),
      ),
    );
}

/** Returns the raw token for the invitation link. Owner only. */
export async function inviteMember(db: Db, ctx: Ctx, email: string, role: Role) {
  requireRole(ctx, "owner");
  const existing = await db
    .select()
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(and(eq(memberships.workspaceId, ctx.workspaceId), eq(users.email, email)));
  if (existing.length) throw new AppError("conflict", "That person is already on your team.");
  const raw = randomBytes(32).toString("base64url");
  await db.insert(invitations).values({
    workspaceId: ctx.workspaceId,
    email,
    role,
    tokenHash: hashToken(raw),
    invitedBy: ctx.userId,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  });
  await audit(db, ctx, "team.invited", email, { role });
  return raw;
}

export async function revokeInvite(db: Db, ctx: Ctx, inviteId: string) {
  requireRole(ctx, "owner");
  await db
    .update(invitations)
    .set({ revokedAt: new Date() })
    .where(and(eq(invitations.id, inviteId), eq(invitations.workspaceId, ctx.workspaceId)));
}

/** The signed-in user accepts an invitation addressed to their email. */
export async function acceptInvite(db: Db, user: { id: string; email: string }, raw: string) {
  return db.transaction(async (tx) => {
    const [inv] = await tx
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.tokenHash, hashToken(raw)),
          isNull(invitations.acceptedAt),
          isNull(invitations.revokedAt),
          gt(invitations.expiresAt, new Date()),
        ),
      );
    if (!inv) throw new AppError("invalid", "This invitation has expired or was already used.");
    if (inv.email !== user.email) {
      throw new AppError("forbidden", `This invitation is for ${inv.email}. Sign in with that email to accept it.`);
    }
    await tx
      .insert(memberships)
      .values({ workspaceId: inv.workspaceId, userId: user.id, role: inv.role })
      .onConflictDoUpdate({ target: [memberships.workspaceId, memberships.userId], set: { role: inv.role } });
    await tx.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, inv.id));
    await audit(tx, { workspaceId: inv.workspaceId, userId: user.id }, "team.joined", user.email, { role: inv.role });
    return inv.workspaceId;
  });
}

async function ownerCount(db: Db | Parameters<Parameters<Db["transaction"]>[0]>[0], workspaceId: string) {
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(memberships)
    .where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.role, "owner")));
  return n;
}

export async function changeRole(db: Db, ctx: Ctx, userId: string, role: Role) {
  requireRole(ctx, "owner");
  return db.transaction(async (tx) => {
    const [m] = await tx
      .select()
      .from(memberships)
      .where(and(eq(memberships.workspaceId, ctx.workspaceId), eq(memberships.userId, userId)))
      .for("update");
    if (!m) throw new AppError("not_found", "That person isn't on this team.");
    if (m.role === "owner" && role !== "owner" && (await ownerCount(tx, ctx.workspaceId)) <= 1) {
      throw new AppError("precondition_failed", "A workspace needs at least one owner. Make someone else an owner first.");
    }
    await tx
      .update(memberships)
      .set({ role })
      .where(and(eq(memberships.workspaceId, ctx.workspaceId), eq(memberships.userId, userId)));
    await audit(tx, ctx, "team.role_changed", userId, { from: m.role, to: role });
  });
}

export async function removeMember(db: Db, ctx: Ctx, userId: string) {
  // Anyone may leave; only owners may remove others.
  if (userId !== ctx.userId) requireRole(ctx, "owner");
  return db.transaction(async (tx) => {
    const [m] = await tx
      .select()
      .from(memberships)
      .where(and(eq(memberships.workspaceId, ctx.workspaceId), eq(memberships.userId, userId)))
      .for("update");
    if (!m) throw new AppError("not_found", "That person isn't on this team.");
    if (m.role === "owner" && (await ownerCount(tx, ctx.workspaceId)) <= 1) {
      throw new AppError("precondition_failed", "You can't remove the last owner. Transfer ownership first.");
    }
    await tx.delete(memberships).where(and(eq(memberships.workspaceId, ctx.workspaceId), eq(memberships.userId, userId)));
    await audit(tx, ctx, "team.removed", userId);
  });
}

/** Makes another member the owner and the current owner an editor, atomically. */
export async function transferOwnership(db: Db, ctx: Ctx, toUserId: string) {
  requireRole(ctx, "owner");
  if (toUserId === ctx.userId) throw new AppError("invalid", "You already own this workspace.");
  return db.transaction(async (tx) => {
    const [target] = await tx
      .select()
      .from(memberships)
      .where(and(eq(memberships.workspaceId, ctx.workspaceId), eq(memberships.userId, toUserId)));
    if (!target) throw new AppError("not_found", "Invite this person to the team first.");
    await tx.update(memberships).set({ role: "owner" }).where(and(eq(memberships.workspaceId, ctx.workspaceId), eq(memberships.userId, toUserId)));
    await tx.update(memberships).set({ role: "editor" }).where(and(eq(memberships.workspaceId, ctx.workspaceId), eq(memberships.userId, ctx.userId)));
    await audit(tx, ctx, "team.ownership_transferred", toUserId);
  });
}

import { createHash, randomBytes } from "node:crypto";
import { and, asc, eq, gt, isNull } from "drizzle-orm";
import type { Db } from "@/db";
import { loginTokens, memberships, sessions, users, workspaces } from "@/db/schema";
import { AppError, audit, type Ctx } from "./context";
import { ensureTrialCredits } from "./credits";
import { dummyHash, hashPassword, verifyPassword } from "./password";

const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function newToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Creates a single-use sign-in token. Returns the raw token for the email link. */
export async function createLoginToken(db: Db, email: string): Promise<string> {
  const raw = newToken();
  await db.insert(loginTokens).values({
    email,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + LOGIN_TOKEN_TTL_MS),
  });
  return raw;
}

/**
 * Consumes a sign-in token. The first sign-in for an email creates the user and
 * a workspace they own. Returns a new raw session token.
 */
export async function consumeLoginToken(db: Db, raw: string) {
  const result = await db.transaction(async (tx) => {
    const [token] = await tx
      .update(loginTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(loginTokens.tokenHash, hashToken(raw)),
          isNull(loginTokens.usedAt),
          gt(loginTokens.expiresAt, new Date()),
        ),
      )
      .returning();
    if (!token) throw new AppError("invalid", "This sign-in link has expired or was already used. Request a new one.");

    let [user] = await tx.select().from(users).where(eq(users.email, token.email));
    let isNew = false;
    let workspaceId: string | null = null;
    if (!user) {
      isNew = true;
      ({ user, workspaceId } = await createUserWithWorkspace(tx, token.email, null));
    }

    const sessionToken = await createSession(tx, user.id);
    return { userId: user.id, isNew, sessionToken, workspaceId };
  });
  if (result.workspaceId) await ensureTrialCredits(db, result.workspaceId);
  return result;
}

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

async function createUserWithWorkspace(tx: Tx, email: string, passwordHash: string | null) {
  const [user] = await tx.insert(users).values({ email, passwordHash }).returning();
  const [ws] = await tx.insert(workspaces).values({ name: "My workspace" }).returning();
  await tx.insert(memberships).values({ workspaceId: ws.id, userId: user.id, role: "owner" });
  await audit(tx, { workspaceId: ws.id, userId: user.id }, "workspace.created", ws.id);
  return { user, workspaceId: ws.id as string };
}

async function createSession(tx: Tx | Db, userId: string): Promise<string> {
  const sessionToken = newToken();
  await tx.insert(sessions).values({
    userId,
    tokenHash: hashToken(sessionToken),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return sessionToken;
}

export const PASSWORD_MIN = 8;

function checkPasswordShape(password: string) {
  if (password.length < PASSWORD_MIN) throw new AppError("invalid", `Use at least ${PASSWORD_MIN} characters for your password.`);
  if (password.length > 128) throw new AppError("invalid", "Use 128 characters or fewer for your password.");
}

/**
 * Creates an account with an email and password, plus a workspace the user owns.
 * An email that already has an account is refused, never overwritten.
 */
export async function signUpWithPassword(db: Db, email: string, password: string) {
  checkPasswordShape(password);
  const passwordHash = await hashPassword(password);
  const result = await db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing) throw new AppError("conflict", "An account with this email already exists. Log in instead.");
    const { user, workspaceId } = await createUserWithWorkspace(tx, email, passwordHash);
    const sessionToken = await createSession(tx, user.id);
    return { userId: user.id, sessionToken, workspaceId };
  });
  await ensureTrialCredits(db, result.workspaceId);
  return result;
}

const BAD_LOGIN = "That email and password don't match. Try again, or get a sign-in link by email.";

/** Signs in with an email and password. The same message is used for every failure. */
export async function signInWithPassword(db: Db, email: string, password: string) {
  const [user] = await db.select({ id: users.id, passwordHash: users.passwordHash }).from(users).where(eq(users.email, email));
  if (!user?.passwordHash) {
    await verifyPassword(password, await dummyHash());
    throw new AppError("invalid", BAD_LOGIN);
  }
  if (!(await verifyPassword(password, user.passwordHash))) throw new AppError("invalid", BAD_LOGIN);
  return { userId: user.id, sessionToken: await createSession(db, user.id) };
}

/** Spends the same time as a real password check, for refusals that must not be distinguishable. */
export async function adminDummyCheck(password: string) {
  await verifyPassword(password, await dummyHash());
}

export async function hasPassword(db: Db, userId: string): Promise<boolean> {
  const [row] = await db.select({ h: users.passwordHash }).from(users).where(eq(users.id, userId));
  return Boolean(row?.h);
}

/**
 * Sets or changes a password. Changing an existing password needs the current
 * one; an account that only used email links can add one while signed in.
 */
export async function setPassword(db: Db, userId: string, newPassword: string, currentPassword?: string) {
  checkPasswordShape(newPassword);
  const [row] = await db.select({ h: users.passwordHash }).from(users).where(eq(users.id, userId));
  if (!row) throw new AppError("not_found", "Account not found.");
  if (row.h && !(currentPassword && (await verifyPassword(currentPassword, row.h)))) {
    throw new AppError("invalid", "Your current password is not correct.");
  }
  await db.update(users).set({ passwordHash: await hashPassword(newPassword) }).where(eq(users.id, userId));
}

/** True when an account exists for this email. Used only to decide whether to send a reset email. */
export async function accountExists(db: Db, email: string): Promise<boolean> {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return Boolean(row);
}

/**
 * Completes a password reset from an emailed link. The token is single use and
 * short lived. Every existing session is signed out, then a fresh one is made.
 */
export async function resetPasswordWithToken(db: Db, raw: string, newPassword: string) {
  checkPasswordShape(newPassword);
  const passwordHash = await hashPassword(newPassword);
  return db.transaction(async (tx) => {
    const [token] = await tx
      .update(loginTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(loginTokens.tokenHash, hashToken(raw)), isNull(loginTokens.usedAt), gt(loginTokens.expiresAt, new Date())))
      .returning();
    if (!token) throw new AppError("invalid", "This reset link has expired or was already used. Request a new one.");
    const [user] = await tx.update(users).set({ passwordHash }).where(eq(users.email, token.email)).returning({ id: users.id });
    if (!user) throw new AppError("invalid", "This reset link has expired or was already used. Request a new one.");
    await tx.update(sessions).set({ revokedAt: new Date() }).where(and(eq(sessions.userId, user.id), isNull(sessions.revokedAt)));
    const sessionToken = await createSession(tx, user.id);
    return { userId: user.id, sessionToken };
  });
}

export type SessionUser = { id: string; email: string; name: string | null };

export async function userForSession(db: Db, raw: string): Promise<SessionUser | null> {
  const [row] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(eq(sessions.tokenHash, hashToken(raw)), isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date())),
    );
  return row ?? null;
}

export async function revokeSession(db: Db, raw: string) {
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, hashToken(raw)));
}

export async function revokeAllSessions(db: Db, userId: string) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

/**
 * Resolves the active workspace: the preferred one if the user is a member
 * of it, otherwise their earliest membership. A preferred id that the user
 * doesn't belong to is ignored, never trusted.
 */
export async function contextForUser(db: Db, userId: string, preferredWorkspaceId?: string): Promise<Ctx | null> {
  const rows = await db.select().from(memberships).where(eq(memberships.userId, userId)).orderBy(asc(memberships.createdAt));
  const m = rows.find((r) => r.workspaceId === preferredWorkspaceId) ?? rows[0];
  return m ? { userId, workspaceId: m.workspaceId, role: m.role } : null;
}

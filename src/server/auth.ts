import { createHash, randomBytes } from "node:crypto";
import { and, asc, eq, gt, isNull } from "drizzle-orm";
import type { Db } from "@/db";
import { loginTokens, memberships, sessions, users, workspaces } from "@/db/schema";
import { AppError, audit, type Ctx } from "./context";

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
  return db.transaction(async (tx) => {
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
    if (!user) {
      isNew = true;
      [user] = await tx.insert(users).values({ email: token.email }).returning();
      const [ws] = await tx.insert(workspaces).values({ name: "My workspace" }).returning();
      await tx.insert(memberships).values({ workspaceId: ws.id, userId: user.id, role: "owner" });
      await audit(tx, { workspaceId: ws.id, userId: user.id }, "workspace.created", ws.id);
    }

    const sessionToken = newToken();
    await tx.insert(sessions).values({
      userId: user.id,
      tokenHash: hashToken(sessionToken),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });
    return { userId: user.id, isNew, sessionToken };
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

/** MVP: one workspace per user — the earliest membership. */
export async function contextForUser(db: Db, userId: string): Promise<Ctx | null> {
  const [m] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .orderBy(asc(memberships.createdAt))
    .limit(1);
  return m ? { userId, workspaceId: m.workspaceId, role: m.role } : null;
}

import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { memberships, users } from "@/db/schema";
import { accountExists, createLoginToken, consumeLoginToken, hasPassword, resetPasswordWithToken, setPassword, signInWithPassword, signUpWithPassword, userForSession } from "@/server/auth";
import { AppError } from "@/server/context";
import { hashPassword, verifyPassword } from "@/server/password";
import { makeDb } from "./helpers";

let db: Db;

async function expectCode(p: Promise<unknown>, code: AppError["code"]) {
  await expect(p).rejects.toSatisfy((e: unknown) => e instanceof AppError && e.code === code);
}

beforeAll(async () => {
  db = await makeDb();
});

describe("password hashing", () => {
  it("stores a salted scrypt hash, never the password", async () => {
    const a = await hashPassword("correct horse");
    const b = await hashPassword("correct horse");
    expect(a).toMatch(/^scrypt\$/);
    expect(a).not.toContain("correct horse");
    expect(a).not.toBe(b);
    expect(await verifyPassword("correct horse", a)).toBe(true);
    expect(await verifyPassword("wrong horse", a)).toBe(false);
    expect(await verifyPassword("anything", "not-a-hash")).toBe(false);
  });
});

describe("password accounts", () => {
  it("sign-up creates the user, a workspace they own, and a session", async () => {
    const { userId, sessionToken } = await signUpWithPassword(db, "dina@example.com", "s3cret-pass");
    expect((await userForSession(db, sessionToken))?.email).toBe("dina@example.com");
    const rows = await db.select().from(memberships).where(eq(memberships.userId, userId));
    expect(rows).toHaveLength(1);
    expect(rows[0].role).toBe("owner");
  });

  it("refuses short passwords and existing emails", async () => {
    await expectCode(signUpWithPassword(db, "short@example.com", "1234567"), "invalid");
    await expectCode(signUpWithPassword(db, "dina@example.com", "another-pass"), "conflict");
    const [u] = await db.select().from(users).where(eq(users.email, "dina@example.com"));
    expect(await verifyPassword("s3cret-pass", u.passwordHash!)).toBe(true);
  });

  it("logs in with the right password and gives one message for every failure", async () => {
    const ok = await signInWithPassword(db, "dina@example.com", "s3cret-pass");
    expect((await userForSession(db, ok.sessionToken))?.email).toBe("dina@example.com");
    const wrong = signInWithPassword(db, "dina@example.com", "nope-nope");
    const missing = signInWithPassword(db, "nobody@example.com", "nope-nope");
    await expectCode(wrong, "invalid");
    await expectCode(missing, "invalid");
    const [a, b] = await Promise.allSettled([
      signInWithPassword(db, "dina@example.com", "nope-nope"),
      signInWithPassword(db, "nobody@example.com", "nope-nope"),
    ]);
    expect((a as PromiseRejectedResult).reason.message).toBe((b as PromiseRejectedResult).reason.message);
  });

  it("email-link accounts can add a password, and changing one needs the current password", async () => {
    const token = await createLoginToken(db, "erin@example.com");
    const { userId } = await consumeLoginToken(db, token);
    expect(await hasPassword(db, userId)).toBe(false);
    await expectCode(signInWithPassword(db, "erin@example.com", "whatever-1"), "invalid");

    await setPassword(db, userId, "first-pass-1");
    expect(await hasPassword(db, userId)).toBe(true);
    await signInWithPassword(db, "erin@example.com", "first-pass-1");

    await expectCode(setPassword(db, userId, "second-pass-2"), "invalid");
    await expectCode(setPassword(db, userId, "second-pass-2", "wrong-current"), "invalid");
    await setPassword(db, userId, "second-pass-2", "first-pass-1");
    await expectCode(signInWithPassword(db, "erin@example.com", "first-pass-1"), "invalid");
    await signInWithPassword(db, "erin@example.com", "second-pass-2");
  });

  it("a password account can still use an email link", async () => {
    const token = await createLoginToken(db, "dina@example.com");
    const { isNew } = await consumeLoginToken(db, token);
    expect(isNew).toBe(false);
  });
});

describe("password reset", () => {
  it("sets a new password from a single-use link and signs out other sessions", async () => {
    const { sessionToken: oldSession } = await signUpWithPassword(db, "fern@example.com", "old-password-1");
    expect(await accountExists(db, "fern@example.com")).toBe(true);
    expect(await accountExists(db, "ghost@example.com")).toBe(false);

    const token = await createLoginToken(db, "fern@example.com");
    await expectCode(resetPasswordWithToken(db, token, "short"), "invalid");
    const { sessionToken } = await resetPasswordWithToken(db, token, "new-password-2");

    expect(await userForSession(db, oldSession)).toBeNull();
    expect((await userForSession(db, sessionToken))?.email).toBe("fern@example.com");
    await expectCode(signInWithPassword(db, "fern@example.com", "old-password-1"), "invalid");
    await signInWithPassword(db, "fern@example.com", "new-password-2");
    await expectCode(resetPasswordWithToken(db, token, "another-pass-3"), "invalid");
  });

  it("refuses a link for an email with no account", async () => {
    const token = await createLoginToken(db, "nobody-here@example.com");
    await expectCode(resetPasswordWithToken(db, token, "whatever-pass"), "invalid");
  });
});

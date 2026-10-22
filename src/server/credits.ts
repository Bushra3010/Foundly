import { and, desc, eq, gte, sql } from "drizzle-orm";
import type { Db, DbOrTx } from "@/db";
import { creditAccounts, creditLedger, creditReservations } from "@/db/schema";
import { AppError } from "./context";

/**
 * Credits pay for AI visibility checks: one credit per successful observation
 * (one question × one source × one sample). Work reserves credits up front,
 * then settles to the successful count and releases the rest, so failed
 * provider calls never cost the owner anything.
 */

export async function getBalance(db: DbOrTx, workspaceId: string): Promise<number> {
  const [row] = await db.select({ balance: creditAccounts.balance }).from(creditAccounts).where(eq(creditAccounts.workspaceId, workspaceId));
  return row?.balance ?? 0;
}

/** Adds credits once per idempotency key (plan grants, purchases, refunds). */
export async function grantCredits(db: Db, workspaceId: string, amount: number, reason: string, idempotencyKey: string, ref?: { type: string; id: string }) {
  if (!Number.isInteger(amount) || amount === 0) throw new AppError("invalid", "Invalid credit amount");
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(creditLedger)
      .values({ workspaceId, delta: amount, reason, idempotencyKey, refType: ref?.type, refId: ref?.id })
      .onConflictDoNothing()
      .returning({ id: creditLedger.id });
    if (inserted.length === 0) return false; // already applied
    await tx
      .insert(creditAccounts)
      .values({ workspaceId, balance: amount })
      .onConflictDoUpdate({ target: creditAccounts.workspaceId, set: { balance: sql`${creditAccounts.balance} + ${amount}`, updatedAt: new Date() } });
    return true;
  });
}

/**
 * Atomically moves `amount` credits from the balance into a reservation.
 * The conditional UPDATE makes concurrent reservations unable to overspend.
 */
export async function reserveCredits(db: DbOrTx, workspaceId: string, amount: number, ref: { type: string; id: string }) {
  if (amount <= 0) throw new AppError("invalid", "Nothing to reserve");
  const updated = await db
    .update(creditAccounts)
    .set({ balance: sql`${creditAccounts.balance} - ${amount}`, updatedAt: new Date() })
    .where(and(eq(creditAccounts.workspaceId, workspaceId), gte(creditAccounts.balance, amount)))
    .returning({ balance: creditAccounts.balance });
  if (updated.length === 0) {
    const balance = await getBalance(db, workspaceId);
    throw new AppError("rate_limited", `This check needs ${amount} credits and you have ${balance}.`, { quota: true, balance, needed: amount });
  }
  const [reservation] = await db
    .insert(creditReservations)
    .values({ workspaceId, amount, refType: ref.type, refId: ref.id })
    .returning();
  await db.insert(creditLedger).values({
    workspaceId,
    delta: -amount,
    reason: "reserved",
    refType: ref.type,
    refId: ref.id,
    idempotencyKey: `reserve:${reservation.id}`,
  });
  return reservation;
}

/** Charges `used` credits and returns the rest. Safe to call more than once. */
export async function settleReservation(db: Db, reservationId: string, used: number) {
  return db.transaction(async (tx) => {
    const [r] = await tx.select().from(creditReservations).where(eq(creditReservations.id, reservationId)).for("update");
    if (!r || r.status !== "reserved") return r ?? null;
    const charge = Math.max(0, Math.min(used, r.amount));
    const refund = r.amount - charge;
    if (refund > 0) {
      await tx
        .update(creditAccounts)
        .set({ balance: sql`${creditAccounts.balance} + ${refund}`, updatedAt: new Date() })
        .where(eq(creditAccounts.workspaceId, r.workspaceId));
      await tx.insert(creditLedger).values({
        workspaceId: r.workspaceId,
        delta: refund,
        reason: "released unused",
        refType: r.refType,
        refId: r.refId,
        idempotencyKey: `release:${r.id}`,
      });
    }
    const [updated] = await tx
      .update(creditReservations)
      .set({ status: charge > 0 ? "settled" : "released", settledAmount: charge, settledAt: new Date() })
      .where(eq(creditReservations.id, r.id))
      .returning();
    return updated;
  });
}

export async function recentLedger(db: DbOrTx, workspaceId: string, limit = 20) {
  return db.select().from(creditLedger).where(eq(creditLedger.workspaceId, workspaceId)).orderBy(desc(creditLedger.createdAt)).limit(limit);
}

/** One-time trial allowance per workspace. Capped so trials can't run up costs. */
export async function ensureTrialCredits(db: Db, workspaceId: string) {
  const amount = Number(process.env.TRIAL_CREDITS ?? 40);
  if (amount > 0) await grantCredits(db, workspaceId, amount, "trial allowance", `trial:${workspaceId}`);
}

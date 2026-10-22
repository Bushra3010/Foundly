import dns from "node:dns/promises";
import { randomBytes } from "node:crypto";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import type { Db } from "@/db";
import { businessProfiles, ownershipClaims } from "@/db/schema";
import { requireBusiness } from "./business";
import { AppError, audit, requireRole, type Ctx } from "./context";
import { hostOf, safeFetch } from "./safe-fetch";

export type ClaimMethod = "dns" | "file" | "manual";
export const VERIFY_FILE_PATH = "/.well-known/growth-platform-verification.txt";
export const DNS_PREFIX = "_growth-verify";

type Resolver = (host: string) => Promise<string[][]>;
type Fetcher = (url: string) => Promise<{ status: number; body: string }>;

const defaultResolver: Resolver = (host) => dns.resolveTxt(host);
const defaultFetcher: Fetcher = (url) => safeFetch(url, { maxBytes: 4096, timeoutMs: 8000 });

export async function listClaims(db: Db, ctx: Ctx) {
  const b = await requireBusiness(db, ctx);
  return db
    .select()
    .from(ownershipClaims)
    .where(and(eq(ownershipClaims.businessId, b.id), eq(ownershipClaims.workspaceId, ctx.workspaceId)))
    .orderBy(desc(ownershipClaims.createdAt));
}

/**
 * Starts a claim. Verifying account access (email sign-in) is not proof of
 * business ownership, so a claim needs DNS, a website file, or manual review.
 */
export async function startClaim(db: Db, ctx: Ctx, method: ClaimMethod, note?: string) {
  requireRole(ctx, "owner");
  const b = await requireBusiness(db, ctx);
  if (method !== "manual" && !b.websiteUrl) {
    throw new AppError("invalid", "Add your website address in My Business to verify with DNS or a file.");
  }
  const token = `growth-verify=${randomBytes(16).toString("hex")}`;
  const [claim] = await db
    .insert(ownershipClaims)
    .values({
      businessId: b.id,
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      method,
      verificationToken: token,
      target: method === "manual" ? null : hostOf(b.websiteUrl!),
      reviewNote: note ?? null,
    })
    .returning();
  await audit(db, ctx, "claim.started", claim.id, { method });
  return claim;
}

/**
 * Checks a DNS or file claim. A second workspace claiming the same website
 * host moves both claims into a disputed state for manual review instead of
 * replacing the existing owner.
 */
export async function verifyClaim(
  db: Db,
  ctx: Ctx,
  claimId: string,
  deps: { resolve?: Resolver; fetch?: Fetcher } = {},
) {
  requireRole(ctx, "owner");
  const [claim] = await db
    .select()
    .from(ownershipClaims)
    .where(and(eq(ownershipClaims.id, claimId), eq(ownershipClaims.workspaceId, ctx.workspaceId)));
  if (!claim) throw new AppError("not_found", "Claim not found.");
  if (claim.status !== "pending") return claim;
  if (claim.method === "manual") throw new AppError("invalid", "Manual claims are reviewed by our support team.");

  let found = false;
  let reason = "";
  try {
    if (claim.method === "dns") {
      const records = await (deps.resolve ?? defaultResolver)(`${DNS_PREFIX}.${claim.target}`);
      found = records.some((r) => r.join("").trim() === claim.verificationToken);
      if (!found) reason = `No TXT record with the expected value at ${DNS_PREFIX}.${claim.target}`;
    } else {
      const res = await (deps.fetch ?? defaultFetcher)(`https://${claim.target}${VERIFY_FILE_PATH}`);
      found = res.status === 200 && res.body.trim() === claim.verificationToken;
      if (!found) reason = res.status === 200 ? "The file doesn't contain the expected value" : `The file returned HTTP ${res.status}`;
    }
  } catch (err) {
    reason = err instanceof Error ? err.message : "Lookup failed";
  }
  if (!found) throw new AppError("precondition_failed", `Not verified yet: ${reason}. DNS changes can take up to an hour.`);

  const outcome = await db.transaction(async (tx) => {
    const competing = await tx
      .select()
      .from(ownershipClaims)
      .where(
        and(
          eq(ownershipClaims.target, claim.target!),
          eq(ownershipClaims.status, "verified"),
          ne(ownershipClaims.workspaceId, ctx.workspaceId),
        ),
      );
    if (competing.length) {
      await tx
        .update(ownershipClaims)
        .set({ status: "disputed" })
        .where(inArray(ownershipClaims.id, [claim.id, ...competing.map((c) => c.id)]));
      await tx
        .update(businessProfiles)
        .set({ status: "disputed" })
        .where(inArray(businessProfiles.businessId, [claim.businessId, ...competing.map((c) => c.businessId)]));
      await audit(tx, ctx, "claim.disputed", claim.id, { target: claim.target });
      return { disputed: true as const };
    }
    const [updated] = await tx
      .update(ownershipClaims)
      .set({ status: "verified", verifiedAt: new Date() })
      .where(eq(ownershipClaims.id, claim.id))
      .returning();
    await tx.update(businessProfiles).set({ verification: claim.method }).where(eq(businessProfiles.businessId, claim.businessId));
    await audit(tx, ctx, "claim.verified", claim.id, { method: claim.method });
    return { disputed: false as const, claim: updated };
  });
  // Raised after commit so the dispute state is kept.
  if (outcome.disputed) {
    throw new AppError("conflict", "Another account has already verified this website. Both claims are now under review by our team.");
  }
  return outcome.claim;
}

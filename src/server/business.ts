import { and, asc, eq, sql } from "drizzle-orm";
import type { z } from "zod";
import type { Db, DbOrTx } from "@/db";
import { businessProfiles, businesses, type Business } from "@/db/schema";
import { toPublicProfile } from "@/lib/profile";
import { checkSlug, slugify } from "@/lib/slug";
import type { basicsSchema, businessDetailsSchema, offerSchema } from "@/lib/validation";
import { AppError, audit, requireRole, type Ctx } from "./context";

export async function getBusiness(db: DbOrTx, ctx: Ctx): Promise<Business | null> {
  const [b] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.workspaceId, ctx.workspaceId))
    .orderBy(asc(businesses.createdAt))
    .limit(1);
  return b ?? null;
}

export async function requireBusiness(db: DbOrTx, ctx: Ctx): Promise<Business> {
  const b = await getBusiness(db, ctx);
  if (!b) throw new AppError("not_found", "Add your business first.");
  return b;
}

/** Finds a free slug: the base, then base-2, base-3 … */
export async function uniqueSlug(
  db: DbOrTx,
  base: string,
  taken: (db: DbOrTx, slug: string) => Promise<boolean>,
): Promise<string> {
  let root = slugify(base) || "business";
  if (checkSlug(root)) root = `${root}-site`.replace(/^-/, "");
  for (let i = 1; i < 100; i++) {
    const candidate = i === 1 ? root : `${root.slice(0, 44)}-${i}`;
    if (!checkSlug(candidate) && !(await taken(db, candidate))) return candidate;
  }
  return `${root.slice(0, 36)}-${Date.now().toString(36)}`;
}

const profileSlugTaken = async (db: DbOrTx, slug: string) =>
  (await db.select({ s: businessProfiles.slug }).from(businessProfiles).where(eq(businessProfiles.slug, slug))).length > 0;

export async function saveBasics(db: Db, ctx: Ctx, input: z.infer<typeof basicsSchema>): Promise<Business> {
  requireRole(ctx, "editor");
  return db.transaction(async (tx) => {
    const existing = await getBusiness(tx, ctx);
    if (existing) {
      const [b] = await tx
        .update(businesses)
        .set({
          ...input,
          onboardingStep: Math.max(existing.onboardingStep, 3),
          version: sql`${businesses.version} + 1`,
          updatedAt: new Date(),
        })
        .where(and(eq(businesses.id, existing.id), eq(businesses.workspaceId, ctx.workspaceId)))
        .returning();
      return b;
    }
    const [b] = await tx
      .insert(businesses)
      .values({ ...input, workspaceId: ctx.workspaceId, onboardingStep: 3 })
      .returning();
    const slug = await uniqueSlug(tx, `${input.name} ${input.city}`, profileSlugTaken);
    await tx.insert(businessProfiles).values({ businessId: b.id, workspaceId: ctx.workspaceId, slug });
    await audit(tx, ctx, "business.created", b.id);
    return b;
  });
}

async function patch(db: DbOrTx, ctx: Ctx, values: Partial<typeof businesses.$inferInsert>, factChange = true) {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  const [updated] = await db
    .update(businesses)
    .set({ ...values, ...(factChange ? { version: sql`${businesses.version} + 1` } : {}), updatedAt: new Date() })
    .where(and(eq(businesses.id, b.id), eq(businesses.workspaceId, ctx.workspaceId)))
    .returning();
  return updated;
}

export async function saveWebsiteChoice(db: Db, ctx: Ctx, hasWebsite: boolean, websiteUrl: string | null) {
  const b = await requireBusiness(db, ctx);
  return patch(db, ctx, {
    hasWebsite,
    websiteUrl: hasWebsite ? websiteUrl : b.websiteUrl,
    onboardingStep: Math.max(b.onboardingStep, 4),
  });
}

export async function saveOffer(db: Db, ctx: Ctx, input: z.infer<typeof offerSchema>) {
  const b = await requireBusiness(db, ctx);
  return patch(db, ctx, { ...input, onboardingStep: Math.max(b.onboardingStep, 5) });
}

/** Step 5: the owner confirms details and which contact fields may be shown publicly. */
export async function confirmReview(db: Db, ctx: Ctx, showAddress: boolean) {
  const b = await requireBusiness(db, ctx);
  return patch(db, ctx, {
    showAddress,
    publicContactConfirmedAt: new Date(),
    onboardingStep: Math.max(b.onboardingStep, 6),
  });
}

export async function completeOnboarding(db: Db, ctx: Ctx) {
  return patch(db, ctx, { onboardingCompletedAt: new Date() }, false);
}

export async function updateBusinessDetails(db: Db, ctx: Ctx, input: z.infer<typeof businessDetailsSchema>) {
  requireRole(ctx, "editor");
  const { expectedVersion, ...values } = input;
  return db.transaction(async (tx) => {
    const b = await requireBusiness(tx, ctx);
    if (b.version !== expectedVersion) {
      throw new AppError(
        "precondition_failed",
        "These details were changed in another window. Reload to see the latest version, then make your changes again.",
      );
    }
    const contactChanged =
      b.phone !== values.phone || b.whatsapp !== values.whatsapp || b.email !== values.email || b.address !== values.address || b.showAddress !== values.showAddress;
    const [updated] = await tx
      .update(businesses)
      .set({
        ...values,
        // Changed public contact fields must be confirmed again before they are published.
        ...(contactChanged ? { publicContactConfirmedAt: null } : {}),
        version: b.version + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(businesses.id, b.id), eq(businesses.workspaceId, ctx.workspaceId)))
      .returning();
    await audit(tx, ctx, "business.updated", b.id, { version: updated.version });
    return updated;
  });
}

export async function confirmPublicContact(db: Db, ctx: Ctx) {
  return patch(db, ctx, { publicContactConfirmedAt: new Date() }, false);
}

// ---------- Public profile ----------

export async function getProfile(db: DbOrTx, ctx: Ctx) {
  const b = await requireBusiness(db, ctx);
  const [p] = await db
    .select()
    .from(businessProfiles)
    .where(and(eq(businessProfiles.businessId, b.id), eq(businessProfiles.workspaceId, ctx.workspaceId)));
  return p ?? null;
}

/** Copies the current confirmed facts into the public projection. Owner only. */
export async function publishProfile(db: Db, ctx: Ctx) {
  requireRole(ctx, "owner");
  return db.transaction(async (tx) => {
    const b = await requireBusiness(tx, ctx);
    if (!b.publicContactConfirmedAt) {
      throw new AppError("precondition_failed", "Confirm which contact details can be public before publishing.");
    }
    const profile = await getProfile(tx, ctx);
    if (!profile) throw new AppError("not_found", "Profile not found.");
    if (profile.status === "suspended" || profile.status === "disputed") {
      throw new AppError("forbidden", "This profile is under review and can't be published right now. Contact support.");
    }
    const [p] = await tx
      .update(businessProfiles)
      .set({ status: "published", publishedData: toPublicProfile(b), publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(businessProfiles.businessId, b.id))
      .returning();
    await audit(tx, ctx, "profile.published", b.id);
    return p;
  });
}

export async function unpublishProfile(db: Db, ctx: Ctx) {
  requireRole(ctx, "owner");
  const b = await requireBusiness(db, ctx);
  await db
    .update(businessProfiles)
    .set({ status: "unpublished", updatedAt: new Date() })
    .where(and(eq(businessProfiles.businessId, b.id), eq(businessProfiles.status, "published")));
  await audit(db, ctx, "profile.unpublished", b.id);
}

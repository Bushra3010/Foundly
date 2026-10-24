import { createHash } from "node:crypto";
import { and, desc, eq, inArray, max, sql } from "drizzle-orm";
import { factsFromSiteContent, slugify } from "@/lib/geo";
import type { Db, DbOrTx } from "@/db";
import { businessProfiles, jobs, siteSlugRedirects, siteVersions, sites, type Site } from "@/db/schema";
import { siteContent, type SiteContent } from "@/lib/site/content";
import { buildBlock, factsFromBusiness, generateSite, requiredFactsProblems } from "@/lib/site/generate";
import { toPublicProfile } from "@/lib/profile";
import { checkSlug, SLUG_PROBLEM_TEXT } from "@/lib/slug";
import { businessIdOf, requireBusiness, uniqueSlug } from "./business";
import { AppError, audit, requireRole, type Ctx } from "./context";
import { requireEntitlement } from "./billing/service";
import { refreshPublicPages, withPublicRefresh } from "./public-cache";

export async function getSite(db: DbOrTx, ctx: Ctx): Promise<Site | null> {
  const [s] = await db
    .select()
    .from(sites)
    .where(and(inArray(sites.businessId, businessIdOf(db, ctx)), eq(sites.workspaceId, ctx.workspaceId)));
  return s ?? null;
}

async function requireSite(db: DbOrTx, ctx: Ctx, forUpdate = false): Promise<Site> {
  const b = await requireBusiness(db, ctx);
  const q = db
    .select()
    .from(sites)
    .where(and(eq(sites.businessId, b.id), eq(sites.workspaceId, ctx.workspaceId)));
  const [s] = forUpdate ? await q.for("update") : await q;
  if (!s) throw new AppError("not_found", "Generate your website first.");
  return s;
}

const siteSlugTaken = async (db: DbOrTx, slug: string) => {
  const [a] = await db.select({ id: sites.id }).from(sites).where(eq(sites.slug, slug));
  const [b] = await db.select({ id: siteSlugRedirects.siteId }).from(siteSlugRedirects).where(eq(siteSlugRedirects.oldSlug, slug));
  return !!(a || b);
};

export function contentHash(content: SiteContent): string {
  return createHash("sha256").update(JSON.stringify(content)).digest("hex");
}

// ---------- Generation job ----------

/**
 * Generates a private draft from confirmed facts. Idempotent per business
 * version and request: repeating a request returns the existing job instead of
 * running (or charging) again, and retrying a failed job reuses it. A failure
 * never touches the existing draft.
 */
export async function generateSiteDraft(
  db: Db,
  ctx: Ctx,
  opts: { requestId?: string; failForTest?: boolean } = {},
) {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  const problems = requiredFactsProblems(b);
  if (problems.length) throw new AppError("invalid", problems.join(". ") + ".", { problems });

  // requestId comes from the rendered form, so a double submit maps to the same job.
  const requestId = (opts.requestId ?? "initial").slice(0, 64);
  const idempotencyKey = `site.generate:${b.id}:v${b.version}:${requestId}`;
  await db
    .insert(jobs)
    .values({ workspaceId: ctx.workspaceId, type: "site.generate", idempotencyKey, input: { businessVersion: b.version } })
    .onConflictDoNothing();
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.workspaceId, ctx.workspaceId), eq(jobs.idempotencyKey, idempotencyKey)));

  if (job.status === "ready") return job;
  if (job.status === "generating" || job.status === "validating") return job;

  const setStatus = (status: (typeof job)["status"], extra: Partial<typeof jobs.$inferInsert> = {}) =>
    db
      .update(jobs)
      .set({ status, updatedAt: new Date(), ...extra })
      .where(eq(jobs.id, job.id))
      .returning()
      .then((r) => r[0]);

  await setStatus("generating", { attempts: job.attempts + 1, error: null });
  try {
    if (opts.failForTest) throw new Error("Simulated generation failure");
    const draft = generateSite(b);
    await setStatus("validating");
    const valid = siteContent.parse(draft);

    const siteId = await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(sites).where(eq(sites.businessId, b.id)).for("update");
      if (existing) {
        await tx
          .update(sites)
          .set({
            draft: valid,
            draftRevision: existing.draftRevision + 1,
            generatedFromVersion: b.version,
            updatedAt: new Date(),
          })
          .where(eq(sites.id, existing.id));
        return existing.id;
      }
      const [profile] = await tx.select().from(businessProfiles).where(eq(businessProfiles.businessId, b.id));
      const slug = await uniqueSlug(tx, profile?.slug ?? b.name, siteSlugTaken);
      const [created] = await tx
        .insert(sites)
        .values({ workspaceId: ctx.workspaceId, businessId: b.id, slug, draft: valid, generatedFromVersion: b.version })
        .returning();
      return created.id;
    });
    await audit(db, ctx, "site.generated", siteId, { businessVersion: b.version });
    return setStatus("ready", { result: { siteId } });
  } catch (err) {
    return setStatus("failed", { error: err instanceof Error ? err.message : "Unknown error" });
  }
}

export async function latestGenerationJob(db: DbOrTx, ctx: Ctx) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.workspaceId, ctx.workspaceId), eq(jobs.type, "site.generate")))
    .orderBy(desc(jobs.updatedAt))
    .limit(1);
  return job ?? null;
}

// ---------- Draft editing ----------

/**
 * Replaces the draft if the caller edited the current revision. Facts are
 * server-owned and can't be changed through the draft.
 */
export async function saveDraft(db: Db, ctx: Ctx, input: unknown, expectedRevision: number) {
  requireRole(ctx, "editor");
  const parsed = siteContent.safeParse(input);
  if (!parsed.success) {
    throw new AppError("invalid", "Some fields need attention before this can be saved.", {
      issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  return db.transaction(async (tx) => {
    const site = await requireSite(tx, ctx, true);
    if (site.draftRevision !== expectedRevision) {
      throw new AppError("precondition_failed", "This draft was changed in another window. Reload to get the latest version.");
    }
    const draft: SiteContent = { ...parsed.data, facts: site.draft.facts };
    const [updated] = await tx
      .update(sites)
      .set({ draft, draftRevision: site.draftRevision + 1, updatedAt: new Date() })
      .where(eq(sites.id, site.id))
      .returning();
    return updated;
  });
}

/** Rebuilds one block from current facts; every other block keeps its edits. */
export async function regenerateBlock(db: Db, ctx: Ctx, blockId: string, expectedRevision: number) {
  requireRole(ctx, "editor");
  return db.transaction(async (tx) => {
    const site = await requireSite(tx, ctx, true);
    if (site.draftRevision !== expectedRevision) {
      throw new AppError("precondition_failed", "This draft was changed in another window. Reload to get the latest version.");
    }
    const b = await requireBusiness(tx, ctx);
    let found = false;
    const pages = site.draft.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((blk) => {
        if (blk.id !== blockId) return blk;
        found = true;
        return buildBlock(blk.type, b, blk.id) ?? blk;
      }),
    }));
    if (!found) throw new AppError("not_found", "That section no longer exists.");
    const draft = siteContent.parse({ ...site.draft, pages, facts: factsFromBusiness(b) });
    const [updated] = await tx
      .update(sites)
      .set({ draft, draftRevision: site.draftRevision + 1, updatedAt: new Date() })
      .where(eq(sites.id, site.id))
      .returning();
    return updated;
  });
}

// ---------- Publishing ----------

/**
 * Creates an immutable version from the reviewed draft revision and points the
 * live site at it in one transaction. Owner only.
 */
export async function publishSite(db: Db, ctx: Ctx, expectedRevision: number) {
  requireRole(ctx, "owner");
  await requireEntitlement(db, ctx.workspaceId, "hostedSite");
  return withPublicRefresh(db.transaction(async (tx) => {
    const site = await requireSite(tx, ctx, true);
    if (site.draftRevision !== expectedRevision) {
      throw new AppError(
        "precondition_failed",
        "The draft changed after you reviewed it. Review the latest preview, then publish again.",
      );
    }
    const b = await requireBusiness(tx, ctx);
    if (!b.publicContactConfirmedAt) {
      throw new AppError("precondition_failed", "Confirm which contact details can be public before publishing.");
    }
    const [profile] = await tx.select().from(businessProfiles).where(eq(businessProfiles.businessId, b.id));
    if (profile && (profile.status === "suspended" || profile.status === "disputed")) {
      throw new AppError("forbidden", "This business is under review and can't be published right now.");
    }

    // Facts are refreshed at publish time so the live site shows the confirmed details.
    const content = siteContent.parse({ ...site.draft, facts: factsFromBusiness(b) });
    const hash = contentHash(content);

    const [{ n }] = await tx
      .select({ n: max(siteVersions.versionNumber) })
      .from(siteVersions)
      .where(eq(siteVersions.siteId, site.id));
    const [version] = await tx
      .insert(siteVersions)
      .values({
        siteId: site.id,
        workspaceId: ctx.workspaceId,
        versionNumber: (n ?? 0) + 1,
        content,
        contentHash: hash,
        draftRevision: site.draftRevision,
        createdBy: ctx.userId,
      })
      .returning();
    await tx.update(sites).set({ publishedVersionId: version.id, updatedAt: new Date() }).where(eq(sites.id, site.id));

    // Publishing the website also publishes the matching directory profile.
    await tx
      .update(businessProfiles)
      .set({ status: "published", publishedData: toPublicProfile(b), publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(businessProfiles.businessId, b.id));

    await audit(tx, ctx, "site.published", site.id, { version: version.versionNumber, hash });
    return version;
  }));
}

export async function listVersions(db: DbOrTx, ctx: Ctx) {
  return db
    .select({
      id: siteVersions.id,
      versionNumber: siteVersions.versionNumber,
      createdAt: siteVersions.createdAt,
      contentHash: siteVersions.contentHash,
    })
    .from(siteVersions)
    .innerJoin(sites, eq(sites.id, siteVersions.siteId))
    .where(
      and(
        eq(siteVersions.workspaceId, ctx.workspaceId),
        eq(sites.workspaceId, ctx.workspaceId),
        inArray(sites.businessId, businessIdOf(db, ctx)),
      ),
    )
    .orderBy(desc(siteVersions.versionNumber));
}

export async function rollbackSite(db: Db, ctx: Ctx, versionId: string) {
  requireRole(ctx, "owner");
  return withPublicRefresh(db.transaction(async (tx) => {
    const site = await requireSite(tx, ctx, true);
    const [version] = await tx
      .select()
      .from(siteVersions)
      .where(
        and(eq(siteVersions.id, versionId), eq(siteVersions.siteId, site.id), eq(siteVersions.workspaceId, ctx.workspaceId)),
      );
    if (!version) throw new AppError("not_found", "That version doesn't exist.");
    await tx.update(sites).set({ publishedVersionId: version.id, updatedAt: new Date() }).where(eq(sites.id, site.id));
    await audit(tx, ctx, "site.rolled_back", site.id, { to: version.versionNumber, from: site.publishedVersionId });
    return version;
  }));
}

export async function unpublishSite(db: Db, ctx: Ctx) {
  requireRole(ctx, "owner");
  const site = await requireSite(db, ctx);
  await db.update(sites).set({ publishedVersionId: null, updatedAt: new Date() }).where(eq(sites.id, site.id));
  await audit(db, ctx, "site.unpublished", site.id);
  refreshPublicPages();
}

/** Changes the site address; the old address keeps redirecting. */
export async function changeSiteSlug(db: Db, ctx: Ctx, newSlug: string) {
  requireRole(ctx, "owner");
  const problem = checkSlug(newSlug);
  if (problem) throw new AppError("invalid", SLUG_PROBLEM_TEXT[problem]);
  return withPublicRefresh(db.transaction(async (tx) => {
    const site = await requireSite(tx, ctx, true);
    if (site.slug === newSlug) return site;
    const [ownRedirect] = await tx
      .select()
      .from(siteSlugRedirects)
      .where(and(eq(siteSlugRedirects.oldSlug, newSlug), eq(siteSlugRedirects.siteId, site.id)));
    if (ownRedirect) {
      await tx.delete(siteSlugRedirects).where(eq(siteSlugRedirects.oldSlug, newSlug));
    } else if (await siteSlugTaken(tx, newSlug)) {
      throw new AppError("conflict", "That address is already taken. Try another.");
    }
    await tx.insert(siteSlugRedirects).values({ oldSlug: site.slug, siteId: site.id });
    const [updated] = await tx
      .update(sites)
      .set({ slug: newSlug, updatedAt: new Date() })
      .where(eq(sites.id, site.id))
      .returning();
    await audit(tx, ctx, "site.slug_changed", site.id, { from: site.slug, to: newSlug });
    return updated;
  }));
}

// ---------- Public delivery ----------

export type PublicSiteResult =
  | { kind: "site"; slug: string; content: SiteContent; versionNumber: number; publishedAt: Date; profileSlug: string | null }
  | { kind: "redirect"; slug: string }
  | { kind: "none" };

/** Resolves a live site by address. Reads only published versions. */
export async function getPublishedSite(db: DbOrTx, slug: string): Promise<PublicSiteResult> {
  const [row] = await db
    .select({ site: sites, version: siteVersions, profileStatus: businessProfiles.status, profileSlug: businessProfiles.slug })
    .from(sites)
    .innerJoin(siteVersions, eq(siteVersions.id, sites.publishedVersionId))
    .leftJoin(businessProfiles, eq(businessProfiles.businessId, sites.businessId))
    .where(eq(sites.slug, slug));
  if (row) {
    if (row.profileStatus === "suspended") return { kind: "none" };
    return {
      kind: "site",
      slug: row.site.slug,
      content: row.version.content,
      versionNumber: row.version.versionNumber,
      publishedAt: row.version.createdAt,
      // Only a published profile is linked from the site's structured data.
      profileSlug: row.profileStatus === "published" ? row.profileSlug : null,
    };
  }
  const [redirect] = await db
    .select({ slug: sites.slug })
    .from(siteSlugRedirects)
    .innerJoin(sites, eq(sites.id, siteSlugRedirects.siteId))
    .where(eq(siteSlugRedirects.oldSlug, slug));
  return redirect ? { kind: "redirect", slug: redirect.slug } : { kind: "none" };
}

export async function listPublishedSiteSlugs(db: DbOrTx) {
  return db
    .select({ slug: sites.slug, updatedAt: sites.updatedAt })
    .from(sites)
    .innerJoin(businessProfiles, eq(businessProfiles.businessId, sites.businessId))
    .where(and(sql`${sites.publishedVersionId} is not null`, eq(businessProfiles.status, "published")));
}

/** Published sites with their service page slugs, for the sitemap. */
export async function listPublishedSiteServices(db: DbOrTx) {
  const rows = await db
    .select({ slug: sites.slug, updatedAt: sites.updatedAt, content: siteVersions.content })
    .from(sites)
    .innerJoin(siteVersions, eq(siteVersions.id, sites.publishedVersionId))
    .innerJoin(businessProfiles, eq(businessProfiles.businessId, sites.businessId))
    .where(eq(businessProfiles.status, "published"));
  return rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt, services: factsFromSiteContent(r.content).services.map((s) => slugify(s.name)) }));
}

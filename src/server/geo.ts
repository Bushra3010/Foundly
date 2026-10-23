import "server-only";
import type { DbOrTx } from "@/db";
import type { Business } from "@/db/schema";
import { geoReadiness } from "@/lib/geo";
import { getProfile } from "./business";
import type { Ctx } from "./context";
import { getSite } from "./sites";

/** AI readiness for the signed-in workspace's business. */
export async function readinessFor(db: DbOrTx, ctx: Ctx, business: Business) {
  const [site, profile] = await Promise.all([getSite(db, ctx), getProfile(db, ctx)]);
  const live = Boolean(site?.publishedVersionId);
  const faqCount = (site?.draft.pages ?? [])
    .flatMap((pg) => pg.blocks)
    .reduce((n, b) => n + (b.type === "faq" ? b.items.length : 0), 0);
  return geoReadiness({
    foundedYear: business.foundedYear,
    projectsCompleted: business.projectsCompleted,
    listings: business.listings,
    description: business.description,
    services: business.services,
    serviceAreas: business.serviceAreas,
    hours: business.hours,
    phone: business.phone,
    whatsapp: business.whatsapp,
    email: business.email,
    sitePublished: live,
    siteCurrent: Boolean(live && site && site.generatedFromVersion >= business.version),
    faqCount,
    profilePublished: profile?.status === "published",
    verified: Boolean(profile && profile.verification !== "none"),
  });
}

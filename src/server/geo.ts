import "server-only";
import type { DbOrTx } from "@/db";
import type { Business } from "@/db/schema";
import { geoReadiness } from "@/lib/geo";
import { currentWebsiteCheck, websiteCheckRunning } from "./audit/service";
import type { Ctx } from "./context";
import { currentProfile } from "@/server/current";

/** AI readiness for the signed-in workspace's business, including our check of its website. */
export async function readinessFor(db: DbOrTx, ctx: Ctx, business: Business) {
  const connected = Boolean(business.hasWebsite && business.websiteUrl);
  const [profile, check, running] = await Promise.all([
    currentProfile(db, ctx),
    connected ? currentWebsiteCheck(db, ctx, business.websiteUrl) : null,
    connected ? websiteCheckRunning(db, ctx, business.websiteUrl) : false,
  ]);
  const readiness = geoReadiness({
    confirmedAt: business.publicContactConfirmedAt,
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
    websiteConnected: connected,
    websiteCheck: check,
    profilePublished: profile?.status === "published",
    verified: Boolean(profile && profile.verification !== "none"),
  });
  return { ...readiness, websiteRunning: running };
}

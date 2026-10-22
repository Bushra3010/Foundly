// Seeds a demo owner into the local dev database and prints a session cookie.
// Usage: npx vite-node -c vitest.config.ts scripts/seed-dev.ts
import { getDb } from "@/db";
import { consumeLoginToken, contextForUser, createLoginToken } from "@/server/auth";
import { completeOnboarding, confirmReview, saveBasics, saveOffer, saveWebsiteChoice } from "@/server/business";
import { generateSiteDraft, getSite, publishSite } from "@/server/sites";

async function main() {
  const db = await getDb();
  const { userId, sessionToken } = await consumeLoginToken(db, await createLoginToken(db, "demo-owner@example.com"));
  const ctx = (await contextForUser(db, userId))!;
  await saveBasics(db, ctx, { name: "Demo Plumbing", category: "Plumber", city: "Pune", phone: "+91 98765 43210", whatsapp: "+91 98765 43210", email: null });
  await saveWebsiteChoice(db, ctx, false, null);
  await saveOffer(db, ctx, { services: [{ name: "Leak repair" }, { name: "Bathroom fitting" }], audience: null, serviceAreas: ["Kothrud", "Baner"] });
  await confirmReview(db, ctx, false);
  await generateSiteDraft(db, ctx);
  await completeOnboarding(db, ctx);
  const site = (await getSite(db, ctx))!;
  if (process.argv.includes("--publish")) await publishSite(db, ctx, site.draftRevision);
  console.log(`COOKIE=${sessionToken}`);
  console.log(`SLUG=${site.slug}`);
}
main().then(() => process.exit(0));

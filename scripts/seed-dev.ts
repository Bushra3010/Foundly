// Seeds a demo owner into the local dev database and prints a session cookie.
// Usage: npx vite-node -c vitest.config.ts scripts/seed-dev.ts [--request]
// --request also sends a website request, so the admin console has one to work on.
//
// Local demo logins (dev database only), both with DEMO_PASSWORD below:
// - demo-owner@example.com: set up, with a published profile.
// - demo-new@example.com: a new account that hasn't started onboarding yet.
// Start the server with ADMIN_EMAILS=demo-owner@example.com to use the same login at /admin/login.
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/server/password";
import { consumeLoginToken, contextForUser, createLoginToken } from "@/server/auth";
import { completeOnboarding, confirmReview, publishProfile, saveBasics, saveOffer, saveWebsiteChoice } from "@/server/business";
import { createWebsiteRequest } from "@/server/website-requests";

const DEMO_PASSWORD = "foundly-demo-2026";

async function main() {
  const db = await getDb();
  const { userId, sessionToken } = await consumeLoginToken(db, await createLoginToken(db, "demo-owner@example.com"));
  const ctx = (await contextForUser(db, userId))!;
  await db.update(users).set({ passwordHash: await hashPassword(DEMO_PASSWORD) }).where(eq(users.id, userId));
  await saveBasics(db, ctx, { name: "Demo Plumbing", category: "Plumber", city: "Pune", phone: "+91 98765 43210", whatsapp: "+91 98765 43210", email: null });
  await saveWebsiteChoice(db, ctx, false, null);
  await saveOffer(db, ctx, { services: [{ name: "Leak repair" }, { name: "Bathroom fitting" }], audience: null, serviceAreas: ["Kothrud", "Baner"] });
  await confirmReview(db, ctx, false);
  await publishProfile(db, ctx);
  await completeOnboarding(db, ctx);
  // A second, brand-new account for trying sign-in and onboarding from the start.
  const fresh = await consumeLoginToken(db, await createLoginToken(db, "demo-new@example.com"));
  await db.update(users).set({ passwordHash: await hashPassword(DEMO_PASSWORD) }).where(eq(users.id, fresh.userId));
  if (process.argv.includes("--request")) {
    await createWebsiteRequest(db, ctx, { goal: "Get more bookings from homes in Pune", pages: "Home, services, contact", style: null, examples: null, contactMethod: "whatsapp", contactValue: "+91 98765 43210", contactTime: "Weekdays after 6 pm" });
  }
  console.log(`COOKIE=${sessionToken}`);
  console.log(`NEW_COOKIE=${fresh.sessionToken}`);
}
main().then(() => process.exit(0));

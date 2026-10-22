import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Db } from "@/db";
import * as schema from "@/db/schema";
import { consumeLoginToken, contextForUser, createLoginToken } from "@/server/auth";
import { confirmReview, saveBasics, saveOffer, saveWebsiteChoice } from "@/server/business";
import type { Ctx } from "@/server/context";

export async function makeDb(): Promise<Db> {
  const db = drizzle({ client: new PGlite(), schema });
  await migrate(db, { migrationsFolder: path.join(__dirname, "..", "drizzle") });
  return db;
}

export async function signUp(db: Db, email: string): Promise<Ctx> {
  const token = await createLoginToken(db, email);
  const { userId } = await consumeLoginToken(db, token);
  return (await contextForUser(db, userId))!;
}

export async function onboard(db: Db, ctx: Ctx, name = "Sharma Plumbing") {
  await saveBasics(db, ctx, { name, category: "Plumber", city: "Pune", phone: "+91 98765 43210", whatsapp: null, email: null });
  await saveWebsiteChoice(db, ctx, false, null);
  await saveOffer(db, ctx, {
    services: [{ name: "Leak repair" }, { name: "Bathroom fitting", description: "Taps, showers and drains." }],
    audience: null,
    serviceAreas: ["Kothrud", "Baner"],
  });
  await confirmReview(db, ctx, false);
}

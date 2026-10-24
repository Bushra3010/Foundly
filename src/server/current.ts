import "server-only";
import { cache } from "react";
import { AppError, type Ctx } from "./context";
import type { DbOrTx } from "@/db";
import { getBusiness, getProfile } from "./business";
import { getSite } from "./sites";

/**
 * Reads for pages and layouts, shared within one request: the app layout,
 * the page and its panels ask for the same business, site and profile, and
 * each is fetched once. Server actions use the plain functions so they always
 * read their own writes.
 */
export const currentBusiness = cache(getBusiness);
export const currentSite = cache(getSite);
export const currentProfile = cache(getProfile);

export async function requireCurrentBusiness(db: DbOrTx, ctx: Ctx) {
  const b = await currentBusiness(db, ctx);
  if (!b) throw new AppError("not_found", "Add your business first.");
  return b;
}

import "server-only";
import type { DbOrTx } from "@/db";
import type { Business } from "@/db/schema";
import { toPublicProfile } from "@/lib/profile";
import type { KitInput } from "@/lib/presence";
import { getProfile } from "./business";
import type { Ctx } from "./context";
import { getListingText } from "./listing-text";

/**
 * Everything the listing kit needs for this business: the confirmed facts,
 * the links, and the AI-written descriptions when there are any. Used by the
 * Connections page and by the Google and Facebook syncs, so they all agree.
 */
export async function kitInputFor(db: DbOrTx, ctx: Ctx, b: Business): Promise<{ input: KitInput; aiText: Awaited<ReturnType<typeof getListingText>>; stale: boolean }> {
  const [profile, aiText] = await Promise.all([getProfile(db, ctx), getListingText(db, ctx)]);
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const profileUrl = `${appUrl}/b/${profile?.slug ?? ""}`;
  const p = toPublicProfile(b);
  return {
    input: { ...p, description: p.description, websiteUrl: b.websiteUrl ?? profileUrl, profileUrl, aiText: aiText?.data ?? null },
    aiText,
    stale: !!aiText && aiText.businessVersion !== b.version,
  };
}

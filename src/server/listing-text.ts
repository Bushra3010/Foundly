import "server-only";
import { eq } from "drizzle-orm";
import type { Db, DbOrTx } from "@/db";
import { listingTexts, type ListingTextData } from "@/db/schema";
import { clip } from "@/lib/presence";
import { jsonObject, pickCompleter, type Completer } from "./ai/complete";
import { factSheet } from "./audit/ai-draft";
import { requireBusiness } from "./business";
import { AppError, audit, requireRole, type Ctx } from "./context";
import { rateLimit } from "./rate-limit";

const PER_DAY = 5;

/** Each text the model writes, with the platform limit it must fit. */
export const LISTING_FIELDS: { key: keyof ListingTextData; limit: number; brief: string }[] = [
  { key: "description750", limit: 750, brief: "Google Business Profile description, up to 750 characters: what the business does, where, which services, who it is for, and how to get in touch. Three or four short paragraphs are fine." },
  { key: "description500", limit: 500, brief: "Directory description (Justdial, Sulekha), up to 500 characters, in one paragraph." },
  { key: "short255", limit: 255, brief: "Facebook short description, up to 255 characters, one or two sentences." },
  { key: "about1000", limit: 1000, brief: "Facebook About / YouTube channel description, up to 1000 characters, two or three short paragraphs." },
  { key: "bio150", limit: 150, brief: "Instagram bio, up to 150 characters: kind of business, city, two or three services, separated by middle dots." },
  { key: "tagline120", limit: 120, brief: "LinkedIn tagline, up to 120 characters, one line." },
];

export async function getListingText(db: DbOrTx, ctx: Pick<Ctx, "workspaceId">) {
  const [row] = await db.select().from(listingTexts).where(eq(listingTexts.workspaceId, ctx.workspaceId));
  return row ?? null;
}

const SYSTEM =
  "You write listing descriptions for a small local business in India, from a fact sheet. " +
  "Use only the facts given. Never invent years, numbers, prices, awards, ratings, certifications, reviews or claims like best, top, leading or number one. " +
  "Do not use square-bracket placeholders; if a fact is missing, leave it out. Plain Indian English, specific and warm, no hype, no exclamation marks, no emoji, no hashtags. " +
  "Every text must fit its character limit. Reply with only a JSON object whose keys are the field names and whose values are the texts.";

/**
 * Writes one description per platform limit from the owner's confirmed facts.
 * The texts feed the listing kit, so Google and Facebook (when connected) and
 * every copy-and-paste listing carry the same wording.
 */
export async function writeListingText(db: Db, ctx: Ctx, deps: { complete?: Completer | null } = {}) {
  requireRole(ctx, "editor");
  const complete = pickCompleter(deps.complete);
  if (!complete) throw new AppError("precondition_failed", "An AI source needs to be connected to write listing text.");
  const b = await requireBusiness(db, ctx);
  if (!b.category.trim() || !b.city.trim()) throw new AppError("precondition_failed", "Add your kind of business and city in My Business first.");
  if (!(await rateLimit(db, `listing-text:${ctx.workspaceId}`, PER_DAY, 86_400_000))) throw new AppError("rate_limited", `You can rewrite listing text ${PER_DAY} times a day. Try again tomorrow.`);
  const user = `Fields to write:\n${LISTING_FIELDS.map((f) => `- ${f.key}: ${f.brief}`).join("\n")}\n\nFact sheet:\n${factSheet(b)}`;
  const json = jsonObject<Partial<Record<keyof ListingTextData, unknown>>>(await complete(SYSTEM, user));
  if (!json) throw new AppError("invalid", "The AI source returned something we couldn't read. Try again.");
  const data = Object.fromEntries(
    LISTING_FIELDS.map((f) => {
      // Bracketed placeholders are dropped (listings have no owner edit step), then the spacing is tidied.
      const raw = typeof json[f.key] === "string" ? (json[f.key] as string).replace(/\s*\[[^\]]*\]/g, "").replace(/[ \t]+([.,;:!?])/g, "$1").replace(/[ \t]{2,}/g, " ").replace(/[ \t]+\n/g, "\n").trim() : "";
      return [f.key, clip(raw, f.limit)];
    }),
  ) as ListingTextData;
  if (!data.description750 || !data.short255) throw new AppError("invalid", "The AI source left the main description empty. Try again.");
  await db
    .insert(listingTexts)
    .values({ workspaceId: ctx.workspaceId, data, businessVersion: b.version, generatedAt: new Date() })
    .onConflictDoUpdate({ target: listingTexts.workspaceId, set: { data, businessVersion: b.version, generatedAt: new Date() } });
  await audit(db, ctx, "listing_text.written", undefined, { version: b.version });
  return data;
}

import "server-only";
import type { Db } from "@/db";
import { parseKeywordList } from "@/lib/keywords";
import { suggestKeywords } from "@/lib/questions";
import { requireBusiness } from "./business";
import { AppError, requireRole, type Ctx } from "./context";
import { enabledAdapters } from "./monitoring/registry";
import { listQuestions } from "./monitoring/service";
import type { ProviderAdapter } from "./monitoring/types";
import { rateLimit } from "./rate-limit";

const PER_DAY = 5;

/**
 * Keyword ideas: what customers would ask an AI assistant to find a business
 * like this one. Asks a connected AI source when there is one, otherwise
 * builds ideas from the owner's own details. Never includes the business name
 * or keywords already tracked.
 */
export async function researchKeywords(
  db: Db,
  ctx: Ctx,
  focus = "",
  deps: { adapter?: ProviderAdapter | null } = {},
): Promise<{ ideas: string[]; source: "ai" | "details" }> {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  const tracked = new Set((await listQuestions(db, ctx)).map((q) => (q.keyword ?? q.text).toLowerCase()));
  const name = b.name.toLowerCase();
  const clean = (list: string[]) =>
    parseKeywordList(list.join("\n"))
      .filter((k) => k.split(" ").length >= 2 && k.length <= 60 && !k.toLowerCase().includes(name) && !tracked.has(k.toLowerCase()))
      .slice(0, 12);
  const fromDetails = () => clean(suggestKeywords({ category: b.category, city: b.city, services: b.services.map((s) => s.name) }));

  const adapter = deps.adapter === undefined ? enabledAdapters()[0] : deps.adapter;
  if (!adapter) return { ideas: fromDetails(), source: "details" };
  if (!(await rateLimit(db, `research:${ctx.workspaceId}`, PER_DAY, 86_400_000))) {
    throw new AppError("rate_limited", `You can get new ideas ${PER_DAY} times a day. Try again tomorrow.`);
  }
  const topic = focus.trim().slice(0, 80) || [b.category, ...b.services.slice(0, 3).map((s) => s.name)].filter(Boolean).join(", ");
  const question =
    `A customer in ${b.city || "India"} wants to find ${topic}. ` +
    "List 12 different short phrases (3 to 7 words) they would type into ChatGPT or Google to find and choose a local business. " +
    "Include the city or a nearby area where natural. One phrase per line, no numbering, no quotes, no business names.";
  const result = await adapter
    .ask({ question, country: b.country || "IN", language: "en", location: b.city || null }, AbortSignal.timeout(45_000))
    .catch(() => null);
  const lines = (result?.answer ?? "").split("\n").map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, ""));
  const ideas = clean(lines);
  return ideas.length ? { ideas, source: "ai" } : { ideas: fromDetails(), source: "details" };
}

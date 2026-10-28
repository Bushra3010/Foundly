import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import type { Db } from "@/db";
import { brandProfiles, type BrandProfileData } from "@/db/schema";
import { requireBusiness } from "./business";
import { AppError, requireRole, type Ctx } from "./context";
import { effectiveMention } from "./monitoring/metrics";
import { queryObservations } from "./monitoring/service";
import { rateLimit } from "./rate-limit";

export type Completer = (system: string, user: string) => Promise<string>;

const claudeComplete: Completer = async (system, user) => {
  const client = new Anthropic({ maxRetries: 1 });
  const res = await client.messages.create(
    { model: process.env.CLAUDE_MONITOR_MODEL || "claude-haiku-5-5", max_tokens: 1500, output_config: { effort: "low" }, system, messages: [{ role: "user", content: user }] },
    { signal: AbortSignal.timeout(60_000) },
  );
  return res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
};

export async function getBrandProfile(db: Db, ctx: Ctx) {
  const [row] = await db.select().from(brandProfiles).where(eq(brandProfiles.workspaceId, ctx.workspaceId));
  return row ?? null;
}

/**
 * How AI assistants describe the business: the attributes they repeat, the
 * objections they raise, and a short summary, read from the stored answers
 * that name it. Built by a model; refreshed at most a few times a day.
 */
export async function buildBrandProfile(db: Db, ctx: Ctx, deps: { complete?: Completer | null } = {}) {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  const complete = deps.complete === undefined ? (process.env.ANTHROPIC_API_KEY ? claudeComplete : null) : deps.complete;
  if (!complete) throw new AppError("precondition_failed", "An AI source needs to be connected to build your brand profile.");
  const rows = (await queryObservations(db, ctx, { from: new Date(Date.now() - 90 * 86_400_000) }, 400)).filter((o) =>
    o.rawAnswer && o.matches.some((m) => m.brandKey === "self" && effectiveMention(m)),
  );
  if (rows.length === 0) throw new AppError("precondition_failed", "No AI answer names your business yet. The profile is built from those answers.");
  if (!(await rateLimit(db, `profile:${ctx.workspaceId}`, 3, 86_400_000))) throw new AppError("rate_limited", "You can refresh the profile 3 times a day. Try again tomorrow.");

  const excerpts = rows
    .slice(0, 30)
    .map((o, i) => `[${i + 1}] (${o.provider}) ${o.rawAnswer!.replace(/\s+/g, " ").slice(0, 900)}`)
    .join("\n\n");
  const system =
    `You analyse how AI assistants describe one business, "${b.name}" (${b.category || "business"} in ${b.city || "India"}), from excerpts of their answers. ` +
    "Report only what the excerpts say about this business; never invent. Reply with only JSON: " +
    '{"summary": "2 sentences on how AI assistants portray the business", "attributes": [{"term": "short attribute such as affordable or experienced", "strength": <number of excerpts supporting it>, "evidence": "short quote from an excerpt"}], "objections": [{"text": "criticism, caveat or weakness the assistants raise", "evidence": "short quote"}]}. ' +
    "Give 4 to 8 attributes ordered by strength, and up to 5 objections (empty list if none).";
  const text = await complete(system, excerpts);
  let data: BrandProfileData;
  try {
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as Partial<BrandProfileData>;
    data = {
      summary: String(json.summary ?? "").slice(0, 600),
      attributes: (json.attributes ?? []).slice(0, 8).map((a) => ({ term: String(a.term).slice(0, 60), strength: Math.max(1, Math.round(Number(a.strength) || 1)), evidence: String(a.evidence ?? "").slice(0, 240) })),
      objections: (json.objections ?? []).slice(0, 5).map((o) => ({ text: String(o.text).slice(0, 240), evidence: String(o.evidence ?? "").slice(0, 240) })),
    };
  } catch {
    throw new AppError("invalid", "The AI source returned something we couldn't read. Try again.");
  }
  await db
    .insert(brandProfiles)
    .values({ workspaceId: ctx.workspaceId, data, fromAnswers: rows.length, generatedAt: new Date() })
    .onConflictDoUpdate({ target: brandProfiles.workspaceId, set: { data, fromAnswers: rows.length, generatedAt: new Date() } });
  return { data, fromAnswers: rows.length };
}

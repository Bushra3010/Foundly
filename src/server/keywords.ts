import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { Db } from "@/db";
import { trackedQuestions } from "@/db/schema";
import { keywordGroup, keywordLanguage, normalizeKeyword, questionForKeyword, KEYWORD_MAX, KEYWORD_MIN } from "@/lib/keywords";
import { requireBusiness } from "./business";
import { AppError, requireRole, type Ctx } from "./context";
import { approveQuestions, type NewQuestion } from "./monitoring/service";

function toQuestion(keyword: string, b: Awaited<ReturnType<typeof requireBusiness>>, replacesId?: string): NewQuestion {
  const k = normalizeKeyword(keyword);
  if (k.length < KEYWORD_MIN || k.length > KEYWORD_MAX) throw new AppError("invalid", `Keep each keyword between ${KEYWORD_MIN} and ${KEYWORD_MAX} characters.`);
  return {
    keyword: k,
    text: questionForKeyword(k, b.city),
    group: keywordGroup(k, b),
    language: keywordLanguage(k),
    location: b.city || null,
    replacesId: replacesId ?? null,
  };
}

/**
 * Starts tracking keywords. Each keyword becomes one question asked to every
 * AI source, so the plan's keyword limit applies. Keywords already tracked are skipped.
 */
export async function addKeywords(db: Db, ctx: Ctx, keywords: string[]) {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  const items = keywords.map((k) => toQuestion(k, b));
  if (items.length === 0) throw new AppError("invalid", "Type at least one keyword.");
  return approveQuestions(db, ctx, items);
}

/** Changes a keyword: the old one is archived (its history stays) and the new one replaces it. */
export async function editKeyword(db: Db, ctx: Ctx, questionId: string, keyword: string) {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  const [old] = await db
    .select()
    .from(trackedQuestions)
    .where(and(eq(trackedQuestions.id, questionId), eq(trackedQuestions.workspaceId, ctx.workspaceId), isNull(trackedQuestions.archivedAt)));
  if (!old) throw new AppError("not_found", "Keyword not found.");
  const next = toQuestion(keyword, b, old.id);
  if (old.keyword?.toLowerCase() === next.keyword?.toLowerCase()) return 0;
  return db.transaction(async (tx) => {
    await tx.update(trackedQuestions).set({ archivedAt: new Date() }).where(eq(trackedQuestions.id, old.id));
    return approveQuestions(tx as unknown as Db, ctx, [next]);
  });
}

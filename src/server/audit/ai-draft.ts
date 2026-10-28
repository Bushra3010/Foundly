import "server-only";
import { and, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { improvementActions, type Business } from "@/db/schema";
import { pickCompleter, type Completer } from "../ai/complete";
import { requireBusiness } from "../business";
import { AppError, audit, requireRole, type Ctx } from "../context";
import { listQuestions } from "../monitoring/service";
import { rateLimit } from "../rate-limit";

const PER_DAY = 20;

/** Tasks whose draft is text a model can write from the owner's facts. Technical tasks keep their fixed drafts. */
export const AI_DRAFT_KEYS = ["title", "meta_description", "h1", "about", "faq", "service_coverage", "service_descriptions"] as const;
export type AiDraftKey = (typeof AI_DRAFT_KEYS)[number];
export const canDraftWithAi = (checkKey: string): checkKey is AiDraftKey => (AI_DRAFT_KEYS as readonly string[]).includes(checkKey);

const BRIEF: Record<AiDraftKey, string> = {
  title: "Write one page title for the homepage: 50 to 70 characters, naming the business, what it does and the city. No slogans, no separators other than one dash or pipe.",
  meta_description: "Write one meta description for the homepage: 120 to 160 characters, plain sentences that say what the business does, where, and two or three of its services.",
  h1: "Write one main heading (H1) for the homepage, under 70 characters, saying what the business does and where.",
  about: "Write an About section of 80 to 140 words in first person plural (\"we\"). Say what the business does, where, who it serves, and anything the facts give about its background. Two short paragraphs at most.",
  faq: "Write 5 to 7 questions customers ask before contacting a business like this, each with a 1 to 3 sentence answer from the facts. Start with the questions customers ask AI assistants when they are given. Format each pair as \"Q: ...\" then a new line \"A: ...\", with a blank line between pairs.",
  service_coverage: "For every service listed, write one line in the form \"Service name: one or two sentences on what is included and who it is for.\" Keep the owner's own description where one is given; write the rest from the service name and the kind of business. One service per line.",
  service_descriptions: "For every service listed, write one line in the form \"Service name: one or two sentences on what is included and who it is for.\" Keep the owner's own description where one is given; write the rest from the service name and the kind of business. One service per line.",
};

/** The owner's confirmed facts, as a list the model may draw on and nothing else. */
export function factSheet(b: Business, questions: string[] = []): string {
  const line = (label: string, v: string | number | null | undefined) => (v === null || v === undefined || v === "" ? null : `${label}: ${v}`);
  const lines = [
    line("Business name", b.name),
    line("Kind of business", b.category),
    line("City", b.city),
    line("State or region", b.region),
    line("Areas served", b.serviceAreas.join(", ")),
    line("Owner's description", b.description?.trim()),
    line("Customers", b.audience?.trim()),
    b.services.length ? `Services:\n${b.services.map((s) => `- ${s.name.trim()}${s.description?.trim() ? `: ${s.description.trim()}` : ""}`).join("\n")}` : null,
    line("In business since", b.foundedYear),
    line("Team size", b.teamSize),
    line("Projects completed", b.projectsCompleted),
    line("Credentials", b.credentials?.trim()),
    b.hours.length ? `Opening hours: ${b.hours.map((h) => `${h.days} ${h.hours}`).join("; ")}` : null,
    line("Phone", b.phone),
    line("WhatsApp", b.whatsapp),
    line("Email", b.email),
    line("Online booking", b.bookingUrl),
    questions.length ? `Questions customers ask AI assistants:\n${questions.map((q) => `- ${q}`).join("\n")}` : null,
  ].filter((x): x is string => x !== null);
  return lines.join("\n");
}

const SYSTEM =
  "You write website text for a small local business in India, from a fact sheet. " +
  "Use only the facts given. Never invent years, numbers, prices, awards, ratings, certifications, reviews or claims like best, top, leading or number one. " +
  "If a fact is needed but missing, write a placeholder in square brackets, like [year founded], so the owner fills it in. " +
  "Plain Indian English, specific and warm, no hype, no exclamation marks. Reply with the text only: no preamble, no markdown headings, no code fences.";

/**
 * Writes a task's draft with a model from the owner's facts. The owner still
 * reviews and approves it; anything the model could not know is left as a
 * [placeholder] for the owner to fill in before copying it to the website.
 */
export async function draftActionWithAi(db: Db, ctx: Ctx, actionId: string, deps: { complete?: Completer | null } = {}) {
  requireRole(ctx, "editor");
  const complete = pickCompleter(deps.complete);
  if (!complete) throw new AppError("precondition_failed", "An AI source needs to be connected to write drafts.");
  const [a] = await db.select().from(improvementActions).where(and(eq(improvementActions.id, actionId), eq(improvementActions.workspaceId, ctx.workspaceId)));
  if (!a) throw new AppError("not_found", "Task not found.");
  if (!canDraftWithAi(a.checkKey)) throw new AppError("invalid", "This task's draft is fixed; AI writing is for text like titles, descriptions, About and FAQ.");
  if (["applied", "verified", "queued"].includes(a.status)) throw new AppError("invalid", "This change has already been applied. Roll it back to rewrite it.");
  if (!(await rateLimit(db, `aidraft:${ctx.workspaceId}`, PER_DAY, 86_400_000))) throw new AppError("rate_limited", `You can write ${PER_DAY} drafts a day with AI. Try again tomorrow.`);
  const b = await requireBusiness(db, ctx);
  const questions = (await listQuestions(db, ctx)).map((q) => q.text).slice(0, 10);
  const user = `${BRIEF[a.checkKey]}\n\nWhat the website check found: ${a.evidence}\n\nFact sheet:\n${factSheet(b, questions)}`;
  const text = (await complete(SYSTEM, user)).replace(/^```[a-z]*\n?|```$/g, "").trim().slice(0, 10_000);
  if (text.length < 10) throw new AppError("invalid", "The AI source returned nothing usable. Try again.");
  const [u] = await db
    .update(improvementActions)
    .set({ draft: text, draftRevision: a.draftRevision + 1, status: "proposed", approvedBy: null, approvedAt: null, approvedRevision: null, approvedHash: null, updatedAt: new Date() })
    .where(eq(improvementActions.id, a.id))
    .returning();
  await audit(db, ctx, "action.ai_drafted", a.id, { revision: u.draftRevision, checkKey: a.checkKey });
  return u;
}

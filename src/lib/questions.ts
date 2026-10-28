import type { Business } from "@/db/schema";

export type QuestionGroup = "service" | "purchase" | "comparison" | "location" | "branded";
export type SuggestedQuestion = { group: QuestionGroup; text: string };

export const GROUP_LABEL: Record<QuestionGroup, string> = {
  service: "About a service",
  purchase: "Ready to hire",
  comparison: "Comparing options",
  location: "Nearby",
  branded: "About your business by name",
};

/** Short tag shown on prompts and used to filter reports. */
export const TAG_LABEL: Record<QuestionGroup, string> = {
  branded: "Branded",
  service: "Service",
  purchase: "Bottom of funnel",
  comparison: "Comparison",
  location: "Near me",
};
export const TAGS = ["branded", "service", "purchase", "comparison", "location"] as const satisfies readonly QuestionGroup[];
export const isTag = (v: unknown): v is QuestionGroup => typeof v === "string" && (TAGS as readonly string[]).includes(v);

/**
 * Natural customer questions from the owner's services and areas. Discovery
 * questions never contain the business name (that would bias inclusion);
 * branded questions are kept in their own group.
 */
export function suggestQuestions(b: Pick<Business, "name" | "category" | "city" | "services" | "serviceAreas">): SuggestedQuestion[] {
  const out: SuggestedQuestion[] = [];
  const category = b.category.toLowerCase();
  for (const s of b.services.slice(0, 3)) {
    const service = s.name.toLowerCase();
    out.push({ group: "service", text: `What should I know before getting ${service} in ${b.city}?` });
    out.push({ group: "purchase", text: `Who can I hire for ${service} in ${b.city}?` });
  }
  out.push({ group: "comparison", text: `What are the best ${category} options in ${b.city}?` });
  for (const area of b.serviceAreas.slice(0, 2)) {
    out.push({ group: "location", text: `Is there a good ${category} near ${area}, ${b.city}?` });
  }
  out.push({ group: "branded", text: `What does ${b.name} in ${b.city} offer?` });
  return out;
}

/**
 * Short search-style keywords for the setup screen, built from what the owner
 * typed. Each keyword is asked as-is to every AI source.
 */
export function suggestKeywords(b: { category: string; city: string; services?: string[] }): string[] {
  const category = b.category.trim().toLowerCase();
  const city = b.city.trim();
  if (!category || !city) return [];
  const out = [`best ${category} in ${city}`, `${category} near me in ${city}`, `affordable ${category} in ${city}`];
  for (const s of (b.services ?? []).slice(0, 2)) out.push(`${s.trim().toLowerCase()} in ${city}`);
  return [...new Set(out)];
}

/** Which question group a typed keyword belongs to. */
export function keywordGroup(keyword: string): QuestionGroup {
  const k = keyword.toLowerCase();
  if (/\b(near|nearby|near me|in my area)\b/.test(k)) return "location";
  if (/\b(best|top|vs|compare|cheapest|affordable)\b/.test(k)) return "comparison";
  if (/\b(hire|book|cost|price|quote)\b/.test(k)) return "purchase";
  return "service";
}

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

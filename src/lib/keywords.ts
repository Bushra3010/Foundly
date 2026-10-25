import type { Business } from "@/db/schema";
import type { QuestionGroup } from "./questions";

export const KEYWORD_MIN = 2;
export const KEYWORD_MAX = 80;

/** Trims, collapses spaces and drops wrapping quotes and trailing punctuation. */
export function normalizeKeyword(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[?.!,;:]+$/, "")
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/[?.!,;:]+$/, "")
    .trim();
}

/** Splits a pasted list ("a, b" or one per line) into clean, unique keywords. */
export function parseKeywordList(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[\n,]+/)) {
    const k = normalizeKeyword(part);
    if (k.length < KEYWORD_MIN || k.length > KEYWORD_MAX) continue;
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
  }
  return out;
}

const DEVANAGARI = /[ऀ-ॿ]/;

/** Language of the keyword as typed: Devanagari is Hindi, everything else is asked in English. */
export function keywordLanguage(keyword: string): "hi" | "en" {
  return DEVANAGARI.test(keyword) ? "hi" : "en";
}

/** Whether the keyword already says where (a city, an area, "near me"). */
function hasPlace(keyword: string, city: string): boolean {
  const k = keyword.toLowerCase();
  return (city.trim() !== "" && k.includes(city.trim().toLowerCase())) || /\b(in|near|around|nearby)\b/.test(k) || /\bnear me\b/.test(k);
}

/**
 * The question we ask AI assistants for a keyword, phrased the way a customer
 * would ask for a recommendation, so answers name businesses. Built from a
 * template: no model call, no cost. The city is added when the keyword has no place.
 */
export function questionForKeyword(keyword: string, city: string): string {
  const k = normalizeKeyword(keyword);
  if (keywordLanguage(k) === "hi") return `${k} के लिए सबसे अच्छे विकल्प कौन से हैं? कुछ नाम बताइए।`;
  const where = hasPlace(k, city) || !city.trim() ? "" : ` in ${city.trim()}`;
  // "best dentist in Indore" must not become "the best best dentist".
  const core = k.replace(/^(the\s+)?(best|top|good|affordable|cheap)\s+/i, "");
  const lead = /^(affordable|cheap)\s/i.test(k) ? "an affordable" : "the best";
  return `Can you recommend ${lead} ${core.charAt(0).toLowerCase()}${core.slice(1)}${where}?`;
}

/** Which question group a keyword belongs to, for reports. */
export function keywordGroup(keyword: string, b: Pick<Business, "services" | "serviceAreas" | "name">): QuestionGroup {
  const k = keyword.toLowerCase();
  if (b.name && k.includes(b.name.toLowerCase())) return "branded";
  if (b.serviceAreas.some((a) => a && k.includes(a.toLowerCase())) || /\bnear\b/.test(k)) return "location";
  if (b.services.some((s) => s.name && k.includes(s.name.toLowerCase()))) return "service";
  return "purchase";
}

/** Keywords a customer would type, from the owner's own details. Never contains the business name. */
export function suggestKeywords(b: Pick<Business, "category" | "city" | "services" | "serviceAreas">, max = 8): string[] {
  const category = b.category.trim().toLowerCase();
  const city = b.city.trim();
  const out: string[] = [];
  if (category && city) out.push(`${category} in ${city}`, `best ${category} in ${city}`);
  for (const s of b.services.slice(0, 4)) if (s.name.trim() && city) out.push(`${s.name.trim().toLowerCase()} in ${city}`);
  for (const area of b.serviceAreas.slice(0, 2)) if (category && area.trim()) out.push(`${category} near ${area.trim()}`);
  if (category && city) out.push(`affordable ${category} in ${city}`);
  return parseKeywordList(out.join("\n")).slice(0, max);
}

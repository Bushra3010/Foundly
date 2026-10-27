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
/** Already phrased as a question or request ("Who can I hire for…?", "Which is the best…"), so it is asked as typed. */
export function isQuestion(keyword: string): boolean {
  return /\?\s*$/.test(keyword.trim()) || /^(what|who|which|where|when|how|why|can|could|should|is|are|do|does|recommend|suggest)\b/i.test(keyword.trim());
}

export function questionForKeyword(keyword: string, city: string): string {
  const k = normalizeKeyword(keyword);
  if (isQuestion(keyword)) return /[?.!]\s*$/.test(keyword.trim()) ? keyword.trim() : `${k}?`;
  if (keywordLanguage(k) === "hi") return `${k} के लिए सबसे अच्छे विकल्प कौन से हैं? कुछ नाम बताइए।`;
  const where = hasPlace(k, city) || !city.trim() ? "" : ` in ${city.trim()}`;
  // "best dentist in Indore" must not become "the best best dentist".
  const core = k.replace(/^(the\s+)?(best|top|good|affordable|cheap)\s+/i, "");
  const lead = /^(affordable|cheap)\s/i.test(k) ? "an affordable" : "the best";
  return `Can you recommend ${lead} ${core.charAt(0).toLowerCase()}${core.slice(1)}${where}?`;
}

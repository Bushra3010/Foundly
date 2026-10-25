/**
 * How an AI answer talks about a business, read from the sentences that name
 * it. A word-list estimate (no model call), so it is shown as "estimated" and
 * defaults to neutral when the wording is plain.
 */
export type Tone = "positive" | "neutral" | "negative";

// Checked before the positive list, so "not recommended" never counts as praise.
const NEGATIVE = [
  "not recommended",
  "not recommend",
  "avoid",
  "complaint",
  "complaints",
  "mixed reviews",
  "negative reviews",
  "poor",
  "bad reviews",
  "overpriced",
  "expensive",
  "rude",
  "unreliable",
  "delays",
  "slow service",
  "permanently closed",
  "scam",
];

const POSITIVE = [
  "best",
  "top",
  "excellent",
  "highly rated",
  "well rated",
  "well-reviewed",
  "recommended",
  "recommend",
  "trusted",
  "reliable",
  "experienced",
  "popular",
  "well-known",
  "reputed",
  "great",
  "good",
  "affordable",
  "quality",
  "professional",
  "friendly",
  "gentle",
  "prompt",
  "5-star",
  "five-star",
];

function count(text: string, words: string[]) {
  let n = 0;
  for (const w of words) {
    const re = new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")}($|[^a-z])`, "g");
    n += text.match(re)?.length ?? 0;
  }
  return n;
}

/** Sentences and list items that mention the term. */
export function passagesAbout(answer: string, term: string): string[] {
  const t = term.trim().toLowerCase();
  if (!t) return [];
  return answer
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.toLowerCase().includes(t));
}

export function toneAround(answer: string | null, term: string | null): Tone {
  if (!answer || !term) return "neutral";
  const passages = passagesAbout(answer, term).map((p) => p.toLowerCase());
  if (passages.length === 0) return "neutral";
  let negative = 0;
  let positive = 0;
  for (let p of passages) {
    negative += count(p, NEGATIVE);
    for (const n of NEGATIVE) p = p.replaceAll(n, " ");
    positive += count(p, POSITIVE);
  }
  if (negative > 0 && negative >= positive) return "negative";
  return positive > 0 ? "positive" : "neutral";
}

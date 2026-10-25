import type { Citation } from "@/db/schema";

/**
 * Brand and citation extraction. Bump EXTRACTION_VERSION whenever matching
 * rules change; metrics warn when comparing across versions.
 */
export const EXTRACTION_VERSION = 1;

export type BrandSpec = {
  key: string;
  name: string;
  aliases: string[];
  domains: string[];
  /** Pages on a shared host that belong to the brand, e.g. https://foundly.co.in/s/<slug>. */
  urlPrefixes?: string[];
};

/** Whether a cited URL is one of the brand's pages on a shared host. */
export function urlHasPrefix(url: string, prefixes: string[] = []): boolean {
  const u = url.toLowerCase().replace(/^https?:\/\/(www\.)?/, "");
  return prefixes.some((p) => {
    const q = p.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
    return u === q || u.startsWith(`${q}/`) || u.startsWith(`${q}?`) || u.startsWith(`${q}#`);
  });
}

export type BrandMatchResult = {
  brandKey: string;
  brandName: string;
  mentioned: boolean;
  cited: boolean;
  matchedText: string | null;
  listedPosition: number | null;
  ambiguous: boolean;
};

export function normalize(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9.ऀ-ॿ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hostOfUrl(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function domainMatches(host: string, domain: string) {
  const d = domain.toLowerCase().replace(/^www\./, "");
  return host === d || host.endsWith(`.${d}`);
}

/** Whole-word search on normalised text; returns the first matching term. */
function findTerm(haystack: string, terms: string[]): string | null {
  const padded = ` ${haystack} `;
  for (const term of terms) {
    const n = normalize(term);
    if (n.length >= 2 && padded.includes(` ${n} `)) return term;
  }
  return null;
}

/** Items of the first explicit list (numbered, or ≥2 bullets) in the answer. */
export function listItems(answer: string): string[] {
  const lines = answer.split(/\r?\n/);
  const numbered = lines.filter((l) => /^\s*(\d+)[.)]\s+\S/.test(l));
  if (numbered.length >= 2) return numbered;
  const bullets = lines.filter((l) => /^\s*[-*•]\s+\S/.test(l));
  return bullets.length >= 2 ? bullets : [];
}

/**
 * A short single-word brand (e.g. "Apex") is easily confused with ordinary
 * words or other businesses, so such matches are flagged for owner review
 * unless the owned domain is cited too.
 */
function isAmbiguousTerm(term: string) {
  const n = normalize(term);
  return !n.includes(" ") && n.length <= 6;
}

export function extractBrands(answer: string | null, citations: Citation[], brands: BrandSpec[]): BrandMatchResult[] {
  const text = normalize(answer ?? "");
  const items = listItems(answer ?? "").map(normalize);
  return brands.map((b) => {
    const terms = [b.name, ...b.aliases].filter(Boolean).sort((x, y) => y.length - x.length);
    const termHit = text ? findTerm(text, terms) : null;
    const domainInText = b.domains.find((d) => text.includes(d.toLowerCase().replace(/^www\./, "")));
    const cited = citations.some((c) => {
      const host = hostOfUrl(c.url);
      const titleHost = (c.title ?? "").toLowerCase().replace(/^www\./, "");
      return b.domains.some((d) => (host && domainMatches(host, d)) || (titleHost && domainMatches(titleHost, d))) || urlHasPrefix(c.url, b.urlPrefixes);
    });
    const mentioned = !!termHit || !!domainInText;
    let listedPosition: number | null = null;
    if (mentioned && items.length >= 2) {
      const idx = items.findIndex((item) => findTerm(item, terms) || b.domains.some((d) => item.includes(d)));
      listedPosition = idx >= 0 ? idx + 1 : null;
    }
    return {
      brandKey: b.key,
      brandName: b.name,
      mentioned,
      cited,
      matchedText: termHit ?? domainInText ?? null,
      listedPosition,
      ambiguous: mentioned && !!termHit && !domainInText && !cited && isAmbiguousTerm(termHit),
    };
  });
}

import "server-only";
import { groupFor, isAllowed, parseRobots } from "@/lib/robots";
import { safeFetch } from "./safe-fetch";

/** The crawlers the free checker reports on, grouped by the assistant they feed. */
export const CHECKED_CRAWLERS = [
  { agent: "OAI-SearchBot", owner: "ChatGPT", purpose: "ChatGPT search results and citations" },
  { agent: "ChatGPT-User", owner: "ChatGPT", purpose: "Pages ChatGPT opens for a user" },
  { agent: "GPTBot", owner: "ChatGPT", purpose: "OpenAI model training" },
  { agent: "Googlebot", owner: "Google & Gemini", purpose: "Google Search and AI Overviews" },
  { agent: "Google-Extended", owner: "Google & Gemini", purpose: "Gemini model training and grounding" },
  { agent: "Bingbot", owner: "Bing & Copilot", purpose: "Bing index, which ChatGPT search and Copilot draw on" },
  { agent: "PerplexityBot", owner: "Perplexity", purpose: "Perplexity search index" },
  { agent: "Perplexity-User", owner: "Perplexity", purpose: "Pages Perplexity opens for a user" },
  { agent: "ClaudeBot", owner: "Claude", purpose: "Anthropic model training" },
  { agent: "Claude-SearchBot", owner: "Claude", purpose: "Claude search results" },
  { agent: "Claude-User", owner: "Claude", purpose: "Pages Claude opens for a user" },
  { agent: "Applebot-Extended", owner: "Apple", purpose: "Apple Intelligence" },
] as const;

export type CrawlerResult = (typeof CHECKED_CRAWLERS)[number] & { allowed: boolean; group: string | null };
export type CrawlerReport = {
  site: string;
  robotsStatus: number | null;
  results: CrawlerResult[];
  homeStatus: number | null;
  llmsTxt: boolean;
  sitemap: boolean;
  error?: string;
};

/** Accepts "example.com", "www.example.com/page" or a full URL; returns its origin, or null. */
export function siteOrigin(raw: string): string | null {
  try {
    const u = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return null;
    return u.origin;
  } catch {
    return null;
  }
}

const OPTS = { maxBytes: 200_000, timeoutMs: 8000, maxRedirects: 3 };

export async function checkCrawlers(origin: string): Promise<CrawlerReport> {
  const [robots, home, llms] = await Promise.allSettled([
    safeFetch(`${origin}/robots.txt`, OPTS),
    safeFetch(origin, OPTS),
    safeFetch(`${origin}/llms.txt`, OPTS),
  ]);
  // Sites often declare their sitemap in robots.txt rather than at /sitemap.xml.
  const declared = robots.status === "fulfilled" && robots.value.status === 200 ? robots.value.body.match(/^\s*sitemap:\s*(\S+)/im)?.[1] : undefined;
  const [sitemap] = await Promise.allSettled([safeFetch(declared ?? `${origin}/sitemap.xml`, OPTS)]);
  if (robots.status === "rejected" && home.status === "rejected") {
    return { site: origin, robotsStatus: null, homeStatus: null, results: [], llmsTxt: false, sitemap: false, error: "We couldn't reach this website. Check the address and try again." };
  }
  const r = robots.status === "fulfilled" ? robots.value : null;
  // Per RFC 9309 a missing robots.txt (4xx) means everything is allowed.
  const groups = parseRobots(r && r.status === 200 ? r.body : "");
  const ok = (x: PromiseSettledResult<{ status: number; body: string }>, test: RegExp) => x.status === "fulfilled" && x.value.status === 200 && test.test(x.value.body.slice(0, 2000));
  return {
    site: origin,
    robotsStatus: r?.status ?? null,
    homeStatus: home.status === "fulfilled" ? home.value.status : null,
    results: CHECKED_CRAWLERS.map((c) => {
      const { group, rules } = groupFor(groups, c.agent);
      return { ...c, group, allowed: isAllowed(rules, "/") };
    }),
    llmsTxt: ok(llms, /^\s*#\s+\S/m),
    sitemap: ok(sitemap, /<(urlset|sitemapindex)\b/i),
  };
}

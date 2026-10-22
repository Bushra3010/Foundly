import { parse } from "node-html-parser";
import { safeFetch, type SafeResponse } from "../safe-fetch";

export type CrawledPage = { url: string; status: number; html: string; headers: Record<string, string>; redirects: string[] };
export type CrawlResult = {
  start: string;
  pages: CrawledPage[];
  robotsTxt: string | null;
  sitemapUrl: string | null;
  sitemapFound: boolean;
  errors: { url: string; reason: string }[];
};

export type Fetcher = (url: string) => Promise<SafeResponse>;

const MAX_PAGES = 8;

/** Very small robots.txt reader: rules for "*" only, prefix matching. */
export function robotsDisallows(robotsTxt: string | null, path: string): boolean {
  if (!robotsTxt) return false;
  let applies = false;
  const rules: { allow: boolean; prefix: string }[] = [];
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const [k, ...rest] = line.split(":");
    const v = rest.join(":").trim();
    if (/^user-agent$/i.test(k)) applies = v === "*";
    else if (applies && /^disallow$/i.test(k) && v) rules.push({ allow: false, prefix: v });
    else if (applies && /^allow$/i.test(k) && v) rules.push({ allow: true, prefix: v });
  }
  const match = rules.filter((r) => path.startsWith(r.prefix)).sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return !!match && !match.allow;
}

/**
 * Crawls the homepage plus a few same-host pages linked from it. Bounded in
 * pages, bytes and time; respects robots.txt. Content is treated as data —
 * nothing in a page can change what the crawler does beyond link discovery.
 */
export async function crawlSite(startUrl: string, fetcher: Fetcher = (u) => safeFetch(u)): Promise<CrawlResult> {
  const start = new URL(startUrl);
  const origin = start.origin;
  const result: CrawlResult = { start: start.toString(), pages: [], robotsTxt: null, sitemapUrl: null, sitemapFound: false, errors: [] };

  try {
    const r = await fetcher(`${origin}/robots.txt`);
    if (r.status === 200) result.robotsTxt = r.body.slice(0, 50_000);
  } catch (e) {
    result.errors.push({ url: `${origin}/robots.txt`, reason: String(e instanceof Error ? e.message : e) });
  }
  result.sitemapUrl = result.robotsTxt?.match(/^\s*sitemap:\s*(\S+)/im)?.[1] ?? `${origin}/sitemap.xml`;
  try {
    const s = await fetcher(result.sitemapUrl);
    result.sitemapFound = s.status === 200 && /<(urlset|sitemapindex)\b/i.test(s.body);
  } catch {
    result.sitemapFound = false;
  }

  const queue = [start.toString()];
  const seen = new Set<string>();
  while (queue.length && result.pages.length < MAX_PAGES) {
    const url = queue.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);
    if (robotsDisallows(result.robotsTxt, new URL(url).pathname) && result.pages.length > 0) continue;
    try {
      const res = await fetcher(url);
      const page = { url: res.url, status: res.status, html: res.body, headers: res.headers, redirects: res.redirects };
      result.pages.push(page);
      if (result.pages.length === 1 && res.status === 200 && /html/i.test(res.headers["content-type"] ?? "text/html")) {
        const root = parse(res.body);
        for (const a of root.querySelectorAll("a[href]")) {
          try {
            const next = new URL(a.getAttribute("href")!, res.url);
            next.hash = "";
            if (next.origin === new URL(res.url).origin && !/\.(pdf|jpe?g|png|gif|webp|zip|docx?)$/i.test(next.pathname)) queue.push(next.toString());
          } catch {
            // ignore malformed links
          }
        }
      }
    } catch (e) {
      result.errors.push({ url, reason: String(e instanceof Error ? e.message : e) });
    }
  }
  return result;
}

import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { getDb } from "@/db";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, faqLd, graph, siteUrl } from "@/lib/site-schema";
import { CHECKED_CRAWLERS, checkCrawlers, siteOrigin, type CrawlerReport } from "@/server/crawler-check";
import { rateLimit } from "@/server/rate-limit";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

const TITLE = "Free AI Crawler Checker: can ChatGPT read your site?";
const DESCRIPTION = "Free tool: check whether GPTBot, OAI-SearchBot, Google-Extended, PerplexityBot, ClaudeBot and other AI crawlers are allowed by your robots.txt.";

type Props = { searchParams: Promise<{ url?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { url } = await searchParams;
  return {
    title: { absolute: `${TITLE} · Foundly` },
    description: DESCRIPTION,
    alternates: { canonical: "/tools/ai-crawler-checker" },
    openGraph: { title: "Free AI Crawler Checker", description: DESCRIPTION, url: "/tools/ai-crawler-checker", images: "/opengraph-image" },
    // Individual results are useful to share but shouldn't be indexed as separate pages.
    ...(url && { robots: { index: false, follow: true } }),
  };
}

const FAQ = [
  { q: "What is an AI crawler?", a: "An AI crawler is a bot that AI companies use to read web pages, either to train models (such as GPTBot, ClaudeBot and Google-Extended) or to fetch fresh pages for search answers (such as OAI-SearchBot, PerplexityBot and Claude-SearchBot)." },
  { q: "Should I block AI crawlers?", a: "If you want ChatGPT, Gemini, Perplexity or Claude to recommend your business, the search crawlers in particular need to be able to read your website. Blocking training crawlers is a separate choice; blocking search crawlers usually means an assistant cannot cite your pages." },
  { q: "How do I allow AI crawlers in robots.txt?", a: "Remove any Disallow: / rules in groups for those user agents, or add a group such as \"User-agent: OAI-SearchBot\" followed by \"Allow: /\". Also check that your hosting firewall or security plugin is not blocking them separately." },
  { q: "Does allowing crawlers guarantee AI will recommend me?", a: "No. Access is the first requirement, not a guarantee. AI assistants also need clear facts about your business, consistent listings and sources they trust." },
  { q: "What is llms.txt?", a: "llms.txt is a proposed plain-text file at the root of a website that summarises the site for AI assistants and links to its most useful pages. It is optional and not yet an official standard." },
];

async function runCheck(raw: string): Promise<CrawlerReport | { error: string }> {
  const origin = siteOrigin(raw);
  if (!origin) return { error: "Enter a website address such as example.com." };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!(await rateLimit(await getDb(), `crawler-check:${ip}`, 20, 60 * 60 * 1000))) return { error: "Too many checks from your network. Please try again in an hour." };
  try {
    return await checkCrawlers(origin);
  } catch {
    return { error: "We couldn't check this website. Check the address and try again." };
  }
}

function Results({ report }: { report: CrawlerReport }) {
  if (report.error) return <p className="tool-error" role="alert">{report.error}</p>;
  const blocked = report.results.filter((r) => !r.allowed);
  return (
    <section className="tool-results" aria-labelledby="results-title">
      <h2 id="results-title">Results for {new URL(report.site).hostname}</h2>
      <p className={blocked.length ? "tool-summary bad" : "tool-summary good"}>
        {blocked.length === 0
          ? "Every AI crawler we check is allowed to read your homepage."
          : `${blocked.length} of ${report.results.length} AI crawlers are blocked by your robots.txt: ${blocked.map((b) => b.agent).join(", ")}.`}
      </p>
      <div className="legal-table-wrap"><table className="legal-table">
        <caption className="sr-only">AI crawler access to the homepage</caption>
        <thead><tr><th scope="col">Crawler</th><th scope="col">Used for</th><th scope="col">Access</th></tr></thead>
        <tbody>{report.results.map((r) => (
          <tr key={r.agent}>
            <th scope="row">{r.agent}<br /><small>{r.owner}</small></th>
            <td>{r.purpose}<br /><small>{r.group === null ? "No matching rules" : r.group === "*" ? "Follows the * rules" : "Has its own rules"}</small></td>
            <td><span className={r.allowed ? "tool-pill good" : "tool-pill bad"}>{r.allowed ? "Allowed" : "Blocked"}</span></td>
          </tr>
        ))}</tbody>
      </table></div>
      <ul className="tool-extras">
        <li><span className={report.robotsStatus === 200 ? "tool-pill good" : "tool-pill"}>{report.robotsStatus === 200 ? "Found" : "Not found"}</span> robots.txt{report.robotsStatus !== 200 && " (crawlers are allowed by default)"}</li>
        <li><span className={report.sitemap ? "tool-pill good" : "tool-pill bad"}>{report.sitemap ? "Found" : "Missing"}</span> sitemap.xml</li>
        <li><span className={report.llmsTxt ? "tool-pill good" : "tool-pill"}>{report.llmsTxt ? "Found" : "Missing"}</span> llms.txt (optional)</li>
      </ul>
      <p className="tool-note">This checks robots.txt rules only. A firewall, CDN bot protection or security plugin can still block crawlers, and access alone doesn&apos;t make AI recommend you. <Link href="/signup">Check what AI actually says about your business</Link>.</p>
    </section>
  );
}

export default async function CrawlerCheckerPage({ searchParams }: Props) {
  const { url } = await searchParams;
  const result = url?.trim() ? await runCheck(url.slice(0, 300)) : null;
  const ld = graph(
    {
      "@type": "WebApplication",
      "@id": siteUrl("/tools/ai-crawler-checker"),
      name: "Foundly AI Crawler Checker",
      url: siteUrl("/tools/ai-crawler-checker"),
      description: DESCRIPTION,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: 0, priceCurrency: "INR" },
      publisher: { "@id": siteUrl("/#organization") },
    },
    faqLd(FAQ),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Free tools", path: "/tools/ai-crawler-checker" }, { name: "AI Crawler Checker", path: "/tools/ai-crawler-checker" }]),
  );

  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow">FOUNDLY / FREE TOOL</p>
          <h1>AI Crawler Checker</h1>
          <p className="legal-intro">See whether ChatGPT, Gemini, Perplexity and Claude are allowed to read your website. Checks {CHECKED_CRAWLERS.length} AI crawlers against your robots.txt, plus your sitemap and llms.txt. Free, no sign-up.</p>
          <form className="tool-form" role="search" action="/tools/ai-crawler-checker">
            <label htmlFor="url" className="sr-only">Website address</label>
            <input id="url" name="url" type="text" inputMode="url" autoComplete="url" placeholder="yourbusiness.com" defaultValue={url ?? ""} required maxLength={300} />
            <button type="submit" className="landing-button">Check website <Icon name="arrow" size={16} /></button>
          </form>
        </header>
        {result && ("results" in result ? <Results report={result} /> : <p className="tool-error" role="alert">{result.error}</p>)}
        <article className="legal-article about-article" aria-label="About AI crawlers">
          <section id="why">
            <h2><span>01</span>Why AI crawler access matters</h2>
            <p>When a customer asks an AI assistant for a recommendation, assistants that search the web can only cite pages their crawlers are allowed to read. If your robots.txt blocks OAI-SearchBot, PerplexityBot or Claude-SearchBot, those assistants can&apos;t quote your website, even if everything on it is accurate.</p>
            <p>Many sites block AI crawlers by accident: a website builder default, a security plugin or a copied robots.txt. This tool shows exactly which crawlers your rules allow.</p>
          </section>
          <section id="allow">
            <h2><span>02</span>How to allow AI crawlers</h2>
            <p>Add groups like these to the robots.txt at the root of your website, and remove any <code>Disallow: /</code> rules that apply to them:</p>
            <pre className="tool-code"><code>{"User-agent: OAI-SearchBot\nUser-agent: ChatGPT-User\nUser-agent: PerplexityBot\nUser-agent: Perplexity-User\nUser-agent: Claude-SearchBot\nUser-agent: Claude-User\nAllow: /"}</code></pre>
            <p>Then read our guide on <Link href="/guides/geo-for-local-businesses">how to get recommended by AI assistants</Link> for the next steps.</p>
          </section>
          <section id="faq">
            <h2><span>03</span>Frequently asked questions</h2>
            {FAQ.map((item) => <div key={item.q} className="guide-faq"><h3>{item.q}</h3><p>{item.a}</p></div>)}
          </section>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage, guideMeta, type GuideSection } from "@/components/guide-page";

const meta = guideMeta("geo-vs-seo");

export const metadata: Metadata = {
  title: { absolute: `${meta.seoTitle ?? meta.title} · Foundly` },
  description: meta.description,
  alternates: { canonical: `/guides/${meta.slug}` },
  openGraph: { type: "article", title: meta.title, description: meta.description, url: `/guides/${meta.slug}`, images: "/opengraph-image", publishedTime: meta.published, modifiedTime: meta.updated },
};

const ROWS: [string, string, string][] = [
  ["Goal", "Rank a page high in a list of links", "Be named or cited inside the answer itself"],
  ["What the customer sees", "Ten links, ads and a map", "One written answer naming a few businesses"],
  ["Unit you track", "Keyword ranking for a page", "Mentions, position and share of voice for your business"],
  ["Main signals", "Relevance, links, page experience, Google Business Profile", "Clear facts, consistent listings, quotable answers, sources the assistant trusts"],
  ["Where you win", "Your own page gets the click", "Your name gets recommended, sometimes with no click at all"],
  ["How stable results are", "Fairly stable day to day", "Varies with wording, location, date and model; measure trends"],
];

const sections: GuideSection[] = [
  { id: "short-answer", title: "The short answer", content: <>
    <p><strong>SEO (search engine optimisation) helps your pages rank in search results. GEO (generative engine optimisation) helps your business get named inside AI-written answers.</strong> SEO competes for a click on a list of links; GEO competes for a mention in a single answer from ChatGPT, Gemini, Perplexity or Claude.</p>
    <p>They are not rivals. Most of what makes a site good for search, such as clear pages, accurate facts and a strong Google Business Profile, also makes it easier for an AI assistant to understand and recommend.</p>
  </> },
  { id: "comparison", title: "GEO and SEO side by side", content: <>
    <div className="legal-table-wrap"><table className="legal-table">
      <caption className="sr-only">Comparison of SEO and GEO</caption>
      <thead><tr><th scope="col"></th><th scope="col">SEO</th><th scope="col">GEO</th></tr></thead>
      <tbody>{ROWS.map(([label, seo, geo]) => <tr key={label}><th scope="row">{label}</th><td>{seo}</td><td>{geo}</td></tr>)}</tbody>
    </table></div>
  </> },
  { id: "same", title: "What stays the same", content: <>
    <ul>
      <li><strong>Crawlability.</strong> Search engines and AI assistants both need to be able to load and read your pages.</li>
      <li><strong>Accurate, consistent business details.</strong> Name, address, phone, hours and services should match everywhere.</li>
      <li><strong>Helpful content.</strong> Pages that genuinely answer customer questions do well in both.</li>
      <li><strong>Reputation.</strong> Reviews, mentions in local press and listings on respected directories are signals for both.</li>
    </ul>
  </> },
  { id: "different", title: "What is different about GEO", content: <>
    <ul>
      <li><strong>Answers, not pages.</strong> An assistant summarises many sources into one reply. Your goal is for that reply to include your business, described correctly.</li>
      <li><strong>Quotable facts matter more.</strong> Plain statements like &ldquo;We serve Baner, Aundh and Wakad, open 8am to 8pm&rdquo; are easier for an assistant to repeat than design-heavy pages.</li>
      <li><strong>Third-party sources carry weight.</strong> Assistants often cite directories, reviews and articles rather than your own site, so where you are listed matters as much as what your site says.</li>
      <li><strong>Different crawlers.</strong> AI companies use their own bots, such as GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot and Google-Extended, which your <code>robots.txt</code> may treat differently from Googlebot.</li>
      <li><strong>Different measurement.</strong> There is no single ranking position. You ask the same questions repeatedly and track how often, and how high, you are named.</li>
    </ul>
  </> },
  { id: "priorities", title: "Where a local business should start", content: <>
    <ol className="guide-steps">
      <li>Fix the shared foundations first: a fast, crawlable website, accurate Google Business Profile and consistent directory listings.</li>
      <li>Rewrite key pages so each service, area and price range is stated in plain, quotable sentences.</li>
      <li>Add <code>LocalBusiness</code> structured data and a short FAQ that answers real customer questions.</li>
      <li>Check what AI assistants say about you today, which competitors they name and which sources they cite.</li>
      <li>Appear accurately in those cited sources, then re-check on a schedule.</li>
    </ol>
    <p>Our <Link href="/guides/geo-for-local-businesses">GEO guide for local businesses</Link> walks through each step in detail.</p>
  </> },
];

const faq = [
  { q: "Is GEO replacing SEO?", a: "No. Search engines still send a large share of local customers, and much of the work overlaps. GEO adds a new goal: being named inside AI-written answers, not only ranking a page in search results." },
  { q: "What is the difference between GEO and AEO?", a: "AEO (answer engine optimisation) focuses on being the source quoted when a search feature or assistant answers a question directly. GEO focuses on generative AI assistants recommending your business. For a local business the practical work is largely the same." },
  { q: "Does good SEO automatically mean good AI visibility?", a: "Not automatically. A page can rank well but still be hard for an assistant to quote, or your business may be missing from the directories an assistant cites. It is worth checking AI answers directly." },
  { q: "How do I check whether AI recommends my business?", a: "Ask the assistants the questions your customers ask, on a schedule, and record whether you are named, in what position and which sources were cited. Tools such as Foundly automate this across ChatGPT, Gemini, Perplexity and Claude." },
];

export default function Page() {
  return <GuidePage meta={meta} intro="More customers now ask an AI assistant for a recommendation instead of scrolling search results. Here is how optimising for those answers differs from classic SEO, and what to do about it." sections={sections} faq={faq} />;
}

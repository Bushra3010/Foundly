import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage, guideMeta, type GuideSection } from "@/components/guide-page";

const meta = guideMeta("rank-on-chatgpt");

export const metadata: Metadata = {
  title: { absolute: `${meta.title} · Foundly` },
  description: meta.description,
  alternates: { canonical: `/guides/${meta.slug}` },
  openGraph: { type: "article", title: meta.title, description: meta.description, url: `/guides/${meta.slug}`, images: "/opengraph-image", publishedTime: meta.published, modifiedTime: meta.updated },
};

const sections: GuideSection[] = [
  { id: "how", title: "How ChatGPT finds businesses", content: <>
    <p><strong>ChatGPT answers from two places: what its model learned in training, and what it finds when it searches the web for a question.</strong> For local recommendations such as &ldquo;a good physiotherapist in Kothrud&rdquo;, it usually searches, then names businesses and links the sources it used.</p>
    <ul>
      <li><strong>OAI-SearchBot</strong> is the crawler OpenAI uses to surface websites in ChatGPT search. If your robots.txt blocks it, your pages are unlikely to be cited.</li>
      <li><strong>ChatGPT-User</strong> fetches pages when a user, or ChatGPT on their behalf, opens a link during a conversation.</li>
      <li><strong>GPTBot</strong> collects content for training future models. Blocking it is a separate choice from appearing in search answers.</li>
    </ul>
    <p>OpenAI has said ChatGPT search also uses third-party search providers, so being well indexed in mainstream search engines, including Bing, supports your visibility.</p>
  </> },
  { id: "steps", title: "Steps to get mentioned", content: <>
    <ol className="guide-steps">
      <li><strong>Allow OAI-SearchBot and ChatGPT-User.</strong> Check with our free <Link href="/tools/ai-crawler-checker">AI Crawler Checker</Link>.</li>
      <li><strong>Get indexed in Bing.</strong> Verify your site in Bing Webmaster Tools and submit your sitemap. IndexNow can notify Bing of changes within minutes.</li>
      <li><strong>Write the answer on your page.</strong> One clear sentence such as &ldquo;We are a physiotherapy clinic in Kothrud, Pune, treating sports injuries and back pain, open Monday to Saturday&rdquo; is easy to quote.</li>
      <li><strong>Make listings agree.</strong> ChatGPT often cites directories and maps listings. Keep your name, address, phone and services identical everywhere.</li>
      <li><strong>Earn mentions in sources ChatGPT cites.</strong> Ask ChatGPT your customers&apos; questions, note the sites it links, and make sure you are listed accurately on them.</li>
      <li><strong>Track over time.</strong> Answers vary between conversations. Ask the same questions on a schedule and watch the trend.</li>
    </ol>
  </> },
  { id: "ads", title: "Organic answers and ChatGPT ads", content: <>
    <p>Organic recommendations in ChatGPT answers cannot be bought. Advertising inside ChatGPT is a separate, labelled product with its own rules and availability. The two work together: ads can put you in front of people now, while GEO improves whether ChatGPT names you on its own.</p>
  </> },
];

const faq = [
  { q: "Can I pay ChatGPT to recommend my business?", a: "No. Organic answers cannot be bought. Ads, where available, are shown separately and labelled. Getting recommended organically depends on clear, consistent and accessible information about your business." },
  { q: "Which crawler does ChatGPT search use?", a: "OpenAI uses OAI-SearchBot to surface websites in ChatGPT search, and ChatGPT-User for pages opened during a conversation. GPTBot is used for model training." },
  { q: "Why does ChatGPT give different answers each time?", a: "Answers depend on the wording, the user's location, the date and the sources found at that moment. That is why it is better to measure how often you are named over many checks than to judge from a single answer." },
  { q: "Does Google ranking affect ChatGPT?", a: "Indirectly. Good, crawlable pages with clear facts help everywhere, but ChatGPT search uses its own crawler and third-party search providers, so check Bing indexing and AI crawler access too." },
];

export default function Page() {
  return <GuidePage meta={meta} intro="When customers ask ChatGPT who to call, it names a handful of businesses and links its sources. Here is how it finds them, and the practical steps that make yours easier to recommend." sections={sections} faq={faq} />;
}

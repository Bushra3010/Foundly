import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage, guideMeta, type GuideSection } from "@/components/guide-page";

const meta = guideMeta("what-is-geo");

export const metadata: Metadata = {
  title: { absolute: `${meta.seoTitle ?? meta.title} · Foundly` },
  description: meta.description,
  alternates: { canonical: `/guides/${meta.slug}` },
  openGraph: { type: "article", title: meta.title, description: meta.description, url: `/guides/${meta.slug}`, images: "/opengraph-image", publishedTime: meta.published, modifiedTime: meta.updated },
};

const METRICS: [string, string][] = [
  ["Mentions", "Whether an assistant names your business at all for a question."],
  ["Coverage", "The share of your tracked questions where you are named."],
  ["Position", "Where you appear in the answer: first, second or further down."],
  ["Share of voice", "How often you are named compared with competitors across the same questions."],
  ["Citations", "Which web pages the assistant links or credits, and whether any of them are yours."],
];

const sections: GuideSection[] = [
  { id: "short-answer", title: "The short answer", content: <>
    <p><strong>GEO (generative engine optimisation) is the work of getting your business named, described correctly and cited in answers written by AI assistants such as ChatGPT, Gemini, Perplexity and Claude.</strong></p>
    <p>Where SEO aims to rank a page in a list of links, GEO aims to be one of the few businesses an assistant recommends when someone asks &ldquo;who should I call?&rdquo;. The term comes from a 2023 research paper that studied how content can become more visible in generative search engines.</p>
    <p>You will also see GEO called <strong>AI SEO</strong>, <strong>LLM SEO</strong>, <strong>LLMO</strong> (large language model optimisation) or <strong>AI search optimisation</strong>. They all describe the same goal: being found, named and cited by AI assistants.</p>
  </> },
  { id: "how", title: "How AI assistants choose who to name", content: <>
    <ul>
      <li><strong>They search, then summarise.</strong> For local and current questions, most assistants run a web search, read a handful of pages and write an answer from them. If your pages are not found or cannot be read, you are not in the answer.</li>
      <li><strong>They need clear facts.</strong> An assistant can only repeat what it can find in plain text: what you do, where you work, prices, hours and who you serve.</li>
      <li><strong>They look for agreement.</strong> When your website, directory listings and reviews say the same thing, an assistant is more confident naming you. Conflicting details make it less likely.</li>
      <li><strong>They lean on other sources.</strong> Answers often cite directories, review sites and articles rather than your own site, so where you are listed and mentioned matters as much as what your site says.</li>
    </ul>
  </> },
  { id: "do", title: "What GEO work involves", content: <>
    <ol className="guide-steps">
      <li><strong>Let AI crawlers in.</strong> Check that your robots.txt allows OAI-SearchBot, PerplexityBot, ClaudeBot and the others. Our free <Link href="/tools/ai-crawler-checker">AI Crawler Checker</Link> tests this in seconds.</li>
      <li><strong>Write quotable facts.</strong> State each service, area served and price range in a sentence an assistant could repeat as it is. Our guide to <Link href="/guides/what-is-aeo">answer engine optimisation</Link> covers how to structure those answers.</li>
      <li><strong>Add structured data.</strong> Mark up your business, services and FAQs so machines read them without guessing.</li>
      <li><strong>Be consistent everywhere.</strong> Keep name, address, phone, hours and services identical on your website, Google Business Profile and directories.</li>
      <li><strong>Earn mentions on trusted sites.</strong> Reviews, local press, industry directories and partner pages give assistants independent sources that agree about you.</li>
      <li><strong>Measure and repeat.</strong> Ask the assistants your customers&rsquo; questions on a schedule and track the results, because answers change over time.</li>
    </ol>
    <p>For a step-by-step checklist, read <Link href="/guides/geo-for-local-businesses">how to get your business recommended by AI</Link>. For each assistant&rsquo;s specifics, see the guides to <Link href="/guides/rank-on-chatgpt">ChatGPT</Link>, <Link href="/guides/google-ai-overviews-and-gemini">Google AI Overviews and Gemini</Link>, and <Link href="/guides/perplexity-and-claude">Perplexity and Claude</Link>.</p>
  </> },
  { id: "measure", title: "How GEO is measured", content: <>
    <p>There is no single ranking position in AI answers. Instead, you ask the same set of questions repeatedly and track:</p>
    <div className="legal-table-wrap"><table className="legal-table">
      <caption className="sr-only">GEO metrics</caption>
      <thead><tr><th scope="col">Metric</th><th scope="col">What it tells you</th></tr></thead>
      <tbody>{METRICS.map(([m, d]) => <tr key={m}><th scope="row">{m}</th><td>{d}</td></tr>)}</tbody>
    </table></div>
    <p>Because answers vary with wording, location, date and model, look at trends over several weeks rather than a single check.</p>
  </> },
  { id: "myths", title: "Common GEO myths", content: <>
    <ul>
      <li><strong>&ldquo;Someone can guarantee you the top spot in ChatGPT.&rdquo;</strong> No one controls AI answers. Treat any guarantee as a warning sign; our guide to <Link href="/guides/choose-seo-aeo-geo-agency">choosing a GEO agency</Link> lists what to ask instead.</li>
      <li><strong>&ldquo;GEO replaces SEO.&rdquo;</strong> Assistants search the web, so crawlable, well-structured pages still come first. See <Link href="/guides/geo-vs-seo">GEO vs SEO</Link>.</li>
      <li><strong>&ldquo;It is all about keywords.&rdquo;</strong> Assistants answer questions in their own words. Clear facts, consistency and trusted mentions matter more than repeating a phrase.</li>
    </ul>
  </> },
];

const faq = [
  { q: "What does GEO stand for?", a: "GEO stands for generative engine optimisation: improving how often and how accurately AI assistants such as ChatGPT, Gemini, Perplexity and Claude name and cite your business in their answers." },
  { q: "Is GEO the same as AI SEO or LLM SEO?", a: "Yes. AI SEO, LLM SEO, LLMO and AI search optimisation are other names for generative engine optimisation: improving how AI assistants such as ChatGPT, Gemini, Perplexity and Claude find, name and cite your business." },
  { q: "Is GEO different from AEO?", a: "They overlap. AEO is about being the direct answer to a question in search features and assistants. GEO focuses on generative AI assistants recommending and citing your business. Clear, consistent, quotable facts help both." },
  { q: "How long does GEO take to show results?", a: "Changes to your own pages can be picked up within days of being crawled, but mentions on other sites and consistent listings take weeks to build. Judge progress over several weeks of repeated checks." },
  { q: "Can small local businesses do GEO?", a: "Yes. Most of the work is getting your facts right and consistent: your website, Google Business Profile and directory listings. That is within reach of any business, with or without an agency." },
];

export default function Page() {
  return <GuidePage meta={meta} intro="More people now ask an AI assistant who to call instead of searching a list of links. Generative engine optimisation is how a business gets into those answers. Here is what it means, how it works and how to measure it." sections={sections} faq={faq} />;
}

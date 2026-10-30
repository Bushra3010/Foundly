import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage, guideMeta, type GuideSection } from "@/components/guide-page";

const meta = guideMeta("what-is-aeo");

export const metadata: Metadata = {
  title: { absolute: `${meta.seoTitle ?? meta.title} · Foundly` },
  description: meta.description,
  alternates: { canonical: `/guides/${meta.slug}` },
  openGraph: { type: "article", title: meta.title, description: meta.description, url: `/guides/${meta.slug}`, images: "/opengraph-image", publishedTime: meta.published, modifiedTime: meta.updated },
};

const ROWS: [string, string, string, string][] = [
  ["Goal", "Rank a page in a list of links", "Be the answer quoted directly", "Be named or cited in an AI-written answer"],
  ["Where it shows", "Search results", "Featured snippets, AI Overviews, voice assistants, answer boxes", "ChatGPT, Gemini, Perplexity, Claude"],
  ["What wins", "Relevance, links, page experience", "A clear, short answer to a specific question", "Clear facts, consistent listings, sources the assistant trusts"],
  ["What you track", "Rankings and clicks", "Questions where your answer is shown", "Mentions, position, share of voice and citations"],
];

const sections: GuideSection[] = [
  { id: "short-answer", title: "The short answer", content: <>
    <p><strong>AEO (answer engine optimisation) is the work of making your content the answer a search engine or AI assistant gives directly, instead of one link among many.</strong> It covers featured snippets and AI Overviews in Google, spoken answers from voice assistants, and the written answers in ChatGPT, Gemini, Perplexity and Claude.</p>
    <p>In practice, AEO means writing clear, short answers to the exact questions your customers ask, and structuring your pages so a machine can find, trust and repeat those answers.</p>
  </> },
  { id: "where", title: "Where answer engines show up", content: <>
    <ul>
      <li><strong>Google Search.</strong> Featured snippets at the top of results, &ldquo;People also ask&rdquo; boxes, and AI Overviews and AI Mode, which write an answer and link the sources used.</li>
      <li><strong>Voice assistants.</strong> Google Assistant, Siri and Alexa read out one answer, so there is no second place.</li>
      <li><strong>AI assistants.</strong> ChatGPT, Gemini, Perplexity and Claude answer in their own words and often link or cite the pages they drew on.</li>
    </ul>
    <p>Each of these favours the same thing: a page that answers the question plainly, near the top, in words that can be lifted without editing.</p>
  </> },
  { id: "comparison", title: "AEO, SEO and GEO side by side", content: <>
    <div className="legal-table-wrap"><table className="legal-table">
      <caption className="sr-only">Comparison of SEO, AEO and GEO</caption>
      <thead><tr><th scope="col"></th><th scope="col">SEO</th><th scope="col">AEO</th><th scope="col">GEO</th></tr></thead>
      <tbody>{ROWS.map(([label, seo, aeo, geo]) => <tr key={label}><th scope="row">{label}</th><td>{seo}</td><td>{aeo}</td><td>{geo}</td></tr>)}</tbody>
    </table></div>
    <p>The three overlap heavily. AEO sits between them: it uses SEO&rsquo;s foundations and produces the quotable answers that GEO depends on. Read <Link href="/guides/what-is-geo">what GEO is</Link>, and our guide to <Link href="/guides/geo-vs-seo">GEO vs SEO</Link> for the other side of the comparison.</p>
  </> },
  { id: "how", title: "How to do AEO", content: <>
    <ol className="guide-steps">
      <li><strong>Start from real questions.</strong> Collect the questions customers ask you on the phone, on WhatsApp and in reviews, and the ones in Google&rsquo;s &ldquo;People also ask&rdquo; boxes for your service.</li>
      <li><strong>Answer first, then explain.</strong> Use the question as a heading and answer it in the first one or two sentences, in about 40 to 60 words. Add detail after the answer, not before it.</li>
      <li><strong>State facts as text.</strong> Prices, hours, areas served, qualifications and turnaround times should be written on the page, not only shown in images, PDFs or pop-ups.</li>
      <li><strong>Add structured data.</strong> Mark up your business with <code>LocalBusiness</code> or <code>Organization</code>, your offers with <code>Service</code> or <code>Product</code>, and articles with <code>Article</code>. It does not guarantee an answer box, but it removes ambiguity.</li>
      <li><strong>Keep one page per question cluster.</strong> A focused page about &ldquo;root canal cost in Pune&rdquo; is easier to quote than a long page that covers every treatment.</li>
      <li><strong>Keep answers current.</strong> Update prices and dates when they change, and show when the page was last updated. Answer engines avoid repeating facts that look stale.</li>
    </ol>
  </> },
  { id: "measure", title: "How to measure AEO", content: <>
    <ul>
      <li><strong>Search Console.</strong> Google includes clicks and impressions from AI Overviews and AI Mode in its regular Search Console reports rather than in a separate one. Watch the question-style queries your pages appear for.</li>
      <li><strong>Featured snippets.</strong> Search your target questions and note when your page is the quoted answer. Results vary by location and device, so check consistently.</li>
      <li><strong>AI assistants.</strong> Ask ChatGPT, Gemini, Perplexity and Claude the same questions on a schedule and record whether you are named or cited. Foundly automates this and saves every answer as evidence.</li>
    </ul>
  </> },
  { id: "mistakes", title: "Common AEO mistakes", content: <>
    <ul>
      <li>Burying the answer under a long introduction.</li>
      <li>Writing FAQs that are really sales copy, so no question gets a straight answer.</li>
      <li>Expecting FAQ markup to create rich results: since 2023, Google shows FAQ rich results mainly for well-known government and health sites. The questions and answers on the page still help.</li>
      <li>Giving different hours, prices or addresses on your website and your listings, which makes every answer engine less sure of you.</li>
    </ul>
  </> },
];

const faq = [
  { q: "What does AEO stand for?", a: "AEO stands for answer engine optimisation: making your content the direct answer a search engine, voice assistant or AI assistant gives to a question." },
  { q: "Is AEO the same as GEO?", a: "They overlap. AEO is about being the answer quoted for a question, in search features and assistants alike. GEO is about generative AI assistants such as ChatGPT and Gemini naming or recommending your business. Clear, quotable facts help both." },
  { q: "Does AEO replace SEO?", a: "No. Answer engines still rely on pages they can crawl and trust, so SEO foundations come first. AEO adds a focus on short, direct answers to specific questions." },
  { q: "How long does AEO take to work?", a: "Pages can be picked up within days of being crawled, but answers vary by wording, location and model, so judge progress over several weeks of consistent checks rather than a single search." },
];

export default function Page() {
  return <GuidePage meta={meta} intro="Search is turning into answers: a featured snippet, a spoken reply, or a paragraph written by AI. Answer engine optimisation is how you become that answer. Here is what it means and how to do it." sections={sections} faq={faq} />;
}

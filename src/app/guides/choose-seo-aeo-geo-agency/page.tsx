import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage, guideMeta, type GuideSection } from "@/components/guide-page";

const meta = guideMeta("choose-seo-aeo-geo-agency");

export const metadata: Metadata = {
  title: { absolute: `${meta.title} · Foundly` },
  description: meta.description,
  alternates: { canonical: `/guides/${meta.slug}` },
  openGraph: { type: "article", title: meta.title, description: meta.description, url: `/guides/${meta.slug}`, images: "/opengraph-image", publishedTime: meta.published, modifiedTime: meta.updated },
};

const sections: GuideSection[] = [
  { id: "which", title: "SEO, AEO or GEO: which do you need?", content: <>
    <p><strong>The best agency for you depends on where your customers look.</strong> If they mostly search Google and click links, classic SEO still matters most. If they ask ChatGPT, Gemini, Perplexity or Claude for a recommendation, you need GEO. AEO sits between the two: making your content the direct answer that both search features and assistants quote.</p>
    <p>For most local businesses in 2026 the honest answer is a mix: the SEO foundations (a crawlable website, an accurate Google Business Profile, consistent listings) plus GEO work to get named in AI answers. Read <Link href="/guides/geo-vs-seo">GEO vs SEO</Link> for the full comparison.</p>
  </> },
  { id: "show-you", title: "What a good agency should show you", content: <>
    <ul>
      <li><strong>A baseline of real AI answers.</strong> Before any work starts, the exact answers ChatGPT, Gemini, Perplexity and Claude give to your customers&apos; questions, saved so you can compare later.</li>
      <li><strong>The questions they will track.</strong> Specific prompts like &ldquo;best dermatologist in Baner&rdquo;, not vague &ldquo;brand awareness&rdquo;.</li>
      <li><strong>Competitors and sources.</strong> Who AI names instead of you, and which websites it cites, because that is where the work is.</li>
      <li><strong>A prioritised plan.</strong> What they will change first and why, in plain language.</li>
      <li><strong>Evidence-based reporting.</strong> Mentions, coverage, share of voice and position over time, with the underlying answers, not just a score.</li>
    </ul>
  </> },
  { id: "questions", title: "Questions to ask before you sign", content: <>
    <ol className="guide-steps">
      <li>Which AI assistants do you track, and how often do you check?</li>
      <li>Can I see the full AI answers behind your numbers?</li>
      <li>What exactly will you change on my website and listings, and will I approve it first?</li>
      <li>Who owns the content, accounts and data if I leave?</li>
      <li>What is included in the monthly fee, and what costs extra, such as ad spend or website work?</li>
      <li>How do you handle the fact that AI answers vary from one check to the next?</li>
    </ol>
  </> },
  { id: "red-flags", title: "Red flags", content: <>
    <ul>
      <li><strong>Guaranteed rankings or &ldquo;#1 on ChatGPT&rdquo;.</strong> No one controls what an AI assistant says.</li>
      <li><strong>Screenshots only.</strong> A single screenshot of one answer proves very little; answers vary by person, place and time.</li>
      <li><strong>Fake reviews or invented credentials.</strong> They can damage your reputation and break platform rules.</li>
      <li><strong>Blocking your access.</strong> You should always own your website, Google Business Profile and data.</li>
      <li><strong>Long lock-in contracts</strong> before you have seen any baseline or plan.</li>
    </ul>
  </> },
  { id: "near-me", title: "Does the agency need to be near you?", content: <>
    <p>Not usually. GEO and AEO work is done online, and AI assistants answer the same way regardless of where your agency sits. What matters is that the agency understands your market: the neighbourhoods you serve, the languages your customers use and the directories that matter in your city.</p>
    <p>A local agency can help if you want in-person meetings or photography. Otherwise, choose on evidence and fit rather than distance.</p>
  </> },
  { id: "foundly", title: "Where Foundly fits", content: <>
    <p>Foundly is an SEO, AEO and GEO agency and platform based in Pune, working with businesses across India and worldwide. We track your customers&apos; questions across ChatGPT, Gemini, Perplexity and Claude, save every answer as evidence and work through prioritised fixes. Plans start at ₹15,000 a month. See our <Link href="/services">services</Link> and <Link href="/pricing">pricing</Link>, or start with the free <Link href="/tools/ai-crawler-checker">AI Crawler Checker</Link>.</p>
  </> },
];

const faq = [
  { q: "What is the best GEO agency in India?", a: "The best agency is the one that can show you real AI answers for your customers' questions, explain what it will change, and report progress with evidence. Compare agencies using the questions in this guide, and be wary of anyone who guarantees rankings." },
  { q: "How much does a GEO agency cost in India?", a: "Pricing varies widely by scope. Ask what is included: which AI assistants are tracked, how many questions, how often, whether fixes are done for you, and whether ad spend or website work is extra. Foundly's plans start at ₹15,000 a month before tax." },
  { q: "Should I hire an SEO agency or a GEO agency?", a: "Many businesses need both. SEO foundations such as a crawlable website and accurate Google profile also support GEO. If customers increasingly ask AI for recommendations, make sure your agency measures AI answers directly." },
  { q: "Do I need an agency near me?", a: "Usually not. GEO and AEO are done online. Choose an agency that understands your local market and can show evidence, wherever it is based." },
];

export default function Page() {
  return <GuidePage meta={meta} intro="More agencies now offer SEO, AEO and GEO, and their promises can be hard to compare. Here is what a good one should show you, the questions to ask and the red flags to avoid." sections={sections} faq={faq} />;
}

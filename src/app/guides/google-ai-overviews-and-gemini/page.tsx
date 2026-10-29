import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage, guideMeta, type GuideSection } from "@/components/guide-page";

const meta = guideMeta("google-ai-overviews-and-gemini");

export const metadata: Metadata = {
  title: { absolute: `${meta.title} · Foundly` },
  description: meta.description,
  alternates: { canonical: `/guides/${meta.slug}` },
  openGraph: { type: "article", title: meta.title, description: meta.description, url: `/guides/${meta.slug}`, images: "/opengraph-image", publishedTime: meta.published, modifiedTime: meta.updated },
};

const sections: GuideSection[] = [
  { id: "what", title: "AI Overviews, AI Mode and Gemini", content: <>
    <p><strong>AI Overviews and AI Mode are part of Google Search. Gemini is Google&apos;s separate AI assistant.</strong> All three can recommend local businesses, but they draw on Google&apos;s systems in different ways.</p>
    <ul>
      <li><strong>AI Overviews</strong> appear above search results and summarise an answer with links to supporting pages.</li>
      <li><strong>AI Mode</strong> is a conversational search experience that breaks a question into several searches and links its sources.</li>
      <li><strong>Gemini</strong> is a standalone assistant that can use Google Search and Maps information when answering.</li>
    </ul>
  </> },
  { id: "eligibility", title: "What Google has said about eligibility", content: <>
    <p>Google&apos;s guidance is that there are no special requirements to appear in AI Overviews or AI Mode beyond normal Search: a page must be indexed and eligible to show with a snippet. The same fundamentals apply, including crawlable pages, helpful content, accurate structured data that matches the visible page, and a good page experience.</p>
    <p><strong>Google-Extended</strong> is a robots.txt token that controls whether your content is used to train Gemini models and for grounding in Gemini apps. Google has said it does not affect inclusion or ranking in Google Search, so blocking it does not remove you from AI Overviews.</p>
  </> },
  { id: "local", title: "For local businesses: Google Business Profile comes first", content: <>
    <p>For local questions, Google&apos;s answers lean heavily on Maps and Business Profile information. Make sure yours is complete and accurate:</p>
    <ul>
      <li>Primary and secondary categories that describe exactly what you do.</li>
      <li>Every service, with a short description, and your service areas.</li>
      <li>Accurate hours, including holiday hours, plus phone number and website.</li>
      <li>Photos, regular updates and genuine reviews with replies.</li>
    </ul>
    <p>Then match those facts on your website, with <code>LocalBusiness</code> structured data that repeats only what is visible on the page.</p>
  </> },
  { id: "steps", title: "Checklist", content: <>
    <ol className="guide-steps">
      <li>Verify your site in Google Search Console, submit your sitemap and fix indexing issues.</li>
      <li>Complete and verify your Google Business Profile.</li>
      <li>Write service and location pages that answer specific questions in plain sentences.</li>
      <li>Add accurate structured data and a short FAQ.</li>
      <li>Allow Googlebot; decide separately whether to allow Google-Extended for Gemini. Check both with the <Link href="/tools/ai-crawler-checker">AI Crawler Checker</Link>.</li>
      <li>Ask Gemini and Google AI Mode your customers&apos; questions regularly and note which sources they link.</li>
    </ol>
  </> },
];

const faq = [
  { q: "How do I get into Google AI Overviews?", a: "Google says there are no extra technical requirements: the page must be indexed and eligible for a search snippet. Clear, helpful content that answers the question, plus accurate structured data and a complete Business Profile for local queries, gives you the best chance." },
  { q: "Does blocking Google-Extended remove me from AI Overviews?", a: "No. Google has said Google-Extended does not affect inclusion or ranking in Google Search, which includes AI Overviews. It controls use of content for Gemini model training and grounding in Gemini apps." },
  { q: "Is Gemini the same as AI Overviews?", a: "No. AI Overviews and AI Mode are features of Google Search. Gemini is a separate assistant, although it can use Google Search and Maps information." },
  { q: "Does my Google Business Profile matter for Gemini?", a: "For local questions, Google's AI experiences commonly draw on Maps and Business Profile data, so an accurate, complete profile is one of the most useful things a local business can maintain." },
];

export default function Page() {
  return <GuidePage meta={meta} intro="Google now answers many local questions with AI before showing any links. Here is what Google has said about getting into those answers, and what a local business should do." sections={sections} faq={faq} />;
}

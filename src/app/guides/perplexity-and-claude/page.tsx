import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage, guideMeta, type GuideSection } from "@/components/guide-page";

const meta = guideMeta("perplexity-and-claude");

export const metadata: Metadata = {
  title: { absolute: `${meta.seoTitle ?? meta.title} · Foundly` },
  description: meta.description,
  alternates: { canonical: `/guides/${meta.slug}` },
  openGraph: { type: "article", title: meta.title, description: meta.description, url: `/guides/${meta.slug}`, images: "/opengraph-image", publishedTime: meta.published, modifiedTime: meta.updated },
};

const sections: GuideSection[] = [
  { id: "perplexity", title: "How Perplexity chooses sources", content: <>
    <p><strong>Perplexity is built around web search: it looks up a question, reads several pages and writes an answer with numbered citations.</strong> Because every claim is linked, being one of those sources is the main way to appear.</p>
    <ul>
      <li><strong>PerplexityBot</strong> builds Perplexity&apos;s search index. Allow it in robots.txt.</li>
      <li><strong>Perplexity-User</strong> fetches pages when a user&apos;s question requires it.</li>
      <li>Answers favour pages that state the answer directly, are clearly structured and are up to date.</li>
    </ul>
  </> },
  { id: "claude", title: "How Claude finds businesses", content: <>
    <p><strong>Claude answers from its training and, when web search is enabled, from pages it finds and cites.</strong> Anthropic uses separate crawlers for different jobs:</p>
    <ul>
      <li><strong>ClaudeBot</strong> collects public web content for model training.</li>
      <li><strong>Claude-SearchBot</strong> indexes pages to improve search results in Claude.</li>
      <li><strong>Claude-User</strong> fetches pages when a user asks Claude to look something up.</li>
    </ul>
    <p>Blocking Claude-SearchBot or Claude-User makes it less likely Claude can find or cite your pages when it searches.</p>
  </> },
  { id: "become-a-source", title: "How to become a source they quote", content: <>
    <ol className="guide-steps">
      <li><strong>Allow the search crawlers</strong> for both: PerplexityBot, Perplexity-User, Claude-SearchBot and Claude-User. Test with the <Link href="/tools/ai-crawler-checker">AI Crawler Checker</Link>.</li>
      <li><strong>Lead with the answer.</strong> Open each service page with one sentence that says what you do, where and for whom.</li>
      <li><strong>Use clear headings and lists.</strong> Well-structured pages are easier to extract accurate facts from.</li>
      <li><strong>Keep pages fresh.</strong> Show a last-updated date and keep hours, prices and services current.</li>
      <li><strong>Be on the pages they already cite.</strong> Ask each assistant your customers&apos; questions, note the cited sites, and make sure you are listed there accurately.</li>
      <li><strong>Publish an llms.txt.</strong> It is an optional, emerging convention, but it gives assistants a short summary of your business and links to your key pages.</li>
    </ol>
  </> },
];

const faq = [
  { q: "How does Perplexity decide what to cite?", a: "Perplexity searches the web for each question and cites the pages it used. Pages that answer the question directly, are well structured, current and accessible to PerplexityBot are more likely to be among them." },
  { q: "Which Claude crawlers should I allow?", a: "To be found and cited when Claude searches, allow Claude-SearchBot and Claude-User. ClaudeBot is used for model training; allowing or blocking it is a separate decision." },
  { q: "Does Claude recommend local businesses?", a: "When web search is available, Claude can look up and cite local businesses. Clear, consistent information across your website and listings makes it easier for Claude to describe you correctly." },
  { q: "What is llms.txt and do I need it?", a: "llms.txt is an optional text file that summarises your site for AI assistants and links key pages. It is not an official standard, but it is quick to add and harmless." },
];

export default function Page() {
  return <GuidePage meta={meta} intro="Perplexity and Claude both show the sources behind their answers. Here is how each one finds pages to cite, and how to make your business one of them." sections={sections} faq={faq} />;
}

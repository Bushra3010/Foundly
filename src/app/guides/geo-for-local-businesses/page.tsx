import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage, guideMeta, type GuideSection } from "@/components/guide-page";

const meta = guideMeta("geo-for-local-businesses");

export const metadata: Metadata = {
  title: { absolute: `${meta.title} · Foundly` },
  description: meta.description,
  alternates: { canonical: `/guides/${meta.slug}` },
  openGraph: { type: "article", title: meta.title, description: meta.description, url: `/guides/${meta.slug}`, images: "/opengraph-image", publishedTime: meta.published, modifiedTime: meta.updated },
};

const sections: GuideSection[] = [
  { id: "what-is-geo", title: "What is GEO?", content: <>
    <p><strong>Generative engine optimisation (GEO) is the work of making your business easy for AI assistants to find, understand and recommend.</strong> When someone asks ChatGPT, Gemini, Perplexity or Claude &ldquo;who is a good plumber in Pune?&rdquo;, the assistant writes one answer and names a handful of businesses. GEO is about being one of them.</p>
    <p>It is closely related to answer engine optimisation (AEO), which focuses on being the source an assistant or search feature quotes when it answers a question directly. In practice, local businesses can treat the two as one job: publish clear, consistent, quotable facts about what you do, where and for whom.</p>
  </> },
  { id: "how-ai-chooses", title: "How AI assistants choose which businesses to name", content: <>
    <p>No assistant publishes its exact ranking rules, and answers vary with the wording, location, date and model. But the way these systems work points to a few consistent inputs:</p>
    <ul>
      <li><strong>What the model already learned.</strong> Assistants are trained on large amounts of public web text. Businesses that are described clearly and often across the web are more likely to be known.</li>
      <li><strong>What it reads at answer time.</strong> Many assistants search the web before answering and cite the pages they used. Perplexity shows its sources by default; ChatGPT, Gemini and Claude do so when they search.</li>
      <li><strong>Whether the facts agree.</strong> When your name, services, area and phone number match across your website, Google Business Profile, directories and social pages, an assistant can state them with more confidence.</li>
      <li><strong>Whether the page answers the question.</strong> A page that plainly says &ldquo;We are a licensed electrician serving Baner, Aundh and Wakad&rdquo; is easier to quote than one that only says &ldquo;Quality you can trust&rdquo;.</li>
    </ul>
  </> },
  { id: "checklist", title: "A GEO checklist for local businesses", content: <>
    <p>Work through these in order. The first items are the foundations; the later ones build on them.</p>
    <ol className="guide-steps">
      <li><strong>Let AI crawlers read your website.</strong> Check that your <code>robots.txt</code> does not block crawlers such as GPTBot, OAI-SearchBot, Google-Extended, PerplexityBot and ClaudeBot, and that your key pages load without logging in.</li>
      <li><strong>State the core facts in plain text.</strong> Your business name, what you do, the areas you serve, opening hours, phone number and address should appear as text on your homepage, not only inside images.</li>
      <li><strong>Give each service its own page or section.</strong> Describe what it includes, who it is for, typical turnaround and the areas you cover. Assistants answer specific questions, so specific pages are easier to match.</li>
      <li><strong>Add structured data.</strong> <code>LocalBusiness</code> JSON-LD with your name, address, phone, hours and services helps machines read the facts exactly. Only include details that are true and visible on the page.</li>
      <li><strong>Make your listings consistent.</strong> Use the same name, address and phone number on Google Business Profile, Facebook, Justdial, IndiaMART, Sulekha and other directories relevant to your trade.</li>
      <li><strong>Answer the questions customers ask.</strong> A short FAQ with real questions (&ldquo;Do you offer same-day repairs in Kothrud?&rdquo;) and direct answers gives assistants something to quote.</li>
      <li><strong>Show proof.</strong> Licences, certifications, years in business, notable projects and genuine reviews give an assistant reasons to recommend you over a competitor. Never invent them.</li>
      <li><strong>Get mentioned where AI looks.</strong> Find the directories, articles and local guides that assistants cite for your category and city, and make sure you appear in them accurately.</li>
      <li><strong>Measure, then repeat.</strong> Ask the same questions on a schedule and track whether you are named, in what position and which sources were cited. Single answers vary; trends are what matter.</li>
    </ol>
  </> },
  { id: "mistakes", title: "Common mistakes", content: <>
    <ul>
      <li><strong>Blocking AI crawlers by accident.</strong> Some website builders and security plugins block unfamiliar bots by default.</li>
      <li><strong>Different details on different sites.</strong> An old phone number or a previous address on one directory can lead an assistant to repeat it.</li>
      <li><strong>Marketing language instead of facts.</strong> &ldquo;Best in town&rdquo; tells an assistant nothing it can verify or quote.</li>
      <li><strong>Judging from one search.</strong> Your own results are shaped by your location, history and wording. Check the same questions consistently over time.</li>
      <li><strong>Paying for guaranteed placement.</strong> No one can guarantee what an AI assistant will say. Treat any such promise with suspicion.</li>
    </ul>
  </> },
  { id: "measure", title: "How to measure AI visibility", content: <>
    <p>Four numbers give a useful picture:</p>
    <ul>
      <li><strong>Mentions:</strong> how many answers name your business.</li>
      <li><strong>Coverage:</strong> the share of tracked questions where you appear at least once.</li>
      <li><strong>Share of voice:</strong> your mentions compared with the competitors named in the same answers.</li>
      <li><strong>Position:</strong> where you appear in the list when you are named.</li>
    </ul>
    <p>Alongside the numbers, read the answers themselves and the sources they cite. They tell you why a competitor was chosen and where you need to appear. <Link href="/">Foundly</Link> runs these checks on a schedule across ChatGPT, Gemini, Perplexity and Claude and saves every answer as evidence.</p>
  </> },
];

const faq = [
  { q: "What is GEO in simple terms?", a: "GEO (generative engine optimisation) means making your business easy for AI assistants such as ChatGPT, Gemini, Perplexity and Claude to find, understand and recommend when customers ask them for a local business." },
  { q: "Can I pay to be recommended by ChatGPT?", a: "Organic recommendations in AI answers cannot be bought or guaranteed. Advertising products are separate from those answers. The reliable route is clear, consistent and verifiable information about your business across the web." },
  { q: "Do I need a website for GEO?", a: "It helps a great deal. A website is the one place you fully control, where you can state your services, areas, hours and proof in plain text for assistants to read. Consistent listings on Google Business Profile and directories also matter." },
  { q: "How long does GEO take to show results?", a: "It varies. Assistants that search the web at answer time can pick up changes once pages are recrawled, while knowledge built into a model only changes when it is retrained. Track the same questions over several weeks to see the trend." },
];

export default function Page() {
  return <GuidePage meta={meta} intro="AI assistants are becoming the first place customers ask for a recommendation. This guide explains how they decide which businesses to name, and the practical steps that make yours easier to recommend." sections={sections} faq={faq} />;
}

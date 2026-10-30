import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { jsonLdScript } from "@/lib/profile";
import { NO_GUARANTEE } from "@/lib/services";
import { breadcrumbLd, faqLd, graph, serviceLd, siteUrl, whatsappLink } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

const TITLE = "Free AI visibility audit";
const DESCRIPTION = "Free AI visibility audit: see what ChatGPT, Gemini, Perplexity and Claude say about your business, who they recommend instead and what to fix first.";
const WHATSAPP = whatsappLink("Hi Foundly, I'd like a free AI visibility audit.\nBusiness name:\nCity:\nWebsite:");

export const metadata: Metadata = {
  title: { absolute: `${TITLE} for your business · Foundly` },
  description: DESCRIPTION,
  alternates: { canonical: "/ai-visibility-audit" },
  openGraph: { title: `${TITLE} · Foundly`, description: DESCRIPTION, url: "/ai-visibility-audit", images: "/opengraph-image" },
};

const GET = [
  { title: "What each assistant says", body: "The answers ChatGPT, Gemini, Perplexity and Claude give to the questions your customers ask, such as “best physiotherapist in Baner”." },
  { title: "Who they name instead", body: "The competitors each assistant recommends when you are not mentioned, and where they rank in the answer." },
  { title: "The sources they read", body: "The websites, directories and listings the assistants cite, so you know where you need to appear." },
  { title: "Your GEO readiness score", body: "A score for how easy your business is for AI to read and recommend: crawler access, clear facts, structured data and consistent listings." },
  { title: "What to fix first", body: "A short, prioritised list of changes, from unblocking AI crawlers to adding the facts assistants look for." },
];

const STEPS = [
  { title: "Tell us your business", body: "Your business name, city and website, and the kind of customer questions you want to be found for." },
  { title: "We ask the assistants", body: "Your questions go to ChatGPT, Gemini, Perplexity and Claude, and every answer is saved as evidence." },
  { title: "You see the results", body: "Who was named, in what position, which sources were cited, and what to change." },
];

const FAQ = [
  { q: "Is the AI visibility audit really free?", a: "Yes. Creating a Foundly account is free and includes your directory profile, a GEO readiness score and one-time trial credits to check AI answers. No card is needed." },
  { q: "Which AI assistants do you check?", a: "ChatGPT, Gemini, Perplexity and Claude: the assistants most people use to ask for recommendations." },
  { q: "What is an AI visibility audit?", a: "A check of whether AI assistants mention, describe and cite your business when people ask the questions your customers ask, compared with your competitors, plus the fixes most likely to help." },
  { q: "Will the audit get me recommended by ChatGPT?", a: NO_GUARANTEE },
];

export default function AiVisibilityAuditPage() {
  const url = siteUrl("/ai-visibility-audit");
  const ld = graph(
    { ...serviceLd({ name: "Free AI visibility audit", url }), serviceType: ["AI visibility audit", "Generative engine optimization"], offers: { "@type": "Offer", price: 0, priceCurrency: "INR", url: siteUrl("/signup") } },
    faqLd(FAQ),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Free AI visibility audit", path: "/ai-visibility-audit" }]),
  );
  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow">FOUNDLY / FREE AI VISIBILITY AUDIT</p>
          <h1>Does ChatGPT recommend your business? Find out free.</h1>
          <p className="legal-intro">Customers now ask ChatGPT, Gemini, Perplexity and Claude who to call. Our free AI visibility audit shows whether they name you, who they recommend instead, and what to fix first.</p>
          <p className="audit-ctas">
            <Link href="/signup" className="landing-button guide-cta">Start your free audit <Icon name="arrow" size={16} /></Link>
            <a href={WHATSAPP} className="landing-button secondary" rel="noopener">Ask on WhatsApp</a>
          </p>
        </header>
        <article className="legal-article about-article" aria-label="Free AI visibility audit">
          <section id="what-you-get">
            <h2><span>01</span>What you get</h2>
            <div className="about-principles industry-facts">{GET.map((g) => <div key={g.title}><h3>{g.title}</h3><p>{g.body}</p></div>)}</div>
          </section>
          <section id="how">
            <h2><span>02</span>How it works</h2>
            <ol className="guide-steps">{STEPS.map((s) => <li key={s.title}><strong>{s.title}.</strong> {s.body}</li>)}</ol>
            <p>Prefer to talk first? <a href={WHATSAPP} rel="noopener">Message us on WhatsApp</a> with your business name and city. Want to check one thing right now? Our free <Link href="/tools/ai-crawler-checker">AI Crawler Checker</Link> shows in seconds whether AI assistants can read your website.</p>
          </section>
          <section id="next">
            <h2><span>03</span>After the audit</h2>
            <p>Many fixes you can make yourself, and our guides explain how: <Link href="/guides/what-is-geo">what GEO is</Link>, <Link href="/guides/geo-for-local-businesses">how to get recommended by AI</Link> and <Link href="/guides/rank-on-chatgpt">how ChatGPT chooses businesses</Link>. If you would rather we do the work, our <Link href="/services">SEO, GEO and AEO service</Link> starts at ₹15,000 a month before tax. <Link href="/pricing">See pricing</Link>.</p>
          </section>
          <section id="faq">
            <h2><span>04</span>Frequently asked questions</h2>
            {FAQ.map((f) => <div key={f.q} className="guide-faq"><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </section>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

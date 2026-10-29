import type { Metadata } from "next";
import { clip } from "@/lib/presence";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { INDUSTRIES, industryBySlug } from "@/lib/industries";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, faqLd, graph, siteUrl } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

type Props = { params: Promise<{ industry: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const i = industryBySlug((await params).industry);
  if (!i) return {};
  const title = `GEO and AI search visibility for ${i.name.toLowerCase()}`;
  return {
    title,
    description: clip(i.intro, 158),
    alternates: { canonical: `/for/${i.slug}` },
    openGraph: { title: i.headline, description: i.intro, url: `/for/${i.slug}`, images: "/opengraph-image" },
  };
}

export default async function IndustryPage({ params }: Props) {
  const i = industryBySlug((await params).industry);
  if (!i) notFound();
  const url = siteUrl(`/for/${i.slug}`);
  const ld = graph(
    { "@type": "WebPage", "@id": url, url, name: i.headline, description: i.intro, about: { "@id": siteUrl("/#software") }, audience: { "@type": "BusinessAudience", audienceType: i.plural } },
    faqLd(i.faq),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Industries", path: "/for" }, { name: i.name, path: `/for/${i.slug}` }]),
  );

  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow"><Link href="/for">FOUNDLY / INDUSTRIES</Link> / {i.name.toUpperCase()}</p>
          <h1>{i.headline}</h1>
          <p className="legal-intro">{i.intro}</p>
          <p><Link href="/signup" className="landing-button guide-cta">Check your AI visibility free <Icon name="arrow" size={16} /></Link></p>
        </header>
        <article className="legal-article about-article" aria-label={i.headline}>
          <section id="questions">
            <h2><span>01</span>What customers ask AI</h2>
            <p>These are the kinds of questions people type into ChatGPT, Gemini, Perplexity and Claude when looking for {i.plural}. Foundly tracks questions like these for your business, every week.</p>
            <ul className="industry-questions">{i.questions.map((q) => <li key={q}>&ldquo;{q}&rdquo;</li>)}</ul>
          </section>
          <section id="facts">
            <h2><span>02</span>What AI needs to recommend you</h2>
            <div className="about-principles industry-facts">{i.facts.map((f) => <div key={f.title}><h3>{f.title}</h3><p>{f.body}</p></div>)}</div>
          </section>
          <section id="sources">
            <h2><span>03</span>Where AI looks</h2>
            <p>AI assistants often cite these sources for {i.plural}. Your details should be accurate and identical in each:</p>
            <ul>{i.sources.map((s) => <li key={s}>{s}</li>)}</ul>
            <p><strong>Common mistake:</strong> {i.pitfall}</p>
          </section>
          <section id="how">
            <h2><span>04</span>How Foundly helps</h2>
            <ul>
              <li>Tracks the questions your customers ask, across ChatGPT, Gemini, Perplexity and Claude.</li>
              <li>Shows which competitors AI names instead of you, and the sources it relied on.</li>
              <li>Audits your website for AI crawler access and the facts above, then writes the fixes.</li>
              <li>Publishes an accurate profile in the <Link href="/directory">Foundly directory</Link> and keeps your Google and Facebook listings in line.</li>
            </ul>
            <p>Start with the free <Link href="/tools/ai-crawler-checker">AI Crawler Checker</Link>, read the <Link href="/guides/geo-for-local-businesses">GEO guide for local businesses</Link>, or <Link href="/pricing">see pricing</Link>.</p>
          </section>
          <section id="faq">
            <h2><span>05</span>Frequently asked questions</h2>
            {i.faq.map((item) => <div key={item.q} className="guide-faq"><h3>{item.q}</h3><p>{item.a}</p></div>)}
          </section>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

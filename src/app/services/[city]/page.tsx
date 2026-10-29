import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { listToText } from "@/lib/geo";
import { SERVICE_CITIES, serviceCity } from "@/lib/locations";
import { jsonLdScript } from "@/lib/profile";
import { NO_GUARANTEE, PROCESS, SERVICES } from "@/lib/services";
import { breadcrumbLd, faqLd, graph, officeLd, serviceLd, siteUrl } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

type Props = { params: Promise<{ city: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return SERVICE_CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = serviceCity((await params).city);
  if (!c) return {};
  const title = `SEO, AEO and GEO agency in ${c.name}`;
  const description = `Get your ${c.name} business recommended by ChatGPT, Gemini, Perplexity and Claude. AI search visibility, local SEO and ChatGPT Ads for businesses in ${listToText(c.areas.slice(0, 3))} and across ${c.name}.`;
  return {
    title: { absolute: `${title} · Foundly` },
    description: description.slice(0, 170),
    alternates: { canonical: `/services/${c.slug}` },
    openGraph: { title, description, url: `/services/${c.slug}`, images: "/opengraph-image" },
  };
}

export default async function CityServicePage({ params }: Props) {
  const c = serviceCity((await params).city);
  if (!c) notFound();
  const faq = [
    { q: `Do you have an office in ${c.name}?`, a: c.office ? "Yes. Our office is at 801, C Wing, Phase 2, Shubhshree Residency, near Akurdi Chowk, Pune. We also work remotely with businesses anywhere." : `No. Our office is in Pune, and we work with ${c.name} businesses remotely. Everything, from audits to reporting, happens online, and the AI assistants we track answer the same way wherever we sit.` },
    { q: `Which ${c.name} businesses do you work with?`, a: `Any local business that customers find by asking AI, especially ${listToText(c.industries)}.` },
    { q: "Do AI assistants answer in regional languages?", a: `Yes. ChatGPT, Gemini and Claude can answer questions asked in ${listToText(c.languages.filter((l) => l !== "English"))}, often using the same English sources. Clear English facts on your website and listings remain the foundation.` },
    { q: "Can you guarantee the top spot?", a: NO_GUARANTEE },
  ];
  const url = siteUrl(`/services/${c.slug}`);
  const ld = graph(
    serviceLd({ name: `SEO, AEO and GEO services in ${c.name}`, url, city: c }),
    ...(c.office ? [officeLd()] : []),
    faqLd(faq),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: c.name, path: `/services/${c.slug}` }]),
  );

  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow"><Link href="/services">FOUNDLY / SERVICES</Link> / {c.name.toUpperCase()}</p>
          <h1>SEO, AEO and GEO agency in {c.name}</h1>
          <p className="legal-intro">When people in {c.name} ask ChatGPT, Gemini, Perplexity or Claude for a recommendation, a few businesses get named. Foundly helps make sure yours is one of them, with AI search tracking, local SEO foundations and the fixes that move results.</p>
          <p><Link href="/signup" className="landing-button guide-cta">Check what AI says about your business <Icon name="arrow" size={16} /></Link></p>
        </header>
        <article className="legal-article about-article" aria-label={`Foundly in ${c.name}`}>
          <section id="local">
            <h2><span>01</span>AI search in {c.name}</h2>
            <p>{c.note}</p>
            <p>These are the kinds of questions {c.name} customers ask AI assistants:</p>
            <ul className="industry-questions">{c.queries.map((q) => <li key={q}>&ldquo;{q}&rdquo;</li>)}</ul>
            <p>We track questions like these for your business across {listToText(c.areas)} and the rest of {c.name}.</p>
          </section>
          <section id="services">
            <h2><span>02</span>What we do for {c.name} businesses</h2>
            <div className="about-principles industry-facts">{SERVICES.map((s) => <div key={s.title}><h3>{s.title}</h3><p>{s.body}</p></div>)}</div>
          </section>
          <section id="process">
            <h2><span>03</span>How it works</h2>
            <ol className="guide-steps">{PROCESS.map((p) => <li key={p.title}><strong>{p.title}.</strong> {p.body}</li>)}</ol>
            <p>{c.office ? "Based in Pune, we can meet you in person or work entirely online." : `Our office is in Pune; we work with ${c.name} businesses entirely online.`} Plans start at ₹15,000 a month before tax. <Link href="/pricing">See pricing</Link>.</p>
          </section>
          <section id="faq">
            <h2><span>04</span>Frequently asked questions</h2>
            {faq.map((item) => <div key={item.q} className="guide-faq"><h3>{item.q}</h3><p>{item.a}</p></div>)}
          </section>
          <section id="other-cities">
            <h2><span>05</span>Other cities</h2>
            <div className="city-links">{SERVICE_CITIES.filter((o) => o.slug !== c.slug).map((o) => <Link key={o.slug} href={`/services/${o.slug}`}>{o.name}</Link>)}</div>
          </section>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

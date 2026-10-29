import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { SERVICE_CITIES } from "@/lib/locations";
import { jsonLdScript } from "@/lib/profile";
import { NO_GUARANTEE, PROCESS, SERVICES } from "@/lib/services";
import { breadcrumbLd, faqLd, graph, serviceLd } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

const TITLE = "SEO, AEO and GEO agency in India, serving businesses worldwide";
const DESCRIPTION = "Foundly is an AI search visibility agency and platform based in Pune. We help businesses across India and worldwide get recommended by ChatGPT, Gemini, Perplexity and Claude.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · Foundly` },
  description: DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/services", images: "/opengraph-image" },
};

const FAQ = [
  { q: "What is the difference between SEO, AEO and GEO?", a: "SEO helps your pages rank in search results. AEO (answer engine optimisation) helps your content become the direct answer that search features and assistants quote. GEO (generative engine optimisation) helps AI assistants like ChatGPT, Gemini, Perplexity and Claude name and recommend your business. Foundly works on all three, with a focus on AI answers." },
  { q: "Do you work with businesses outside India?", a: "Yes. We are based in Pune and work remotely with businesses across India and in other countries. Plans outside India are billed in US dollars." },
  { q: "How much does it cost?", a: "Plans start at ₹15,000 a month before tax and include basic GEO and the ChatGPT Ads service. See the pricing page for what each plan includes." },
  { q: "Can you guarantee first position on ChatGPT or Google?", a: NO_GUARANTEE },
  { q: "How do I choose a GEO agency?", a: "Ask to see real AI answers before and after, check that they track the specific questions your customers ask, and avoid anyone who guarantees rankings. Our guide on choosing an SEO, AEO or GEO agency lists the questions to ask." },
];

export default function ServicesPage() {
  const ld = graph(serviceLd(), faqLd(FAQ), breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]));
  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow">FOUNDLY / SERVICES</p>
          <h1>SEO, AEO and GEO agency for the AI search era</h1>
          <p className="legal-intro">{DESCRIPTION} You get our platform and our team: we measure what AI says about you, fix what is holding you back and show the results as evidence.</p>
          <p><Link href="/signup" className="landing-button guide-cta">Get your free AI visibility check <Icon name="arrow" size={16} /></Link></p>
        </header>
        <article className="legal-article about-article" aria-label="Foundly services">
          <section id="services">
            <h2><span>01</span>What we do</h2>
            <div className="about-principles industry-facts">{SERVICES.map((s) => <div key={s.title}><h3>{s.title}</h3><p>{s.body}</p></div>)}</div>
          </section>
          <section id="process">
            <h2><span>02</span>How we work</h2>
            <ol className="guide-steps">{PROCESS.map((p) => <li key={p.title}><strong>{p.title}.</strong> {p.body}</li>)}</ol>
            <p>{NO_GUARANTEE}</p>
          </section>
          <section id="cities">
            <h2><span>03</span>Where we work</h2>
            <p>Our office is in Pune. We work remotely with businesses in every major Indian city and around the world:</p>
            <div className="city-links">{SERVICE_CITIES.map((c) => <Link key={c.slug} href={`/services/${c.slug}`}>SEO, AEO and GEO in {c.name}</Link>)}</div>
            <p>Outside India? Everything we do works remotely, and the AI assistants we track are the same worldwide. <Link href="/pricing">See pricing in your region</Link>.</p>
          </section>
          <section id="faq">
            <h2><span>04</span>Frequently asked questions</h2>
            {FAQ.map((item) => <div key={item.q} className="guide-faq"><h3>{item.q}</h3><p>{item.a}</p></div>)}
            <p>Choosing between agencies? Read <Link href="/guides/choose-seo-aeo-geo-agency">how to choose an SEO, AEO or GEO agency</Link>.</p>
          </section>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

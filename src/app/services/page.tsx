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

const TITLE = "SEO, GEO, AEO and AI SEO agency in India";
const DESCRIPTION = "Foundly is a GEO and AI SEO agency in Pune, helping businesses in India and worldwide get recommended by ChatGPT, Gemini, Perplexity and Claude.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · Foundly` },
  description: DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/services", images: "/opengraph-image" },
};

const FAQ = [
  { q: "What is the difference between SEO, AEO and GEO?", a: "SEO helps your pages rank in search results. AEO (answer engine optimisation) helps your content become the direct answer that search features and assistants quote. GEO (generative engine optimisation) helps AI assistants like ChatGPT, Gemini, Perplexity and Claude name and recommend your business. Foundly works on all three, with a focus on AI answers." },
  { q: "What is AI SEO or LLM SEO?", a: "AI SEO and LLM SEO are other names for GEO: optimising how AI assistants built on large language models, such as ChatGPT, Gemini, Perplexity and Claude, find, describe and recommend your business. It builds on traditional SEO, with more focus on clear facts, consistent listings and being cited by sources the assistants trust." },
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
          <p><Link href="/ai-visibility-audit" className="landing-button guide-cta">Get your free AI visibility audit <Icon name="arrow" size={16} /></Link></p>
        </header>
        <article className="legal-article about-article" aria-label="Foundly services">
          <section id="services">
            <h2><span>01</span>What we do</h2>
            <div className="about-principles industry-facts">{SERVICES.map((s) => <div key={s.title}><h3>{s.title}</h3><p>{s.body}</p></div>)}</div>
          </section>
          <section id="more">
            <h2><span>02</span>More on each service</h2>
            <ul>
              <li><Link href="/ai-visibility-audit">Free AI visibility audit</Link>: see what ChatGPT, Gemini, Perplexity and Claude say about you today.</li>
              <li><Link href="/guides/what-is-geo">GEO, also called AI SEO or LLM SEO</Link>: how AI assistants choose which businesses to name.</li>
              <li><Link href="/guides/what-is-aeo">AEO</Link>: becoming the answer search features and assistants quote.</li>
              <li><Link href="/services/local-seo">Local SEO and Google Business Profile</Link>: consistent listings everywhere customers look.</li>
              <li><Link href="/services/chatgpt-ads">ChatGPT Ads</Link>: planned and run for you, included in every plan.</li>
            </ul>
          </section>
          <section id="process">
            <h2><span>03</span>How we work</h2>
            <ol className="guide-steps">{PROCESS.map((p) => <li key={p.title}><strong>{p.title}.</strong> {p.body}</li>)}</ol>
            <p>{NO_GUARANTEE}</p>
          </section>
          <section id="cities">
            <h2><span>04</span>Where we work</h2>
            <p>Our office is in Pune. We work remotely with businesses in every major Indian city and around the world:</p>
            <div className="city-links">{SERVICE_CITIES.map((c) => <Link key={c.slug} href={`/services/${c.slug}`}>SEO, AEO and GEO in {c.name}</Link>)}</div>
            <p>Outside India? Everything we do works remotely, and the AI assistants we track are the same worldwide. <Link href="/pricing">See pricing in your region</Link>.</p>
          </section>
          <section id="faq">
            <h2><span>05</span>Frequently asked questions</h2>
            {FAQ.map((item) => <div key={item.q} className="guide-faq"><h3>{item.q}</h3><p>{item.a}</p></div>)}
            <p>Choosing between agencies? Read <Link href="/guides/choose-seo-aeo-geo-agency">how to choose an SEO, AEO or GEO agency</Link>.</p>
          </section>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

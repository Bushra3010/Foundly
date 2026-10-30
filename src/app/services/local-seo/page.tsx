import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { SERVICE_CITIES } from "@/lib/locations";
import { jsonLdScript } from "@/lib/profile";
import { NO_GUARANTEE } from "@/lib/services";
import { breadcrumbLd, faqLd, graph, serviceLd, siteUrl, whatsappLink } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

const TITLE = "Local SEO and Google Business Profile";
const DESCRIPTION = "Local SEO and Google Business Profile management in India: consistent listings, structured data and AI visibility from one set of confirmed facts.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · Foundly` },
  description: DESCRIPTION,
  alternates: { canonical: "/services/local-seo" },
  openGraph: { title: `${TITLE} · Foundly`, description: DESCRIPTION, url: "/services/local-seo", images: "/opengraph-image" },
};

const WHAT = [
  { title: "Google Business Profile", body: "Connect your profile once and Foundly keeps your description, services and other supported details in line with your confirmed facts. Gemini and Google's AI answers read it first for local businesses." },
  { title: "Facebook and Instagram", body: "Connect your Facebook Page and Instagram so your name, contact details and description match everywhere customers and AI assistants look." },
  { title: "Directory listings", body: "Ready-to-paste details for Justdial, Bing Places, Sulekha, IndiaMART, LinkedIn and more, written from your confirmed facts so every listing says the same thing." },
  { title: "Website and structured data", body: "A website that states your services, areas and hours in plain text, with LocalBusiness structured data, a sitemap and IndexNow submission so search engines see changes quickly." },
  { title: "A public business profile", body: "A Foundly directory profile with its own page and structured data, another consistent source that search engines and AI assistants can read." },
  { title: "AI visibility tracking", body: "We check whether ChatGPT, Gemini, Perplexity and Claude name you for local questions, and which sources they rely on." },
];

const FAQ = [
  { q: "What is local SEO?", a: "Local SEO is the work of making a business easy to find for searches with a place in them, such as “dentist near me” or “plumber in Kothrud”. It covers your Google Business Profile, consistent listings, reviews, a clear website and structured data." },
  { q: "Why does Google Business Profile matter so much?", a: "It decides whether you appear in Google Maps and the local results, and Gemini and Google's AI answers read it first when recommending local businesses. Accurate categories, services, hours and photos all count." },
  { q: "How is local SEO different from GEO?", a: "They share the same foundation: accurate, consistent business facts. Local SEO focuses on Google Maps and local search results; GEO focuses on being named in AI answers. Doing local SEO well is one of the strongest things a local business can do for GEO." },
  { q: "Can you get me to the top of Google Maps?", a: NO_GUARANTEE },
];

export default function LocalSeoPage() {
  const url = siteUrl("/services/local-seo");
  const ld = graph(
    { ...serviceLd({ name: "Local SEO and Google Business Profile management", url }), serviceType: ["Local SEO", "Google Business Profile management", "Local listings management"] },
    faqLd(FAQ),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "Local SEO", path: "/services/local-seo" }]),
  );
  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow"><Link href="/services">FOUNDLY / SERVICES</Link> / LOCAL SEO</p>
          <h1>Local SEO and Google Business Profile, kept consistent everywhere</h1>
          <p className="legal-intro">When your Google Business Profile, listings and website all say the same thing, Google ranks you with more confidence and AI assistants recommend you more readily. Foundly keeps them in line from one set of facts you confirm.</p>
          <p className="audit-ctas">
            <Link href="/ai-visibility-audit" className="landing-button guide-cta">Get a free audit <Icon name="arrow" size={16} /></Link>
            <a href={whatsappLink("Hi Foundly, I'd like help with local SEO and my Google Business Profile.")} className="landing-button secondary" rel="noopener">Ask on WhatsApp</a>
          </p>
        </header>
        <article className="legal-article about-article" aria-label="Local SEO service">
          <section id="what">
            <h2><span>01</span>What we do</h2>
            <div className="about-principles industry-facts">{WHAT.map((w) => <div key={w.title}><h3>{w.title}</h3><p>{w.body}</p></div>)}</div>
          </section>
          <section id="consistency">
            <h2><span>02</span>Why consistency matters</h2>
            <p>Search engines and AI assistants compare what different sources say about you. If your hours on Google differ from your website, or your address is written two ways, they become less sure which is right, and less likely to show or name you. Our guide to <Link href="/guides/geo-for-local-businesses">getting a local business recommended by AI</Link> explains the checklist in full.</p>
          </section>
          <section id="cities">
            <h2><span>03</span>Local SEO by city</h2>
            <p>What matters locally differs by city, from sector numbers in Gurugram to block addresses in Bengaluru:</p>
            <div className="city-links">{SERVICE_CITIES.map((c) => <Link key={c.slug} href={`/services/${c.slug}`}>Local SEO in {c.name}</Link>)}</div>
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

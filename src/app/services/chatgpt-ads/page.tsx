import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, faqLd, graph, serviceLd, siteUrl, whatsappLink } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

const TITLE = "ChatGPT Ads agency in India";
const DESCRIPTION = "Foundly plans and runs ChatGPT Ads for businesses in India and worldwide, included in every plan, alongside GEO that gets you named in ChatGPT's answers.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · Foundly` },
  description: DESCRIPTION,
  alternates: { canonical: "/services/chatgpt-ads" },
  openGraph: { title: `${TITLE} · Foundly`, description: DESCRIPTION, url: "/services/chatgpt-ads", images: "/opengraph-image" },
};

const WHAT = [
  { title: "Planning", body: "We work out whether ChatGPT Ads suit your business, which customer questions and audiences to aim at, and a starting budget, before anything goes live." },
  { title: "Setup and creative", body: "We set up the campaign in OpenAI's ads tools where they are available to you, and write ad copy that matches how people ask ChatGPT for help." },
  { title: "Running and reporting", body: "We watch results, adjust spend and messaging, and report what the ads delivered next to your organic visibility in AI answers." },
];

const FAQ = [
  { q: "What are ChatGPT Ads?", a: "ChatGPT Ads are paid placements shown inside ChatGPT conversations, sold by OpenAI. They are labelled as sponsored and kept separate from ChatGPT's own answers. OpenAI decides where they are offered, in which formats and to which users." },
  { q: "Are ChatGPT Ads available in India?", a: "OpenAI has been rolling ChatGPT Ads out to more countries, including India. Availability, formats and minimum budgets are set by OpenAI and can change, so we confirm what is available for your business before planning a campaign." },
  { q: "Is the ChatGPT Ads service included in my plan?", a: "Yes. Every Foundly plan includes our ChatGPT Ads service: our team plans and runs your campaign where it is available. Scope, eligibility and any ad spend are confirmed in writing before launch. Ad spend is paid separately to OpenAI." },
  { q: "Do ChatGPT Ads replace GEO?", a: "No. Ads put you in front of people for as long as you pay. GEO works on whether ChatGPT names and cites your business in its own answers, which keeps working without ad spend. Most businesses benefit from both." },
  { q: "Can you guarantee results from ChatGPT Ads?", a: "No. Ad results depend on your offer, budget, competition and OpenAI's own systems. We agree goals and a test budget up front and report the actual results." },
];

export default function ChatGptAdsPage() {
  const url = siteUrl("/services/chatgpt-ads");
  const ld = graph(
    { ...serviceLd({ name: "ChatGPT Ads management", url }), serviceType: ["ChatGPT Ads management", "AI advertising"] },
    faqLd(FAQ),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "ChatGPT Ads", path: "/services/chatgpt-ads" }]),
  );
  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow"><Link href="/services">FOUNDLY / SERVICES</Link> / CHATGPT ADS</p>
          <h1>ChatGPT Ads, planned and run for you</h1>
          <p className="legal-intro">People now ask ChatGPT what to buy and who to hire. ChatGPT Ads let you appear in those conversations. Foundly plans and runs your campaign, included in every plan, and pairs it with GEO so you are named in ChatGPT&rsquo;s own answers too.</p>
          <p className="audit-ctas">
            <Link href="/pricing" className="landing-button guide-cta">See plans <Icon name="arrow" size={16} /></Link>
            <a href={whatsappLink("Hi Foundly, I'd like to talk about ChatGPT Ads for my business.")} className="landing-button secondary" rel="noopener">Ask on WhatsApp</a>
          </p>
        </header>
        <article className="legal-article about-article" aria-label="ChatGPT Ads service">
          <section id="what">
            <h2><span>01</span>What we do</h2>
            <div className="about-principles industry-facts">{WHAT.map((w) => <div key={w.title}><h3>{w.title}</h3><p>{w.body}</p></div>)}</div>
          </section>
          <section id="ads-and-geo">
            <h2><span>02</span>Ads and GEO work together</h2>
            <p>An ad gets you seen while it runs. Being named in ChatGPT&rsquo;s answers, which is what <Link href="/guides/what-is-geo">GEO</Link> works on, keeps bringing customers without ad spend. We work on both, so you can compare what paid and organic visibility each bring in. Read <Link href="/guides/rank-on-chatgpt">how ChatGPT chooses which businesses to mention</Link>.</p>
          </section>
          <section id="fit">
            <h2><span>03</span>Who ChatGPT Ads suit</h2>
            <ul>
              <li>Businesses whose customers research before they buy, such as clinics, coaching institutes, real estate and professional services.</li>
              <li>Brands launching in a new city or category, where few businesses are named in AI answers yet.</li>
              <li>Businesses that already have clear offers, prices and a page or WhatsApp number ready to handle enquiries.</li>
            </ul>
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

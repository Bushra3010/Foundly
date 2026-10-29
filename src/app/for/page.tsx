import type { Metadata } from "next";
import Link from "next/link";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { INDUSTRIES } from "@/lib/industries";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, graph, siteUrl } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

const DESCRIPTION = "How AI assistants recommend businesses in your industry, and how Foundly helps clinics, restaurants, salons, real estate, coaching and home services get named.";

export const metadata: Metadata = {
  title: "Industries",
  description: DESCRIPTION,
  alternates: { canonical: "/for" },
  openGraph: { title: "Foundly for your industry", description: DESCRIPTION, url: "/for", images: "/opengraph-image" },
};

export default function IndustriesPage() {
  const ld = graph(
    { "@type": "CollectionPage", "@id": siteUrl("/for"), url: siteUrl("/for"), name: "Foundly for your industry", description: DESCRIPTION, hasPart: INDUSTRIES.map((i) => ({ "@type": "WebPage", name: i.headline, url: siteUrl(`/for/${i.slug}`) })) },
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Industries", path: "/for" }]),
  );
  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow">FOUNDLY / INDUSTRIES</p>
          <h1>AI search visibility for your industry</h1>
          <p className="legal-intro">{DESCRIPTION}</p>
        </header>
        <div className="guide-list">
          {INDUSTRIES.map((i) => (
            <Link key={i.slug} href={`/for/${i.slug}`} className="guide-card">
              <h2>{i.name}</h2>
              <p>{i.headline}.</p>
            </Link>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

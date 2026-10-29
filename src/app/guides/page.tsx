import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/components/guide-page";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, graph, siteUrl } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

const DESCRIPTION = "Practical guides to GEO and AEO for local businesses: how to get recommended by ChatGPT, Gemini, Perplexity and Claude.";

export const metadata: Metadata = {
  title: "Guides",
  description: DESCRIPTION,
  alternates: { canonical: "/guides" },
  openGraph: { title: "Foundly guides", description: DESCRIPTION, url: "/guides", images: "/opengraph-image" },
};

export default function GuidesPage() {
  const ld = graph(
    {
      "@type": "CollectionPage",
      "@id": siteUrl("/guides"),
      url: siteUrl("/guides"),
      name: "Foundly guides",
      description: DESCRIPTION,
      hasPart: GUIDES.map(g => ({ "@type": "Article", headline: g.title, url: siteUrl(`/guides/${g.slug}`) })),
    },
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }]),
  );
  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow">FOUNDLY / GUIDES</p>
          <h1>Guides to AI search visibility</h1>
          <p className="legal-intro">{DESCRIPTION}</p>
        </header>
        <div className="guide-list">
          {GUIDES.map(g => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card">
              <h2>{g.title}</h2>
              <p>{g.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

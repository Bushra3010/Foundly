import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "./landing-chrome";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, faqLd, graph, siteUrl } from "@/lib/site-schema";
import { GUIDES, type GuideMeta } from "@/lib/guides";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

export type GuideSection = { id: string; title: string; content: ReactNode };
export { GUIDES, guideMeta } from "@/lib/guides";

/** Long-form guide with a table of contents, a plain-text FAQ and matching structured data. */
export function GuidePage({ meta, intro, sections, faq }: { meta: GuideMeta; intro: string; sections: GuideSection[]; faq: { q: string; a: string }[] }) {
  const url = siteUrl(`/guides/${meta.slug}`);
  const ld = graph(
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: meta.title,
      description: meta.description,
      url,
      mainEntityOfPage: url,
      datePublished: meta.published,
      dateModified: meta.updated,
      inLanguage: "en-IN",
      image: siteUrl("/opengraph-image"),
      author: { "@id": siteUrl("/#organization") },
      publisher: { "@type": "Organization", "@id": siteUrl("/#organization"), name: "Foundly", logo: siteUrl("/icon-512.png") },
    },
    faqLd(faq),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: meta.title, path: `/guides/${meta.slug}` }]),
  );
  const all = [...sections, { id: "faq", title: "Frequently asked questions", content: null }];

  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow"><Link href="/guides">FOUNDLY / GUIDES</Link></p>
          <h1>{meta.title}</h1>
          <p className="legal-intro">{intro}</p>
          <p className="legal-date">By the Foundly team · Updated <time dateTime={meta.updated}>{new Date(meta.updated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time></p>
        </header>
        <div className="legal-layout">
          <aside className="legal-sidebar">
            <nav aria-label="On this page">
              <h2>On this page</h2>
              <ol>{all.map(s => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ol>
            </nav>
            <nav className="legal-related" aria-label="More guides">{GUIDES.filter(g => g.slug !== meta.slug).map(g => <Link key={g.slug} href={`/guides/${g.slug}`}>{g.title}</Link>)}<Link href="/pricing">View pricing</Link></nav>
          </aside>
          <article className="legal-article" aria-label={meta.title}>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
                <h2 id={`${section.id}-title`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</h2>
                {section.content}
              </section>
            ))}
            <section id="faq" aria-labelledby="faq-title">
              <h2 id="faq-title"><span>{String(sections.length + 1).padStart(2, "0")}</span>Frequently asked questions</h2>
              {faq.map(item => <div key={item.q} className="guide-faq"><h3>{item.q}</h3><p>{item.a}</p></div>)}
            </section>
            <p><Link href="/signup" className="landing-button guide-cta">See what AI says about your business <Icon name="arrow" size={16} /></Link></p>
          </article>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { WorkCard } from "@/components/work-card";
import { buttonClass } from "@/components/ui";
import { getDb } from "@/db";
import { listPublishedProjects } from "@/server/portfolio";
import { FEATURED_SLUGS, NEEDS } from "@/lib/work-copy";
import { breadcrumbLd, graph, siteUrl, whatsappLink } from "@/lib/site-schema";
import { jsonLdScript } from "@/lib/profile";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/automation.css";
import "@/app/work.css";

export const dynamic = "force-dynamic";

type WorkSearch = Promise<{ need?: string; category?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: WorkSearch }): Promise<Metadata> {
  const { need, category } = await searchParams;
  return {
    title: "Software Portfolio: ERP, CRM & App Live Demos",
    description: "75+ real ERP, CRM, mobile app, e-commerce, website and AI projects built by Foundly for businesses in India. Open any project and try its live demo.",
    openGraph: { title: "Software we've built for real businesses · Foundly", description: "75+ real projects with live demos you can try.", url: "/work", images: "/opengraph-image" },
    alternates: { canonical: "/work" },
    ...((need || category) && { robots: { index: false, follow: true } }),
  };
}

export default async function WorkPage({ searchParams }: { searchParams: WorkSearch }) {
  const { need } = await searchParams;
  const all = await listPublishedProjects(await getDb());
  const used = NEEDS.filter((n) => all.some((p) => p.need === n.id));
  const active = used.find((n) => n.id === need);
  const featured = FEATURED_SLUGS.map((s) => all.find((p) => p.slug === s)).filter((p) => p !== undefined);
  const rest = active ? all.filter((p) => p.need === active.id) : all.filter((p) => !featured.includes(p));
  const live = all.filter((p) => p.demoStatus === "live").length;
  const industries = new Set(all.map((p) => p.industry).filter(Boolean)).size;

  const ld = graph(
    {
      "@type": "CollectionPage",
      "@id": `${siteUrl("/work")}#page`,
      name: "Software we've built for real businesses",
      url: siteUrl("/work"),
      about: ["ERP software", "CRM software", "Mobile apps", "E-commerce", "Websites", "AI automation"],
      publisher: { "@id": siteUrl("/#organization") },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: all.length,
        itemListElement: all.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: siteUrl(`/work/${p.slug}`) })),
      },
    },
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Our work", path: "/work" }]),
  );

  return (
    <div className="foundly-landing">
      {!active && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />}
      <LandingHeader announcement={false} />
      <main id="main" className="landing-main public-software-guide automation-page work-page">
        <section className="wk-hero">
          <p className="au-eyebrow"><Icon name="workspaces" size={14} /> Our work</p>
          <h1>Software we&apos;ve built for real businesses</h1>
          <p className="au-lede">From online stores and CRMs to AI WhatsApp assistants and mobile apps. Open any project to see what it does — and where there&apos;s a live demo, try it yourself with sample data.</p>
          <dl className="wk-stats">
            <div><dt>Projects delivered</dt><dd>{all.length}</dd></div>
            <div><dt>Industries</dt><dd>{industries}</dd></div>
            <div><dt>Live demos you can try</dt><dd>{live}</dd></div>
          </dl>
          <ol className="wk-how">
            <li><span>1</span>Pick what you need below</li>
            <li><span>2</span>Open a project to see what it does</li>
            <li><span>3</span>Press <b>Try live demo</b> and click around. It&apos;s sample data, nothing breaks</li>
          </ol>
        </section>

        {all.length === 0 ? (
          <section className="wk-empty">
            <h2>Our portfolio is being prepared</h2>
            <p>Projects will appear here shortly. In the meantime, tell us what you&apos;d like to build.</p>
            <a className={buttonClass()} href={whatsappLink("Hi Foundly, I'd like to see examples of your work.")}>Ask for examples <Icon name="arrow" size={16} /></a>
          </section>
        ) : (
          <>
            <nav aria-label="What do you need?" className="wk-filters">
              <span className="wk-filters-label">What do you need?</span>
              <Link href="/work" scroll={false} aria-current={!active ? "page" : undefined}>Everything <span>{all.length}</span></Link>
              {used.map((n) => (
                <Link key={n.id} href={`/work?need=${n.id}`} scroll={false} aria-current={active?.id === n.id ? "page" : undefined}>
                  {n.label} <span>{all.filter((p) => p.need === n.id).length}</span>
                </Link>
              ))}
            </nav>
            {!active && featured.length > 0 && (
              <section aria-labelledby="featured-title" className="wk-featured">
                <h2 id="featured-title">Start here: our best work</h2>
                <ul className="wk-grid">
                  {featured.map((p, i) => <li key={p.slug} style={{ animationDelay: `${i * 60}ms` }}><WorkCard project={p} /></li>)}
                </ul>
              </section>
            )}
            {!active && <h2 className="wk-all-title">All projects</h2>}
            <ul className="wk-grid">
              {rest.map((p, i) => <li key={p.slug} style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}><WorkCard project={p} /></li>)}
            </ul>
          </>
        )}

        <section className="au-tools wk-cta">
          <h2>Want something like this for your business?</h2>
          <p>Tell us how your team works today. We&apos;ll suggest what to build first and show you a working demo.</p>
          <a className={buttonClass()} href={whatsappLink("Hi Foundly, I saw your portfolio and I'd like to discuss a project.")}>Discuss your project <Icon name="arrow" size={16} /></a>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

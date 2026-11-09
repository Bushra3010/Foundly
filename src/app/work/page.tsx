import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { WorkCard } from "@/components/work-card";
import { buttonClass } from "@/components/ui";
import { getDb } from "@/db";
import { listPublishedProjects, PORTFOLIO_CATEGORIES } from "@/server/portfolio";
import { whatsappLink } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/automation.css";
import "@/app/work.css";

export const dynamic = "force-dynamic";

const slug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string }> }): Promise<Metadata> {
  const { category } = await searchParams;
  return {
    title: "Our work: software we've built",
    description: "ERP, CRM, e-commerce, mobile apps, AI assistants and SaaS products Foundly has built for businesses, with live demos you can try.",
    alternates: { canonical: "/work" },
    ...(category && { robots: { index: false, follow: true } }),
  };
}

export default async function WorkPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const all = await listPublishedProjects(await getDb());
  const used = PORTFOLIO_CATEGORIES.filter((c) => all.some((p) => p.category === c));
  const active = used.find((c) => slug(c) === category);
  const shown = active ? all.filter((p) => p.category === active) : all;
  const live = all.filter((p) => p.demoStatus === "live").length;

  return (
    <div className="foundly-landing">
      <LandingHeader />
      <main id="main" className="landing-main public-software-guide automation-page work-page">
        <section className="wk-hero">
          <p className="au-eyebrow"><Icon name="workspaces" size={14} /> Our work</p>
          <h1>Software we&apos;ve built for real businesses</h1>
          <p className="au-lede">From online stores and CRMs to AI WhatsApp assistants and mobile apps. Open any project to see what it does — and where there&apos;s a live demo, try it yourself with sample data.</p>
          <dl className="wk-stats">
            <div><dt>Projects</dt><dd>{all.length}</dd></div>
            <div><dt>Categories</dt><dd>{used.length}</dd></div>
            <div><dt>Live demos</dt><dd>{live}</dd></div>
          </dl>
        </section>

        {all.length === 0 ? (
          <section className="wk-empty">
            <h2>Our portfolio is being prepared</h2>
            <p>Projects will appear here shortly. In the meantime, tell us what you&apos;d like to build.</p>
            <a className={buttonClass()} href={whatsappLink("Hi Foundly, I'd like to see examples of your work.")}>Ask for examples <Icon name="arrow" size={16} /></a>
          </section>
        ) : (
          <>
            <nav aria-label="Filter by category" className="wk-filters">
              <Link href="/work" scroll={false} aria-current={!active ? "page" : undefined}>All <span>{all.length}</span></Link>
              {used.map((c) => (
                <Link key={c} href={`/work?category=${slug(c)}`} scroll={false} aria-current={active === c ? "page" : undefined}>
                  {c} <span>{all.filter((p) => p.category === c).length}</span>
                </Link>
              ))}
            </nav>
            <ul className="wk-grid">
              {shown.map((p, i) => <li key={p.slug} style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}><WorkCard project={p} /></li>)}
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

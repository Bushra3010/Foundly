import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { buttonClass } from "@/components/ui";
import { categoryIcon, WorkCover } from "@/components/work-card";
import { getDb } from "@/db";
import { DEMO_STATUS_TEXT, getPublishedProject } from "@/server/portfolio";
import { whatsappLink } from "@/lib/site-schema";
import { needLabel } from "@/lib/work-copy";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, graph, siteUrl } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/automation.css";
import "@/app/work.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPublishedProject(await getDb(), (await params).slug);
  if (!p) return { title: "Project not found", robots: { index: false } };
  const title = `${p.name}: case study & live demo`;
  return {
    title,
    description: p.tagline.length > 155 ? `${p.tagline.slice(0, 152)}…` : p.tagline,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title, description: p.tagline, url: `/work/${p.slug}`, images: p.media[0]?.url ?? "/opengraph-image" },
  };
}

export default async function WorkProjectPage({ params }: Props) {
  const p = await getPublishedProject(await getDb(), (await params).slug);
  if (!p) notFound();
  const steps = p.description?.replace(/^Main workflow:\s*/i, "").split("→").map((s) => s.trim()).filter(Boolean) ?? [];
  const isFlow = !!p.description && /^Main workflow:/i.test(p.description) && steps.length > 1;

  const ld = graph(
    {
      "@type": "CreativeWork",
      "@id": `${siteUrl(`/work/${p.slug}`)}#work`,
      name: p.name,
      headline: `${p.name}: ${needLabel(p.need)}`,
      abstract: p.tagline,
      description: p.summary,
      url: siteUrl(`/work/${p.slug}`),
      genre: needLabel(p.need),
      about: p.industry ?? undefined,
      audience: { "@type": "BusinessAudience", name: p.client },
      creator: { "@id": siteUrl("/#organization") },
      image: p.media.slice(0, 3).map((m) => siteUrl(m.url)),
      ...(p.features.length > 0 && { keywords: p.features.map((f) => f.split(": ")[0]).join(", ") }),
    },
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Our work", path: "/work" }, { name: p.name, path: `/work/${p.slug}` }]),
  );

  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <LandingHeader announcement={false} />
      <main id="main" className="landing-main public-software-guide automation-page work-page">
        <Link href="/work" className="wk-back"><Icon name="chevron" size={14} className="wk-flip" /> All projects</Link>
        <section className="wk-detail-hero">
          <div>
            <p className="au-eyebrow"><Icon name={categoryIcon(p.category)} size={14} /> {needLabel(p.need)}{p.industry ? ` · ${p.industry}` : ""}</p>
            <h1>{p.name}</h1>
            <p className="wk-client">Built for {p.client}</p>
            <p className="au-lede">{p.tagline}</p>
            <div className="au-hero-actions">
              {p.demoUrl ? (
                <a className={buttonClass()} href={p.demoUrl} target="_blank" rel="noopener">Try live demo <Icon name="arrow" size={16} /></a>
              ) : (
                <span className={`wk-status wk-status-${p.demoStatus} static`}>{DEMO_STATUS_TEXT[p.demoStatus]}</span>
              )}
              <a className={buttonClass("secondary")} href={whatsappLink(`Hi Foundly, I saw "${p.name}" in your portfolio and I'd like something similar.`)}>Build something similar</a>
            </div>
          </div>
          <div className="wk-detail-cover"><WorkCover project={p} large /></div>
        </section>

        {p.demoUrl && (
          <section className="wk-demo" aria-labelledby="demo-title">
            <div className="wk-demo-head">
              <div>
                <h2 id="demo-title">Try the live demo</h2>
                <p>A working copy of the software with sample data. Click anything you like: nothing you do reaches the client&apos;s real system.</p>
              </div>
              <a className={buttonClass("secondary")} href={p.demoUrl} target="_blank" rel="noopener">Open full screen <Icon name="arrow" size={16} /></a>
            </div>
            <ol className="wk-try-steps">
              <li><span>1</span><p>Press <b>Open full screen</b>{p.embeddable ? <span className="wk-desktop-only"> or use the window below</span> : null}.</p></li>
              <li><span>2</span><p>{p.demoLogins.length > 0 ? <>Log in as <b>{p.demoLogins[0].role}</b> with the details shown here.</> : <>Browse the pages as a customer would.</>}</p></li>
              <li><span>3</span><p>{p.demoLogins.length > 1 ? <>Then log in as <b>{p.demoLogins[1].role}</b> to see the other side of the same work.</> : <>Fill a form or add an item, and see it appear straight away.</>}</p></li>
            </ol>
            <div className={`wk-demo-body${p.embeddable ? "" : " no-embed"}`}>
              {p.embeddable && (
                <div className="wk-browser">
                  <div className="wk-browser-bar"><span className="sd-dots" aria-hidden="true"><i /><i /><i /></span><span>{p.demoUrl.replace(/^https?:\/\//, "")}</span></div>
                  <iframe src={p.demoUrl} title={`${p.name} live demo`} loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads" referrerPolicy="no-referrer" />
                </div>
              )}
              {p.demoLogins.length > 0 && (
                <aside className="wk-logins">
                  <h3><Icon name="profile" size={15} /> Demo logins</h3>
                  <ul>
                    {p.demoLogins.map((l) => (
                      <li key={`${l.role}-${l.login}`}><strong>{l.role}</strong><code>{l.login}</code>{l.secret && <code>{l.secret}</code>}</li>
                    ))}
                  </ul>
                  <p>These accounts exist only in the demo copy.</p>
                </aside>
              )}
            </div>
          </section>
        )}

        {p.media.length > 0 && (
          <section className="wk-section" aria-labelledby="shots-title">
            <h2 id="shots-title">Screenshots</h2>
            <ul className="wk-shots">
              {p.media.map((m, i) => (
                <li key={m.id}>
                  <a href={m.url} target="_blank" rel="noopener">
                    {/* eslint-disable-next-line @next/next/no-img-element -- served from our own database route */}
                    <img src={m.url} alt={m.caption ?? `${p.name} screenshot ${i + 1}`} loading="lazy" />
                  </a>
                  {m.caption && <p>{m.caption}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="wk-section" aria-labelledby="what-title">
          <h2 id="what-title">What it does</h2>
          <p className="text-sm leading-relaxed">{p.summary}</p>
        </section>

        <div className="wk-columns">
          {p.features.length > 0 && (
            <section className="wk-section" aria-labelledby="features-title">
              <h2 id="features-title">Key features</h2>
              <ul className="wk-features">
                {p.features.map((f) => {
                  const [head, ...rest] = f.split(": ");
                  return <li key={f}><Icon name="check" size={14} /><span>{rest.length ? <><strong>{head}</strong> {rest.join(": ")}</> : f}</span></li>;
                })}
              </ul>
            </section>
          )}
          <div className="space-y-4">
            {p.description && (
              <section className="wk-section" aria-labelledby="flow-title">
                <h2 id="flow-title">{isFlow ? "How it works" : "About the project"}</h2>
                {isFlow ? (
                  <ol className="wk-flow">{steps.map((s, i) => <li key={s}><span>{i + 1}</span>{s}</li>)}</ol>
                ) : (
                  <p className="whitespace-pre-line text-sm leading-relaxed">{p.description}</p>
                )}
              </section>
            )}
          </div>
        </div>

        <section className="au-tools wk-cta">
          <h2>Need software like this?</h2>
          <p>We build custom ERP, CRM, e-commerce, mobile apps and AI automation around the way your team works.</p>
          <a className={buttonClass()} href={whatsappLink(`Hi Foundly, I'd like to discuss a project like "${p.name}".`)}>Discuss your project <Icon name="arrow" size={16} /></a>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

import Link from "next/link";
import { Icon } from "@/components/icon";
import { DEMO_STATUS_TEXT, type PublicProject } from "@/server/portfolio";

const CATEGORY_ICON: Record<string, string> = {
  Websites: "website",
  "ERP / CRM": "business",
  "Mobile apps": "profile",
  SaaS: "workspaces",
  "E-commerce": "presence",
  "AI applications": "spark",
  "Management systems": "reports",
  "Custom software": "settings",
};

export function categoryIcon(category: string) {
  return CATEGORY_ICON[category] ?? "workspaces";
}

/** Thumbnail: the first screenshot, or a branded cover when there are none yet. */
export function WorkCover({ project, large = false }: { project: PublicProject; large?: boolean }) {
  const cover = project.media[0];
  if (cover) {
    // eslint-disable-next-line @next/next/no-img-element -- served from our own database route
    return <img src={cover.url} alt={cover.caption ?? `${project.name} screenshot`} className="wk-cover" loading="lazy" />;
  }
  return (
    <div className={`wk-cover wk-cover-art${large ? " large" : ""}`} aria-hidden="true">
      <span className="wk-cover-icon"><Icon name={categoryIcon(project.category)} size={large ? 34 : 24} /></span>
      <strong>{project.name}</strong>
      <i /><i /><i />
    </div>
  );
}

export function WorkCard({ project: p }: { project: PublicProject }) {
  return (
    <article className="wk-card">
      <Link href={`/work/${p.slug}`} className="wk-card-media" tabIndex={-1} aria-hidden="true">
        <WorkCover project={p} />
        <span className={`wk-status wk-status-${p.demoStatus}`}>{p.demoStatus === "live" && <i />}{DEMO_STATUS_TEXT[p.demoStatus]}</span>
      </Link>
      <div className="wk-card-body">
        <p className="wk-card-meta"><Icon name={categoryIcon(p.category)} size={13} /> {p.category}{p.industry ? ` · ${p.industry}` : ""}</p>
        <h2><Link href={`/work/${p.slug}`}>{p.name}</Link></h2>
        <p className="wk-client">For {p.client}</p>
        <p className="wk-summary">{p.summary}</p>
        {p.techStack.length > 0 && <ul className="wk-tech">{p.techStack.slice(0, 4).map((t) => <li key={t}>{t}</li>)}</ul>}
        <div className="wk-actions">
          <Link href={`/work/${p.slug}`} className="wk-link">View details <Icon name="arrow" size={14} /></Link>
          {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noopener" className="wk-try">Try live demo <Icon name="arrow" size={14} /></a>}
        </div>
      </div>
    </article>
  );
}

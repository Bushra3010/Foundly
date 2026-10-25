import Link from "next/link";
import { Icon } from "@/components/icon";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { citationsFor } from "@/server/insights";
import { Mini } from "../overview-parts";
import "../overview.css";

export const metadata = { title: "Sources" };

const PERIODS = [7, 30, 90];

export default async function SourcesPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = PERIODS.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const c = await citationsFor(await getDb(), await requireCtx(), days);

  return (
    <div className="dash ov">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <Link href="/app" className="dash-eyebrow" style={{ textDecoration: "none" }}>← Performance</Link>
          <h1>Sources AI reads</h1>
          <p>The websites AI assistants cite when they answer your keywords · last {days} days</p>
        </div>
        <div className="dash-hero-actions">
          <nav aria-label="Period" className="ov-row">
            {PERIODS.map((d) => (
              <Link key={d} href={`/app/sources?days=${d}`} className="dash-btn ghost" aria-current={d === days ? "page" : undefined} style={d === days ? { borderColor: "var(--d-ink)" } : undefined}>
                {d} days
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {c.domains.length === 0 ? (
        <section className="dash-panel ov-empty">
          <Icon name="globe" size={34} />
          <h2>No sources yet</h2>
          <p>When AI assistants cite websites in answers about your keywords, they appear here, ranked by how often they&apos;re used.</p>
        </section>
      ) : (
        <>
          <p className="ov-note">
            Getting listed or mentioned on the top sites below is one of the fastest ways to be recommended: AI repeats what these pages say.{" "}
            {c.withSources} of {c.answers} answers cited at least one source.
          </p>
          <section className="dash-panel ov-panel" aria-labelledby="src-domains">
            <h2 id="src-domains">Domains</h2>
            <div className="ov-table-wrap">
              <table className="ov-table">
                <thead>
                  <tr>
                    <th scope="col">Website</th>
                    <th scope="col">Cited in</th>
                    <th scope="col">Named you too</th>
                    <th scope="col">For keywords</th>
                  </tr>
                </thead>
                <tbody>
                  {c.domains.slice(0, 25).map((d) => (
                    <tr key={d.host}>
                      <td>
                        <strong className={d.own ? "own" : undefined}>{d.host}</strong>
                        {d.own && <span className="ov-q">Your website</span>}
                      </td>
                      <td><Mini rate={d.share} />{d.answers} answer{d.answers === 1 ? "" : "s"}</td>
                      <td>{d.namedYou ? `${d.namedYou} of ${d.answers}` : <span className="ov-muted">Never</span>}</td>
                      <td className="ov-muted">{d.keywords.slice(0, 3).join(", ")}{d.keywords.length > 3 ? ` +${d.keywords.length - 3}` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="dash-panel ov-panel" aria-labelledby="src-pages">
            <h2 id="src-pages">Pages</h2>
            <p className="ov-sub">The exact pages cited. Ask to be added to the lists and directories that keep coming up.</p>
            <ul className="ov-list">
              {c.urls.slice(0, 20).map((u) => (
                <li key={u.url}>
                  <a href={u.url} target="_blank" rel="noopener noreferrer nofollow" className="ov-link" title={u.url}>
                    {u.title || u.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 80)}
                  </a>
                  <span className="ov-muted" style={{ whiteSpace: "nowrap" }}>{u.answers}×</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { urlHasPrefix } from "@/server/monitoring/extract";
import { keywordAnswers } from "@/server/performance";
import { HighlightedAnswer } from "../../perf-parts";
import "../../perf.css";

export const metadata = { title: "AI answers" };

const STATUS: Record<string, string> = {
  refusal: "The assistant declined to answer.",
  partial: "The answer came back incomplete.",
  timeout: "The assistant took too long to answer.",
  unavailable: "The assistant was unavailable.",
  error: "We couldn't get an answer this time.",
};

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function KeywordAnswersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const ctx = await requireCtx();
  const data = await keywordAnswers(await getDb(), ctx, id);
  if (!data) notFound();
  const self = data.brands.find((b) => b.key === "self");
  const selfTerms = self ? [self.name, ...self.aliases] : [];
  const rivalTerms = data.brands.filter((b) => b.key !== "self").flatMap((b) => [b.name, ...b.aliases]);
  const ownDomains = self?.domains ?? [];
  const named = data.answers.filter((a) => a.self && a.named.some((n) => n.key === "self")).length;
  const valid = data.answers.filter((a) => a.ok).length;

  return (
    <div className="dash pf">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <Link href="/app/keywords" className="dash-eyebrow" style={{ textDecoration: "none" }}>← Keywords</Link>
          <h1>{data.question.keyword ?? data.question.text}</h1>
          <p>Asked as: “{data.question.text}”</p>
        </div>
        <div className="dash-hero-actions">
          <span className="pf-engine">
            {valid ? <>Recommended by <strong>{named} of {valid}</strong> assistants</> : "No answers yet"}
          </span>
        </div>
      </header>

      {data.answers.length === 0 ? (
        <section className="dash-panel pf-empty">
          <Icon name="visibility" size={34} />
          <h2>Not checked yet</h2>
          <p>This keyword is included in the next check. Answers from each AI assistant will appear here.</p>
        </section>
      ) : (
        <div className="an-grid">
          {data.answers.map((a) => {
            const me = a.named.find((n) => n.key === "self");
            return (
              <section key={a.id} className="an-card" aria-labelledby={`an-${a.id}`}>
                <div className="pf-row between">
                  <h2 id={`an-${a.id}`} style={{ margin: 0, fontSize: 17 }}>{a.label}</h2>
                  {!a.ok ? (
                    <span className="pf-badge pending">No answer</span>
                  ) : me ? (
                    <span className="pf-badge won">Recommends you{me.position ? ` · #${me.position}` : ""}</span>
                  ) : (
                    <span className="pf-badge lost">Doesn&apos;t mention you</span>
                  )}
                </div>
                <p className="pf-sub">
                  {a.capturedAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  {a.named.filter((n) => n.key !== "self").length > 0 && <> · Also named: {a.named.filter((n) => n.key !== "self").map((n) => n.name).join(", ")}</>}
                </p>
                {a.ok && a.text ? (
                  <HighlightedAnswer text={a.text} self={selfTerms} rivals={rivalTerms} />
                ) : (
                  <p className="pf-note" style={{ marginTop: 12 }}>{STATUS[a.status] ?? STATUS.error}</p>
                )}
                {a.citations.length > 0 && (
                  <>
                    <p className="pf-sub" style={{ marginTop: 12, fontWeight: 650 }}>Sources it read</p>
                    <ol className="an-sources">
                      {a.citations.slice(0, 8).map((c) => {
                        const host = hostOf(c.url);
                        const own = ownDomains.some((d) => host === d || host.endsWith(`.${d}`)) || urlHasPrefix(c.url, self?.urlPrefixes);
                        return (
                          <li key={c.url}>
                            <a href={c.url} target="_blank" rel="noopener noreferrer nofollow" className={own ? "own" : undefined}>
                              {c.title || host}
                            </a>
                            {own && " (your site)"}
                          </li>
                        );
                      })}
                    </ol>
                  </>
                )}
              </section>
            );
          })}
        </div>
      )}
      {data.checks > 1 && <p className="pf-sub">Checked {data.checks} times. Showing the latest answers.</p>}
    </div>
  );
}

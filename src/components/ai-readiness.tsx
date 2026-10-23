import Link from "next/link";
import type { geoReadiness } from "@/lib/geo";
import { ConfirmFresh } from "./confirm-fresh";
import { Icon } from "./icon";

type Readiness = ReturnType<typeof geoReadiness>;

/** "Get found by AI" panel: score, what's done, and the next steps with links. */
export function AiReadiness({ readiness, limit, fresh }: { readiness: Readiness; limit?: number; fresh?: boolean }) {
  const todo = readiness.items.filter((i) => !i.done);
  const done = readiness.items.filter((i) => i.done);
  const shownTodo = limit ? todo.slice(0, limit) : todo;
  const tone = readiness.score >= 80 ? "good" : readiness.score >= 50 ? "mid" : "low";
  return (
    <section className="dash-panel geo-panel" aria-labelledby="geo-title">
      <div className="geo-head">
        <div>
          <span className="geo-eyebrow"><Icon name="spark" size={14} /> Get found by AI</span>
          <h2 id="geo-title">AI readiness</h2>
          <p>
            How easy it is for ChatGPT, Gemini, Perplexity and Claude to find, understand and recommend your business.
            {readiness.score < 100 ? " Each step below raises your chances." : " Everything is in place. Keep your details current."}
          </p>
        </div>
        <div className={`geo-score ${tone}`} role="img" aria-label={`AI readiness ${readiness.score} out of 100`}>
          <strong>{readiness.score}</strong>
          <span>/100</span>
        </div>
      </div>
      <div className="geo-bar" aria-hidden="true"><span style={{ width: `${readiness.score}%` }} /></div>
      {shownTodo.length > 0 && (
        <ul className="geo-list">
          {shownTodo.map((i) => (
            <li key={i.key}>
              <Link href={i.href}>
                <span className="geo-dot" aria-hidden="true" />
                <span className="geo-text">
                  <strong>{i.label}</strong>
                  <span>{i.why}</span>
                </span>
                <Icon name="arrow" size={16} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {done.length > 0 && (
        <p className="geo-done">
          <Icon name="check" size={14} /> Done: {done.map((i) => i.label.toLowerCase()).join(" · ")}
        </p>
      )}
      {fresh && <ConfirmFresh daysAgo={readiness.confirmedDaysAgo} />}
      <p className="geo-note">
        Foundly also does this for you automatically: every page of your website and profile carries structured data, each service has its own page, AI crawlers are allowed, and search engines are told the moment you publish.
      </p>
    </section>
  );
}

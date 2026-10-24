import Link from "next/link";
import type { geoReadiness } from "@/lib/geo";
import { ConfirmFresh } from "./confirm-fresh";
import { Icon } from "./icon";

type Readiness = ReturnType<typeof geoReadiness> & { websiteRunning?: boolean };

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
      <p className="geo-parts">
        Business details <strong>{readiness.detailsScore}/50</strong> · Website <strong>{readiness.websiteRunning ? "checking now…" : readiness.websiteChecked ? `${readiness.websiteScore}/50` : "not checked yet"}</strong>
        {readiness.websiteCheck && !readiness.websiteRunning && (
          <> ({readiness.websiteCheck.passed} of {readiness.websiteCheck.total} website checks pass, {Math.round((readiness.websiteCheck.passed / readiness.websiteCheck.total) * 100)}%)</>
        )}
      </p>
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
        Half of the score is your business details and listings; the other half is what our latest check of your connected website found. Foundly also keeps your profile readable by AI: it carries structured data, AI crawlers are allowed, and search engines are told whenever your details change.
      </p>
    </section>
  );
}

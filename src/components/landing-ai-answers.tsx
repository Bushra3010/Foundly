"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./icon";

// Illustrative mockups of how a business can appear in AI answers.
// Generic interfaces, no third-party logos; every answer is a sample.
const BIZ = "The Sunday Studio";
const QUERY = "Best interior stylist in Pune for a 2BHK makeover?";

type Item = { name: string; desc: string; yours?: boolean; cite?: number };
type Provider = {
  id: string;
  name: string;
  layout: "chat" | "overview" | "engine";
  accent: string;
  intro: string;
  items: Item[];
  outro: string;
  sources: { label: string; yours?: boolean }[];
  result: { mentioned: boolean; position: string; cited: boolean; note: string };
};

const providers: Provider[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    layout: "chat",
    accent: "#10a37f",
    intro: "Here are a few well-regarded options in Pune for a 2BHK makeover:",
    items: [
      { name: BIZ, desc: "Baner. Home styling, space planning and colour consultation, with warm and practical interiors.", yours: true, cite: 1 },
      { name: "A boutique studio in Koregaon Park", desc: "Premium full-home design projects." },
      { name: "A design firm in Aundh", desc: "Good for modular kitchens and storage." },
    ],
    outro: "For a refresh rather than a renovation, start with The Sunday Studio’s styling packages.",
    sources: [{ label: "sundaystudio.example", yours: true }, { label: "Business profile on Foundly", yours: true }],
    result: { mentioned: true, position: "1st of 3", cited: true, note: "Your website is cited as a source" },
  },
  {
    id: "gemini",
    name: "Gemini",
    layout: "overview",
    accent: "#5b7cf6",
    intro: "For a 2BHK makeover in Pune, The Sunday Studio in Baner is a strong choice for styling and space planning. Other options include studios in Koregaon Park and Aundh.",
    items: [
      { name: "Services", desc: "Home styling, space planning, colour consultation", yours: true, cite: 1 },
      { name: "Areas served", desc: "Baner, Kothrud and across Pune", cite: 2 },
      { name: "How to enquire", desc: "Through the enquiry form on their website" },
    ],
    outro: "",
    sources: [{ label: "sundaystudio.example", yours: true }, { label: "Business profile on Foundly", yours: true }, { label: "Local listings" }],
    result: { mentioned: true, position: "1st of 3", cited: true, note: "Facts match your confirmed profile" },
  },
  {
    id: "perplexity",
    name: "Perplexity",
    layout: "engine",
    accent: "#1f8a9a",
    intro: "The Sunday Studio is an interior styling studio based in Baner, Pune, offering space planning and colour consultation [1]. It serves Baner, Kothrud and nearby areas [2].",
    items: [
      { name: "Best for", desc: "Styling refreshes and small-home makeovers", yours: true, cite: 1 },
      { name: "Also consider", desc: "Studios in Koregaon Park for full renovations" },
    ],
    outro: "",
    sources: [{ label: "sundaystudio.example", yours: true }, { label: "Business profile on Foundly", yours: true }, { label: "Local listings" }],
    result: { mentioned: true, position: "1st of 2", cited: true, note: "2 of 3 sources are yours" },
  },
  {
    id: "claude",
    name: "Claude",
    layout: "chat",
    accent: "#c96442",
    intro: "Based on a web search, a few studios stand out for a 2BHK makeover in Pune:",
    items: [
      { name: "A boutique studio in Koregaon Park", desc: "Full-home design with a premium focus." },
      { name: BIZ, desc: "Baner. Styling and space planning for homes that need a lighter touch.", yours: true },
      { name: "A design firm in Aundh", desc: "Practical storage and kitchens." },
    ],
    outro: "I’d suggest comparing portfolios before you decide.",
    sources: [{ label: "Local listings" }, { label: "A home décor blog" }],
    result: { mentioned: true, position: "2nd of 3", cited: false, note: "Next step: add structured data so your site can be cited" },
  },
];

function useStream(total: number, key: string, enabled: boolean) {
  const [state, setState] = useState({ key: "", n: 0 });
  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduce ? total : 3;
    const id = window.setInterval(() => {
      setState(s => {
        const n = s.key === key ? s.n : 0;
        return n >= total ? s : { key, n: Math.min(total, n + step) };
      });
    }, 16);
    return () => window.clearInterval(id);
  }, [total, key, enabled]);
  return state.key === key ? Math.min(state.n, total) : 0;
}

function Bit({ text, budget }: { text: string; budget: number }) {
  if (budget <= 0) return null;
  return <>{text.slice(0, budget)}</>;
}

// Renders the intro with the business name highlighted once it has streamed in.
function Highlighted({ text, budget }: { text: string; budget: number }) {
  const shown = text.slice(0, Math.max(0, budget));
  const parts = shown.split(BIZ);
  return <>{parts.map((p, i) => <Fragment key={i}>{p}{i < parts.length - 1 && <mark>{BIZ}</mark>}</Fragment>)}</>;
}

export function LandingAiAnswers() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [manual, setManual] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const p = providers[active];

  const segments = useMemo(() => [p.intro, ...p.items.flatMap(i => [i.name, i.desc]), p.outro], [p]);
  const total = segments.reduce((a, s) => a + s.length, 0);
  const n = useStream(total, p.id, visible || manual);
  const done = n >= total;

  // Budget per segment, in order.
  let left = n;
  const budgets = segments.map(s => { const b = Math.max(0, Math.min(s.length, left)); left -= s.length; return b; });
  const [introB, ...rest] = budgets;
  const outroB = rest[rest.length - 1];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(e => setVisible(Boolean(e[0]?.isIntersecting)), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!done || manual || !visible) return;
    const t = window.setTimeout(() => setActive(a => (a + 1) % providers.length), 3800);
    return () => window.clearTimeout(t);
  }, [done, manual, visible]);

  const pick = (i: number) => { setManual(true); setActive(i); };

  const list = (
    <ol className={`ai-list ${p.layout}`}>
      {p.items.map((it, i) => {
        const nb = rest[i * 2], db = rest[i * 2 + 1];
        if (nb <= 0) return null;
        return (
          <li key={it.name} className={it.yours ? "yours" : ""}>
            <strong>{it.name === BIZ ? <mark><Bit text={it.name} budget={nb} /></mark> : <Bit text={it.name} budget={nb} />}</strong>
            {db > 0 && <span> <Bit text={it.desc} budget={db} />{it.cite && db >= it.desc.length && <sup className="ai-cite">{it.cite}</sup>}</span>}
          </li>
        );
      })}
    </ol>
  );

  const sources = (
    <div className={`ai-sources ${done ? "in" : ""}`}>
      {p.sources.map((s, i) => (
        <span key={s.label} className={`ai-source${s.yours ? " yours" : ""}`}>
          <span className="ai-source-n">{i + 1}</span>
          <Icon name="globe" size={13} />
          {s.label}
          {s.yours && <em>Yours</em>}
        </span>
      ))}
    </div>
  );

  return (
    <div className="ai-board" ref={ref} style={{ ["--ai-accent" as string]: p.accent }}>
      <div className="ai-tabs" role="tablist" aria-label="AI assistants">
        {providers.map((x, i) => (
          <button key={x.id} type="button" role="tab" aria-selected={i === active} onClick={() => pick(i)} style={{ ["--tab-accent" as string]: x.accent }}>
            <span className="ai-tab-dot" aria-hidden="true" />
            {x.name}
            {i === active && !manual && <span className="ai-tab-progress" aria-hidden="true" key={`${x.id}-${done}`} data-done={done} />}
          </button>
        ))}
      </div>

      <div className="ai-stage">
        <div className={`ai-window ${p.layout}`} aria-live="polite">
          <div className="ai-window-bar">
            <span className="ai-window-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="ai-window-title"><span className="ai-brand-dot" aria-hidden="true" />{p.name}</span>
            <span className="ai-window-tag">Illustrative</span>
          </div>

          {p.layout === "overview" || p.layout === "engine" ? (
            <div className="ai-body">
              <div className="ai-searchbar"><Icon name="spark" size={16} /><span>{QUERY}</span></div>
              {p.layout === "engine" && sources}
              <div className="ai-overview-label"><Icon name="spark" size={14} /> {p.layout === "overview" ? "AI answer" : "Answer"}</div>
              <p className="ai-intro"><Highlighted text={p.intro} budget={introB} />{!done && introB < p.intro.length && <span className="ai-caret" />}</p>
              {list}
              {p.layout === "overview" && sources}
            </div>
          ) : (
            <div className="ai-body">
              <div className="ai-user-bubble">{QUERY}</div>
              <div className="ai-reply">
                <span className="ai-avatar" aria-hidden="true"><Icon name="spark" size={14} /></span>
                <div>
                  <p className="ai-intro"><Highlighted text={p.intro} budget={introB} /></p>
                  {list}
                  {outroB > 0 && <p className="ai-outro"><Highlighted text={p.outro} budget={outroB} /></p>}
                  {!done && <span className="ai-caret" />}
                  {sources}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className={`ai-report ${done ? "in" : ""}`}>
          <div className="ai-report-head">
            <span><Icon name="visibility" size={15} /> What Foundly records</span>
            <strong>{p.name}</strong>
          </div>
          <dl>
            <div><dt>Mentioned</dt><dd className={p.result.mentioned ? "yes" : "no"}>{p.result.mentioned ? <><Icon name="check" size={13} /> Yes</> : "No"}</dd></div>
            <div><dt>Position</dt><dd>{p.result.position}</dd></div>
            <div><dt>Your site cited</dt><dd className={p.result.cited ? "yes" : "warn"}>{p.result.cited ? <><Icon name="check" size={13} /> Yes</> : "Not yet"}</dd></div>
          </dl>
          <p className={`ai-report-note${p.result.cited ? "" : " warn"}`}>{p.result.note}</p>
          <div className="ai-report-all">
            <span>Across assistants</span>
            <ul>
              {providers.map((x, i) => (
                <li key={x.id} className={i === active ? "on" : ""}>
                  <span style={{ background: x.accent }} aria-hidden="true" />
                  {x.name}
                  <em className={x.result.cited ? "yes" : "warn"}>{x.result.cited ? "Cited" : "Mentioned"}</em>
                </li>
              ))}
            </ul>
          </div>
          <span className="ai-report-saved"><Icon name="reports" size={13} /> Full answer saved as evidence</span>
        </aside>
      </div>
    </div>
  );
}

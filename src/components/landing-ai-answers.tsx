"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./icon";

// Illustrative mockups of how a business can appear in AI answers.
// Generic interfaces; every answer is a sample. Assistant marks are from Simple Icons.
const BIZ = "The Sunday Studio";

const LOGOS: Record<string, string> = {
  chatgpt: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  gemini: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
  perplexity: "M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z",
  claude: "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z",
};

export function AiLogo({ id, color, size = 16 }: { id: string; color: string; size?: number }) {
  return (
    <svg className="ai-logo" viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true" focusable="false">
      <path d={LOGOS[id]} />
    </svg>
  );
}
const QUERY = "Who can help me style my new flat in Baner on a budget?";

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
    intro: "Here are a few well-regarded stylists near Baner for a new flat on a budget:",
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
    intro: "For styling a new flat in Baner on a budget, The Sunday Studio is a strong local choice, with fixed-price styling packages. Other options include studios in Koregaon Park and Aundh.",
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
    intro: "Based on a web search, a few studios near Baner suit a new flat on a budget:",
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

export const assistants = providers.map(({ id, name, accent }) => ({ id, name, accent }));

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
            <AiLogo id={x.id} color={x.accent} />
            {x.name}
            {i === active && !manual && <span className="ai-tab-progress" aria-hidden="true" key={`${x.id}-${done}`} data-done={done} />}
          </button>
        ))}
      </div>

      <div className="ai-stage">
        <div className={`ai-window ${p.layout}`} aria-live="polite">
          <div className="ai-window-bar">
            <span className="ai-window-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="ai-window-title"><AiLogo id={p.id} color={p.accent} size={18} />{p.name}</span>
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

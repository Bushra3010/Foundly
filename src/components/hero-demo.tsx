"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "./icon";
import { AiLogo, assistants } from "./landing-ai-answers";

// A looping walkthrough of Foundly in four steps, for the hero. Every value is a sample.
const BIZ = "The Sunday Studio";
const SERVICES = ["Home styling", "Space planning", "Colour consultation"];
const QUESTION = "Best interior stylist in Pune?";
const ANSWER = `For a 2BHK makeover, ${BIZ} in Baner is a strong choice for home styling and space planning.`;

const steps = [
  { id: "details", label: "Add your details", short: "Details", length: 4800, caption: "Tell us what you do and where you work. It becomes one confirmed business profile." },
  { id: "website", label: "Get a website", short: "Website", length: 5200, caption: "Foundly drafts your website from that profile. Review it, then publish in one click." },
  { id: "ai", label: "Show up in AI", short: "AI answers", length: 6600, caption: "When people ask ChatGPT, Gemini, Perplexity or Claude, we check whether you are mentioned and cited." },
  { id: "grow", label: "Track and grow", short: "Grow", length: 5400, caption: "See where you show up, get enquiries in one place, and know the next thing to improve." },
];

// Stands in for "the scene has finished" when motion is reduced.
const END = 1e9;

const on = (t: number, at: number) => t >= at;
const typed = (text: string, at: number, t: number, speed = 42) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - at) / speed))));

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const m = window.matchMedia(motionQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

function Typing({ text, at, t, speed }: { text: string; at: number; t: number; speed?: number }) {
  const v = typed(text, at, t, speed);
  return <>{v}{on(t, at) && v.length < text.length && <i className="hd-caret" />}</>;
}

function Details({ t }: { t: number }) {
  const fields = [
    { label: "Business name", value: BIZ, at: 200 },
    { label: "What you do", value: "Interior styling", at: 1050 },
    { label: "Where you work", value: "Baner, Pune", at: 1800 },
  ];
  const chipAt = (i: number) => 2450 + i * 230;
  const done = fields.filter(f => typed(f.value, f.at, t).length === f.value.length).length + SERVICES.filter((_, i) => on(t, chipAt(i))).length;
  const pct = Math.round((done / (fields.length + SERVICES.length)) * 100);
  return (
    <div className="hd-scene">
      <div className="hd-head"><span><Icon name="business" size={15} /> Business profile</span><span className="hd-pct">{pct}%</span></div>
      <div className="hd-meter"><i style={{ width: `${pct}%` }} /></div>
      {fields.map(f => {
        const active = on(t, f.at) && typed(f.value, f.at, t).length < f.value.length;
        return <div key={f.label} className={`hd-field${active ? " active" : ""}`}><span>{f.label}</span><strong><Typing text={f.value} at={f.at} t={t} /></strong></div>;
      })}
      <div className={`hd-field${on(t, chipAt(0)) && !on(t, chipAt(SERVICES.length)) ? " active" : ""}`}>
        <span>Services</span>
        <div className="hd-chips">{SERVICES.map((s, i) => on(t, chipAt(i)) && <em key={s}>{s}</em>)}</div>
      </div>
      <div className={`hd-badge${pct === 100 ? " in" : ""}`}><Icon name="check" size={14} /> Profile confirmed</div>
    </div>
  );
}

function Website({ t }: { t: number }) {
  const live = on(t, 3100);
  return (
    <div className="hd-scene hd-site">
      <div className="hd-site-bar">
        <span className="hd-url"><Icon name="globe" size={12} />{live ? "sundaystudio.example" : "Draft preview"}</span>
        <span className={`hd-publish${on(t, 2850) && !live ? " pressed" : ""}${live ? " live" : ""}`}>
          {live ? <><Icon name="check" size={12} /> Live</> : "Publish"}
          <span className={`hd-cursor${on(t, 1900) ? " go" : ""}${on(t, 3700) ? " gone" : ""}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 3l14 8-6.2 1.6L10 19z" fill="#20221e" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </span>
        </span>
      </div>
      <div className="hd-page">
        <div className={`hd-pnav hd-pop${on(t, 150) ? " in" : ""}`}><strong>the sunday studio<span>✳</span></strong><span>Services · About · Enquire</span></div>
        <div className="hd-phero">
          <div className={`hd-pop${on(t, 450) ? " in" : ""}`}><small>INTERIOR STYLING · BANER, PUNE</small><h4>Spaces with soul.</h4><span className="hd-pbtn">Enquire now</span></div>
          <div className={`hd-pimg hd-pop${on(t, 750) ? " in" : ""}`} />
        </div>
        <div className="hd-pcards">{SERVICES.map((s, i) => <div key={s} className={`hd-pop${on(t, 1050 + i * 180) ? " in" : ""}`}><i />{s}</div>)}</div>
      </div>
      <div className={`hd-toast${on(t, 3300) ? " in" : ""}`}><Icon name="check" size={14} /> Your website is live</div>
    </div>
  );
}

function Answers({ t }: { t: number }) {
  const answerAt = 1900;
  const answer = typed(ANSWER, answerAt, t, 19);
  const answered = answer.length === ANSWER.length;
  const parts = answer.split(BIZ);
  const chatgpt = assistants[0];
  return (
    <div className="hd-scene">
      <div className="hd-head"><span><Icon name="visibility" size={15} /> AI visibility check</span><span className="hd-sub">Pune · 2BHK makeover</span></div>
      <div className="hd-q"><Typing text={QUESTION} at={150} t={t} speed={32} /></div>
      <div className="hd-a">
        <span className="hd-a-icon"><AiLogo id={chatgpt.id} color={chatgpt.accent} size={15} /></span>
        <p>
          {on(t, 1250) && !on(t, answerAt) && <span className="hd-thinking"><i /><i /><i /></span>}
          {parts.map((p, i) => <Fragment key={i}>{p}{i < parts.length - 1 && <mark>{BIZ}</mark>}</Fragment>)}
          {on(t, answerAt) && !answered && <i className="hd-caret" />}
        </p>
      </div>
      <div className={`hd-src hd-pop${answered ? " in" : ""}`}><span>1</span><Icon name="globe" size={12} />sundaystudio.example<em>Your site, cited</em></div>
      <div className="hd-assistants">
        {assistants.map((a, i) => {
          const hit = answered && on(t, answerAt + ANSWER.length * 19 + 500 + i * 260);
          return <span key={a.id} className={hit ? "hit" : ""}><AiLogo id={a.id} color={a.accent} size={13} />{a.name}{hit && <Icon name="check" size={12} />}</span>;
        })}
      </div>
    </div>
  );
}

function Grow({ t }: { t: number }) {
  const mentions = on(t, 250) ? Math.min(3, Math.floor((t - 250) / 320) + 1) : 0;
  const bars = [22, 30, 34, 48, 61, 82];
  return (
    <div className="hd-scene">
      <div className="hd-grow">
        <div className="hd-card">
          <small>Mentioned by AI</small>
          <div className="hd-big">{mentions}<span> of 4 assistants</span></div>
          <div className="hd-logos">{assistants.map((a, i) => <span key={a.id} className={i < mentions ? "hit" : ""}><AiLogo id={a.id} color={a.accent} size={12} /></span>)}</div>
        </div>
        <div className="hd-card">
          <small>Profile views, last 6 weeks</small>
          <div className="hd-bars">{bars.map((h, i) => <i key={i} style={{ height: on(t, 300 + i * 110) ? `${h}%` : "6%" }} />)}</div>
        </div>
      </div>
      <div className={`hd-lead hd-pop${on(t, 2100) ? " in" : ""}`}>
        <span className="hd-avatar">P</span>
        <div><strong>New enquiry from Priya</strong><span>2BHK makeover in Baner · via your website</span></div>
        <em>Just now</em>
      </div>
      <div className={`hd-next hd-pop${on(t, 3100) ? " in" : ""}`}>
        <Icon name="improve" size={15} />
        <div><strong>Next step</strong><span>Add your Sunday hours so AI can answer “are they open on Sundays?”</span></div>
      </div>
    </div>
  );
}

const scenes = [Details, Website, Answers, Grow];

export function HeroDemo() {
  const [{ step, t }, setState] = useState({ step: 0, t: 0 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const reduce = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const ref = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const playing = !reduce && !hovered && visible;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(e => setVisible(Boolean(e[0]?.isIntersecting)), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      setState(s => (s.t + dt >= steps[s.step].length ? { step: (s.step + 1) % steps.length, t: 0 } : { step: s.step, t: s.t + dt }));
    }, 40);
    return () => window.clearInterval(id);
  }, [playing]);

  const pick = (i: number) => setState({ step: i, t: 0 });
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === "ArrowRight" ? (i + 1) % steps.length : e.key === "ArrowLeft" ? (i + steps.length - 1) % steps.length : e.key === "Home" ? 0 : e.key === "End" ? steps.length - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    pick(next);
    tabs.current[next]?.focus();
  };

  const s = steps[step];
  const Scene = scenes[step];
  const shown = reduce ? END : t;

  return (
    <div className="hero-demo" ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="hd-window">
        <div className="hd-bar">
          <span className="hd-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="hd-title">Foundly · {BIZ}</span>
          <span className="hd-tag">Illustrative</span>
        </div>
        <div className="hd-stage" id="hero-demo-panel" role="tabpanel" aria-labelledby={`hero-demo-tab-${s.id}`}>
          <div aria-hidden="true" className="hd-stage-inner"><Scene key={s.id} t={shown} /></div>
          <p className="hd-caption"><strong>{step + 1}. {s.label}.</strong> {s.caption}</p>
        </div>
      </div>
      <div className="hd-steps" role="tablist" aria-label="How Foundly works">
        {steps.map((x, i) => (
          <button
            key={x.id}
            ref={el => { tabs.current[i] = el; }}
            id={`hero-demo-tab-${x.id}`}
            type="button"
            role="tab"
            aria-selected={i === step}
            aria-controls="hero-demo-panel"
            tabIndex={i === step ? 0 : -1}
            className={i < step ? "done" : ""}
            onClick={() => pick(i)}
            onKeyDown={e => onKey(e, i)}
          >
            <span className="hd-num">{i < step ? <Icon name="check" size={11} /> : i + 1}</span>
            <span className="hd-long">{x.label}</span><span className="hd-short">{x.short}</span>
            {i === step && !reduce && <span className="hd-progress" aria-hidden="true" style={{ width: `${Math.min(100, (t / x.length) * 100)}%` }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "./icon";
import { AiLogo, assistants } from "./landing-ai-answers";

// "How it works": the three steps play in turn, each with a small illustrative visual.
const STEP = 4200;
const HOLD = 1600;

const steps = [
  { title: "Tell us about your business", body: "Add what you do, where you work, and how customers can reach you.", tag: "Business facts" },
  { title: "Make it your own", body: "Review your business profile and website draft. Edit the details until they sound like you.", tag: "Website draft" },
  { title: "Publish. Learn. Keep growing.", body: "Put your website online, check your AI visibility, and keep improving your presence.", tag: "Live and tracked" },
];

const END = 1e9;
const on = (t: number, at: number) => t >= at;
const typed = (text: string, at: number, t: number, speed = 45) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - at) / speed))));

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const m = window.matchMedia(motionQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

function Facts({ t }: { t: number }) {
  const rows = [
    { icon: "business", text: "Interior styling", at: 200 },
    { icon: "home", text: "Baner, Pune", at: 1150 },
    { icon: "leads", text: "Enquiry form", at: 1900 },
  ];
  return (
    <div className="pv-facts">
      {rows.map(r => {
        const v = typed(r.text, r.at, t);
        const done = v.length === r.text.length;
        return (
          <div key={r.text} className={done ? "done" : on(t, r.at) ? "active" : ""}>
            <Icon name={r.icon} size={12} />
            <span>{v}{on(t, r.at) && !done && <i className="pv-caret" />}</span>
            {done && <b><Icon name="check" size={10} /></b>}
          </div>
        );
      })}
    </div>
  );
}

function Draft({ t }: { t: number }) {
  const before = "Welcome to our site";
  const after = "Spaces with soul.";
  const selecting = on(t, 500) && !on(t, 1300);
  const v = on(t, 1300) ? typed(after, 1300, t, 60) : before;
  const saved = on(t, 1300 + after.length * 60 + 200);
  return (
    <div className="pv-draft">
      <div className="pv-draft-nav"><strong>the sunday studio<span>✳</span></strong><em className={saved ? "in" : ""}><Icon name="check" size={10} /> Saved</em></div>
      <div className="pv-draft-body">
        <small>INTERIOR STYLING · BANER</small>
        <h5 className={selecting ? "selected" : ""}>{v}{on(t, 1300) && v.length < after.length && <i className="pv-caret" />}</h5>
        <div className="pv-lines"><i /><i /></div>
      </div>
    </div>
  );
}

function Live({ t }: { t: number }) {
  const draw = Math.min(1, Math.max(0, (t - 600) / 1800));
  return (
    <div className="pv-live">
      <div className="pv-live-top">
        <span className={`pv-live-pill${on(t, 200) ? " in" : ""}`}><i /> Live</span>
        <span className="pv-live-url">sundaystudio.example</span>
      </div>
      <svg viewBox="0 0 160 44" preserveAspectRatio="none" className="pv-spark">
        <path d="M2 40 C 25 38, 35 33, 52 30 S 85 26, 100 18 S 135 10, 158 4" pathLength={1} style={{ strokeDashoffset: 1 - draw }} />
      </svg>
      <div className="pv-live-ai">
        {assistants.map((a, i) => (
          <span key={a.id} className={i < 3 && on(t, 2300 + i * 280) ? "hit" : ""}><AiLogo id={a.id} color={a.accent} size={11} /></span>
        ))}
        <small>{on(t, 2300 + 2 * 280) ? "Mentioned by 3 of 4" : "Checking AI answers…"}</small>
      </div>
    </div>
  );
}

const visuals = [Facts, Draft, Live];

export function LandingProcess() {
  const [{ step, t }, setState] = useState({ step: 0, t: 0 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduce = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const ref = useRef<HTMLOListElement>(null);
  const playing = !reduce && !hovered && visible;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(e => setVisible(Boolean(e[0]?.isIntersecting)), { threshold: 0.35 });
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
      setState(s => {
        const length = s.step === steps.length - 1 ? STEP + HOLD : STEP;
        return s.t + dt >= length ? { step: (s.step + 1) % steps.length, t: 0 } : { step: s.step, t: s.t + dt };
      });
    }, 40);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <ol ref={ref} className="process-steps" onMouseLeave={() => setHovered(false)}>
      {steps.map((s, i) => {
        const state = reduce || i < step ? "done" : i === step ? "active" : "next";
        const Visual = visuals[i];
        const shown = state === "done" || (state === "active" && hovered) ? END : state === "active" ? t : 0;
        const fill = state === "done" ? 1 : state === "active" ? Math.min(1, t / STEP) : 0;
        return (
          <li key={s.title} className={`is-${state}`} onMouseEnter={() => { setHovered(true); if (i !== step) setState({ step: i, t: 0 }); }}>
            <span className="process-number">{state === "done" && !reduce ? <Icon name="check" size={16} /> : `0${i + 1}`}</span>
            {i < steps.length - 1 && <span className="process-line" aria-hidden="true"><i style={{ transform: `scaleY(${fill})` }} /></span>}
            <div className="process-card">
              <div className="process-text">
                <span className="process-tag">{s.tag}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
              <div className="process-visual" aria-hidden="true"><Visual t={shown} /></div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

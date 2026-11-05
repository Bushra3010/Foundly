"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "./icon";
import { CHART_MONTHS, formatKpi, type KpiUnit, type SoftwareDemo as Demo } from "@/lib/software-demo";

// An interactive, self-playing walkthrough of a custom software product. Every value is a sample.
// Phase -1 is the empty board, 0–2 are the workflow steps and 3 is the finished state.

type Feature = { name: string; description: string };
type Props = {
  title: string;
  demo: Demo;
  features: readonly Feature[];
  workflow: readonly string[];
  variant: "desktop" | "phone";
};

const LENGTH: Record<number, number> = { [-1]: 1200, 0: 3800, 1: 3800, 2: 3800, 3: 3600 };
const MODULE_ICONS = ["workspaces", "reports", "shield", "performance", "profile"];

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const m = window.matchMedia(motionQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
function subscribeFullscreen(cb: () => void) {
  document.addEventListener("fullscreenchange", cb);
  return () => document.removeEventListener("fullscreenchange", cb);
}

function Count({ value, unit, run, instant }: { value: number; unit: KpiUnit; run: boolean; instant: boolean }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const a = from.current;
    const length = instant ? 0 : 900;
    let id = 0;
    const tick = (now: number) => {
      const p = length ? Math.min(1, (now - start) / length) : 1;
      const v = a + (value - a) * (1 - (1 - p) ** 3);
      from.current = v;
      setShown(v);
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value, run, instant]);
  return <>{formatKpi(shown, unit)}</>;
}

export function SoftwareDemo({ title, demo, features, workflow, variant }: Props) {
  const [{ phase, t }, setState] = useState({ phase: -1, t: 0 });
  const [playing, setPlaying] = useState(true);
  const [userPlayed, setUserPlayed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);
  const [spot, setSpot] = useState<number | null>(null);
  const reduce = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const fullscreen = useSyncExternalStore(subscribeFullscreen, () => document.fullscreenElement !== null, () => false);
  const ref = useRef<HTMLElement>(null);
  const running = playing && visible && (!reduce || userPlayed);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(e => {
      const on = Boolean(e[0]?.isIntersecting);
      setVisible(on);
      if (on) setSeen(true);
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      setState(s => (s.t + dt >= LENGTH[s.phase] ? { phase: s.phase === 3 ? -1 : s.phase + 1, t: 0 } : { phase: s.phase, t: s.t + dt }));
    }, 50);
    return () => window.clearInterval(id);
  }, [running]);

  const go = (next: number) => {
    setState({ phase: Math.max(-1, Math.min(3, next)), t: 0 });
    setPlaying(false);
  };
  const togglePlay = () => {
    if (running) {
      setPlaying(false);
      return;
    }
    if (phase === 3) setState({ phase: -1, t: 0 });
    setUserPlayed(true);
    setPlaying(true);
  };
  const restart = () => {
    setState({ phase: -1, t: 0 });
    setSpot(null);
    setUserPlayed(true);
    setPlaying(true);
  };
  const present = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void ref.current?.requestFullscreen?.();
  };
  const pickModule = (i: number | null) => {
    setSpot(s => (s === i ? null : i));
    setPlaying(false);
  };

  // Figures after the steps that have happened so far.
  const done = Math.min(phase, 2);
  const kpis = demo.kpis.map((k, i) => {
    let value = k.value;
    for (let s = 0; s <= done; s++) value += demo.effects[s][i as 0 | 1 | 2 | 3] ?? 0;
    return { ...k, value, changed: phase >= 0 && phase <= 2 && demo.effects[phase][i as 0 | 1 | 2 | 3] !== undefined };
  });
  const chart = demo.chart.values.map((v, i, all) => (i === all.length - 1 && phase === 3 ? v + demo.chart.bump : v));
  // Bars start from 60% of the smallest month so month-to-month changes are visible.
  const max = Math.max(...demo.chart.values) + demo.chart.bump;
  const floor = Math.min(...demo.chart.values) * 0.6;
  const height = (v: number) => 12 + ((v - floor) / (max - floor)) * 88;
  const recordStage = phase < 0 ? -1 : Math.min(phase, 2);
  const event = phase >= 0 && phase <= 2 ? demo.events[phase] : phase === 3 ? `Workflow complete · ${demo.record.title}` : null;
  const caption = phase < 0 ? "Press play, or pick a step below, to walk through the workflow." : phase === 3 ? "That is the whole workflow. Every step is recorded and the dashboard updates itself." : workflow[phase];
  const progress = phase >= 0 && phase <= 2 ? Math.min(100, (t / LENGTH[phase]) * 100) : 0;
  const run = seen;

  const kpiCards = kpis.map(k => (
    <div key={k.label} className={`sd-kpi${k.changed ? " bump" : ""}`}>
      {k.changed && <i key={phase} className="sd-kpi-flash" aria-hidden="true"><b>Updated</b></i>}
      <small>{k.label}</small>
      <strong><Count value={k.value} unit={k.unit} run={run} instant={reduce} /></strong>
      <span>{k.delta}</span>
    </div>
  ));

  const chartCard = (
    <div className="sd-card sd-chart">
      <div className="sd-card-head"><span><Icon name="performance" size={14} /> {demo.chart.title}</span><em>Last 6 months</em></div>
      <div className="sd-bars">
        {chart.map((v, i) => (
          <div key={CHART_MONTHS[i]} className={`sd-bar-col${i === chart.length - 1 && phase === 3 ? " up" : ""}`}>
            <span className="sd-bar-tip">{v.toLocaleString("en-IN")}</span>
            <i style={{ height: run ? `${height(v)}%` : "6%", transitionDelay: run ? `${i * 70}ms` : "0ms" }} />
            <small>{CHART_MONTHS[i]}</small>
          </div>
        ))}
      </div>
    </div>
  );

  const spotlight = spot !== null && features[spot] && (
    <div className="sd-spot" key={spot}>
      <span className="sd-spot-icon"><Icon name={MODULE_ICONS[spot % MODULE_ICONS.length]} size={16} /></span>
      <div><strong>{features[spot].name}</strong><p>{features[spot].description}</p></div>
      <button type="button" className="sd-spot-close" onClick={() => setSpot(null)} aria-label="Close module details">×</button>
    </div>
  );

  const recordCard = (stage: number) => (
    <div key={`record-${stage}`} className={`sd-item sd-record${phase === 3 ? " done" : ""}`}>
      <strong>{demo.record.title}</strong>
      <span>{demo.record.detail}</span>
      <em>{phase === 3 ? <><Icon name="check" size={11} /> Complete</> : demo.record.tag}</em>
      {stage === recordStage && phase < 3 && <i className="sd-record-pulse" aria-hidden="true" />}
    </div>
  );

  const desktop = (
    <div className="sd-window">
      <div className="sd-titlebar">
        <span className="sd-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="sd-title">{demo.workspace}</span>
        <span className="sd-live"><i /> Live demo · sample data</span>
      </div>
      <div className="sd-body">
        <nav className="sd-side" aria-label="Demo modules">
          <button type="button" className={spot === null ? "on" : ""} onClick={() => pickModule(null)} aria-pressed={spot === null}><Icon name="home" size={15} /> Dashboard</button>
          {features.map((f, i) => (
            <button key={f.name} type="button" className={spot === i ? "on" : ""} onClick={() => pickModule(i)} aria-pressed={spot === i}>
              <Icon name={MODULE_ICONS[i % MODULE_ICONS.length]} size={15} /> {f.name}
            </button>
          ))}
        </nav>
        <div className="sd-main">
          {spotlight}
          <div className="sd-kpis">{kpiCards}</div>
          <div className="sd-grid">
            {chartCard}
            <div className="sd-card sd-board">
              <div className="sd-card-head"><span><Icon name="workspaces" size={14} /> Workflow board</span><em>{phase === 3 ? "All steps done" : phase >= 0 ? `Step ${phase + 1} of 3` : "Ready"}</em></div>
              <div className="sd-cols">
                {demo.stages.map((label, s) => {
                  const items = demo.backlog.filter(b => b.stage === s);
                  const here = recordStage === s;
                  return (
                    <div key={label} className={`sd-col${here && phase < 3 ? " active" : ""}`}>
                      <div className="sd-col-head"><span>{label}</span><b>{items.length + (here ? 1 : 0)}</b></div>
                      {here && recordCard(s)}
                      {items.map(b => (
                        <div key={b.title} className="sd-item"><strong>{b.title}</strong><span>{b.detail}</span><em>{b.tag}</em></div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {event && <div className="sd-toast" key={phase}><Icon name="check" size={14} /> {event}</div>}
    </div>
  );

  const phone = (
    <div className="sd-phone-layout">
      <div className="sd-phone">
        <div className="sd-screen">
          <div className="sd-status" aria-hidden="true"><span>9:41</span><span className="sd-island" /><span>5G ▮</span></div>
          {event && <div className="sd-push" key={phase}><span className="sd-push-icon"><Icon name="spark" size={12} /></span><div><b>{demo.workspace}</b><p>{event}</p></div></div>}
          <div className="sd-app-head"><small>Good morning</small><strong>{demo.workspace}</strong></div>
          {spotlight}
          <div className="sd-kpis sd-kpis-phone">{kpiCards}</div>
          <div className={`sd-track${phase === 3 ? " done" : ""}${phase < 0 ? " idle" : ""}`}>
            <div className="sd-track-top"><strong>{demo.record.title}</strong><em>{phase === 3 ? "Complete" : phase < 0 ? "Waiting" : demo.stages[recordStage]}</em></div>
            <span>{demo.record.detail}</span>
            <div className="sd-track-steps">
              {demo.stages.map((label, s) => (
                <div key={label} className={s < recordStage || phase === 3 ? "done" : s === recordStage ? "on" : ""}><i>{s < recordStage || phase === 3 ? <Icon name="check" size={10} /> : s + 1}</i><small>{label}</small></div>
              ))}
            </div>
          </div>
          <div className="sd-recent">
            <small>Recent</small>
            {demo.backlog.map(b => (
              <div key={b.title} className="sd-recent-row"><span className="sd-avatar">{b.title.charAt(0)}</span><div><strong>{b.title}</strong><span>{b.detail}</span></div><em>{b.tag}</em></div>
            ))}
          </div>
          <nav className="sd-tabbar" aria-label="App screens">
            <button type="button" className={spot === null ? "on" : ""} onClick={() => pickModule(null)} aria-pressed={spot === null}><Icon name="home" size={16} /><span>Home</span></button>
            {features.slice(0, 3).map((f, i) => (
              <button key={f.name} type="button" className={spot === i ? "on" : ""} onClick={() => pickModule(i)} aria-pressed={spot === i}>
                <Icon name={MODULE_ICONS[i % MODULE_ICONS.length]} size={16} /><span>{f.name.split(/ & | /)[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="sd-phone-side">
        {chartCard}
        <div className="sd-card">
          <div className="sd-card-head"><span><Icon name="workspaces" size={14} /> App features</span><em>Tap to explore</em></div>
          <div className="sd-feature-list">
            {features.map((f, i) => (
              <button key={f.name} type="button" className={spot === i ? "on" : ""} onClick={() => pickModule(i)} aria-pressed={spot === i}>
                <Icon name={MODULE_ICONS[i % MODULE_ICONS.length]} size={15} /> {f.name}<Icon name="chevron" size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section ref={ref} className={`software-demo${fullscreen ? " is-presenting" : ""}`} aria-labelledby="software-demo-title">
      <div className="sd-header">
        <div>
          <p className="sd-eyebrow"><Icon name="spark" size={13} /> Interactive demo</p>
          <h2 id="software-demo-title">See {title} in action</h2>
          <p>Watch a real workflow play out, or take control: step through it, open any module and present it full screen.</p>
        </div>
        <div className="sd-controls">
          <button type="button" onClick={() => go(phase - 1)} disabled={phase < 0} aria-label="Previous step"><Icon name="chevron" size={16} className="sd-flip" /></button>
          <button type="button" className="sd-play" onClick={togglePlay}>{running ? "Pause" : "Play demo"}</button>
          <button type="button" onClick={() => go(phase + 1)} disabled={phase >= 3} aria-label="Next step"><Icon name="chevron" size={16} /></button>
          <button type="button" onClick={restart} aria-label="Restart demo"><Icon name="compare" size={15} /></button>
          <button type="button" onClick={present} className="sd-present">{fullscreen ? "Exit full screen" : "Present"}</button>
        </div>
      </div>

      {variant === "phone" ? phone : desktop}

      <p className="sd-caption" aria-live={running ? "off" : "polite"}>{caption}</p>
      <ol className="sd-steps">
        {workflow.map((step, i) => (
          <li key={step}>
            <button type="button" onClick={() => go(i)} className={i < phase ? "done" : i === phase ? "on" : ""} aria-current={i === phase ? "step" : undefined}>
              <span className="sd-num">{i < phase ? <Icon name="check" size={11} /> : i + 1}</span>
              <span>{step}</span>
              {i === phase && running && <span className="sd-progress" aria-hidden="true" style={{ width: `${progress}%` }} />}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

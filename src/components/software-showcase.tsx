"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "./icon";
import { formatKpi, type SoftwareDemo } from "@/lib/software-demo";

// Hero art for /software/[product]: a tilted live mockup (browser window or phone) that cycles
// through the product's modules, with floating cards that react to each step. Every value is a sample.

const STEP = 2800;
const ICONS = ["workspaces", "reports", "shield", "performance", "profile"];

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const m = window.matchMedia(motionQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

function chartPath(values: readonly number[], w: number, h: number) {
  const min = Math.min(...values) * 0.85;
  const max = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - ((v - min) / (max - min)) * (h - 8) - 4] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return { line, area: `${line} L${w},${h} L0,${h} Z`, last: pts[pts.length - 1] };
}

type Props = { variant: "desktop" | "phone"; demo: SoftwareDemo; features: readonly string[] };

export function SoftwareShowcase({ variant, demo, features }: Props) {
  const [{ active, picked }, setState] = useState({ active: 0, picked: false });
  const [hover, setHover] = useState(false);
  const reduce = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);

  // Advance one module at a time; after a manual pick, stay on it for longer before moving on.
  useEffect(() => {
    if (reduce || hover) return;
    const id = window.setTimeout(() => setState(s => ({ active: (s.active + 1) % features.length, picked: false })), picked ? STEP * 3 : STEP);
    return () => window.clearTimeout(id);
  }, [reduce, hover, active, picked, features.length]);

  const event = demo.events[active % demo.events.length];
  const done = active % demo.events.length;
  const { line, area, last } = chartPath(demo.chart.values, 240, 92);
  const [k0, k1, k2] = demo.kpis;
  const ring = k2.unit === "pct" ? Math.min(100, k2.value) : 72;

  const chips = (
    <>
      <div className="sx-chip sx-chip-a" aria-hidden="true">
        <span className="sx-chip-icon up"><Icon name="improve" size={14} /></span>
        <div><small>{k0.label}</small><strong>{formatKpi(k0.value, k0.unit)}</strong><em>{k0.delta}</em></div>
      </div>
      <div className="sx-chip sx-chip-b" key={`ev-${active}`} aria-hidden="true">
        <span className="sx-chip-icon"><Icon name="check" size={14} /></span>
        <p>{event}</p>
      </div>
      <div className="sx-chip sx-chip-c" aria-hidden="true">
        <span className="sx-avatar">{demo.record.title.charAt(0)}</span>
        <div><strong>{demo.record.title}</strong><small>{demo.record.detail}</small></div>
        <em>{demo.record.tag}</em>
      </div>
    </>
  );

  const pick = (i: number) => setState({ active: i, picked: true });

  return (
    <div className={`sx sx--${variant}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <span className="sx-blob sx-blob-1" aria-hidden="true" />
      <span className="sx-blob sx-blob-2" aria-hidden="true" />
      <span className="sx-grid" aria-hidden="true" />

      {variant === "desktop" ? (
        <div className="sx-window">
          <div className="sx-bar"><span className="sx-dots" aria-hidden="true"><i /><i /><i /></span><span>{demo.workspace}</span><span className="sx-live"><i /> Live</span></div>
          <div className="sx-body">
            <nav className="sx-side" aria-label="Product modules" style={{ ["--sx-i" as string]: active }}>
              <span className="sx-side-pill" aria-hidden="true" />
              {features.map((f, i) => (
                <button key={f} type="button" className={i === active ? "on" : ""} onClick={() => pick(i)} aria-pressed={i === active}>
                  <Icon name={ICONS[i % ICONS.length]} size={13} /><span>{f}</span>
                </button>
              ))}
              <span className="sx-cursor" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 3l14 8-6.2 1.6L10 19z" fill="#20221e" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
              </span>
            </nav>
            <div className="sx-main" key={active}>
              <div className="sx-main-head"><strong>{features[active]}</strong><span>Updated just now</span></div>
              <div className="sx-tiles">
                <div><small>{k1.label}</small><b>{formatKpi(k1.value, k1.unit)}</b></div>
                <div><small>{k2.label}</small><b>{formatKpi(k2.value, k2.unit)}</b></div>
              </div>
              <svg className="sx-chart" viewBox="0 0 240 92" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="sx-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a4cd48" stopOpacity=".45" /><stop offset="1" stopColor="#a4cd48" stopOpacity="0" /></linearGradient></defs>
                <path d={area} fill="url(#sx-fill)" className="sx-area" />
                <path d={line} fill="none" stroke="#5f6b47" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="sx-line" />
                <circle cx={last[0]} cy={last[1]} r="4" className="sx-dot" />
              </svg>
              <ul className="sx-steps">
                {demo.stages.map((s, i) => (
                  <li key={s} className={i <= done ? "done" : ""} style={{ animationDelay: `${300 + i * 160}ms` }}>
                    <span>{i <= done ? <Icon name="check" size={10} /> : i + 1}</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="sx-phone">
          <div className="sx-screen">
            <div className="sx-status" aria-hidden="true"><span>9:41</span><span className="sx-island" /><span>●●●</span></div>
            <div className="sx-hello"><small>Good morning</small><strong>{demo.workspace}</strong></div>
            <div className="sx-ring-card">
              <svg viewBox="0 0 64 64" className="sx-ring" aria-hidden="true">
                <circle cx="32" cy="32" r="26" className="sx-ring-bg" />
                <circle cx="32" cy="32" r="26" className="sx-ring-fg" pathLength={100} style={{ strokeDasharray: `${ring} 100` }} key={`ring-${active}`} />
              </svg>
              <div><small>{k2.label}</small><b>{formatKpi(k2.value, k2.unit)}</b><span>{k2.delta}</span></div>
            </div>
            <div className="sx-carousel" aria-label="App screens">
              <div className="sx-track" style={{ transform: `translateX(-${active * 100}%)` }}>
                {features.map((f, i) => (
                  <div key={f} className="sx-slide">
                    <span className="sx-slide-icon"><Icon name={ICONS[i % ICONS.length]} size={16} /></span>
                    <strong>{f}</strong>
                    <span className="sx-slide-bar"><i style={{ width: i === active ? "100%" : "0%" }} /></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sx-dots-row">
              {features.map((f, i) => (
                <button key={f} type="button" className={i === active ? "on" : ""} onClick={() => pick(i)} aria-label={`Show ${f}`} aria-pressed={i === active} />
              ))}
            </div>
            <ul className="sx-list">
              {demo.backlog.slice(0, 3).map((b, i) => (
                <li key={b.title} style={{ animationDelay: `${i * 140}ms` }}><span className="sx-avatar">{b.title.charAt(0)}</span><div><strong>{b.title}</strong><small>{b.detail}</small></div></li>
              ))}
            </ul>
            <div className="sx-push" key={`push-${active}`} aria-hidden="true"><span className="sx-chip-icon"><Icon name="spark" size={12} /></span><p>{event}</p></div>
          </div>
        </div>
      )}

      {chips}
    </div>
  );
}

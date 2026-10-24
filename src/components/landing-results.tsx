"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./icon";

// Illustrative journey for a sample business. Every number here is an example,
// labelled as such on the page, never a claim about real customers.
const TOTAL_ANSWERS = 24;
const weekly = [2, 3, 3, 5, 6, 7, 8, 9];

const stages = [
  {
    id: "day1",
    label: "Day 1",
    week: 0,
    website: { value: "Not connected", detail: "No home on the internet yet", live: false },
    enquiries: { value: 0, detail: "Not listed where AI looks yet" },
    profile: { done: 3, total: 9 },
    tasks: 0,
    answer: {
      status: "Not mentioned",
      tone: "none",
      text: "Popular choices include a couple of studios in Koregaon Park and a design firm in Aundh. Check recent reviews before you book.",
      highlight: "",
      source: "",
    },
  },
  {
    id: "week4",
    label: "Week 4",
    week: 3,
    website: { value: "Connected", detail: "Built by the Foundly team", live: true },
    enquiries: { value: 3, detail: "Listed on 3 sites AI reads" },
    profile: { done: 7, total: 9 },
    tasks: 3,
    answer: {
      status: "Mentioned",
      tone: "mention",
      text: "Popular choices include a couple of studios in Koregaon Park. ",
      highlight: "The Sunday Studio in Baner is also known for home styling.",
      source: "",
    },
  },
  {
    id: "week8",
    label: "Week 8",
    week: 7,
    website: { value: "Connected", detail: "Checked weekly for AI readiness", live: true },
    enquiries: { value: 6, detail: "Listed on 6 sites AI reads" },
    profile: { done: 9, total: 9 },
    tasks: 6,
    answer: {
      status: "Mentioned and cited",
      tone: "cited",
      text: "For home styling and colour consultation, ",
      highlight: "The Sunday Studio in Baner offers space planning and styling across Pune.",
      source: "sundaystudio.example",
    },
  },
] as const;

const improvements = [
  "Added opening hours and service areas",
  "Published a clear services page",
  "Confirmed contact details everywhere",
  "Added structured business data",
  "Answered common customer questions",
  "Verified business ownership",
];

const CHART_W = 520;
const CHART_H = 170;
const PAD = { l: 34, r: 14, t: 16, b: 26 };
const MAX_PCT = 50;

function point(i: number) {
  const pct = (weekly[i] / TOTAL_ANSWERS) * 100;
  const x = PAD.l + (i / (weekly.length - 1)) * (CHART_W - PAD.l - PAD.r);
  const y = PAD.t + (1 - pct / MAX_PCT) * (CHART_H - PAD.t - PAD.b);
  return { x, y, pct };
}

export function LandingResults() {
  const [active, setActive] = useState(0);
  const [played, setPlayed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const stage = stages[active];
  const weekIdx = stage.week;
  const mention = weekly[weekIdx];
  const rate = Math.round((mention / TOTAL_ANSWERS) * 100);

  // Play the journey once when the board first scrolls into view.
  useEffect(() => {
    const el = ref.current;
    if (!el || played) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        setPlayed(true);
        timers.push(window.setTimeout(() => setActive(1), 1100));
        timers.push(window.setTimeout(() => setActive(2), 2400));
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(t => window.clearTimeout(t));
    };
  }, [played]);

  const pts = weekly.map((_, i) => point(i));
  const shown = pts.slice(0, weekIdx + 1);
  const line = shown.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = shown.length > 1
    ? `${line} L${shown[shown.length - 1].x.toFixed(1)},${CHART_H - PAD.b} L${shown[0].x.toFixed(1)},${CHART_H - PAD.b} Z`
    : "";
  const last = shown[shown.length - 1];

  const select = (i: number) => {
    setPlayed(true);
    setActive(i);
  };

  return (
    <div className="results-board" ref={ref}>
      <div className="results-main">
        <div className="results-topbar">
          <div className="results-biz">
            <span className="results-monogram">s</span>
            <div>
              <strong>The Sunday Studio</strong>
              <span>Interior styling · Pune</span>
            </div>
          </div>
          <div className="results-stages" role="tablist" aria-label="Show results at">
            {stages.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => select(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="results-kpis" aria-live="polite">
          <div className="results-kpi">
            <span className="results-kpi-label"><Icon name="website" size={16} /> Website</span>
            <strong className="results-kpi-value">
              {stage.website.value}
              {stage.website.live && <span className="results-live-dot" aria-hidden="true" />}
            </strong>
            <span className="results-kpi-detail">{stage.website.detail}</span>
          </div>
          <div className="results-kpi violet">
            <span className="results-kpi-label"><Icon name="visibility" size={16} /> AI mention rate</span>
            <strong className="results-kpi-value">{rate}%</strong>
            <span className="results-kpi-detail">{mention} of {TOTAL_ANSWERS} answers</span>
          </div>
          <div className="results-kpi amber">
            <span className="results-kpi-label"><Icon name="presence" size={16} /> Listings</span>
            <strong className="results-kpi-value">{stage.enquiries.value}</strong>
            <span className="results-kpi-detail">{stage.enquiries.detail}</span>
          </div>
          <div className="results-kpi sage">
            <span className="results-kpi-label"><Icon name="business" size={16} /> Business profile</span>
            <strong className="results-kpi-value">{stage.profile.done}/{stage.profile.total}</strong>
            <span className="results-kpi-meter" aria-hidden="true">
              <span style={{ width: `${(stage.profile.done / stage.profile.total) * 100}%` }} />
            </span>
            <span className="results-kpi-detail">Key facts confirmed</span>
          </div>
        </div>

        <div className="results-chart">
          <div className="results-chart-head">
            <div>
              <span>AI mention rate over 8 weeks</span>
              <strong>{weekIdx === 0 ? "Your starting point" : `+${rate - Math.round((weekly[0] / TOTAL_ANSWERS) * 100)} points since day 1`}</strong>
            </div>
            <span className="results-chart-note">Same {TOTAL_ANSWERS} tracked questions each week</span>
          </div>
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} role="img" aria-label={`Mention rate rising from 8% in week 1 to ${rate}% in week ${weekIdx + 1}`}>
            <defs>
              <linearGradient id="results-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8a72c4" stopOpacity=".28" />
                <stop offset="100%" stopColor="#8a72c4" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 25, 50].map(v => {
              const y = PAD.t + (1 - v / MAX_PCT) * (CHART_H - PAD.t - PAD.b);
              return (
                <g key={v}>
                  <line x1={PAD.l} x2={CHART_W - PAD.r} y1={y} y2={y} className="results-grid" />
                  <text x={PAD.l - 8} y={y + 4} textAnchor="end" className="results-axis">{v}%</text>
                </g>
              );
            })}
            {pts.map((p, i) => (
              <text key={i} x={p.x} y={CHART_H - 6} textAnchor="middle" className={`results-axis${i <= weekIdx ? " on" : ""}`}>W{i + 1}</text>
            ))}
            {pts.map((p, i) => i > weekIdx && <circle key={`g${i}`} cx={p.x} cy={p.y} r="3" className="results-ghost" />)}
            {area && <path d={area} fill="url(#results-area)" className="results-area" />}
            {shown.length > 1 && <path d={line} className="results-line" />}
            {shown.slice(0, -1).map((p, i) => <circle key={`p${i}`} cx={p.x} cy={p.y} r="3.5" className="results-dot" />)}
            <circle cx={last.x} cy={last.y} r="11" className="results-halo" />
            <circle cx={last.x} cy={last.y} r="5.5" className="results-dot current" />
            <g transform={`translate(${Math.min(last.x, CHART_W - 60)}, ${last.y - 20})`}>
              <rect x="-26" y="-17" width="52" height="22" rx="11" className="results-tip" />
              <text y="-2" textAnchor="middle" className="results-tip-text">{rate}%</text>
            </g>
          </svg>
        </div>
      </div>

      <aside className="results-side">
        <div className="results-answer">
          <div className="results-answer-head">
            <span className="results-answer-label"><Icon name="spark" size={15} /> Sample AI answer</span>
            <span className={`results-status ${stage.answer.tone}`}>{stage.answer.status}</span>
          </div>
          <p className="results-question">“Who are good interior stylists in Pune?”</p>
          <p className="results-answer-text">
            {stage.answer.text}
            {stage.answer.highlight && <mark>{stage.answer.highlight}</mark>}
          </p>
          <div className="results-sources">
            <span>Sources</span>
            {stage.answer.source
              ? <span className="results-source yours"><Icon name="globe" size={13} /> {stage.answer.source}</span>
              : <span className="results-source">Your website isn’t cited yet</span>}
          </div>
        </div>

        <div className="results-tasks">
          <div className="results-tasks-head">
            <span>Improvements applied</span>
            <strong>{stage.tasks} of {improvements.length}</strong>
          </div>
          <ul>
            {improvements.map((t, i) => (
              <li key={t} className={i < stage.tasks ? "done" : ""}>
                <span className="results-check" aria-hidden="true">{i < stage.tasks && <Icon name="check" size={12} />}</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="results-foot">
        <p>
          <Icon name="shield" size={15} />
          An illustrative example with a sample business. AI answers change, and mentions aren’t guaranteed. Your dashboard shows your own observed results, with saved evidence behind every number.
        </p>
        <Link href="/signup" className="landing-button small">See your own results <Icon name="arrow" size={16} /></Link>
      </div>
    </div>
  );
}

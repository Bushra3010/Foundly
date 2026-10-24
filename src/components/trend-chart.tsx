"use client";

import { useState } from "react";

type Point = { label: string; rate: number | null; answers: number };

const W = 640;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

/**
 * Weekly mention rate as one line. Weeks without any checked answers are gaps,
 * never zero. Hover (or focus) a week to read its exact numbers.
 */
export function TrendChart({ points, unit = "percent", label = "Share of AI answers that mention you, by week" }: { points: Point[]; unit?: "percent" | "score"; label?: string }) {
  const fmt = (r: number) => (unit === "score" ? `${Math.round(r * 100)}` : `${Math.round(r * 100)}%`);
  const [active, setActive] = useState<number | null>(null);
  const has = points.some((p) => p.rate !== null);
  const step = (W - PAD.left - PAD.right) / Math.max(points.length - 1, 1);
  const x = (i: number) => PAD.left + i * step;
  const y = (r: number) => PAD.top + (1 - r) * (H - PAD.top - PAD.bottom);

  // Break the line where a week has no data.
  const segments: string[] = [];
  let d = "";
  points.forEach((p, i) => {
    if (p.rate === null) {
      if (d) segments.push(d);
      d = "";
      return;
    }
    d += `${d ? "L" : "M"}${x(i).toFixed(1)},${y(p.rate).toFixed(1)}`;
  });
  if (d) segments.push(d);

  const a = active !== null ? points[active] : null;

  return (
    <div className="pf-chart">
      {!has && <p className="pf-chart-empty">Your trend appears here after your first AI checks.</p>}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} onMouseLeave={() => setActive(null)}>
        {[0, 0.5, 1].map((g) => (
          <g key={g}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(g)} y2={y(g)} className="pf-grid-line" />
            <text x={PAD.left - 8} y={y(g)} className="pf-axis" textAnchor="end" dominantBaseline="middle">{fmt(g)}</text>
          </g>
        ))}
        {/* Every other week is labelled, ending on the latest. */}
        {points.map((p, i) => ((points.length - 1 - i) % 2 === 0 ? (
          <text key={p.label} x={x(i)} y={H - 8} className="pf-axis" textAnchor="middle">{p.label}</text>
        ) : null))}
        {active !== null && <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={H - PAD.bottom} className="pf-crosshair" />}
        {segments.map((s) => <path key={s} d={s} className="pf-line-path" />)}
        {points.map((p, i) => p.rate !== null && (
          <circle key={p.label} cx={x(i)} cy={y(p.rate)} r={active === i ? 6 : 4} className="pf-marker" />
        ))}
        {/* Hit targets wider than the marks, one per week. */}
        {points.map((p, i) => (
          <rect
            key={`hit-${p.label}`}
            x={x(i) - step / 2}
            y={PAD.top}
            width={step}
            height={H - PAD.top - PAD.bottom}
            fill="transparent"
            tabIndex={0}
            aria-label={`Week of ${p.label}: ${p.rate === null ? "no answers checked" : `${fmt(p.rate)}${unit === "score" ? " out of 100" : ""} from ${p.answers} answers`}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
          />
        ))}
      </svg>
      {a && (
        <div className="pf-tip" style={{ left: `${(x(active!) / W) * 100}%` }} role="status">
          <strong>Week of {a.label}</strong>
          <span>{a.rate === null ? "No answers checked" : `${fmt(a.rate)}${unit === "score" ? " / 100" : ""} · ${a.answers} answer${a.answers === 1 ? "" : "s"}`}</span>
        </div>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th scope="col">Week of</th><th scope="col">{unit === "score" ? "Score" : "Mention rate"}</th><th scope="col">Answers</th></tr></thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.label}><td>{p.label}</td><td>{p.rate === null ? "—" : fmt(p.rate)}</td><td>{p.answers}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState } from "react";

type Point = { label: string; answers: number; you: number | null; them: number | null };

const W = 640;
const H = 210;
const PAD = { top: 16, right: 92, bottom: 28, left: 40 };

/**
 * Two lines on one 0–100% axis: how often AI answers name you and the
 * competitor each week. Weeks with no answers are gaps, never zero.
 */
export function CompareChart({ points, them }: { points: Point[]; them: string }) {
  const [active, setActive] = useState<number | null>(null);
  const has = points.some((p) => p.you !== null);
  const step = (W - PAD.left - PAD.right) / Math.max(points.length - 1, 1);
  const x = (i: number) => PAD.left + i * step;
  const y = (r: number) => PAD.top + (1 - r) * (H - PAD.top - PAD.bottom);
  const pct = (r: number | null) => (r === null ? "—" : `${Math.round(r * 100)}%`);

  const path = (key: "you" | "them") => {
    const segs: string[] = [];
    let d = "";
    points.forEach((p, i) => {
      const v = p[key];
      if (v === null) {
        if (d) segs.push(d);
        d = "";
        return;
      }
      d += `${d ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    });
    if (d) segs.push(d);
    return segs;
  };

  // Direct labels at each line's latest point.
  const lastIndex = (key: "you" | "them") => points.map((p, i) => (p[key] === null ? -1 : i)).filter((i) => i >= 0).at(-1);
  const labels = (["you", "them"] as const)
    .map((k) => ({ k, i: lastIndex(k) }))
    .filter((l): l is { k: "you" | "them"; i: number } => l.i !== undefined)
    .map((l) => ({ ...l, y: y(points[l.i][l.k]!) }));
  if (labels.length === 2 && Math.abs(labels[0].y - labels[1].y) < 14) {
    const [a, b] = labels[0].y <= labels[1].y ? [labels[0], labels[1]] : [labels[1], labels[0]];
    a.y -= 7;
    b.y += 7;
  }
  const a = active !== null ? points[active] : null;

  return (
    <div className="cmp-chart">
      <ul className="cmp-legend" aria-label="Legend">
        <li><span className="cmp-swatch you" aria-hidden="true" />You</li>
        <li><span className="cmp-swatch them" aria-hidden="true" />{them}</li>
      </ul>
      <div className="cmp-plot">
        {!has && <p className="pf-chart-empty">The trend appears here after your first AI checks.</p>}
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Share of AI answers naming you and ${them}, by week`} onMouseLeave={() => setActive(null)}>
          {[0, 0.5, 1].map((g) => (
            <g key={g}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(g)} y2={y(g)} className="pf-grid-line" />
              <text x={PAD.left - 8} y={y(g)} className="pf-axis" textAnchor="end" dominantBaseline="middle">{Math.round(g * 100)}%</text>
            </g>
          ))}
          {points.map((p, i) => ((points.length - 1 - i) % 2 === 0 ? (
            <text key={p.label} x={x(i)} y={H - 8} className="pf-axis" textAnchor="middle">{p.label}</text>
          ) : null))}
          {active !== null && <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={H - PAD.bottom} className="pf-crosshair" />}
          {(["them", "you"] as const).map((k) => path(k).map((d) => <path key={`${k}${d}`} d={d} className={`cmp-line ${k}`} />))}
          {(["them", "you"] as const).map((k) =>
            points.map((p, i) => p[k] !== null && <circle key={`${k}${p.label}`} cx={x(i)} cy={y(p[k]!)} r={active === i ? 6 : 4} className={`cmp-marker ${k}`} />),
          )}
          {labels.map((l) => (
            <text key={l.k} x={x(l.i) + 10} y={l.y} className="cmp-label" dominantBaseline="middle">
              {l.k === "you" ? "You" : them.length > 12 ? `${them.slice(0, 11)}…` : them} {pct(points[l.i][l.k])}
            </text>
          ))}
          {points.map((p, i) => (
            <rect
              key={`hit-${p.label}`}
              x={x(i) - step / 2}
              y={PAD.top}
              width={step}
              height={H - PAD.top - PAD.bottom}
              fill="transparent"
              tabIndex={0}
              aria-label={`Week of ${p.label}: you ${pct(p.you)}, ${them} ${pct(p.them)}, ${p.answers} answers`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            />
          ))}
        </svg>
        {a && (
          <div className="pf-tip" style={{ left: `${(x(active!) / W) * 100}%` }} role="status">
            <strong>Week of {a.label}</strong>
            {a.answers === 0 ? <span>No answers checked</span> : <>
              <span><i className="cmp-swatch you" aria-hidden="true" /> You {pct(a.you)}</span>
              <span><i className="cmp-swatch them" aria-hidden="true" /> {them} {pct(a.them)}</span>
              <span>{a.answers} answer{a.answers === 1 ? "" : "s"}</span>
            </>}
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>Share of AI answers naming you and {them}, by week</caption>
        <thead><tr><th scope="col">Week of</th><th scope="col">You</th><th scope="col">{them}</th><th scope="col">Answers</th></tr></thead>
        <tbody>
          {points.map((p) => <tr key={p.label}><td>{p.label}</td><td>{pct(p.you)}</td><td>{pct(p.them)}</td><td>{p.answers}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

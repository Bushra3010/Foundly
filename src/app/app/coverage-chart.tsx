"use client";

import { useState } from "react";

export type ChartSeries = { key: string; name: string; self: boolean; slot: number; values: number[] };

const W = 720;
const H = 240;
const PAD = { l: 44, r: 96, t: 14, b: 28 };

const day = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/**
 * Brand coverage over time: one line per brand (the business first, in slot 1),
 * share of AI answers naming it at each check. Hover a check for every brand's value.
 */
export function CoverageChart({ points, series }: { points: string[]; series: ChartSeries[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = points.length;
  const x = (i: number) => (n === 1 ? (PAD.l + W - PAD.r) / 2 : PAD.l + (i * (W - PAD.l - PAD.r)) / (n - 1));
  const y = (v: number) => PAD.t + ((100 - v) * (H - PAD.t - PAD.b)) / 100;
  const self = series.find((s) => s.self);
  const ordered = [...series].sort((a, b) => Number(a.self) - Number(b.self)); // the business is drawn last, on top

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    let best = 0;
    for (let i = 1; i < n; i++) if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    setHover(best);
  }

  return (
    <div className="cv">
      <ul className="cv-legend" aria-label="Brands">
        {series.map((s) => (
          <li key={s.key}>
            <span className="cv-swatch" style={{ background: `var(--series-${s.slot})` }} aria-hidden="true" />
            {s.name}
            {s.self && <em> (you)</em>}
          </li>
        ))}
      </ul>
      <div className="cv-plot">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Share of AI answers naming each brand at each check. ${self ? `${self.name}: ${self.values.map((v, i) => `${day(points[i])} ${v}%`).join(", ")}.` : ""}`}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line className="cv-grid" x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} />
              <text className="cv-axis" x={PAD.l - 8} y={y(v) + 4} textAnchor="end">{v}%</text>
            </g>
          ))}
          {n > 0 && (
            <>
              <text className="cv-axis" x={x(0)} y={H - 8} textAnchor={n === 1 ? "middle" : "start"}>{day(points[0])}</text>
              {n > 1 && <text className="cv-axis" x={x(n - 1)} y={H - 8} textAnchor="end">{day(points[n - 1])}</text>}
            </>
          )}
          {hover !== null && <line className="cv-cross" x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} />}
          {ordered.map((s) => (
            <g key={s.key} style={{ color: `var(--series-${s.slot})` }}>
              {n > 1 && (
                <polyline
                  className={s.self ? "cv-line self" : "cv-line"}
                  points={s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
                />
              )}
              {s.values.map((v, i) => (
                <circle key={i} className="cv-dot" cx={x(i)} cy={y(v)} r={hover === i || n === 1 ? 5 : s.self ? 4 : 3} />
              ))}
            </g>
          ))}
          {self && n > 0 && (
            <text className="cv-direct" x={x(n - 1) + 10} y={y(self.values[n - 1]) + 4}>
              You {self.values[n - 1]}%
            </text>
          )}
        </svg>
        {hover !== null && (
          <div className="cv-tip" style={{ left: `${(x(hover) / W) * 100}%` }} role="status">
            <strong>{day(points[hover])}</strong>
            {[...series]
              .sort((a, b) => b.values[hover] - a.values[hover])
              .map((s) => (
                <span key={s.key}>
                  <i style={{ background: `var(--series-${s.slot})` }} aria-hidden="true" />
                  {s.name}
                  <b>{s.values[hover]}%</b>
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

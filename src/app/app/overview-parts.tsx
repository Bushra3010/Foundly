import type { KeywordResult, Performance } from "@/server/insights";

const STATUS_TEXT: Record<KeywordResult["status"], string> = {
  won: "Recommended",
  partly: "Sometimes",
  lost: "Not yet",
  pending: "Waiting",
};

export function StatusBadge({ status }: { status: KeywordResult["status"] }) {
  return <span className={`ov-badge ${status}`}>{STATUS_TEXT[status]}</span>;
}

export function Mini({ rate }: { rate: number | null }) {
  return (
    <span className="ov-mini" aria-hidden="true">
      <span style={{ width: `${rate ?? 0}%` }} />
    </span>
  );
}

const day = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** Visibility per check over time. Server-rendered SVG, no chart library. */
export function TrendChart({ points }: { points: Performance["trend"] }) {
  const W = 560;
  const H = 190;
  const pad = { l: 44, r: 12, t: 12, b: 26 };
  const x = (i: number) => (points.length === 1 ? (W + pad.l - pad.r) / 2 : pad.l + (i * (W - pad.l - pad.r)) / (points.length - 1));
  const y = (rate: number) => pad.t + ((100 - rate) * (H - pad.t - pad.b)) / 100;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" ");
  const area = points.length > 1 ? `${line} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z` : "";
  const label = points.length
    ? `Visibility per check: ${points.map((p) => `${day(p.at)} ${p.rate}%`).join(", ")}`
    : "No checks yet";
  return (
    <svg className="ov-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line className="grid" x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} />
          <text className="axis" x={pad.l - 8} y={y(v) + 4} textAnchor="end">{v}%</text>
        </g>
      ))}
      {area && <path className="area" d={area} />}
      {points.length > 1 && <path className="line" d={line} />}
      {points.map((p, i) => (
        <circle key={i} className="dot" cx={x(i)} cy={y(p.rate)} r={4.5}>
          <title>{`${day(p.at)}: ${p.rate}% of ${p.answers} answers`}</title>
        </circle>
      ))}
      {points.length > 0 && (
        <>
          <text className="axis" x={x(0)} y={H - 6} textAnchor={points.length === 1 ? "middle" : "start"}>{day(points[0].at)}</text>
          {points.length > 1 && <text className="axis" x={x(points.length - 1)} y={H - 6} textAnchor="end">{day(points[points.length - 1].at)}</text>}
        </>
      )}
    </svg>
  );
}

export function ShareBars({ share }: { share: Performance["share"] }) {
  return (
    <ul className="ov-bars">
      {share.map((b) => (
        <li key={b.key} className={b.self ? "self" : undefined}>
          <div className="ov-bar-top">
            <span>{b.name}</span>
            <span>{b.share}%</span>
          </div>
          <div className="ov-bar" role="presentation">
            <span style={{ width: `${Math.max(b.share, b.answers ? 2 : 0)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The answer text with the business (and competitors) highlighted. Light markdown is flattened. */
export function HighlightedAnswer({ text, self, rivals }: { text: string; self: string[]; rivals: string[] }) {
  const clean = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#{1,6}\s+/gm, "");
  const terms = [...self.map((t) => ({ t, self: true })), ...rivals.map((t) => ({ t, self: false }))]
    .filter((x) => x.t.trim().length >= 2)
    .sort((a, b) => b.t.length - a.t.length);
  if (terms.length === 0) return <div className="an-text">{clean}</div>;
  const re = new RegExp(`(${terms.map((x) => escapeRe(x.t)).join("|")})`, "gi");
  const parts = clean.split(re);
  return (
    <div className="an-text">
      {parts.map((part, i) => {
        const hit = terms.find((x) => x.t.toLowerCase() === part.toLowerCase());
        if (!hit) return part;
        return (
          <mark key={i} className={hit.self ? undefined : "rival"}>
            {part}
          </mark>
        );
      })}
    </div>
  );
}

/** Chart slot per brand: the business is always slot 1; competitors follow in the order they were added. */
export function brandSlots(brands: { key: string }[]): Map<string, number> {
  const m = new Map<string, number>();
  let next = 2;
  for (const b of brands) m.set(b.key, b.key === "self" ? 1 : next <= 8 ? next++ : 0);
  return m;
}

export function Swatch({ slot }: { slot: number }) {
  return <span className="cv-swatch" style={{ background: slot ? `var(--series-${slot})` : "var(--d-line)" }} aria-hidden="true" />;
}

/** Brand ranking: every tracked brand by AI recommendations, with share of voice, coverage, position and tone. */
export function RankingTable({ ranking, slots }: { ranking: Performance["ranking"]; slots: Map<string, number> }) {
  return (
    <div className="ov-table-wrap">
      <table className="ov-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Brand</th>
            <th scope="col">Mentions</th>
            <th scope="col">Share of voice</th>
            <th scope="col">Coverage</th>
            <th scope="col">Avg. position</th>
            <th scope="col">Positive tone</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((b, i) => (
            <tr key={b.key} className={b.self ? "ov-self-row" : undefined}>
              <td className="ov-muted">{i + 1}</td>
              <td>
                <span className="ov-row" style={{ gap: 8, flexWrap: "nowrap" }}>
                  <Swatch slot={slots.get(b.key) ?? 0} />
                  <strong>{b.name}</strong>
                  {b.self && <span className="ov-badge won">You</span>}
                </span>
              </td>
              <td>{b.answers}</td>
              <td><Mini rate={b.share} />{b.share}%</td>
              <td>{b.coverage}%</td>
              <td>{b.avgPosition ? `#${b.avgPosition}` : <span className="ov-muted">—</span>}</td>
              <td>{b.positive === null ? <span className="ov-muted">—</span> : `${b.positive}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

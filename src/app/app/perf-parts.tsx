import type { KeywordResult, Performance } from "@/server/performance";

const STATUS_TEXT: Record<KeywordResult["status"], string> = {
  won: "Recommended",
  partly: "Sometimes",
  lost: "Not yet",
  pending: "Waiting",
};

export function StatusBadge({ status }: { status: KeywordResult["status"] }) {
  return <span className={`pf-badge ${status}`}>{STATUS_TEXT[status]}</span>;
}

export function Mini({ rate }: { rate: number | null }) {
  return (
    <span className="pf-mini" aria-hidden="true">
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
    <svg className="pf-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
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
    <ul className="pf-bars">
      {share.map((b) => (
        <li key={b.key} className={b.self ? "self" : undefined}>
          <div className="pf-bar-top">
            <span>{b.name}</span>
            <span>{b.share}%</span>
          </div>
          <div className="pf-bar" role="presentation">
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

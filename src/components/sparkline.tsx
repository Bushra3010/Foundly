/** A tiny 0–100 trend line for one keyword. Weeks without answers are gaps. */
export function Sparkline({ values, label }: { values: (number | null)[]; label: string }) {
  const W = 96;
  const H = 28;
  const step = W / Math.max(values.length - 1, 1);
  const y = (v: number) => 2 + (1 - v / 100) * (H - 4);
  const segments: string[] = [];
  let d = "";
  values.forEach((v, i) => {
    if (v === null) {
      if (d) segments.push(d);
      d = "";
      return;
    }
    d += `${d ? "L" : "M"}${(i * step).toFixed(1)},${y(v).toFixed(1)}`;
  });
  if (d) segments.push(d);
  const known = values.filter((v): v is number => v !== null);
  const summary = known.length === 0 ? "no checks yet" : known.length === 1 ? `${known[0]} this period` : `from ${known[0]} to ${known.at(-1)}`;
  if (known.length === 0) return <span className="pf-muted" aria-label={`${label}: ${summary}`}>—</span>;
  const lastI = values.map((v, i) => (v === null ? -1 : i)).filter((i) => i >= 0).at(-1)!;
  return (
    <svg viewBox={`-3 0 ${W + 6} ${H}`} width={W} height={H} role="img" aria-label={`${label} score trend, last 8 weeks: ${summary}`} className="pf-spark">
      <line x1={0} x2={W} y1={y(0)} y2={y(0)} className="pf-grid-line" />
      {segments.map((s) => <path key={s} d={s} className="pf-line-path" />)}
      <circle cx={lastI * step} cy={y(values[lastI]!)} r={3} className="pf-marker" />
    </svg>
  );
}

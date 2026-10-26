/**
 * Landing page product preview: the Overview screen with example data for a
 * made-up clinic, so visitors see exactly what they get. Labelled as an example.
 */
const BRANDS = [
  { name: "Green Leaf Dental", you: true, slot: 1, values: [22, 31, 38, 47, 55, 61, 68], mentions: 41, share: 34, pos: "1.6" },
  { name: "Smile Care Clinic", you: false, slot: 2, values: [58, 55, 57, 52, 49, 47, 44], mentions: 37, share: 31, pos: "2.1" },
  { name: "City Dental Studio", you: false, slot: 3, values: [41, 44, 40, 39, 37, 35, 33], mentions: 29, share: 24, pos: "2.8" },
];
const WEEKS = ["1 Sep", "8 Sep", "15 Sep", "22 Sep", "29 Sep", "6 Oct", "13 Oct"];
const W = 560;
const H = 190;
const PAD = { l: 34, r: 76, t: 10, b: 24 };
const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / (WEEKS.length - 1);
const y = (v: number) => PAD.t + ((100 - v) * (H - PAD.t - PAD.b)) / 100;

export const AI_ENGINES = ["ChatGPT", "Gemini", "Perplexity", "Claude"];

export function LandingDashboard() {
  return (
    <figure className="lv-dash" aria-label="Example Foundly dashboard for a dental clinic">
      <div className="lv-dash-top">
        <span className="lv-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="lv-dash-url">foundly.co.in/app</span>
        <span className="lv-example">Example</span>
      </div>
      <div className="lv-dash-body">
        <aside className="lv-dash-nav" aria-hidden="true">
          <b>AI search</b>
          <span className="on">Overview</span>
          <span>Prompts</span>
          <span>Competitors</span>
          <span>Citations</span>
          <b>Optimize</b>
          <span>GEO audit &amp; fixes</span>
          <span>Connections</span>
        </aside>
        <div className="lv-dash-main">
          <div className="lv-dash-head">
            <div>
              <small>Overview</small>
              <strong>Green Leaf Dental</strong>
            </div>
            <div className="lv-tabs" aria-hidden="true">
              <span>7d</span><span className="on">30d</span><span>90d</span>
            </div>
          </div>
          <div className="lv-tabs wide" aria-hidden="true">
            <span className="on">All</span>
            {AI_ENGINES.map((e) => <span key={e}>{e}</span>)}
          </div>
          <div className="lv-kpis">
            {[
              ["Brand mentions", "41", "of 60 answers"],
              ["Coverage", "68%", "+46 pts"],
              ["Share of voice", "34%", "#1 of 3"],
              ["Avg. position", "#1.6", "when listed"],
            ].map(([k, v, d], i) => (
              <div key={k} className={i === 0 ? "lv-kpi hero" : "lv-kpi"}>
                <span>{k}</span>
                <strong>{v}</strong>
                <em>{d}</em>
              </div>
            ))}
          </div>
          <div className="lv-chart">
            <div className="lv-chart-head">
              <strong>Brand coverage over time</strong>
              <ul>
                {BRANDS.map((b) => (
                  <li key={b.name}><i style={{ background: `var(--lv-s${b.slot})` }} />{b.you ? "You" : b.name}</li>
                ))}
              </ul>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Example: the clinic's share of AI answers rises from 22% to 68% over seven weeks while two competitors fall.">
              {[0, 50, 100].map((v) => (
                <g key={v}>
                  <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="lv-grid" />
                  <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" className="lv-axis">{v}%</text>
                </g>
              ))}
              <text x={x(0)} y={H - 6} className="lv-axis">{WEEKS[0]}</text>
              <text x={x(WEEKS.length - 1)} y={H - 6} textAnchor="end" className="lv-axis">{WEEKS.at(-1)}</text>
              {[...BRANDS].reverse().map((b) => (
                <g key={b.name} style={{ color: `var(--lv-s${b.slot})` }}>
                  <polyline className={b.you ? "lv-line you" : "lv-line"} points={b.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
                  <circle cx={x(WEEKS.length - 1)} cy={y(b.values.at(-1)!)} r={b.you ? 5 : 3.5} className="lv-dot" />
                </g>
              ))}
              <text x={x(WEEKS.length - 1) + 10} y={y(68) + 4} className="lv-direct">You 68%</text>
            </svg>
          </div>
          <table className="lv-rank">
            <thead>
              <tr><th>Brand</th><th>Mentions</th><th>Share of voice</th><th>Avg. position</th></tr>
            </thead>
            <tbody>
              {BRANDS.map((b) => (
                <tr key={b.name} className={b.you ? "you" : undefined}>
                  <td><i style={{ background: `var(--lv-s${b.slot})` }} />{b.name}{b.you && <em>You</em>}</td>
                  <td>{b.mentions}</td>
                  <td><span className="lv-bar"><span style={{ width: `${b.share * 2}%` }} /></span>{b.share}%</td>
                  <td>#{b.pos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <figcaption className="sr-only">Example data, not a real business.</figcaption>
    </figure>
  );
}

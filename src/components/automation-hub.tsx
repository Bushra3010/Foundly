import Link from "next/link";
import { Icon } from "@/components/icon";
import { DEPARTMENTS } from "@/lib/automation-catalog";

// Hero graphic: one core wired to a ring of nodes. Nodes with an href are links.
const R = 39; // node ring radius, % of the box

type HubNode = { key: string; label: string; icon: string; href?: string; on?: boolean };

export function OrbitHub({ core, nodes, label }: { core: { icon: string; title: string; sub: string }; nodes: readonly HubNode[]; label: string }) {
  const points = nodes.map((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a), i };
  });
  const Wrap = points.some(p => p.href) ? "nav" : "div";
  return (
    <div className="ah">
      <svg className="ah-lines" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={R} className="ah-orbit" />
        <circle cx="50" cy="50" r="24" className="ah-orbit ah-orbit-in" />
        {points.map(p => (
          <line key={p.key} x1="50" y1="50" x2={p.x} y2={p.y} className={`ah-line${p.on ? " on" : ""}`} style={{ animationDelay: `${p.i * -0.35}s` }} />
        ))}
      </svg>
      <div className="ah-core" aria-hidden="true">
        <span className="ah-ring" /><span className="ah-ring ah-ring-2" />
        <Icon name={core.icon} size={26} />
        <strong>{core.title}</strong>
        <small>{core.sub}</small>
      </div>
      <Wrap className="ah-nodes" aria-label={label}>
        {points.map(p => {
          const body = <><span className="ah-node-icon"><Icon name={p.icon} size={18} /></span><span className="ah-node-label">{p.label}</span></>;
          const props = { className: `ah-node${p.on ? " on" : ""}`, style: { left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.i * 70}ms` } };
          return p.href
            ? <Link key={p.key} href={p.href} scroll={false} aria-current={p.on ? "page" : undefined} {...props}>{body}</Link>
            : <span key={p.key} {...props}>{body}</span>;
        })}
      </Wrap>
    </div>
  );
}

export function AutomationHub({ current }: { current: string }) {
  return (
    <OrbitHub
      label="Departments"
      core={{ icon: "spark", title: "AI", sub: "works 24/7" }}
      nodes={DEPARTMENTS.map(d => ({ key: d.id, label: d.label, icon: d.icon, href: `/automation?team=${d.id}#department`, on: d.id === current }))}
    />
  );
}

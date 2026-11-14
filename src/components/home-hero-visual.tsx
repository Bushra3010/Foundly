"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "./icon";

// Homepage hero art: one tab per kind of software Foundly builds, each with its own small animated scene.
// Rotates on its own, pauses on hover, and any tab can be picked. Every value shown is sample data.

export type HeroService = { key: "erp" | "crm" | "app" | "ai" | "web"; label: string; href: string; icon: string; count: number };

const STEP = 4200;
const SHORT: Record<HeroService["key"], string> = { erp: "ERP", crm: "CRM", app: "Apps", ai: "AI", web: "Websites" };
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const m = window.matchMedia(motionQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

function Erp() {
  const bars = [42, 58, 50, 72, 64, 86, 94];
  return (
    <div className="hv-scene hv-erp">
      <div className="hv-head"><b>Factory dashboard</b><span>Today</span></div>
      <div className="hv-kpis">
        <div><small>Orders</small><strong>128</strong><em>+14%</em></div>
        <div><small>Stock value</small><strong>₹18.4L</strong><em>3 godowns</em></div>
        <div><small>On-time</small><strong>94%</strong><em>+3 pts</em></div>
      </div>
      <div className="hv-bars" aria-hidden="true">
        {bars.map((h, i) => <i key={i} style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }} />)}
      </div>
      <div className="hv-row"><span className="hv-pill">WO-881</span>Steel brackets · Line 2<span className="hv-track"><i /></span></div>
    </div>
  );
}

function Crm() {
  const cols: [string, string[]][] = [["New", ["Rahul · 2BHK", "Neha · Office"]], ["Follow-up", ["Amit · Villa"]], ["Won", []]];
  return (
    <div className="hv-scene hv-crm">
      <div className="hv-head"><b>Sales pipeline</b><span>12 leads today</span></div>
      <div className="hv-board">
        {cols.map(([name, cards], c) => (
          <div key={name} className="hv-col">
            <small>{name}</small>
            {cards.map((t, i) => <div key={t} className="hv-card" style={{ animationDelay: `${(c * 2 + i) * 140}ms` }}><span>{t.charAt(0)}</span>{t}</div>)}
            {c === 2 && <div className="hv-card hv-won"><span>P</span>Priya · Shop<em>₹2,40,000</em></div>}
          </div>
        ))}
      </div>
      <div className="hv-toast"><Icon name="check" size={13} /> Deal won · WhatsApp sent to Priya</div>
    </div>
  );
}

function App() {
  return (
    <div className="hv-scene hv-app">
      <div className="hv-phone">
        <div className="hv-notch" />
        <small>Good morning</small>
        <b>Book a service</b>
        <div className="hv-app-card"><span><Icon name="spark" size={14} /></span><div><strong>AC deep cleaning</strong><small>Tomorrow · 10:00 AM</small></div></div>
        <div className="hv-app-card"><span><Icon name="business" size={14} /></span><div><strong>Technician</strong><small>Arriving in 25 min</small></div></div>
        <div className="hv-app-btn">Confirm booking</div>
        <div className="hv-app-nav"><i className="on" /><i /><i /><i /></div>
      </div>
      <div className="hv-push"><Icon name="check" size={13} /> Booking confirmed</div>
    </div>
  );
}

function Ai() {
  return (
    <div className="hv-scene hv-ai">
      <div className="hv-head"><b>WhatsApp AI assistant</b><span className="hv-online">online</span></div>
      <div className="hv-chat">
        <p className="hv-msg in" style={{ animationDelay: "0ms" }}>Hi, do you have 2BHK flats in Pune under ₹80L?</p>
        <p className="hv-typing" aria-hidden="true"><i /><i /><i /></p>
        <p className="hv-msg out" style={{ animationDelay: "1500ms" }}>Yes! 3 options in Wakad and Baner. Want to visit this Saturday?</p>
        <p className="hv-msg in" style={{ animationDelay: "2300ms" }}>Saturday 11 AM works.</p>
        <p className="hv-msg out ok" style={{ animationDelay: "3000ms" }}><Icon name="check" size={12} /> Visit booked · added to CRM</p>
      </div>
    </div>
  );
}

function Web() {
  return (
    <div className="hv-scene hv-web">
      <div className="hv-url"><i /><i /><i /><span>yourstore.in</span><em className="hv-cart">Cart · 2</em></div>
      <div className="hv-banner"><b>Festive sale</b><small>Up to 30% off</small></div>
      <div className="hv-products">
        {["Kurta set", "Brass lamp", "Silk saree"].map((p, i) => (
          <div key={p} style={{ animationDelay: `${i * 120}ms` }}><span /><b>{p}</b><small>₹{[1299, 899, 3499][i].toLocaleString("en-IN")}</small></div>
        ))}
      </div>
      <div className="hv-toast"><Icon name="check" size={13} /> New order · ₹2,198 paid via UPI</div>
    </div>
  );
}

const SCENES = { erp: Erp, crm: Crm, app: App, ai: Ai, web: Web };

export function HomeHeroVisual({ services, projects, demos }: { services: HeroService[]; projects: number; demos: number }) {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const reduce = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const paused = reduce || hover;

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % services.length), STEP);
    return () => window.clearTimeout(id);
  }, [paused, active, services.length]);

  const s = services[active];
  const Scene = SCENES[s.key];

  return (
    <div className="hv" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <span className="hv-glow" aria-hidden="true" />
      <div className="hv-tabs" role="tablist" aria-label="Software we build">
        {services.map((t, i) => (
          <button key={t.key} type="button" role="tab" aria-selected={i === active} aria-label={t.label} className={i === active ? "on" : ""} onClick={() => setActive(i)}>
            <Icon name={t.icon} size={14} /><span>{SHORT[t.key]}</span>
            {i === active && !paused && <i className="hv-progress" style={{ animationDuration: `${STEP}ms` }} />}
          </button>
        ))}
      </div>
      <div className="hv-stage" role="tabpanel" aria-label={s.label} key={s.key}>
        <Scene />
      </div>
      <div className="hv-foot">
        <Link href={s.href}>See {s.count} {s.label} projects <Icon name="arrow" size={14} /></Link>
        <span><b>{projects}</b> projects · <b>{demos}</b> live demos</span>
      </div>
    </div>
  );
}

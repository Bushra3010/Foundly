"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "./icon";
import type { AutomationFlow as Flow } from "@/lib/automation-catalog";

// Animated diagram of one automation: trigger → two AI steps → three actions → result.
// Phase -1 is the empty diagram; phases 0–4 light each column in turn.

const LENGTH: Record<number, number> = { [-1]: 700, 0: 1900, 1: 2100, 2: 2100, 3: 2300, 4: 3000 };
const KINDS = ["Trigger", "AI step 1", "AI step 2", "Actions", "Result"] as const;

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const m = window.matchMedia(motionQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

const typed = (text: string, t: number, at = 250, speed = 28) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - at) / speed))));

export function AutomationFlow({ flow, name }: { flow: Flow; name: string }) {
  const [{ phase, t }, setState] = useState({ phase: -1, t: 0 });
  const [playing, setPlaying] = useState(true);
  const [userPlayed, setUserPlayed] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduce = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const ref = useRef<HTMLDivElement>(null);
  // With reduced motion nothing plays on its own; pressing Play still runs the walkthrough.
  const animate = !reduce || userPlayed;
  const running = playing && visible && animate;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(e => setVisible(Boolean(e[0]?.isIntersecting)), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      setState(s => (s.t + dt >= LENGTH[s.phase] ? { phase: s.phase === 4 ? -1 : s.phase + 1, t: 0 } : { phase: s.phase, t: s.t + dt }));
    }, 40);
    return () => window.clearInterval(id);
  }, [running]);

  // With reduced motion the whole diagram is shown at once until someone presses Play or picks a step.
  const shown = !animate && playing ? 4 : phase;
  const time = animate ? t : 1e9;
  const jump = (i: number) => { setState({ phase: i, t: 1e9 }); setPlaying(false); };
  const replay = () => { setState({ phase: -1, t: 0 }); setUserPlayed(true); setPlaying(true); };
  const togglePlay = () => {
    if (running) { setPlaying(false); return; }
    if (phase === 4) setState({ phase: -1, t: 0 });
    else if (t >= LENGTH[phase]) setState({ phase: phase === 4 ? -1 : phase + 1, t: 0 });
    setUserPlayed(true);
    setPlaying(true);
  };

  const state = (i: number) => (i < shown ? "done" : i === shown ? "on" : "next");

  const node = (i: number, [label, text]: readonly [string, string], extra?: string) => {
    const thinking = i === shown && (i === 1 || i === 2) && time < 600;
    const at = thinking || i === 1 || i === 2 ? 600 : 250;
    const value = i < shown ? text : i === shown ? typed(text, time, at) : "";
    return (
      <button type="button" className={`af-node af-${state(i)}${extra ? ` ${extra}` : ""}`} onClick={() => jump(i)} aria-label={`${KINDS[i]}: ${label}. ${text}`}>
        <span className="af-kind">{i === 0 ? <Icon name="spark" size={12} /> : i === 4 ? <Icon name="check" size={12} /> : <Icon name="improve" size={12} />} {KINDS[i]}</span>
        <strong>{label}</strong>
        <span className="af-sample" aria-hidden="true">
          {thinking ? <span className="af-think"><i /><i /><i /></span> : value}
          {!thinking && i === shown && animate && value.length < text.length && time >= at && <i className="af-caret" />}
        </span>
      </button>
    );
  };

  const link = (target: number, split = false) => (
    <div className={`af-link af-${state(target)}${split ? " split" : ""}`} aria-hidden="true">
      <i className="af-wire" />
      {target === shown && animate && <i className="af-packet" key={`${target}-${phase}`} />}
    </div>
  );

  return (
    <div className="af" ref={ref}>
      <div className="af-head">
        <div>
          <h2>How the {name.replace(/^AI /, "")} runs</h2>
          <p>Follow one real-world example from the first signal to the finished result. Click any step to pause on it.</p>
        </div>
        <div className="af-controls">
          <button type="button" onClick={togglePlay}>{running ? "Pause" : "Play"}</button>
          <button type="button" onClick={replay}>Replay</button>
        </div>
      </div>
      <div className="af-track">
        {node(0, flow.trigger, "af-trigger")}
        {link(1)}
        {node(1, flow.thinking[0], "af-ai")}
        {link(2)}
        {node(2, flow.thinking[1], "af-ai")}
        {link(3, true)}
        <div className={`af-actions af-${state(3)}`}>
          {flow.actions.map(([label, text], k) => (
            <button
              type="button"
              key={label}
              className={`af-node af-action af-${state(3)}${shown === 3 && time < 250 + k * 450 ? " wait" : ""}`}
              onClick={() => jump(3)}
              aria-label={`Action: ${label}. ${text}`}
            >
              <span className="af-kind"><Icon name="check" size={12} /> Action {k + 1}</span>
              <strong>{label}</strong>
              <span className="af-sample" aria-hidden="true">{shown > 3 || (shown === 3 && time >= 250 + k * 450) ? text : ""}</span>
            </button>
          ))}
        </div>
        {link(4)}
        {node(4, flow.result, "af-result")}
      </div>
      <p className="af-note"><Icon name="shield" size={14} /> You decide which steps need a person’s approval. Every action is logged, so the team can see what the AI did and why.</p>
    </div>
  );
}

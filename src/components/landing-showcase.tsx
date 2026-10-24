"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "./icon";
import { AiLogo, assistants } from "./landing-ai-answers";

const products = [
  { id: "website", label: "Websites", eyebrow: "YOUR OWN CORNER OF THE INTERNET", title: "Connect yours,\nor we build it.", body: "Already online? Connect your website and we check what AI can read. No website yet? Our team designs and builds a professional one for your business.", cta: "Get your website", color: "orange", length: 6800 },
  { id: "business", label: "Business profile", eyebrow: "THE DETAILS MAKE THE DIFFERENCE", title: "Your business story.\nAll the right details.", body: "Help people understand what makes you, you. Bring your services, service areas and contact information into one clear profile.", cta: "Build your profile", color: "green", length: 6800 },
  { id: "visibility", label: "AI visibility", eyebrow: "A CLEARER PICTURE OF YOUR PRESENCE", title: "Know how AI\ntalks about you.", body: "Explore how supported AI answers mention your business, with saved evidence that helps you see the bigger picture.", cta: "Explore AI visibility", color: "purple", length: 7400 },
];

// Each preview builds itself over its timeline; END shows it finished.
const END = 1e9;
const on = (t: number, at: number) => t >= at;
const pop = (t: number, at: number) => `sc-pop${on(t, at) ? " in" : ""}`;
const typed = (text: string, at: number, t: number, speed = 38) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - at) / speed))));

function Typing({ text, at, t, speed }: { text: string; at: number; t: number; speed?: number }) {
  const v = typed(text, at, t, speed);
  // The hidden full text holds the space, so the layout doesn't jump while typing.
  return <span className="sc-type"><span className="sc-ghost">{text}</span><span>{v}{on(t, at) && v.length < text.length && <i className="sc-caret" />}</span></span>;
}

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const m = window.matchMedia(motionQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

function WebsitePreview({ t }: { t: number }) {
  const line1 = "A little more room";
  const line2 = "for beautiful living.";
  const at2 = 700 + line1.length * 38;
  return (
    <div className="website-example">
      <div className={`example-nav ${pop(t, 200)}`}><strong>the sunday studio<span>✳</span></strong><span>Our story&nbsp;&nbsp; Services</span></div>
      <div className="example-hero">
        <span className={pop(t, 450)}>THOUGHTFUL SPACES. EVERYDAY JOY.</span>
        <h3><Typing text={line1} at={700} t={t} />{on(t, at2) && <br />}<Typing text={line2} at={at2} t={t} /></h3>
        <p className={pop(t, 2300)}>Interior styling for the spaces you call home.</p>
        <span className={`example-button ${pop(t, 2550)}`}>Explore our services ↗</span>
      </div>
      <div className={`example-interior sc-rise${on(t, 1000) ? " in" : ""}`} aria-hidden="true"><div className="interior-sun" /><div className="interior-arch" /><div className="interior-table" /><div className="interior-vase" /><div className="interior-stem" /></div>
      <div className={`example-bottom ${pop(t, 2800)}`}><span>Spaces with soul.</span><span>Designed around you. ↗</span></div>
    </div>
  );
}

function ProfilePreview({ t }: { t: number }) {
  const details = [
    { label: "WHAT WE DO", value: "Home styling · Space planning · Colour consultation", at: 2100 },
    { label: "WHERE WE WORK", value: "Pune, Baner & Kothrud", at: 2700 },
    { label: "LET’S TALK", value: "hello@example.com", at: 3200 },
  ];
  return (
    <div className="profile-example">
      <span className={`profile-monogram ${pop(t, 200)}`}>s<span>✳</span></span>
      <h3><Typing text="The Sunday Studio" at={450} t={t} /></h3>
      <p><Typing text="Interior styling · Pune" at={1200} t={t} speed={22} /></p>
      <span className={`example-tag ${pop(t, 1750)}`}><Icon name="check" size={12} /> Business details in one place</span>
      {details.map(d => (
        <div key={d.label} className={`profile-detail ${pop(t, d.at)}`}><span>{d.label}</span><p><Typing text={d.value} at={d.at + 150} t={t} speed={14} /></p></div>
      ))}
    </div>
  );
}

function VisibilityPreview({ t }: { t: number }) {
  const mentions = on(t, 2400) ? Math.min(3, Math.floor((t - 2400) / 260) + 1) : 0;
  return (
    <div className="visibility-example">
      <span className={`example-tag ${pop(t, 200)}`}>ILLUSTRATIVE REPORT</span>
      <h3 className={pop(t, 400)}>A clearer view of<br />your AI presence.</h3>
      <div className="visibility-query"><Icon name="spark" size={17} /><span>“<Typing text="Interior stylists in Pune" at={800} t={t} />”</span>{on(t, 1900) && !on(t, 2400) && <span className="sc-scan">Checking</span>}</div>
      <div className={`visibility-row ${pop(t, 2300)}`}>
        <span>Business mentions</span>
        <span className="sc-logos">{assistants.map((a, i) => <i key={a.id} className={i < mentions ? "hit" : ""}><AiLogo id={a.id} color={a.accent} size={11} /></i>)} {mentions} of 4</span>
      </div>
      <div className={`visibility-row ${pop(t, 3300)}`}><span>Answer evidence</span><span><Icon name="reports" size={14} /> 4 saved sources</span></div>
      <div className={`visibility-row ${pop(t, 3800)}`}><span>Your next step</span><span>Add your opening hours ↗</span></div>
      <p className={pop(t, 4300)}>See the answer. Understand the context.</p>
    </div>
  );
}

const previews = [WebsitePreview, ProfilePreview, VisibilityPreview];
const floats = [
  { icon: "check", text: "Your next chapter, online.", at: 3200 },
  { icon: "business", text: "The full picture of your business.", at: 3800 },
  { icon: "visibility", text: "Insights backed by evidence.", at: 4600 },
];
const toolbar = [
  (t: number) => (on(t, 2800) ? "Your business website" : "Our team is building it…"),
  (t: number) => (on(t, 3500) ? "Your business profile" : "Filling in your profile…"),
  (t: number) => (on(t, 2400) ? "Your visibility workspace" : "Asking AI assistants…"),
];

export function LandingShowcase() {
  const [{ active, t }, setState] = useState({ active: 0, t: 0 });
  const [manual, setManual] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduce = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const ref = useRef<HTMLDivElement>(null);
  const playing = !reduce && !hovered && visible;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(e => setVisible(Boolean(e[0]?.isIntersecting)), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      setState(s => {
        const next = s.t + dt;
        if (next < products[s.active].length) return { active: s.active, t: next };
        // A tab the visitor picked stays put once it has finished building.
        return manual ? s : { active: (s.active + 1) % products.length, t: 0 };
      });
    }, 40);
    return () => window.clearInterval(id);
  }, [playing, manual]);

  const pick = (i: number) => { setManual(true); setState({ active: i, t: 0 }); };
  const product = products[active];
  const Preview = previews[active];
  const shown = reduce ? END : t;
  const float = floats[active];

  return <div className="showcase-shell" ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <div className="showcase-tabs" role="tablist" aria-label="Foundly products">{products.map((item,i)=><button key={item.id} id={`product-tab-${item.id}`} type="button" role="tab" aria-selected={i===active} aria-controls={`product-panel-${item.id}`} tabIndex={i===active ? 0 : -1} onClick={()=>pick(i)} onKeyDown={event=>{let next=i;if(event.key==="ArrowRight") next=(i+1)%products.length;else if(event.key==="ArrowLeft") next=(i+products.length-1)%products.length;else if(event.key==="Home") next=0;else if(event.key==="End") next=products.length-1;else return;event.preventDefault();pick(next);document.getElementById(`product-tab-${products[next].id}`)?.focus();}}><span className={`product-dot ${item.color}`} /><span>{item.label}</span><Icon name={item.id} size={17} />{i===active && !manual && !reduce && <span className="showcase-progress" aria-hidden="true" style={{ width: `${Math.min(100, (t / item.length) * 100)}%` }} />}</button>)}</div>
    <div className={`showcase-panel ${product.color}`} id={`product-panel-${product.id}`} role="tabpanel" aria-labelledby={`product-tab-${product.id}`} tabIndex={0}>
      <div className="showcase-copy" key={`copy-${product.id}`}><span className="showcase-label">{product.eyebrow}</span><h2>{product.title}</h2><p>{product.body}</p><Link href="/signup" className="showcase-cta">{product.cta}<Icon name="arrow" size={18} /></Link><span className="showcase-example-label">An illustrative look at what you can create</span></div>
      <div className="showcase-art" aria-hidden="true"><div className="showcase-orb" /><div className="preview-window" key={`win-${product.id}`}><div className="preview-toolbar"><span className="window-dots">● ● ●</span><span>{toolbar[active](shown)}</span><Icon name="shield" size={12} /></div>
      <Preview t={shown} />
      </div><div className={`showcase-floating ${pop(shown, float.at)}`}><span><Icon name={float.icon} size={17} /></span>{float.text}</div></div>
    </div>
  </div>;
}

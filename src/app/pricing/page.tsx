import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { LandingPricing } from "@/components/landing-pricing";
import { ALL_PLATFORMS, PLATFORM_LABEL, planSpec } from "@/lib/plans";
import "../landing.css";
import "../landing-v2.css";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Basic GEO on ChatGPT, Gemini, Perplexity and Claude, with the ChatGPT Ads service in every plan. From ₹15,000 a month.",
  alternates: { canonical: "/pricing" },
};

const growth = planSpec("growth");
const pro = planSpec("pro");
const agency = planSpec("agency");
const every = (s: string | null) => (s === "daily" ? "Every day" : s === "weekly" ? "Every week" : s === "biweekly" ? "Every 2 weeks" : "On demand");

const PLANS = [growth, pro, agency];

// One row per capability; ✓ / text per plan, in the order the plan cards show.
const ROWS: { group: string; rows: [string, string, string, string][] }[] = [
  {
    group: "ChatGPT Ads",
    rows: [["ChatGPT Ads service", "✓", "✓", "✓"]],
  },
  {
    group: "Basic GEO",
    rows: [
      ["AI platforms", ...PLANS.map((p) => String(p.platforms.length))] as [string, string, string, string],
      ...ALL_PLATFORMS.map((k) => [PLATFORM_LABEL[k], ...PLANS.map((p) => (p.platforms.includes(k) ? "✓" : "—"))] as [string, string, string, string]),
    ],
  },
  {
    group: "AI search tracking",
    rows: [
      ["Prompts tracked", String(growth.keywords), String(pro.keywords), `${agency.keywords} per business`],
      ["Scheduled checks", every(growth.checks), every(pro.checks), every(agency.checks)],
      ["Check now (uses credits)", "✓", "✓", "✓"],
      ["Businesses", "1", "1", String(agency.maxWorkspaces)],
    ],
  },
  {
    group: "Analytics",
    rows: [
      ["Brand mentions, coverage, share of voice, position", "✓", "✓", "✓"],
      ["Competitor ranking (up to 10)", "✓", "✓", "✓"],
      ["Citations: domains and pages AI reads", "✓", "✓", "✓"],
      ["Tone of mentions (estimated)", "✓", "✓", "✓"],
      ["Full answer for every prompt", "✓", "✓", "✓"],
      ["CSV export", "✓", "✓", "✓"],
    ],
  },
  {
    group: "Optimize",
    rows: [
      ["Prompt research with AI", "✓", "✓", "✓"],
      ["GEO audit of your website", "✓", "✓", "✓"],
      ["Recommendations and fixes", "✓", "✓", "✓"],
      ["Weekly GEO upkeep: profiles refreshed, pages resubmitted", "✓", "✓", "✓"],
      ["Directory profile with schema", "✓", "✓", "✓"],
    ],
  },
];

const FAQ = [
  { q: "What is included in every plan?", a: "Every plan includes our ChatGPT Ads service and basic GEO. The plans differ in how many AI platforms get basic GEO: ChatGPT on Growth, ChatGPT and Gemini on Pro, and all four (ChatGPT, Gemini, Perplexity and Claude) on Enterprise." },
  { q: "What counts as a prompt?", a: "One question you want AI assistants to answer about your kind of business, like “best dentist in Indore”. Each check asks it on every AI platform in your plan." },
  { q: "How many prompts do I need?", a: "Start with your main service in your city, then add one per important service or area. Most local businesses begin with 5 and grow from there." },
  { q: "Can I add more prompts later?", a: "Yes. Add prompts one at a time on your plan (see the price on each card), or move to a larger plan." },
  { q: "Can I cancel any time?", a: "Yes. Plans are monthly and you can cancel from Settings. Your saved answers and history stay available." },
  { q: "Do you guarantee AI recommendations?", a: "No one can. Foundly shows what AI actually says, with the saved answers as evidence, and the changes most likely to help." },
];

export default function PricingPage() {
  return (
    <div className="foundly-landing">
      <LandingHeader />
      <main id="main" className="landing-main">
        <section className="lv-hero lv-pricing-hero" aria-labelledby="pricing-hero-title">
          <p className="landing-eyebrow"><span /> PRICING</p>
          <h1 id="pricing-hero-title">ChatGPT Ads and GEO,<br />priced by platform.</h1>
          <p className="lv-hero-sub">Every plan includes our ChatGPT Ads service. Start with basic GEO on ChatGPT from ₹15,000 a month, or add Gemini, Perplexity and Claude.</p>
        </section>

        <LandingPricing />

        <section className="landing-section" aria-labelledby="compare-title">
          <div className="lv-heading">
            <p className="landing-eyebrow"><span /> COMPARE PLANS</p>
            <h2 id="compare-title">Everything in each plan</h2>
          </div>
          <div className="lv-compare-wrap">
            <table className="lv-compare">
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Feature</span></th>
                  <th scope="col">{growth.name}</th>
                  <th scope="col" className="hl">{pro.name}</th>
                  <th scope="col">{agency.name}</th>
                </tr>
              </thead>
              {ROWS.map((g) => (
                <tbody key={g.group}>
                  <tr className="lv-compare-group"><th scope="rowgroup" colSpan={4}>{g.group}</th></tr>
                  {g.rows.map(([label, ...cells]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      {cells.map((c, i) => (
                        <td key={i} className={i === 1 ? "hl" : undefined}>
                          {c === "✓" ? <Icon name="check" size={16} /> : c === "—" ? <span className="lv-muted" aria-label="Not included">—</span> : c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </section>

        <section id="faq" className="landing-section" aria-labelledby="pfaq-title">
          <div className="landing-faq faq-panel">
            <div className="faq-intro">
              <span className="faq-mark" aria-hidden="true">✳</span>
              <p className="landing-eyebrow">PRICING FAQ</p>
              <h2 id="pfaq-title">Questions about<br /><em>plans.</em></h2>
              <p className="faq-description">Anything else? Write to us from your account and we&apos;ll help you choose.</p>
              <Link href="/signup" className="faq-start">Get started <Icon name="arrow" size={18} /></Link>
            </div>
            <div className="faq-questions">
              {FAQ.map((item, index) => (
                <details key={item.q} name="pricing-faq" open={index === 0}>
                  <summary><small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small><b>{item.q}</b><span aria-hidden="true">+</span></summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-final" style={{ marginTop: 40 }}>
          <span className="final-spark" aria-hidden="true">✳</span>
          <p className="landing-eyebrow">CHATGPT ADS IN EVERY PLAN.</p>
          <h2>Find out what AI<br />tells your customers.</h2>
          <div className="final-buttons"><Link href="/signup" className="landing-button lime">Get started <Icon name="arrow" size={18} /></Link></div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

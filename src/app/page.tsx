import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LandingAiAnswers } from "@/components/landing-ai-answers";
import { AI_ENGINES, LandingDashboard } from "@/components/landing-dashboard";
import { LandingPricing } from "@/components/landing-pricing";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { FitSections } from "@/components/fit-sections";
import "./landing.css";
import "./landing-v2.css";

export const metadata: Metadata = {
  title: "Foundly — Get recommended by ChatGPT, Gemini, Perplexity and Claude",
  description:
    "Foundly tracks how AI assistants talk about your business, shows who they recommend instead, and tells you what to fix to be recommended. Built for local businesses in India.",
};

const FEATURES = [
  { icon: "spark", title: "Prompt research", body: "See the questions customers ask AI to find a business like yours, and pick the ones to track." },
  { icon: "visibility", title: "AI search analytics", body: "Brand mentions, coverage, share of voice and position across ChatGPT, Gemini, Perplexity and Claude." },
  { icon: "competitors", title: "Competitor benchmarking", body: "Who AI recommends instead of you, for which questions, and how that changes week by week." },
  { icon: "sources", title: "Citation analysis", body: "The websites and listings AI reads before it answers, so you know where you need to be." },
  { icon: "improve", title: "GEO audit", body: "Checks whether AI crawlers can read your website and whether it states the facts AI quotes." },
  { icon: "connections", title: "Fixes and listings", body: "Step-by-step fixes, and your Google and Facebook profiles kept in line with your details." },
];

const QUESTIONS = [
  { q: "Does ChatGPT even mention my business?", a: "Foundly asks the assistants your customers use the questions they ask, and shows every answer with your name highlighted." },
  { q: "Who does AI recommend instead of me?", a: "Every competitor named in the same answers is ranked next to you, with how often and in what position." },
  { q: "Why does AI pick them?", a: "See the sites each answer cited. If a directory or article keeps coming up, that is where you need to appear." },
  { q: "Can AI read my website?", a: "The GEO audit checks crawler access and the facts AI needs: services, areas, hours, proof and contact details." },
  { q: "What should I fix first?", a: "Recommendations are ordered by what most often moves results, and each one tells you exactly what to change." },
  { q: "Is it working?", a: "Every check is saved, so coverage, share of voice and position show as a trend you can compare over time." },
];

const STEPS = [
  { n: "01", title: "Tell us about your business", body: "Your name, what you do, your city and website." },
  { n: "02", title: "Pick your prompts", body: "AI suggests what customers ask. Keep the ones that matter." },
  { n: "03", title: "Add competitors", body: "AI suggests who it already recommends nearby." },
  { n: "04", title: "Start tracking", body: "Foundly checks every assistant and shows your results." },
];

const FAQ = [
  { q: "What is Foundly?", a: "Foundly is an AI search visibility tool for local businesses. It asks ChatGPT, Gemini, Perplexity and Claude the questions your customers ask, records whether they recommend you, compares you with competitors, and tells you what to fix." },
  { q: "How is this different from Google ranking tools?", a: "SEO tools track links on a results page. Foundly tracks the answer itself: whether an AI assistant names your business, where in its list, what it says about you and which sources it relied on." },
  { q: "Why do my own searches show different answers?", a: "AI answers vary with the person, the wording, the location and the day. Foundly asks the same questions the same way on a schedule, so the trend is comparable even when single answers differ." },
  { q: "Do I need a website?", a: "No. Foundly tracks you either way. If you don't have one, our team can build one for you, and AI assistants trust businesses with a clear website more." },
  { q: "Will Foundly guarantee AI recommendations?", a: "No one can. AI answers change, and Foundly never promises rankings. It shows what AI actually says, with the saved answers as evidence, and the changes most likely to help." },
  { q: "How often are answers checked?", a: "On your plan's schedule, and any time you press Check now. Each check asks every connected assistant every prompt you track." },
  { q: "Can I track my competitors?", a: "Yes. Add up to 10. They're found in the same answers and ranked by mentions, share of voice, coverage, position and tone." },
  { q: "Is there a free trial?", a: "Yes. Start free with a few prompts and see your first results before you choose a plan." },
];

function EngineRow({ label }: { label?: string }) {
  return (
    <div className="lv-engines" aria-label={label ?? "AI assistants Foundly checks"}>
      {AI_ENGINES.map((e) => (
        <span key={e} className="lv-engine"><i aria-hidden="true">{e[0]}</i>{e}</span>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="foundly-landing">
      <LandingHeader />

      <main id="main" className="landing-main">
        <div className="lv-first">
          <section className="lv-hero" aria-labelledby="hero-title">
            <p className="landing-eyebrow"><span /> AI SEARCH VISIBILITY FOR LOCAL BUSINESSES</p>
            <h1 id="hero-title">Get recommended when<br />customers <span className="hero-found">ask AI<svg viewBox="0 0 330 18" aria-hidden="true"><path d="M4 13 Q150 -2 326 7" /></svg></span>.</h1>
            <p className="lv-hero-sub">
              Foundly tracks how ChatGPT, Gemini, Perplexity and Claude talk about your business, shows who they recommend instead, and tells you exactly what to fix.
            </p>
            <div className="hero-buttons lv-center">
              <Link href="/signup" className="landing-button">Start free <Icon name="arrow" size={18} /></Link>
              <a href="#product" className="landing-button secondary">See the dashboard <Icon name="down" size={17} /></a>
            </div>
            <EngineRow />
            <p className="lv-note">No card needed · Set up in 3 minutes · Made for businesses in India</p>
          </section>
          <div id="product" className="lv-product">
            <LandingDashboard />
          </div>
        </div>

        <section id="ai-answers" className="landing-section landing-ai landing-fit" aria-labelledby="ai-title"><div className="fit-body">
          <div className="landing-section-heading"><div><p className="landing-eyebrow"><span /> THE ANSWERS BEHIND THE NUMBERS</p><h2 id="ai-title">Read exactly what<br />AI says about you.</h2></div><p>Every answer is saved: your name highlighted, competitors marked, the position you were listed at and the sources the assistant read.</p></div>
          <LandingAiAnswers />
        </div></section>

        <section id="features" className="landing-section landing-fit" aria-labelledby="features-title"><div className="fit-body">
          <div className="lv-heading">
            <p className="landing-eyebrow"><span /> ONE PLATFORM</p>
            <h2 id="features-title">Measure it. Understand it.<br />Improve it.</h2>
            <p>Everything you need to be found in AI search, from the questions customers ask to the fixes that change the answers.</p>
          </div>
          <div className="lv-features">
            {FEATURES.map((f) => (
              <article key={f.title} className="lv-feature">
                <span className="lv-feature-icon"><Icon name={f.icon} size={22} /></span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div></section>

        <section className="landing-section landing-fit" aria-labelledby="questions-title"><div className="fit-body">
          <div className="lv-heading">
            <p className="landing-eyebrow"><span /> WHAT OWNERS ASK US</p>
            <h2 id="questions-title">The questions Foundly<br />answers for you.</h2>
          </div>
          <div className="lv-questions">
            {QUESTIONS.map((x) => (
              <article key={x.q} className="lv-question">
                <h3>{x.q}</h3>
                <p>{x.a}</p>
              </article>
            ))}
          </div>
        </div></section>

        <section id="how-it-works" className="landing-section landing-fit" aria-labelledby="how-title"><div className="fit-body">
          <div className="lv-heading">
            <p className="landing-eyebrow"><span /> HOW IT WORKS</p>
            <h2 id="how-title">From sign-up to your first<br />AI report in minutes.</h2>
          </div>
          <ol className="lv-steps">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="lv-step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="lv-center" style={{ marginTop: 28 }}>
            <Link href="/signup" className="landing-button">Start free <Icon name="arrow" size={18} /></Link>
          </div>
        </div></section>

        <LandingPricing />

        <section id="faq" className="landing-section landing-fit" aria-labelledby="faq-title">
          <div className="fit-body landing-faq faq-panel">
            <div className="faq-intro">
              <span className="faq-mark" aria-hidden="true">✳</span>
              <p className="landing-eyebrow">FAQ</p>
              <h2 id="faq-title">Good questions.<br /><em>Clear answers.</em></h2>
              <p className="faq-description">What to know about AI search, and how Foundly helps you show up in it.</p>
              <Link href="/signup" className="faq-start">Start free <Icon name="arrow" size={18} /></Link>
            </div>
            <div className="faq-questions">
              {FAQ.map((item, index) => (
                <details key={item.q} name="foundly-faq" open={index === 0}>
                  <summary><small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small><b>{item.q}</b><span aria-hidden="true">+</span></summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div className="landing-fit landing-last"><div className="fit-body"><section className="landing-final">
          <span className="final-spark" aria-hidden="true">✳</span>
          <p className="landing-eyebrow">YOUR CUSTOMERS ARE ALREADY ASKING.</p>
          <h2>Find out what AI<br />tells them about you.</h2>
          <div className="final-buttons"><Link href="/signup" className="landing-button lime">Start free <Icon name="arrow" size={18} /></Link><a href="#product" className="landing-button ghost">See the dashboard</a></div>
          <EngineRow label="Works with" />
        </section></div></div>
        <FitSections />
      </main>

      <LandingFooter />
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { LandingFooter, LandingHeader } from "./landing-chrome";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

export type LegalSection = { id: string; title: string; content: ReactNode };

export function LegalContact() {
  return (
    <dl className="legal-contact">
      <div><dt>Service</dt><dd>Foundly</dd></div>
      <div><dt>Legal operator</dt><dd>Foundly — proposed legal name, subject to verification against the actual registered entity or proprietor.</dd></div>
      <div><dt>Business address</dt><dd>801, C Wing, Phase 2, Shubhshree Residency, Near Akurdi Chowk, Pune, Maharashtra, India.</dd></div>
      <div><dt>Support and refund requests</dt><dd>support@foundly.in — proposed address; domain, mailbox availability and receipt of requests must be verified before use.</dd></div>
      <div><dt>Privacy requests</dt><dd>privacy@foundly.in — proposed address; domain, mailbox availability and receipt of requests must be verified before use.</dd></div>
      <div><dt>Grievance contact</dt><dd>Name, designation and verified contact details pending confirmation.</dd></div>
    </dl>
  );
}

export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <div className="foundly-landing">
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow">FOUNDLY / LEGAL</p>
          <h1>{title}</h1>
          <p className="legal-intro">{intro}</p>
          <p className="legal-date">Draft prepared <time dateTime="2026-10-29">29 October 2026</time> · Effective date pending</p>
        </header>
        <div className="legal-layout">
          <aside className="legal-sidebar">
            <nav aria-label="On this page">
              <h2>On this page</h2>
              <ol>{sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
            </nav>
            <nav className="legal-related" aria-label="Legal pages"><Link href="/terms">Terms &amp; Conditions</Link><Link href="/privacy">Privacy Policy</Link><Link href="/pricing">View pricing</Link></nav>
          </aside>
          <article className="legal-article" aria-label={title}>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
                <h2 id={`${section.id}-title`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</h2>
                {section.content}
              </section>
            ))}
          </article>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

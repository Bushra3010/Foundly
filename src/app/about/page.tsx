import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LandingFooter, LandingHeader } from "@/components/landing-chrome";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, COMPANY, graph, organizationLd, siteUrl } from "@/lib/site-schema";
import "@/app/landing.css";
import "@/app/landing-v2.css";
import "@/app/legal.css";

const DESCRIPTION = "Foundly helps local businesses get named when customers ask AI assistants who to call.";

export const metadata: Metadata = {
  title: "About us",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { title: "About Foundly", description: DESCRIPTION, url: "/about", images: "/opengraph-image" },
};

const principles = [
  { title: "Show the evidence", body: "Every visibility score links back to the AI answers it came from, so you can read exactly what was said about your business." },
  { title: "Measure honestly", body: "AI answers vary by time, model and location. We report what we sampled and never promise rankings, recommendations or traffic." },
  { title: "You stay in control", body: "Your confirmed business details are the source of truth. Suggested fixes are yours to review before anything is published." },
];

export default function AboutPage() {
  return (
    <div className="foundly-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph(
        { "@type": "AboutPage", "@id": siteUrl("/about"), url: siteUrl("/about"), name: "About Foundly", description: DESCRIPTION, about: { "@id": siteUrl("/#organization") } },
        organizationLd(),
        breadcrumbLd([{ name: "Home", path: "/" }, { name: "About us", path: "/about" }]),
      )) }} />
      <LandingHeader />
      <main id="main" className="landing-main legal-main">
        <header className="legal-hero">
          <p className="landing-eyebrow">FOUNDLY / ABOUT US</p>
          <h1>Helping local businesses get found in AI answers</h1>
          <p className="legal-intro">Customers increasingly ask ChatGPT, Gemini, Perplexity and Claude who to call. Foundly shows businesses whether they are being named, why competitors are mentioned instead, and what to fix.</p>
        </header>
        <article className="legal-article about-article" aria-label="About Foundly">
          <section id="why">
            <h2><span>01</span>Why we built Foundly</h2>
            <p>Search is changing. Instead of scrolling a list of links, people ask an AI assistant for a recommendation and act on the first few names it gives. For a local business, not being in that answer means not being considered at all.</p>
            <p>Most owners have no way to see what these assistants say about them. Foundly asks the questions your customers ask, records the answers, and turns them into clear, practical next steps.</p>
          </section>
          <section id="who">
            <h2><span>02</span>Who we are</h2>
            <p>Foundly was founded in {COMPANY.founded} in Pune, India, by {COMPANY.founders.join(" and ")}.</p>
            <ul>
              <li><strong>Office:</strong> {COMPANY.address}</li>
              <li><strong>Email:</strong> <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
              <li><strong>Phone:</strong> <a href={`tel:${COMPANY.telephone.replace(/-/g, "")}`}>{COMPANY.telephoneDisplay}</a></li>
              <li><strong>Elsewhere:</strong> {COMPANY.profiles.map((p, i) => <span key={p.url}>{i > 0 && ", "}<a href={p.url} rel="noopener">{p.name}</a></span>)}</li>
            </ul>
          </section>
          <section id="what">
            <h2><span>03</span>What we do</h2>
            <ul>
              <li>Track the questions customers ask and check how often AI assistants mention your business.</li>
              <li>Compare your visibility with competitors and show the sources AI answers rely on.</li>
              <li>Publish a clean, accurate business profile in the <Link href="/directory">Foundly directory</Link>.</li>
              <li>Audit your website and prepare fixes, listing text and a weekly report.</li>
            </ul>
          </section>
          <section id="principles">
            <h2><span>04</span>How we work</h2>
            <div className="about-principles">
              {principles.map(p => <div key={p.title}><h3>{p.title}</h3><p>{p.body}</p></div>)}
            </div>
          </section>
          <section id="contact">
            <h2><span>05</span>Where we are</h2>
            <p>Foundly is built in Pune, Maharashtra, India, for local businesses in India and around the world. Read our <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy">Privacy Policy</Link>, or see <Link href="/pricing">plans and pricing</Link>.</p>
            <p><Link href="/signup" className="landing-button">Check your AI visibility free <Icon name="arrow" size={16} /></Link></p>
          </section>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

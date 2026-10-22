import type { Metadata } from "next";
import Link from "next/link";
import { Brand, Icon } from "@/components/icon";
import { LandingShowcase } from "@/components/landing-showcase";
import { LandingPricing } from "@/components/landing-pricing";
import "./landing.css";

export const metadata: Metadata = {
  title: "Foundly — Give your business a place to grow",
  description: "Build your business website, keep your business information accurate, and understand your visibility in AI answers. Bring your online presence together with Foundly.",
};

const features = [
  { icon: "website", n: "01", title: "A website that feels like you.", body: "Turn your business details into a website draft. Edit your pages, preview the result, and publish when it feels right.", detail: "Create · Edit · Publish", tone: "peach" },
  { icon: "business", n: "02", title: "Your business, clearly represented.", body: "Bring your services, locations and contact details together in one business profile. Keep the facts that matter up to date.", detail: "Services · Locations · Contact details", tone: "sage" },
  { icon: "visibility", n: "03", title: "See where you stand in AI.", body: "Check how supported AI answers mention your business. Explore saved evidence and use it to guide your next improvement.", detail: "Monitor · Understand · Improve", tone: "lilac" },
];

export default function Home() {
  return (
    <div className="foundly-landing">
      <div className="landing-announcement"><span className="announcement-dot" /> Your next chapter starts with being found. <a href="#products">Meet Foundly <span aria-hidden="true">↗</span></a></div>
      <header className="landing-header">
        <Link href="/" aria-label="Foundly home"><Brand /></Link>
        <nav className="landing-desktop-nav" aria-label="Main">
          <a href="#products">Products</a><a href="#why-foundly">Why Foundly</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><Link href="/directory">Directory</Link>
        </nav>
        <div className="landing-auth"><Link href="/login" className="landing-login">Log in</Link><Link href="/login" className="landing-button small">Get started <Icon name="arrow" size={16} /></Link></div>
        <details className="landing-mobile-menu"><summary>Menu <Icon name="down" size={15} /></summary><nav aria-label="Mobile navigation"><a href="#products">Products</a><a href="#why-foundly">Why Foundly</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><Link href="/directory">Directory</Link><Link href="/login">Log in</Link></nav></details>
      </header>
      <main id="main" className="landing-main">
        <section className="landing-hero" aria-labelledby="hero-title">
          <div><p className="landing-eyebrow"><span /> SMALL BUSINESS. BIG POSSIBILITIES.</p><h1 id="hero-title">Good businesses<br />deserve to be <span className="hero-found">found<svg viewBox="0 0 330 18" aria-hidden="true"><path d="M4 13 Q150 -2 326 7" /></svg></span>.</h1></div>
          <div className="hero-intro"><p>You do the work you love.{" "}<br />Let’s help the world find it.</p><p className="hero-description">Build your website, bring your business information together, and understand how you show up in AI answers. Your online presence, all in one place.</p><div className="hero-buttons"><Link href="/login" className="landing-button">Start building <Icon name="arrow" size={18} /></Link><a href="#products" className="landing-button secondary">Explore Foundly <Icon name="down" size={17} /></a></div><span className="hero-note">Made for business owners. No coding needed.</span></div>
        </section>
        <section id="products" className="landing-products" aria-label="Explore Foundly products"><LandingShowcase /></section>
        <div className="landing-audience"><span>FOR PEOPLE BUILDING SOMETHING OF THEIR OWN</span><div><span>Local businesses</span><span className="audience-star">✳</span><span>Independent professionals</span><span className="audience-star">✳</span><span>Growing teams</span><span className="audience-star">✳</span><span>Service businesses</span></div></div>
        <section id="why-foundly" className="landing-section">
          <div className="landing-section-heading"><div><p className="landing-eyebrow">LESS JUGGLING. MORE GROWING.</p><h2>One home for your<br />online presence.</h2></div><p>A good first impression starts with the right information. Foundly connects the essentials so you can spend more time on your business.</p></div>
          <div className="landing-features">{features.map(feature => <article className={`landing-feature ${feature.tone}`} key={feature.n}><div className="feature-top"><span className="feature-icon"><Icon name={feature.icon} size={27} /></span><span>{feature.n}</span></div><h3>{feature.title}</h3><p>{feature.body}</p><div className="feature-detail">{feature.detail}</div></article>)}</div>
        </section>
        <section id="how-it-works" className="landing-process landing-section"><div><p className="landing-eyebrow">FROM IDEA TO ONLINE</p><h2>A little setup.<br />A whole new start.</h2><p>You don’t need to know where to begin.<br />We’ll walk you through it.</p><Link href="/login" className="landing-text-link">Let’s get you started <Icon name="arrow" size={18} /></Link></div><ol>{[{title:"Tell us about your business",body:"Add what you do, where you work, and how customers can reach you."},{title:"Make it your own",body:"Review your business profile and website draft. Edit the details until they sound like you."},{title:"Publish. Learn. Keep growing.",body:"Put your website online, check your AI visibility, and keep improving your presence."}].map((step,i)=><li key={step.title}><span className="process-number">0{i+1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol></section>
        <LandingPricing />
        <section className="landing-faq landing-section"><div><p className="landing-eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</p><h2>Good questions.<br />Clear answers.</h2></div><div>{[{q:"What is Foundly?",a:"Foundly is a workspace for managing your business’s online presence. Create a business profile, build and publish a website, and review how supported AI answers mention your business."},{q:"Do I need to know how to code?",a:"No. Start with your business details, review your website draft, and make edits before publishing. The setup guides you through each step."},{q:"Can I review my website before it goes live?",a:"Yes. Your website begins as a draft. You can preview and edit it before choosing to publish."},{q:"Will Foundly guarantee AI recommendations?",a:"No. AI answers can change, and mentions or rankings aren’t guaranteed. Foundly shows observed results and saved evidence so you can understand what was found."}].map(item=><details key={item.q}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div></section>
        <section className="landing-final"><span className="final-spark" aria-hidden="true">✳</span><p className="landing-eyebrow">YOUR BUSINESS HAS SOMETHING TO OFFER.</p><h2>Let’s make it<br />easier to find.</h2><Link href="/login" className="landing-button">Get started with Foundly <Icon name="arrow" size={18} /></Link><p>Your business. Your story. Your next chapter.</p></section>
      </main>
      <footer className="landing-footer"><div><Link href="/" aria-label="Foundly home"><Brand /></Link><p>A place for your business to grow.</p></div><nav aria-label="Footer"><a href="#products">Products</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><Link href="/directory">Directory</Link><Link href="/login">Sign in</Link></nav><span>© {new Date().getFullYear()} Foundly</span></footer>
    </div>
  );
}

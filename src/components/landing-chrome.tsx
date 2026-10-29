import Link from "next/link";
import { Brand, Icon } from "@/components/icon";
import { SERVICE_CITIES } from "@/lib/locations";

/** Top of every public marketing page. */
export function LandingHeader() {
  return (
    <>
        <div className="landing-announcement"><span className="announcement-dot" /> Customers now ask AI who to call. <Link href="/#product">See if it names you <span aria-hidden="true">↗</span></Link></div>
        <div className="landing-header-bar"><header className="landing-header">
          <Link href="/" aria-label="Foundly home"><Brand /></Link>
          <nav className="landing-desktop-nav" aria-label="Main">
            <Link href="/#product">Product</Link><Link href="/#features">Features</Link><Link href="/#how-it-works">How it works</Link><Link href="/services">Services</Link><Link href="/pricing">Pricing</Link><Link href="/guides">Guides</Link><Link href="/directory">Directory</Link>
          </nav>
          <div className="landing-auth"><Link href="/login" className="landing-login">Log in</Link><Link href="/signup" className="landing-button small">Start free <Icon name="arrow" size={16} /></Link></div>
          <details className="landing-mobile-menu"><summary>Menu <Icon name="down" size={15} /></summary><nav aria-label="Mobile navigation"><Link href="/#product">Product</Link><Link href="/#features">Features</Link><Link href="/#how-it-works">How it works</Link><Link href="/services">Services</Link><Link href="/pricing">Pricing</Link><Link href="/guides">Guides</Link><Link href="/tools/ai-crawler-checker">Free AI crawler check</Link><Link href="/directory">Directory</Link><Link href="/login">Log in</Link></nav></details>
        </header></div>
    </>
  );
}

/** Bottom of every public marketing page. */
export function LandingFooter() {
  return (
        <footer className="landing-footer lv-footer">
          <div className="lv-footer-brand">
            <Link href="/" aria-label="Foundly home"><Brand /></Link>
            <p>AI search visibility for local businesses.</p>
          </div>
          <nav aria-label="Product">
            <strong>Product</strong>
            <Link href="/#product">Brand report</Link><Link href="/#features">Features</Link><Link href="/pricing">Pricing</Link><Link href="/#how-it-works">How it works</Link>
          </nav>
          <nav aria-label="Resources">
            <strong>Resources</strong>
            <Link href="/guides">Guides</Link><Link href="/tools/ai-crawler-checker">AI Crawler Checker</Link><Link href="/for">Industries</Link><Link href="/#faq">FAQ</Link><Link href="/directory">Business directory</Link><a href="/llms.txt">llms.txt</a>
          </nav>
          <nav aria-label="Company">
            <strong>Company</strong>
            <Link href="/about">About us</Link><Link href="/services">SEO, AEO &amp; GEO services</Link><Link href="/terms">Terms &amp; Conditions</Link><Link href="/privacy">Privacy Policy</Link>
          </nav>
          <nav aria-label="Account">
            <strong>Account</strong>
            <Link href="/signup">Start free</Link><Link href="/login">Log in</Link>
          </nav>
          <nav className="lv-footer-cities" aria-label="Cities we serve">
            <strong>SEO, AEO &amp; GEO agency in</strong>
            {SERVICE_CITIES.map((c) => <Link key={c.slug} href={`/services/${c.slug}`}>{c.name}</Link>)}
          </nav>
          <span className="lv-copy">© {new Date().getFullYear()} Foundly</span>
        </footer>
  );
}

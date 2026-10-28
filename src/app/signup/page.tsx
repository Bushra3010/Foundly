import type { Metadata } from "next";
import Link from "next/link";
import { Brand, Icon } from "@/components/icon";
import { SignUpForm } from "../login/auth-forms";
import "../start.css";

export const metadata: Metadata = { title: "Create your account", robots: { index: false } };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const loginHref = `/login${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  return (
    <main id="main" className="start-page">
      <header className="start-top">
        <Link href="/" aria-label="Foundly home"><Brand compact /></Link>
        <Link href={loginHref} className="start-top-link">Log in</Link>
      </header>
      <section className="start-card narrow">
        <h1>Create your account</h1>
        <p className="start-lead">Free to start. Your website is ready in about two minutes.</p>
        <SignUpForm next={next} />
        <p className="start-switch">Read our <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
        <p className="start-switch">Already have an account? <Link href={loginHref}>Log in</Link></p>
        <ul className="start-perks">
          <li><Icon name="check" size={15} /> Free to start</li>
          <li><Icon name="check" size={15} /> No coding</li>
          <li><Icon name="check" size={15} /> No card needed</li>
        </ul>
      </section>
    </main>
  );
}

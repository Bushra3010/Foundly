import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/icon";
import { ForgotPasswordForm } from "../login/auth-forms";
import "../start.css";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <main id="main" className="start-page">
      <header className="start-top">
        <Link href="/" aria-label="Foundly home"><Brand compact /></Link>
        <Link href="/login" className="start-top-link">Log in</Link>
      </header>
      <section className="start-card narrow">
        <h1>Forgot your password?</h1>
        <p className="start-lead">Enter your email and we’ll send you a link to choose a new one.</p>
        <ForgotPasswordForm />
        <p className="start-switch">Remembered it? <Link href="/login">Log in</Link></p>
      </section>
    </main>
  );
}

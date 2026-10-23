import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/icon";
import { ResetPasswordForm } from "../login/auth-forms";
import "../start.css";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

// The token is only used when the form is submitted, so email link scanners can't use it up.
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <main id="main" className="start-page">
      <header className="start-top">
        <Link href="/" aria-label="Foundly home"><Brand compact /></Link>
      </header>
      <section className="start-card narrow">
        <h1>Choose a new password</h1>
        {token ? (
          <>
            <p className="start-lead">You’ll be logged in straight after. Other devices will be signed out.</p>
            <ResetPasswordForm token={token} />
          </>
        ) : (
          <>
            <p className="start-lead">This link is missing its code. Request a new reset link.</p>
            <Link href="/forgot-password" className="start-button">Request a new link</Link>
          </>
        )}
      </section>
    </main>
  );
}

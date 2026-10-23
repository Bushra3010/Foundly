import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/icon";
import { LogInForm } from "./auth-forms";
import "../start.css";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; deleted?: string }>;
}) {
  const { error, next, deleted } = await searchParams;
  const signupHref = `/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  return (
    <main id="main" className="start-page">
      <header className="start-top">
        <Link href="/" aria-label="Foundly home"><Brand compact /></Link>
        <Link href={signupHref} className="start-top-link">Create account</Link>
      </header>
      <section className="start-card narrow">
        <h1>Welcome back</h1>
        <p className="start-lead">Log in to manage your business.</p>
        {error === "no_workspace" && (
          <p className="start-message err" role="alert">
            Your account has no workspace. Contact support so we can restore access.
          </p>
        )}
        {deleted === "1" && (
          <p className="start-message ok" role="status">
            Your account is scheduled for deletion.
          </p>
        )}
        <LogInForm next={next} />
        <p className="start-switch">New to Foundly? <Link href={signupHref}>Create an account</Link></p>
      </section>
    </main>
  );
}

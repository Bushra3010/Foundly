import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/icon";
import { VerifyForm } from "./verify-form";
import "../../start.css";

export const metadata: Metadata = { title: "Continue", robots: { index: false } };

// The token is consumed by an explicit POST so email link scanners can't use it up.
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string; next?: string }> }) {
  const { token = "", next } = await searchParams;
  return (
    <main id="main" className="start-page">
      <header className="start-top">
        <Link href="/" aria-label="Foundly home"><Brand compact /></Link>
      </header>
      <section className="start-card narrow">
        <h1>Almost there</h1>
        <p className="start-lead">Tap continue to open Foundly on this device.</p>
        <VerifyForm token={token} next={next} />
      </section>
    </main>
  );
}

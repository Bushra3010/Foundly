import type { Metadata } from "next";
import Link from "next/link";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { Brand, Icon } from "@/components/icon";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { AboutStep, FinishStep } from "./steps";
import "../start.css";
import { currentBusiness } from "@/server/current";

export const metadata: Metadata = { title: "Set up your business", robots: { index: false } };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const ctx = await requireCtx();
  const business = await currentBusiness(await getDb(), ctx);
  if (business?.onboardingCompletedAt) redirect("/app");

  // Two screens. Screen 2 needs the details from screen 1; owners can always go back.
  const ready = Boolean(business && business.services.length > 0);
  const step = ready && (await searchParams).step !== "1" ? 2 : 1;

  return (
    <main id="main" className="start-page">
      <header className="start-top">
        <Link href="/" aria-label="Foundly home"><Brand compact /></Link>
        <div className="start-progress" aria-label={`Step ${step} of 2`}>
          <span className="on" />
          <span className={step === 2 ? "on" : ""} />
          <em>Step {step} of 2</em>
        </div>
      </header>

      <section className="start-card">
        {step === 1 ? (
          <>
            <h1>Tell us about your business</h1>
            <p className="start-lead">Five quick details. You can change anything later.</p>
            <AboutStep
              initial={{
                name: business?.name ?? "",
                category: business?.category ?? "",
                city: business?.city ?? "",
                services: business?.services.map((s) => s.name).join(", ") ?? "",
                phone: business?.phone ?? "",
                onWhatsapp: business?.whatsapp && business.whatsapp === business.phone ? "on" : "",
                email: business?.email ?? ctx.user.email,
              }}
            />
          </>
        ) : (
          business && (
            <>
              <h1>Great, {business.name}!</h1>
              <p className="start-lead">One click and your website is ready.</p>
              <div className="start-summary">
                <div>
                  <strong>{business.name}</strong>
                  <span>{business.category} · {business.city}</span>
                  <span>{business.services.map((s) => s.name).join(", ")}</span>
                  <span>{[business.phone, business.email].filter(Boolean).join(" · ")}</span>
                </div>
                <Link href="/onboarding?step=1" className="start-edit">Edit</Link>
              </div>
              <FinishStep requestId={randomUUID()} />
              <p className="start-fine">
                <Icon name="shield" size={14} />
                By continuing, you confirm these details are correct. Nothing goes public until you choose to publish.
              </p>
            </>
          )
        )}
      </section>
    </main>
  );
}

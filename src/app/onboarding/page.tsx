import type { Metadata } from "next";
import Link from "next/link";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Brand, Icon } from "@/components/icon";
import { CandidatePicker } from "@/components/presence-kit";
import { SocialConnect } from "@/components/social-connect";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { decodeCandidates, providerConfigured } from "@/server/connect";
import { currentBusiness } from "@/server/current";
import { enabledAdapters } from "@/server/monitoring/registry";
import { listQuestions } from "@/server/monitoring/service";
import { setupSteps, socialStatus } from "@/server/performance";
import { KeywordsStep, StartStep, WebsiteStep } from "./steps";
import "../start.css";

export const metadata: Metadata = { title: "Set up Foundly", robots: { index: false } };

const STEPS = ["keywords", "website", "social", "start"] as const;
type Step = (typeof STEPS)[number];
const LABEL: Record<Step, string> = { keywords: "Keywords", website: "Website", social: "Social media", start: "Start tracking" };

const CONNECT_TEXT: Record<string, string> = {
  linked: "Connected. Foundly keeps it up to date with your details.",
  none: "That account doesn't manage any listings yet. Paste the link instead.",
  denied: "Nothing was connected. You can paste the link instead.",
  failed: "We couldn't read your listings right now. Paste the link instead.",
  invalid: "That attempt expired. Try connecting again.",
  unavailable: "One-click connect isn't switched on yet. Paste the link instead.",
};

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ step?: string; connect?: string }> }) {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await currentBusiness(db, ctx);
  if (business?.onboardingCompletedAt) redirect("/app");
  const sp = await searchParams;

  // Every step after the first needs the business from step 1.
  const asked = STEPS.find((s) => s === sp.step);
  const step: Step = !business ? "keywords" : (asked ?? "keywords");
  const at = STEPS.indexOf(step);
  const questions = business ? await listQuestions(db, ctx) : [];
  const social = business ? await socialStatus(db, ctx, business) : [];

  return (
    <main id="main" className="start-page">
      <header className="start-top">
        <Link href="/" aria-label="Foundly home"><Brand compact /></Link>
        <ol className="start-steps" aria-label={`Step ${at + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <li key={s} className={i < at ? "done" : i === at ? "on" : ""} aria-current={i === at ? "step" : undefined}>
              <span className="start-step-dot" aria-hidden="true">{i < at ? <Icon name="check" size={11} /> : i + 1}</span>
              <span className="start-step-label">{LABEL[s]}</span>
            </li>
          ))}
        </ol>
      </header>

      <section className="start-card">
        {step === "keywords" && (
          <>
            <h1>What should people find you for?</h1>
            <p className="start-lead">Tell us a little about your business and pick the keywords you want to show up for.</p>
            <KeywordsStep
              initial={{ name: business?.name ?? "", category: business?.category ?? "", city: business?.city ?? "" }}
              tracked={questions.map((q) => q.text)}
            />
          </>
        )}

        {step === "website" && (
          <>
            <h1>Connect your website</h1>
            <p className="start-lead">We check what AI assistants can read on it and show you what to fix.</p>
            <WebsiteStep initialUrl={business?.websiteUrl ?? ""} />
            <Back to="keywords" />
          </>
        )}

        {step === "social" && (
          <>
            <h1>Connect your social media</h1>
            <p className="start-lead">Add your Google, Facebook or Instagram page so AI assistants see your business in more places. Skip it if you don&apos;t have any.</p>
            {sp.connect && CONNECT_TEXT[sp.connect] && <p className={`start-message ${sp.connect === "linked" ? "ok" : "err"}`} role="status">{CONNECT_TEXT[sp.connect]}</p>}
            <SocialCandidates connect={sp.connect} />
            <SocialConnect social={social} oneClick={{ google: providerConfigured("google"), facebook: providerConfigured("facebook") }} back="setup" />
            <Link href="/onboarding?step=start" className="start-button start-next">
              {social.some((s) => s.state !== "none") ? "Continue" : "Skip for now"} <Icon name="arrow" size={18} />
            </Link>
            <Back to="website" />
          </>
        )}

        {step === "start" && business && (
          <>
            <h1>You&apos;re ready to start tracking</h1>
            <p className="start-lead">We&apos;ll ask the AI assistants your keywords and show the results on your dashboard.</p>
            <ul className="start-summary-list">
              {setupSteps({ keywords: questions.length, business, websiteRequested: false, social, trackingStarted: false })
                .steps.filter((s) => s.key !== "tracking")
                .map((s) => (
                  <li key={s.key} className={s.done ? "done" : ""}>
                    <span className="start-step-dot" aria-hidden="true">{s.done ? <Icon name="check" size={11} /> : "–"}</span>
                    <span>
                      {s.label}
                      {s.key === "keywords" && ` · ${questions.length} keyword${questions.length === 1 ? "" : "s"}`}
                      {s.key === "website" && (business.websiteUrl ? ` · ${business.websiteUrl.replace(/^https?:\/\//, "")}` : " · not yet")}
                      {s.key === "social" && ` · ${social.filter((x) => x.state !== "none").length} connected`}
                    </span>
                    {!s.done && <Link href={s.href} className="start-edit">Add</Link>}
                  </li>
                ))}
            </ul>
            {enabledAdapters().length === 0 && (
              <p className="start-hint">Our team is switching on the AI checks. Your first results appear on your dashboard as soon as they run.</p>
            )}
            <StartStep requestId={randomUUID()} />
            <Back to="social" />
          </>
        )}
      </section>
    </main>
  );
}

function Back({ to }: { to: Step }) {
  return (
    <Link href={`/onboarding?step=${to}`} className="start-link start-back">
      Back
    </Link>
  );
}

async function SocialCandidates({ connect }: { connect?: string }) {
  if (connect !== "google" && connect !== "facebook") return null;
  const candidates = decodeCandidates((await cookies()).get("foundly_connect")?.value);
  if (!candidates?.length) return null;
  return <CandidatePicker candidates={candidates} label={connect === "google" ? "Google" : "Facebook"} back="setup" />;
}

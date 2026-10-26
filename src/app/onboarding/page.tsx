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
import { listCompetitors, listQuestions, questionLimit } from "@/server/monitoring/service";
import { suggestKeywords } from "@/lib/questions";
import { socialStatus } from "@/server/performance";
import { BusinessStep, CompetitorsStep, PromptsStep, StartStep } from "./steps";
import { readSetupSuggestions } from "./suggestions";
import "../start.css";

export const metadata: Metadata = { title: "Set up Foundly", robots: { index: false } };

const STEPS = ["business", "prompts", "competitors", "social"] as const;
type Step = (typeof STEPS)[number];
const LABEL: Record<Step, string> = { business: "Your business", prompts: "Prompts", competitors: "Competitors", social: "Connect & start" };
// Older links to the previous steps.
const ALIAS: Record<string, Step> = { keywords: "prompts", website: "business", start: "social" };

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
  const asked = STEPS.find((s) => s === sp.step) ?? (sp.step ? ALIAS[sp.step] : undefined);
  const step: Step = !business ? "business" : (asked ?? "business");
  const at = STEPS.indexOf(step);
  const [questions, rivals, social, limit, saved] = business
    ? await Promise.all([listQuestions(db, ctx), listCompetitors(db, ctx), socialStatus(db, ctx, business), questionLimit(db, ctx.workspaceId), readSetupSuggestions()])
    : [[], [], [], 5, { ideas: null, rivals: null }];
  const ideas = saved.ideas ?? {
    items: business ? suggestKeywords({ category: business.category, city: business.city, services: business.services.map((x) => x.name) }) : [],
    source: "details" as const,
  };

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
        {step === "business" && (
          <>
            <h1>Let&apos;s see how AI sees your business</h1>
            <p className="start-lead">Tell us who you are. We&apos;ll find what customers ask AI assistants and who they recommend.</p>
            <BusinessStep initial={{ name: business?.name ?? "", category: business?.category ?? "", city: business?.city ?? "", websiteUrl: business?.websiteUrl ?? "" }} />
          </>
        )}

        {step === "prompts" && business && (
          <>
            <h1>What do customers ask AI?</h1>
            <p className="start-lead">Pick the prompts to track. You can change them any time.</p>
            <PromptsStep ideas={ideas.items} source={ideas.source} tracked={questions.map((q) => q.keyword ?? q.text)} limit={limit} city={business.city} />
            <Back to="business" />
          </>
        )}

        {step === "competitors" && business && (
          <>
            <h1>Who do you compete with?</h1>
            <p className="start-lead">Add the businesses you want to beat in AI answers.</p>
            <CompetitorsStep ideas={saved.rivals?.items ?? []} tracked={rivals.map((r) => r.name)} />
            <Back to="prompts" />
          </>
        )}

        {step === "social" && business && (
          <>
            <h1>Connect your profiles, then start</h1>
            <p className="start-lead">AI assistants trust businesses they find in several places. Link what you have, or skip it for now.</p>
            {sp.connect && CONNECT_TEXT[sp.connect] && <p className={`start-message ${sp.connect === "linked" ? "ok" : "err"}`} role="status">{CONNECT_TEXT[sp.connect]}</p>}
            <SocialCandidates connect={sp.connect} />
            <SocialConnect social={social} oneClick={{ google: providerConfigured("google"), facebook: providerConfigured("facebook") }} back="setup" />
            <ul className="start-summary-list">
              <li className={questions.length ? "done" : ""}>
                <span className="start-step-dot" aria-hidden="true">{questions.length ? <Icon name="check" size={11} /> : "–"}</span>
                <span>{questions.length} prompt{questions.length === 1 ? "" : "s"} to track</span>
                {!questions.length && <Link href="/onboarding?step=prompts" className="start-edit">Add</Link>}
              </li>
              <li className={rivals.length ? "done" : ""}>
                <span className="start-step-dot" aria-hidden="true">{rivals.length ? <Icon name="check" size={11} /> : "–"}</span>
                <span>{rivals.length} competitor{rivals.length === 1 ? "" : "s"}</span>
                {!rivals.length && <Link href="/onboarding?step=competitors" className="start-edit">Add</Link>}
              </li>
              <li className={business.websiteUrl ? "done" : ""}>
                <span className="start-step-dot" aria-hidden="true">{business.websiteUrl ? <Icon name="check" size={11} /> : "–"}</span>
                <span>Website · {business.websiteUrl ? business.websiteUrl.replace(/^https?:\/\//, "") : "not yet"}</span>
                {!business.websiteUrl && <Link href="/onboarding?step=business" className="start-edit">Add</Link>}
              </li>
            </ul>
            {enabledAdapters().length === 0 && (
              <p className="start-hint">Our team is switching on the AI checks. Your first results appear on your dashboard as soon as they run.</p>
            )}
            <StartStep requestId={randomUUID()} />
            <Back to="competitors" />
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

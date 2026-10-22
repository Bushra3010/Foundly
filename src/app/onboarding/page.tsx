import type { Metadata } from "next";
import Link from "next/link";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { Card, DefinitionList, LinkButton, Notice } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { GROUP_LABEL, suggestQuestions } from "@/lib/questions";
import { getBusiness } from "@/server/business";
import { BasicsStep, ExistingSiteFinishStep, GenerateStep, OfferStep, ReviewStep, WebsiteChoiceStep } from "./steps";

export const metadata: Metadata = { title: "Set up your business", robots: { index: false } };

const STEPS = ["Sign in", "Business basics", "Website", "What you offer", "Review", "First result"];

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const ctx = await requireCtx();
  const business = await getBusiness(await getDb(), ctx);
  if (business?.onboardingCompletedAt) redirect("/app");

  const furthest = business?.onboardingStep ?? 2;
  const requested = Number((await searchParams).step) || furthest;
  // Owners can go back to any completed step but not skip ahead.
  const step = Math.min(Math.max(requested, 2), furthest);

  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-bold">Growth Platform</span>
        <span className="text-sm text-muted">Your progress is saved after each step</span>
      </div>

      <nav aria-label="Setup progress" className="mb-6">
        <p className="mb-2 text-sm font-semibold">
          Step {step} of {STEPS.length}: {STEPS[step - 1]}
        </p>
        <ol className="grid grid-cols-6 gap-1.5">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = n < furthest || n === 1;
            const current = n === step;
            const reachable = n >= 2 && n <= furthest && !current;
            const bar = (
              <span
                className={`block h-2 rounded-full ${current ? "bg-brand" : done ? "bg-brand/50" : "bg-border"}`}
                aria-hidden="true"
              />
            );
            return (
              <li key={label} aria-current={current ? "step" : undefined}>
                {reachable ? (
                  <Link href={`/onboarding?step=${n}`} className="block py-2" aria-label={`Go back to ${label}`}>
                    {bar}
                  </Link>
                ) : (
                  <span className="block py-2">
                    {bar}
                    <span className="sr-only">
                      {label}
                      {done ? " (done)" : ""}
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <Card>
        {step === 2 && (
          <>
            <StepTitle title="Tell us about your business" lead="Just the basics — you can add more later." />
            <BasicsStep
              initial={{
                name: business?.name ?? "",
                category: business?.category ?? "",
                city: business?.city ?? "",
                phone: business?.phone ?? "",
                whatsapp: business?.whatsapp ?? "",
                email: business?.email ?? ctx.user.email,
              }}
            />
          </>
        )}
        {step === 3 && business && (
          <>
            <StepTitle title="Your website" lead="Choose what fits. You can change this later." />
            <WebsiteChoiceStep
              initial={{
                hasWebsite: business.hasWebsite === null ? undefined : business.hasWebsite ? "yes" : "no",
                websiteUrl: business.websiteUrl ?? undefined,
              }}
            />
          </>
        )}
        {step === 4 && business && (
          <>
            <StepTitle title="What do you offer?" lead="We use this to write your pages and suggest customer questions." />
            <OfferStep
              initial={{
                services: business.services.map((s) => s.name).join("\n"),
                serviceAreas: business.serviceAreas.join(", "),
                audience: business.audience ?? "",
              }}
            />
          </>
        )}
        {step === 5 && business && (
          <>
            <StepTitle title="Check your details" lead="Only facts you confirm are used. We never add reviews, prices or claims you didn't give us." />
            <DefinitionList
              items={[
                ["Business", business.name],
                ["Category", business.category],
                ["City", business.city],
                ["Phone", business.phone],
                ["WhatsApp", business.whatsapp],
                ["Email", business.email],
                ["Website", business.hasWebsite ? business.websiteUrl : "Create one for me"],
                ["Services", business.services.map((s) => s.name).join(", ")],
                ["Areas served", business.serviceAreas.join(", ")],
              ]}
            />
            <p className="mt-2 mb-6 text-sm">
              <Link href="/onboarding?step=2" className="font-semibold text-brand underline">
                Change details
              </Link>
            </p>
            <details className="mb-6 rounded-lg border border-border p-4">
              <summary className="cursor-pointer font-semibold">Questions customers might ask AI assistants</summary>
              <p className="mt-2 text-sm text-muted">
                When AI visibility checks are available for your account, you&apos;ll pick which of these to track. We
                keep questions that name your business separate, because they make inclusion more likely.
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {suggestQuestions(business).map((q) => (
                  <li key={q.text}>
                    <span className="text-muted">{GROUP_LABEL[q.group]}:</span> {q.text}
                  </li>
                ))}
              </ul>
            </details>
            <ReviewStep />
          </>
        )}
        {step === 6 && business && !business.hasWebsite && (
          <>
            <StepTitle title="Create your website" lead="We'll build a private preview from your confirmed details." />
            <GenerateStep requestId={randomUUID()} />
          </>
        )}
        {step === 6 && business && business.hasWebsite && (
          <>
            <StepTitle title="You're almost done" lead={`We saved ${business.websiteUrl}. We won't change your website.`} />
            <div className="mb-6">
              <Notice tone="info" title="Website audits are coming soon">
                Automatic checks of existing websites aren&apos;t available in this release yet. Meanwhile, your
                directory profile gives customers an accurate page about your business.
              </Notice>
            </div>
            <ExistingSiteFinishStep />
            <p className="mt-4 text-sm text-muted">
              Changed your mind?{" "}
              <LinkButton href="/onboarding?step=3" variant="ghost" className="px-1">
                Create a website instead
              </LinkButton>
            </p>
          </>
        )}
      </Card>
    </main>
  );
}

function StepTitle({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-muted">{lead}</p>
    </div>
  );
}

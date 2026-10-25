"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { resubmitBusiness } from "@/server/indexnow";
import { getDb } from "@/db";
import { formValues, toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { basicsSchema, fieldErrors, websiteChoiceSchema } from "@/lib/validation";
import { completeOnboarding, confirmReview, getBusiness, publishProfile, saveBasics, saveWebsiteChoice } from "@/server/business";
import { checkWebsiteSoon } from "@/server/audit/service";
import { enabledAdapters } from "@/server/monitoring/registry";
import { parseKeywordList } from "@/lib/keywords";
import { addKeywords } from "@/server/keywords";
import { createRun, executeRun, listQuestions, manualRunKey } from "@/server/monitoring/service";

/**
 * Setup in four steps: keywords, website, social media, start tracking.
 * Every step saves as it goes, so owners can leave and come back.
 */

/** Step 1: who the business is, and the keywords to track. */
export async function saveKeywordsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const keywords = parseKeywordList([...form.getAll("keyword").map(String), String(form.get("custom") ?? "")].join("\n"));
  try {
    const ctx = await requireCtx();
    const basics = basicsSchema.safeParse({
      name: values.name ?? "",
      category: values.category ?? "",
      city: values.city ?? "",
      phone: "",
      whatsapp: "",
      email: ctx.user.email,
    });
    const errors = basics.success ? {} : fieldErrors(basics.error);
    if (keywords.length === 0) errors.custom = ["Pick or type at least one keyword"];
    else if (keywords.some((k) => k.length < 8)) errors.custom = ["Make each keyword a little longer, like “plumber in Pune”"];
    if (!basics.success || errors.custom) return { ok: false, fieldErrors: errors, values };

    const db = await getDb();
    const existing = await getBusiness(db, ctx);
    // Keep contact details the owner already gave; only fill the email for a new business.
    await saveBasics(db, ctx, existing ? { ...basics.data, phone: existing.phone, whatsapp: existing.whatsapp, email: existing.email } : basics.data);
    // Each keyword is asked to AI as a customer's request for a recommendation.
    await addKeywords(db, ctx, keywords);
  } catch (err) {
    return toActionError(err, values);
  }
  redirect("/onboarding?step=website");
}

/** Step 2: connect the owner's website, or note that they don't have one yet. */
export async function saveWebsiteStepAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    if (values.choice === "none") {
      await saveWebsiteChoice(db, ctx, false, null);
    } else {
      const parsed = websiteChoiceSchema.safeParse({ hasWebsite: "yes", websiteUrl: values.websiteUrl ?? "" });
      if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error), values };
      await saveWebsiteChoice(db, ctx, true, "websiteUrl" in parsed.data ? (parsed.data.websiteUrl ?? null) : null);
      after(() => checkWebsiteSoon(db, ctx));
    }
  } catch (err) {
    return toActionError(err, values);
  }
  redirect("/onboarding?step=social");
}

/**
 * Step 4: one button. Confirms the details, lists the business if the owner
 * agreed, and runs the first AI check when sources are switched on.
 */
export async function startTrackingAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let started = "1";
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    if ((await listQuestions(db, ctx)).length === 0) return { ok: false, message: "Add at least one keyword first." };
    await confirmReview(db, ctx, false);
    if (form.get("publishProfile") === "on") {
      await publishProfile(db, ctx);
      after(() => resubmitBusiness(db, ctx));
    }
    await completeOnboarding(db, ctx);
    if (enabledAdapters().length > 0) {
      try {
        const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: manualRunKey(String(form.get("requestId") ?? randomUUID())) });
        after(() => executeRun(db, run.id).catch((err) => console.error("[monitoring] first run failed", run.id, err)));
      } catch (err) {
        // Tracking is on either way; the dashboard explains why the first check didn't start.
        console.error("[setup] first check not started", err);
        started = "later";
      }
    } else {
      started = "later";
    }
  } catch (err) {
    return toActionError(err);
  }
  redirect(`/app?started=${started}`);
}

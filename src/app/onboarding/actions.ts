"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { formValues, toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { basicsSchema, fieldErrors, offerSchema, splitList, websiteChoiceSchema } from "@/lib/validation";
import {
  completeOnboarding,
  confirmReview,
  publishProfile,
  saveBasics,
  saveOffer,
  saveWebsiteChoice,
} from "@/server/business";
import { generateSiteDraft } from "@/server/sites";

export async function saveBasicsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const parsed = basicsSchema.safeParse(values);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error), values };
  if (!parsed.data.phone && !parsed.data.whatsapp && !parsed.data.email) {
    return { ok: false, fieldErrors: { phone: ["Add at least one way for customers to contact you"] }, values };
  }
  try {
    const ctx = await requireCtx();
    await saveBasics(await getDb(), ctx, parsed.data);
  } catch (err) {
    return toActionError(err, values);
  }
  redirect("/onboarding?step=3");
}

export async function saveWebsiteChoiceAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const parsed = websiteChoiceSchema.safeParse(values);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error), values };
  try {
    const ctx = await requireCtx();
    const hasWebsite = parsed.data.hasWebsite === "yes";
    await saveWebsiteChoice(await getDb(), ctx, hasWebsite, hasWebsite && "websiteUrl" in parsed.data ? (parsed.data.websiteUrl ?? null) : null);
  } catch (err) {
    return toActionError(err, values);
  }
  redirect("/onboarding?step=4");
}

export async function saveOfferAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const parsed = offerSchema.safeParse({
    services: splitList(form.get("services")).map((name) => ({ name })),
    audience: values.audience ?? "",
    serviceAreas: splitList(form.get("serviceAreas")),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error), values };
  try {
    const ctx = await requireCtx();
    await saveOffer(await getDb(), ctx, parsed.data);
  } catch (err) {
    return toActionError(err, values);
  }
  redirect("/onboarding?step=5");
}

export async function confirmReviewAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  if (form.get("confirmContact") !== "on") {
    return { ok: false, fieldErrors: { confirmContact: ["Confirm the details are correct to continue"] }, values };
  }
  try {
    const ctx = await requireCtx();
    await confirmReview(await getDb(), ctx, false);
  } catch (err) {
    return toActionError(err, values);
  }
  redirect("/onboarding?step=6");
}

/** Step 6, no website: one action builds a private preview. Publishing is separate. */
export async function generateFirstSiteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    const job = await generateSiteDraft(db, ctx, { requestId: String(form.get("requestId") ?? "") });
    if (job.status === "failed") {
      return { ok: false, message: "We couldn't build your preview this time. Your answers are saved — try again." };
    }
    await completeOnboarding(db, ctx);
  } catch (err) {
    return toActionError(err);
  }
  redirect("/app/website?generated=1");
}

/** Step 6, existing website: publish the directory profile (optional) and finish. */
export async function finishWithExistingSiteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    if (form.get("publishProfile") === "on") await publishProfile(db, ctx);
    await completeOnboarding(db, ctx);
  } catch (err) {
    return toActionError(err);
  }
  redirect("/app");
}

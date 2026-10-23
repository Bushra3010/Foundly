"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { resubmitBusiness } from "@/server/indexnow";
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

/**
 * Screen 1 of 2: everything we need in one short form.
 * Saves the basics and services together, then moves to the website choice.
 */
export async function saveAboutAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const phone = values.phone ?? "";
  const basics = basicsSchema.safeParse({
    name: values.name ?? "",
    category: values.category ?? "",
    city: values.city ?? "",
    phone,
    whatsapp: values.onWhatsapp === "on" ? phone : "",
    email: values.email ?? "",
  });
  const offer = offerSchema.safeParse({
    services: splitList(form.get("services")).map((name) => ({ name })),
    audience: "",
    serviceAreas: [],
  });
  if (!basics.success || !offer.success) {
    return {
      ok: false,
      fieldErrors: {
        ...(basics.success ? {} : fieldErrors(basics.error)),
        ...(offer.success ? {} : fieldErrors(offer.error)),
      },
      values,
    };
  }
  if (!basics.data.phone && !basics.data.email) {
    return { ok: false, fieldErrors: { phone: ["Add a phone number so customers can reach you"] }, values };
  }
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    await saveBasics(db, ctx, basics.data);
    await saveOffer(db, ctx, offer.data);
  } catch (err) {
    return toActionError(err, values);
  }
  redirect("/onboarding?step=2");
}

/**
 * Screen 2 of 2: one click. Either build a private website preview, or save an
 * existing website. Choosing an option confirms the details shown on screen.
 */
export async function finishSetupAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const choice = values.choice;
  let destination = "/app";
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    if (choice === "existing") {
      const parsed = websiteChoiceSchema.safeParse({ hasWebsite: "yes", websiteUrl: values.websiteUrl ?? "" });
      if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error), values };
      const url = "websiteUrl" in parsed.data ? (parsed.data.websiteUrl ?? null) : null;
      await saveWebsiteChoice(db, ctx, true, url);
      await confirmReview(db, ctx, false);
      if (values.publishProfile === "on") {
        await publishProfile(db, ctx);
        after(() => resubmitBusiness(db, ctx));
      }
    } else {
      await saveWebsiteChoice(db, ctx, false, null);
      await confirmReview(db, ctx, false);
      const job = await generateSiteDraft(db, ctx, { requestId: String(form.get("requestId") ?? "") });
      if (job.status === "failed") {
        return { ok: false, message: "We couldn't build your website this time. Your details are saved. Try again.", values };
      }
      destination = "/app/website?generated=1";
    }
    await completeOnboarding(db, ctx);
  } catch (err) {
    return toActionError(err, values);
  }
  redirect(destination);
}

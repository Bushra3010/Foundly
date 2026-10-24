"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { checkWebsiteSoon } from "@/server/audit/service";
import { getDb } from "@/db";
import { formValues, toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { fieldErrors, websiteChoiceSchema, websiteRequestSchema } from "@/lib/validation";
import { saveWebsiteChoice } from "@/server/business";
import { AppError } from "@/server/context";
import { cancelWebsiteRequest, createWebsiteRequest } from "@/server/website-requests";

/**
 * Connects the owner's own website. If they had asked our team to build one,
 * that request is cancelled, since they have a website now.
 */
export async function connectWebsiteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const parsed = websiteChoiceSchema.safeParse({ hasWebsite: "yes", websiteUrl: values.websiteUrl ?? "" });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error), values };
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    await saveWebsiteChoice(db, ctx, true, "websiteUrl" in parsed.data ? (parsed.data.websiteUrl ?? null) : null);
    await cancelWebsiteRequest(db, ctx).catch((err) => {
      if (!(err instanceof AppError && err.code === "not_found")) throw err;
    });
    // Check the new site straight away, so its score reflects this website.
    after(() => checkWebsiteSoon(db, ctx));
  } catch (err) {
    return toActionError(err, values);
  }
  revalidatePath("/app", "layout");
  redirect(form.get("mode") === "change" ? "/app/website?changed=1" : "/app/website?connected=1");
}

/** The owner no longer has their own website, so they can ask Foundly to build one. */
export async function noWebsiteAction(): Promise<ActionState> {
  try {
    await saveWebsiteChoice(await getDb(), await requireCtx(), false, null);
    revalidatePath("/app", "layout");
    return { ok: true, message: "Removed. You can ask us to build your website now." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function requestWebsiteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const parsed = websiteRequestSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Some fields need attention.", fieldErrors: fieldErrors(parsed.error), values };
  try {
    await createWebsiteRequest(await getDb(), await requireCtx(), parsed.data);
    revalidatePath("/app", "layout");
    return { ok: true, message: "Thanks! We'll contact you soon to plan your website." };
  } catch (err) {
    return toActionError(err, values);
  }
}

export async function cancelRequestAction(): Promise<ActionState> {
  try {
    await cancelWebsiteRequest(await getDb(), await requireCtx());
    revalidatePath("/app", "layout");
    return { ok: true, message: "Request cancelled." };
  } catch (err) {
    return toActionError(err);
  }
}

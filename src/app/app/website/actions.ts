"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { resubmitBusiness } from "@/server/indexnow";
import { getDb } from "@/db";
import { formValues, toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import type { SiteContent } from "@/lib/site/content";
import { AppError } from "@/server/context";
import { saveWebsiteChoice } from "@/server/business";
import { addDomain, removeDomain, verifyDomain } from "@/server/domains";
import { changeSiteSlug, generateSiteDraft, publishSite, regenerateBlock, rollbackSite, saveDraft, unpublishSite } from "@/server/sites";

export async function generateAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const job = await generateSiteDraft(await getDb(), await requireCtx(), { requestId: String(form.get("requestId") ?? "") });
    revalidatePath("/app/website");
    if (job.status === "failed") return { ok: false, message: "We couldn't build the draft. Your current draft is unchanged — try again." };
    return { ok: true, message: "Your draft is ready. Review the preview before publishing." };
  } catch (err) {
    return toActionError(err);
  }
}

/** The owner no longer has their own website, so Foundly can create one for them. */
export async function noWebsiteAction(): Promise<ActionState> {
  try {
    await saveWebsiteChoice(await getDb(), await requireCtx(), false, null);
    revalidatePath("/app", "layout");
    return { ok: true, message: "Removed. You can create your website now." };
  } catch (err) {
    return toActionError(err);
  }
}

export type DraftResult =
  | { ok: true; revision: number; draft: SiteContent }
  | { ok: false; message: string; conflict?: boolean; issues?: { path: string; message: string }[] };

function draftError(err: unknown): DraftResult {
  if (err instanceof AppError) {
    return {
      ok: false,
      message: err.message,
      conflict: err.code === "precondition_failed",
      issues: err.details?.issues as { path: string; message: string }[] | undefined,
    };
  }
  console.error(err);
  return { ok: false, message: "Couldn't save just now. Your changes are still here — we'll keep trying." };
}

export async function saveDraftAction(draft: unknown, revision: number): Promise<DraftResult> {
  try {
    const site = await saveDraft(await getDb(), await requireCtx(), draft, revision);
    return { ok: true, revision: site.draftRevision, draft: site.draft };
  } catch (err) {
    return draftError(err);
  }
}

export async function regenerateBlockAction(blockId: string, revision: number): Promise<DraftResult> {
  try {
    const site = await regenerateBlock(await getDb(), await requireCtx(), blockId, revision);
    return { ok: true, revision: site.draftRevision, draft: site.draft };
  } catch (err) {
    return draftError(err);
  }
}

export async function publishAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    const v = await publishSite(db, ctx, Number(form.get("revision")));
    revalidatePath("/app", "layout");
    // Tell search engines (and so AI search) the pages changed, after responding.
    after(() => resubmitBusiness(db, ctx));
    return { ok: true, message: `Version ${v.versionNumber} is live.` };
  } catch (err) {
    return toActionError(err);
  }
}

export async function rollbackAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    const v = await rollbackSite(db, ctx, String(form.get("versionId")));
    revalidatePath("/app/website");
    after(() => resubmitBusiness(db, ctx));
    return { ok: true, message: `Version ${v.versionNumber} is live again.` };
  } catch (err) {
    return toActionError(err);
  }
}

export async function unpublishAction(): Promise<ActionState> {
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    await unpublishSite(db, ctx);
    revalidatePath("/app", "layout");
    after(() => resubmitBusiness(db, ctx));
    return { ok: true, message: "Your website is offline. Your draft and versions are kept." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function changeSlugAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    const site = await changeSiteSlug(db, ctx, String(values.slug ?? "").trim().toLowerCase());
    revalidatePath("/app/website");
    after(() => resubmitBusiness(db, ctx));
    return { ok: true, message: `Your website address is now /s/${site.slug}. The old address redirects.` };
  } catch (err) {
    return toActionError(err, values);
  }
}

export async function addDomainAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await addDomain(await getDb(), await requireCtx(), String(form.get("hostname") ?? ""));
    revalidatePath("/app/website");
    return { ok: true, message: "Add the DNS records shown, then select Check DNS." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function verifyDomainAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const d = await verifyDomain(await getDb(), await requireCtx(), String(form.get("domainId")));
    revalidatePath("/app/website");
    return d.status === "verified"
      ? { ok: true, message: `${d.hostname} is verified. It goes live once your hosting provider has issued its security certificate.` }
      : { ok: false, message: `Not ready yet: ${d.lastError}. DNS changes can take up to 48 hours.` };
  } catch (err) {
    return toActionError(err);
  }
}

export async function removeDomainAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await removeDomain(await getDb(), await requireCtx(), String(form.get("domainId")));
    revalidatePath("/app/website");
    return { ok: true, message: "Domain disconnected. Your platform address still works." };
  } catch (err) {
    return toActionError(err);
  }
}

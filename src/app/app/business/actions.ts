"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { resubmitBusiness } from "@/server/indexnow";
import { getDb } from "@/db";
import { formValues, toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { businessDetailsSchema, fieldErrors, listingUrl, splitList } from "@/lib/validation";
import { startClaim, verifyClaim } from "@/server/claims";
import { addListing, confirmPublicContact, getProfile, publishProfile, unpublishProfile, updateBusinessDetails } from "@/server/business";
import { decodeConnection } from "@/server/connect";
import { connectGoogleLocation, disconnectGoogle, syncGoogle, syncGoogleSafe } from "@/server/google-business";
import { can } from "@/server/context";

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** "Name: description" per line; the description is optional. */
function parseServices(value: FormDataEntryValue | null) {
  return lines(value).map((line) => {
    const i = line.indexOf(":");
    return i === -1 ? { name: line } : { name: line.slice(0, i).trim(), description: line.slice(i + 1).trim() || undefined };
  });
}

/** "Days: hours" per line, e.g. "Mon–Sat: 9am–7pm". */
function parseHours(value: FormDataEntryValue | null) {
  return lines(value).map((line) => {
    const i = line.indexOf(":");
    return i === -1 ? { days: line, hours: "" } : { days: line.slice(0, i).trim(), hours: line.slice(i + 1).trim() };
  });
}

export async function saveDetailsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const parsed = businessDetailsSchema.safeParse({
    ...values,
    showAddress: form.get("showAddress") === "on",
    services: parseServices(form.get("services")),
    serviceAreas: splitList(form.get("serviceAreas")),
    hours: parseHours(form.get("hours")),
    listings: lines(form.get("listings")),
    expectedVersion: Number(values.expectedVersion),
  });
  if (!parsed.success) {
    return { ok: false, message: "Some fields need attention.", fieldErrors: fieldErrors(parsed.error), values };
  }
  if (!parsed.data.phone && !parsed.data.whatsapp && !parsed.data.email) {
    return { ok: false, fieldErrors: { phone: ["Keep at least one way for customers to contact you"] }, values };
  }
  try {
    await updateBusinessDetails(await getDb(), await requireCtx(), parsed.data);
    revalidatePath("/app", "layout");
    return { ok: true, message: "Saved. Publish your website or profile again to show these changes publicly." };
  } catch (err) {
    return toActionError(err, values);
  }
}

export async function confirmContactAction(): Promise<ActionState> {
  try {
    await confirmPublicContact(await getDb(), await requireCtx());
    revalidatePath("/app", "layout");
    return { ok: true, message: "Confirmed." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function publishProfileAction(): Promise<ActionState> {
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    await publishProfile(db, ctx);
    revalidatePath("/app", "layout");
    after(() => resubmitBusiness(db, ctx));
    revalidatePath("/directory");
    return { ok: true, message: "Your directory profile is up to date." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function unpublishProfileAction(): Promise<ActionState> {
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    await unpublishProfile(db, ctx);
    revalidatePath("/app", "layout");
    after(() => resubmitBusiness(db, ctx));
    revalidatePath("/directory");
    return { ok: true, message: "Your profile is hidden from the directory." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function startClaimAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const method = String(form.get("method"));
  if (method !== "dns" && method !== "file" && method !== "manual") return { ok: false, message: "Choose a verification method." };
  try {
    await startClaim(await getDb(), await requireCtx(), method, String(form.get("note") ?? "").slice(0, 1000) || undefined);
    revalidatePath("/app/business");
    return { ok: true, message: method === "manual" ? "Sent for review. We'll email you." : "Follow the steps below, then select Check now." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function verifyClaimAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await verifyClaim(await getDb(), await requireCtx(), String(form.get("claimId")));
    revalidatePath("/app/business");
    return { ok: true, message: "Verified. Your profile now shows how ownership was confirmed." };
  } catch (err) {
    return toActionError(err);
  }
}

/**
 * "Still correct?" Marks the details as confirmed today and refreshes the public
 * profile, so pages carry a current date (recently confirmed content is cited
 * more often) and search engines are told to recrawl.
 */
export async function confirmFreshAction(): Promise<ActionState> {
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    await confirmPublicContact(db, ctx);
    const profile = await getProfile(db, ctx);
    if (profile?.status === "published" && can(ctx, "owner")) await publishProfile(db, ctx);
    revalidatePath("/app", "layout");
    after(() => resubmitBusiness(db, ctx));
    after(() => syncGoogleSafe(db, ctx));
    return { ok: true, message: "Thanks. Your details are marked as confirmed today." };
  } catch (err) {
    return toActionError(err);
  }
}

/** Presence kit: the owner pastes the link of a listing they just created. */
export async function addListingAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = { url: String(form.get("url") ?? "") };
  const parsed = listingUrl.safeParse(values.url);
  if (!parsed.success) return { ok: false, fieldErrors: { url: ["Enter a web address like instagram.com/yourbusiness"] }, values };
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    await addListing(db, ctx, parsed.data);
    revalidatePath("/app", "layout");
    after(() => resubmitBusiness(db, ctx));
    return { ok: true, message: "Linked. It now appears on your website and profile." };
  } catch (err) {
    return toActionError(err, values);
  }
}

/** Presence kit: link a listing found through the platform's own login. */
export async function linkCandidateAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const url = String(form.get("url") ?? "");
  const externalId = String(form.get("externalId") ?? "");
  const parsed = listingUrl.safeParse(url);
  if (!parsed.success) return { ok: false, message: "That listing link looks wrong. Try connecting again." };
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    const jar = await cookies();
    const conn = decodeConnection(jar.get("foundly_connect")?.value);
    // Only a candidate that came from this owner's own Google login can be connected for syncing.
    const chosen = conn?.candidates.find((c) => c.url === parsed.data && c.externalId === externalId);
    await addListing(db, ctx, parsed.data);
    if (chosen?.platform === "google" && chosen.externalId && conn?.refreshToken) {
      await connectGoogleLocation(db, ctx, { locationName: chosen.externalId, mapsUrl: chosen.url, refreshToken: conn.refreshToken });
      after(() => syncGoogleSafe(db, ctx));
    }
    jar.delete({ name: "foundly_connect", path: "/app/presence" });
    revalidatePath("/app", "layout");
    after(() => resubmitBusiness(db, ctx));
  } catch (err) {
    return toActionError(err);
  }
  redirect("/app/presence?connect=linked");
}

/** "Update Google now": pushes the confirmed facts to the connected listing. */
export async function syncGoogleAction(): Promise<ActionState> {
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    await syncGoogle(db, ctx);
    revalidatePath("/app/presence");
    return { ok: true, message: "Google Business Profile updated with your current details." };
  } catch (err) {
    revalidatePath("/app/presence");
    return toActionError(err);
  }
}

export async function disconnectGoogleAction(): Promise<ActionState> {
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    await disconnectGoogle(db, ctx);
    revalidatePath("/app", "layout");
    return { ok: true, message: "Google disconnected. Your listing stays as it is; Foundly just stops updating it." };
  } catch (err) {
    return toActionError(err);
  }
}

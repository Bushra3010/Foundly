"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { formValues, toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { businessDetailsSchema, fieldErrors, splitList } from "@/lib/validation";
import { confirmPublicContact, publishProfile, unpublishProfile, updateBusinessDetails } from "@/server/business";

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
    await publishProfile(await getDb(), await requireCtx());
    revalidatePath("/app", "layout");
    revalidatePath("/directory");
    return { ok: true, message: "Your directory profile is up to date." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function unpublishProfileAction(): Promise<ActionState> {
  try {
    await unpublishProfile(await getDb(), await requireCtx());
    revalidatePath("/app", "layout");
    revalidatePath("/directory");
    return { ok: true, message: "Your profile is hidden from the directory." };
  } catch (err) {
    return toActionError(err);
  }
}

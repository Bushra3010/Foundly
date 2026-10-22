"use server";

import { headers } from "next/headers";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { rateLimit } from "@/lib/rate-limit";
import { fieldErrors, leadSchema } from "@/lib/validation";
import { submitLead } from "@/server/leads";

export async function submitLeadAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = {
    siteSlug: String(form.get("siteSlug") ?? ""),
    name: String(form.get("name") ?? ""),
    contact: String(form.get("contact") ?? ""),
    message: String(form.get("message") ?? ""),
    website: String(form.get("website") ?? ""),
  };
  const parsed = leadSchema.safeParse(values);
  if (!parsed.success) {
    // A filled honeypot gets the same success response so bots learn nothing.
    if (values.website) return { ok: true, message: "Thanks — your enquiry was sent." };
    return { ok: false, fieldErrors: fieldErrors(parsed.error), values };
  }
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`lead:${ip}`, 5, 10 * 60_000) || !rateLimit(`lead-site:${values.siteSlug}`, 50, 60 * 60_000)) {
    return { ok: false, message: "Too many enquiries were sent from here. Please wait a few minutes and try again.", values };
  }
  try {
    await submitLead(await getDb(), parsed.data, "website contact form");
    return { ok: true, message: "Thanks — your enquiry was sent. The business will reply using the details you gave." };
  } catch (err) {
    return toActionError(err, values);
  }
}

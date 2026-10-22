"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { updateLead } from "@/server/leads";

const schema = z.object({
  leadId: z.uuid(),
  status: z.enum(["new", "contacted", "qualified", "closed"]),
  notes: z.string().trim().max(2000).transform((v) => v || null),
});

export async function updateLeadAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "Check the status and notes, then try again." };
  try {
    await updateLead(await getDb(), await requireCtx(), parsed.data.leadId, parsed.data);
    revalidatePath("/app/leads");
    return { ok: true, message: "Saved." };
  } catch (err) {
    return toActionError(err);
  }
}

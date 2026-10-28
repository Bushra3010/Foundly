"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { buildBrandProfile } from "@/server/profile-ai";

export async function refreshProfileAction(): Promise<ActionState> {
  try {
    const r = await buildBrandProfile(await getDb(), await requireCtx());
    revalidatePath("/app/profile");
    return { ok: true, message: `Profile built from ${r.fromAnswers} AI answer${r.fromAnswers === 1 ? "" : "s"} that name you.` };
  } catch (err) {
    return toActionError(err);
  }
}

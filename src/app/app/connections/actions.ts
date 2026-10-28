"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { writeListingText } from "@/server/listing-text";
import { syncConnectedSafe } from "@/server/sync";

/** Writes every listing description with AI, then pushes it to connected Google and Facebook pages. */
export async function writeListingTextAction(): Promise<ActionState> {
  try {
    const db = await getDb();
    const ctx = await requireCtx();
    await writeListingText(db, ctx);
    after(() => syncConnectedSafe(db, ctx));
    revalidatePath("/app/connections");
    return { ok: true, message: "Listing text written from your details. Copy it below; connected Google and Facebook pages are being updated." };
  } catch (err) {
    return toActionError(err);
  }
}

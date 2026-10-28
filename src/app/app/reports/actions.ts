"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { buildWeeklyReport } from "@/server/weekly-report";

/** Writes (or rewrites) this week's report from the stored answers. */
export async function writeReportAction(): Promise<ActionState> {
  try {
    const r = await buildWeeklyReport(await getDb(), await requireCtx(), { manual: true });
    revalidatePath("/app/reports");
    revalidatePath("/app");
    return { ok: true, message: r.data.source === "ai" ? "This week's report is ready." : "This week's report is ready, built from the numbers (no AI source connected to write it)." };
  } catch (err) {
    return toActionError(err);
  }
}

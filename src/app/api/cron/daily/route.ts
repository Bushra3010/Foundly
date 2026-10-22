import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { isAuthorizedCron } from "@/lib/cron";
import { applyPeriodTransitions } from "@/server/billing/service";
import { processDueDeletions } from "@/server/lifecycle";
import { scheduledRunKey } from "@/server/monitoring/service";
import { sendWeeklySummaries } from "@/server/notifications";

export const maxDuration = 300;

/** Daily: billing period transitions, due deletions; Mondays: weekly summaries. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  const billing = await applyPeriodTransitions(db);
  const deletions = await processDueDeletions(db);
  const summaries = new Date().getUTCDay() === 1 ? await sendWeeklySummaries(db, scheduledRunKey()) : 0;
  return NextResponse.json({ billing, deletions, summaries });
}

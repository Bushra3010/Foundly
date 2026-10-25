import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { isAuthorizedCron } from "@/lib/cron";
import { applyPeriodTransitions } from "@/server/billing/service";
import { processDueDeletions } from "@/server/lifecycle";
import { scheduledRunKey } from "@/server/monitoring/service";
import { pruneRateLimits } from "@/server/rate-limit";
import { sendConfirmReminders, sendWeeklySummaries } from "@/server/notifications";
import { geoMaintenance } from "@/server/sync";

export const maxDuration = 300;

/** Daily: billing period transitions, due deletions, expired rate limits, GEO upkeep for that weekday; Mondays: weekly summaries. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  const billing = await applyPeriodTransitions(db);
  const deletions = await processDueDeletions(db);
  const rateLimits = await pruneRateLimits(db);
  const monday = new Date().getUTCDay() === 1;
  const summaries = monday ? await sendWeeklySummaries(db, scheduledRunKey()) : 0;
  // GEO upkeep: each business gets fresh search engine and listing signals once a week, on its own weekday.
  const geo = await geoMaintenance(db, { weekday: new Date().getUTCDay() });
  const reminders = await sendConfirmReminders(db, new Date().toISOString().slice(0, 7));
  return NextResponse.json({ billing, deletions, rateLimits, summaries, geo, reminders });
}

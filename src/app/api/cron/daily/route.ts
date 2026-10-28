import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { isAuthorizedCron } from "@/lib/cron";
import { applyPeriodTransitions } from "@/server/billing/service";
import { processDueDeletions } from "@/server/lifecycle";
import { pruneRateLimits } from "@/server/rate-limit";
import { sendConfirmReminders, sendWeeklySummaries } from "@/server/notifications";
import { geoMaintenance } from "@/server/sync";
import { buildWeeklyReports, weekKeyOf } from "@/server/weekly-report";

export const maxDuration = 300;

/** Daily: billing period transitions, due deletions, expired rate limits, GEO upkeep for that weekday; Mondays: weekly reports, then the summary emails. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  const billing = await applyPeriodTransitions(db);
  const deletions = await processDueDeletions(db);
  const rateLimits = await pruneRateLimits(db);
  const monday = new Date().getUTCDay() === 1;
  const reports = monday ? await buildWeeklyReports(db) : 0;
  const summaries = monday ? await sendWeeklySummaries(db, weekKeyOf()) : 0;
  // GEO upkeep: each business gets fresh search engine and listing signals once a week, on its own weekday.
  const geo = await geoMaintenance(db, { weekday: new Date().getUTCDay() });
  const reminders = await sendConfirmReminders(db, new Date().toISOString().slice(0, 7));
  return NextResponse.json({ billing, deletions, rateLimits, reports, summaries, geo, reminders });
}

import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { isAuthorizedCron } from "@/lib/cron";
import { resumeRuns, scheduleDueRuns } from "@/server/monitoring/service";

export const maxDuration = 300;

/** Weekly scheduling plus recovery of queued or interrupted runs. Call hourly. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  const scheduled = await scheduleDueRuns(db);
  const executed = await resumeRuns(db);
  return NextResponse.json({ scheduled, executed });
}

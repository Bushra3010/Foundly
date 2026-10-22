import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db";
import { getCtxOrNull } from "@/lib/auth/session";
import { audit } from "@/server/context";
import { effectiveMention, METRIC_DEFINITIONS_VERSION } from "@/server/monitoring/metrics";
import { queryObservations } from "@/server/monitoring/service";
import { applyMetric, parseEvidence } from "../evidence/filters";

const cell = (v: unknown) => {
  let s = v == null ? "" : String(v instanceof Date ? v.toISOString() : v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  const ctx = await getCtxOrNull();
  if (!ctx) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const db = await getDb();
  const sp = Object.fromEntries(req.nextUrl.searchParams);
  const { filters, metric } = parseEvidence(sp);
  const rows = applyMetric(await queryObservations(db, ctx, filters, 5000), metric);
  await audit(db, ctx, "monitoring.exported", undefined, { count: rows.length, ...sp });

  const header = ["captured_at", "question", "provider", "source_type", "model", "requested_location", "location_method", "sample", "status", "mentioned_you", "cited_your_site", "listed_position", "uncertain_match", "correction", "citations", "answer", "extraction_version"];
  const lines = rows.map((o) => {
    const self = o.matches.find((m) => m.brandKey === "self");
    return [
      o.capturedAt, o.questionText, o.provider, o.sourceType, o.model, o.requestedLocale, o.appliedLocale, o.sample, o.status,
      self ? effectiveMention(self) : "", self?.cited ?? "", self?.listedPosition ?? "", self?.ambiguous ?? "", self?.correction ?? "",
      o.citations.map((c) => c.url).join(" "), o.rawAnswer, o.extractionVersion,
    ].map(cell).join(",");
  });
  const meta = `# metric_definitions_version=${METRIC_DEFINITIONS_VERSION}; filters=${JSON.stringify(sp)}`;
  return new NextResponse([meta, header.map(cell).join(","), ...lines].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ai-visibility-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

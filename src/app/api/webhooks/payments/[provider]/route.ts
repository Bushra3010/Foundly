import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { providerByKey } from "@/server/billing/providers";
import { processBillingEvent } from "@/server/billing/service";

/** Verified, deduplicated payment webhooks. Always 2xx for a verified duplicate so providers stop retrying. */
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const provider = providerByKey((await params).provider);
  if (!provider) return NextResponse.json({ error: "unknown provider" }, { status: 404 });
  const raw = await req.text();
  if (raw.length > 512_000) return NextResponse.json({ error: "too large" }, { status: 413 });
  const event = provider.parseWebhook(raw, req.headers);
  if (!event) return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  const result = await processBillingEvent(await getDb(), event);
  return NextResponse.json({ result });
}

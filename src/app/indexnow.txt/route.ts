import { indexNowKey } from "@/server/indexnow";

export const dynamic = "force-dynamic";

/** The IndexNow key file. Search engines fetch it to confirm our pings are genuine. */
export async function GET() {
  const key = indexNowKey();
  if (!key) return new Response("Not found\n", { status: 404 });
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

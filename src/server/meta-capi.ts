import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { CONSENT_COOKIE, META_PIXEL_ID, PENDING_EVENT_COOKIE } from "@/lib/meta-pixel";

/**
 * Meta Conversions API: sends key events from the server, so they still count when a browser
 * blocks the Pixel. Each event also asks the browser to send the same event with the same ID,
 * which Meta uses to count it once. Only runs for visitors who accepted marketing cookies.
 *
 * Needs NEXT_PUBLIC_META_PIXEL_ID (public) and META_CAPI_TOKEN (secret, from Events Manager).
 * Without the token, only the browser event is sent.
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v23.0";

const sha256 = (value: string) => createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

/** Records a standard event such as "Lead". Never throws: tracking must not break sign-up. */
export async function sendMetaEvent(name: string, opts: { email?: string; sourcePath: string }): Promise<void> {
  try {
    if (!META_PIXEL_ID) return;
    const jar = await cookies();
    if (jar.get(CONSENT_COOKIE)?.value !== "accepted") return;

    const id = randomUUID();
    jar.set(PENDING_EVENT_COOKIE, `${name}.${id}`, { path: "/", maxAge: 600, sameSite: "lax", secure: process.env.NODE_ENV === "production" });

    const token = process.env.META_CAPI_TOKEN;
    if (!token || process.env.NODE_ENV !== "production") return;

    const h = await headers();
    const base = (process.env.APP_URL ?? "").replace(/\/$/, "");
    const userData: Record<string, unknown> = {
      client_ip_address: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
      client_user_agent: h.get("user-agent") ?? undefined,
      fbp: jar.get("_fbp")?.value,
      fbc: jar.get("_fbc")?.value,
    };
    if (opts.email) userData.em = [sha256(opts.email)];

    await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{ event_name: name, event_time: Math.floor(Date.now() / 1000), event_id: id, action_source: "website", event_source_url: `${base}${opts.sourcePath}`, user_data: userData }],
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error("[meta-capi] event not sent", err);
  }
}

import "server-only";
import { createHash } from "node:crypto";
import type { DbOrTx } from "@/db";
import { slugify } from "@/lib/geo";
import { getBusiness, getProfile } from "./business";
import type { Ctx } from "./context";

/**
 * IndexNow tells Bing (and Yandex, Naver, Seznam) that a page changed, so it is
 * recrawled within minutes instead of days. Bing's index feeds ChatGPT search
 * and Copilot, so this is one of the quickest ways to reach AI answers.
 *
 * The key is public by design (it is served at /indexnow.txt). It is derived
 * from APP_SECRET so no extra configuration is needed, and can be overridden
 * with INDEXNOW_KEY.
 */
export function indexNowKey(): string | null {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY;
  const secret = process.env.APP_SECRET;
  if (!secret) return null;
  return createHash("sha256").update(`indexnow:${secret}`).digest("hex").slice(0, 32);
}

/** Submits changed public URLs. Never throws; a failed ping must not break publishing. */
export async function pingIndexNow(urls: string[]): Promise<{ sent: number; status?: number }> {
  const key = indexNowKey();
  const appUrl = process.env.APP_URL;
  if (!key || !appUrl || process.env.NODE_ENV !== "production") return { sent: 0 };
  const host = new URL(appUrl).host;
  // IndexNow only accepts URLs on the host that serves the key.
  const urlList = Array.from(new Set(urls)).filter((u) => {
    try {
      return new URL(u).host === host;
    } catch {
      return false;
    }
  });
  if (urlList.length === 0) return { sent: 0 };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: `${appUrl}/indexnow.txt`, urlList }),
      signal: AbortSignal.timeout(8000),
    });
    return { sent: urlList.length, status: res.status };
  } catch (err) {
    console.error("[indexnow] ping failed", err);
    return { sent: 0 };
  }
}

/** Every public URL that shows this business, to resubmit after it changes. */
export async function businessPublicUrls(db: DbOrTx, ctx: Ctx) {
  const base = process.env.APP_URL ?? "";
  const [profile, business] = await Promise.all([getProfile(db, ctx), getBusiness(db, ctx)]);
  const urls = [`${base}/llms.txt`, `${base}/directory`];
  if (profile) urls.push(`${base}/b/${profile.slug}`, `${base}/b/${profile.slug}/llms.txt`);
  if (business) {
    urls.push(`${base}/directory/${slugify(business.city)}`, `${base}/directory/${slugify(business.city)}/${slugify(business.category)}`);
  }
  return urls;
}

/** Resubmits a business's public pages. For use in after() so owners never wait on it. */
export async function resubmitBusiness(db: DbOrTx, ctx: Ctx) {
  try {
    await pingIndexNow(await businessPublicUrls(db, ctx));
  } catch (err) {
    console.error("[indexnow] resubmit failed", err);
  }
}

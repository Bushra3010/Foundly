import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * "Connect" for listings the owner already has. The owner signs in with the
 * platform's official login, we read the listings that account manages and
 * the owner picks one. No passwords, no scraping, nothing is created on the
 * owner's behalf. Tokens are used once and never stored.
 */
export type Provider = "google" | "facebook";
export type Candidate = { platform: "google" | "facebook" | "instagram"; title: string; url: string; detail?: string };

const PROVIDERS: Record<Provider, { label: string; configured: () => boolean; envNames: string[] }> = {
  google: { label: "Google", configured: () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), envNames: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
  facebook: { label: "Facebook", configured: () => Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET), envNames: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"] },
};

export function providerConfigured(p: Provider) {
  return PROVIDERS[p].configured();
}
export function providerEnvNames(p: Provider) {
  return PROVIDERS[p].envNames;
}

function appUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}
export function callbackUrl(p: Provider) {
  return `${appUrl()}/api/connect/${p}/callback`;
}

// ---------- Signed state: ties the callback to the signed-in owner ----------

function secret() {
  const s = process.env.APP_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("APP_SECRET is required in production");
  return s || "dev-only-connect-secret";
}
function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function makeState(data: { provider: Provider; workspaceId: string; userId: string }) {
  const payload = Buffer.from(JSON.stringify({ ...data, nonce: randomBytes(8).toString("hex"), exp: Date.now() + 10 * 60_000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readState(state: string): { provider: Provider; workspaceId: string; userId: string } | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const want = sign(payload);
  if (want.length !== sig.length || !timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { provider: Provider; workspaceId: string; userId: string; exp: number };
    if (!data.exp || data.exp < Date.now()) return null;
    return { provider: data.provider, workspaceId: data.workspaceId, userId: data.userId };
  } catch {
    return null;
  }
}

/** Candidates travel from the callback to the picker in a short-lived signed cookie. */
export function encodeCandidates(c: Candidate[]) {
  const payload = Buffer.from(JSON.stringify({ c, exp: Date.now() + 15 * 60_000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function decodeCandidates(value: string | undefined): Candidate[] | null {
  if (!value) return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const want = sign(payload);
  if (want.length !== sig.length || !timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { c: Candidate[]; exp: number };
    return data.exp > Date.now() ? data.c : null;
  } catch {
    return null;
  }
}

// ---------- Google Business Profile ----------

export function googleAuthUrl(state: string) {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  u.searchParams.set("redirect_uri", callbackUrl("google"));
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "https://www.googleapis.com/auth/business.manage");
  u.searchParams.set("access_type", "online");
  u.searchParams.set("prompt", "select_account");
  u.searchParams.set("state", state);
  return u.toString();
}

async function googleToken(code: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: callbackUrl("google"), grant_type: "authorization_code" }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status})`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Lists the Business Profile locations this Google account manages. */
export async function googleCandidates(code: string): Promise<Candidate[]> {
  const token = await googleToken(code);
  const h = { Authorization: `Bearer ${token}` };
  const accRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", { headers: h, signal: AbortSignal.timeout(10_000) });
  if (!accRes.ok) throw new Error(`Google accounts request failed (${accRes.status}). The Business Profile API must be enabled and approved for this app.`);
  const accounts = ((await accRes.json()) as { accounts?: { name: string }[] }).accounts ?? [];
  const out: Candidate[] = [];
  for (const acc of accounts.slice(0, 5)) {
    const u = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${acc.name}/locations`);
    u.searchParams.set("readMask", "name,title,storefrontAddress,metadata,websiteUri");
    u.searchParams.set("pageSize", "50");
    const res = await fetch(u, { headers: h, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) continue;
    const data = (await res.json()) as { locations?: { name: string; title: string; storefrontAddress?: { locality?: string; addressLines?: string[] }; metadata?: { mapsUri?: string }; websiteUri?: string }[] };
    for (const loc of data.locations ?? []) {
      if (!loc.metadata?.mapsUri) continue;
      out.push({ platform: "google", title: loc.title, url: loc.metadata.mapsUri, detail: [loc.storefrontAddress?.addressLines?.[0], loc.storefrontAddress?.locality].filter(Boolean).join(", ") || undefined });
    }
  }
  return out;
}

// ---------- Facebook Pages + Instagram business accounts ----------

export function facebookAuthUrl(state: string) {
  const u = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  u.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
  u.searchParams.set("redirect_uri", callbackUrl("facebook"));
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "pages_show_list,instagram_basic");
  u.searchParams.set("state", state);
  return u.toString();
}

async function facebookToken(code: string): Promise<string> {
  const u = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
  u.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
  u.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET!);
  u.searchParams.set("redirect_uri", callbackUrl("facebook"));
  u.searchParams.set("code", code);
  const res = await fetch(u, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Facebook token exchange failed (${res.status})`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Lists the Pages this Facebook account manages, with their Instagram business accounts. */
export async function facebookCandidates(code: string): Promise<Candidate[]> {
  const token = await facebookToken(code);
  const u = new URL("https://graph.facebook.com/v21.0/me/accounts");
  u.searchParams.set("fields", "id,name,link,instagram_business_account{username}");
  u.searchParams.set("access_token", token);
  const res = await fetch(u, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Facebook pages request failed (${res.status})`);
  const data = (await res.json()) as { data?: { id: string; name: string; link?: string; instagram_business_account?: { username?: string } }[] };
  const out: Candidate[] = [];
  for (const page of data.data ?? []) {
    out.push({ platform: "facebook", title: page.name, url: page.link ?? `https://www.facebook.com/${page.id}` });
    if (page.instagram_business_account?.username) {
      out.push({ platform: "instagram", title: `@${page.instagram_business_account.username}`, url: `https://www.instagram.com/${page.instagram_business_account.username}`, detail: `Linked to the ${page.name} Page` });
    }
  }
  return out;
}

export async function candidatesFor(p: Provider, code: string) {
  return p === "google" ? googleCandidates(code) : facebookCandidates(code);
}

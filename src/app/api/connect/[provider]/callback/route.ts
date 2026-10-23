import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { candidatesFor, encodeCandidates, readState, type Provider } from "@/server/connect";

export const CANDIDATES_COOKIE = "foundly_connect";

/**
 * Back from the platform. Verifies the signed state belongs to this owner,
 * reads the listings their account manages, and hands them to the picker.
 */
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const url = new URL(req.url);
  const back = (q: string) => NextResponse.redirect(`${base}/app/presence?connect=${q}`);
  const state = readState(url.searchParams.get("state") ?? "");
  const user = await getCurrentUser();
  if (!state || state.provider !== provider || !user || user.id !== state.userId) return back("invalid");
  if (url.searchParams.get("error")) return back("denied");
  const code = url.searchParams.get("code");
  if (!code) return back("invalid");
  try {
    const { candidates, refreshToken } = await candidatesFor(provider as Provider, code);
    if (candidates.length === 0) return back("none");
    const res = back(provider);
    res.cookies.set(CANDIDATES_COOKIE, encodeCandidates(candidates, refreshToken), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/app/presence", maxAge: 15 * 60 });
    return res;
  } catch (err) {
    console.error("[connect]", provider, err);
    return back("failed");
  }
}

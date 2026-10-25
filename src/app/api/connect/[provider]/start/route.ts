import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { getCurrentUser } from "@/lib/auth/session";
import { contextForUser } from "@/server/auth";
import { facebookAuthUrl, googleAuthUrl, makeState, providerConfigured, type Provider } from "@/server/connect";

/** Sends the signed-in owner to the platform's login. */
export async function GET(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const base = process.env.APP_URL ?? "http://localhost:3000";
  if (provider !== "google" && provider !== "facebook") return NextResponse.redirect(`${base}/app/connections?connect=unknown`);
  const p = provider as Provider;
  if (!providerConfigured(p)) return NextResponse.redirect(`${base}/app/connections?connect=unavailable`);
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${base}/login?next=${encodeURIComponent("/app/connections")}`);
  const ctx = await contextForUser(await getDb(), user.id);
  if (!ctx) return NextResponse.redirect(`${base}/login`);
  const state = makeState({ provider: p, workspaceId: ctx.workspaceId, userId: user.id });
  return NextResponse.redirect(p === "google" ? googleAuthUrl(state) : facebookAuthUrl(state));
}

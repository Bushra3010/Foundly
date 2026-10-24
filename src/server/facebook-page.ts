import "server-only";
import { and, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { integrations } from "@/db/schema";
import { facebookPageUpdate } from "@/lib/presence";
import { toPublicProfile } from "@/lib/profile";
import { AppError, audit, requireRole, type Ctx } from "./context";
import { decryptSecret, encryptSecret } from "./crypto";
import { getProfile, requireBusiness } from "./business";

/** A connected Facebook Page, kept in step with the confirmed facts through Meta's Graph API. */
const KIND = "facebook_page";

export async function getFacebookConnection(db: Db, ctx: Ctx) {
  const [row] = await db
    .select({ siteUrl: integrations.siteUrl, pageId: integrations.username, status: integrations.status, lastError: integrations.lastError, lastSyncedAt: integrations.lastSyncedAt, createdAt: integrations.createdAt })
    .from(integrations)
    .where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, KIND)));
  return row ?? null;
}

export async function connectFacebookPage(db: Db, ctx: Ctx, input: { pageId: string; link: string; pageToken: string }) {
  requireRole(ctx, "owner");
  await db.delete(integrations).where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, KIND)));
  await db.insert(integrations).values({ workspaceId: ctx.workspaceId, kind: KIND, siteUrl: input.link, username: input.pageId, secretEncrypted: encryptSecret(input.pageToken), connectedBy: ctx.userId });
  await audit(db, ctx, "integration.connected", KIND, { page: input.pageId });
}

export async function disconnectFacebook(db: Db, ctx: Ctx) {
  requireRole(ctx, "owner");
  await db.delete(integrations).where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, KIND)));
  await audit(db, ctx, "integration.disconnected", KIND);
}

export async function syncFacebook(db: Db, ctx: Ctx) {
  requireRole(ctx, "editor");
  const [row] = await db.select().from(integrations).where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, KIND)));
  if (!row) throw new AppError("not_found", "Facebook isn't connected.");
  const [b, profile] = await Promise.all([requireBusiness(db, ctx), getProfile(db, ctx)]);
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const websiteUrl = b.websiteUrl ?? `${appUrl}/b/${profile?.slug ?? ""}`;
  const body = facebookPageUpdate({ ...toPublicProfile(b), websiteUrl, profileUrl: `${appUrl}/b/${profile?.slug ?? ""}` });
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${row.username}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ...body, access_token: decryptSecret(row.secretEncrypted) }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = (await res.text()).slice(0, 300);
      throw new AppError("invalid", `Facebook rejected the update (${res.status}). ${res.status === 403 || res.status === 400 ? "The app may lack the pages_manage_metadata permission, or the connection expired. Connect Facebook again." : text}`);
    }
    await db.update(integrations).set({ status: "synced", lastError: null, lastSyncedAt: new Date() }).where(eq(integrations.id, row.id));
    await audit(db, ctx, "integration.synced", KIND, { fields: Object.keys(body) });
    return { ok: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db.update(integrations).set({ status: "error", lastError: message.slice(0, 500) }).where(eq(integrations.id, row.id));
    throw err instanceof AppError ? err : new AppError("invalid", message);
  }
}

export async function syncFacebookSafe(db: Db, ctx: Ctx) {
  try {
    const row = await getFacebookConnection(db, ctx);
    if (row) await syncFacebook(db, ctx);
  } catch (err) {
    console.error("[facebook-page] sync failed", err);
  }
}

import "server-only";
import { and, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { integrations } from "@/db/schema";
import { googleLocationUpdate } from "@/lib/presence";
import { AppError, audit, requireRole, type Ctx } from "./context";
import { decryptSecret, encryptSecret } from "./crypto";
import { requireBusiness } from "./business";
import { kitInputFor } from "./presence-input";

/**
 * A connected Google Business Profile location. The owner signed in with
 * Google once; from then on Foundly keeps the listing's description, phone
 * and website in step with the confirmed facts, through Google's official
 * Business Profile API. The refresh token is stored encrypted.
 */
const KIND = "google_business";

export async function getGoogleConnection(db: Db, ctx: Ctx) {
  const [row] = await db
    .select({ siteUrl: integrations.siteUrl, locationName: integrations.username, status: integrations.status, lastError: integrations.lastError, lastSyncedAt: integrations.lastSyncedAt, createdAt: integrations.createdAt })
    .from(integrations)
    .where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, KIND)));
  return row ?? null;
}

export async function connectGoogleLocation(db: Db, ctx: Ctx, input: { locationName: string; mapsUrl: string; refreshToken: string }) {
  requireRole(ctx, "owner");
  await db.delete(integrations).where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, KIND)));
  await db.insert(integrations).values({
    workspaceId: ctx.workspaceId,
    kind: KIND,
    siteUrl: input.mapsUrl,
    username: input.locationName,
    secretEncrypted: encryptSecret(input.refreshToken),
    connectedBy: ctx.userId,
  });
  await audit(db, ctx, "integration.connected", KIND, { location: input.locationName });
}

export async function disconnectGoogle(db: Db, ctx: Ctx) {
  requireRole(ctx, "owner");
  await db.delete(integrations).where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, KIND)));
  await audit(db, ctx, "integration.disconnected", KIND);
}

async function accessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ refresh_token: refreshToken, client_id: process.env.GOOGLE_CLIENT_ID ?? "", client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "", grant_type: "refresh_token" }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new AppError("invalid", "Google no longer accepts this connection. Connect Google again.");
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Pushes the confirmed facts to the connected location. Records the outcome; never throws to callers that use syncGoogleSafe. */
export async function syncGoogle(db: Db, ctx: Ctx) {
  requireRole(ctx, "editor");
  const [row] = await db.select().from(integrations).where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, KIND)));
  if (!row) throw new AppError("not_found", "Google isn't connected.");
  const b = await requireBusiness(db, ctx);
  const { input } = await kitInputFor(db, ctx, b);
  const { body, updateMask } = googleLocationUpdate(input);
  try {
    const token = await accessToken(decryptSecret(row.secretEncrypted));
    const u = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${row.username}`);
    u.searchParams.set("updateMask", updateMask);
    const res = await fetch(u, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      const text = (await res.text()).slice(0, 300);
      throw new AppError("invalid", `Google rejected the update (${res.status}). ${res.status === 403 ? "The listing may not be verified yet, or this app lacks Business Profile API access." : text}`);
    }
    await db.update(integrations).set({ status: "synced", lastError: null, lastSyncedAt: new Date() }).where(eq(integrations.id, row.id));
    await audit(db, ctx, "integration.synced", KIND, { updateMask });
    return { ok: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db.update(integrations).set({ status: "error", lastError: message.slice(0, 500) }).where(eq(integrations.id, row.id));
    throw err instanceof AppError ? err : new AppError("invalid", message);
  }
}

/** For background use after publishing: a failed sync is recorded on the connection, never surfaced as an error. */
export async function syncGoogleSafe(db: Db, ctx: Ctx) {
  try {
    const row = await getGoogleConnection(db, ctx);
    if (row) await syncGoogle(db, ctx);
  } catch (err) {
    console.error("[google-business] sync failed", err);
  }
}

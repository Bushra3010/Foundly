import { createHash } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, desc, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { assets } from "@/db/schema";
import { AppError, audit, requireRole, type Ctx } from "./context";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Allowed image types, identified by their file signature rather than the
 * browser-supplied type or extension. SVG is deliberately not accepted
 * because it can carry scripts.
 */
export function sniffImageType(buf: Buffer): "image/png" | "image/jpeg" | "image/webp" | null {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

function storageRoot() {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), ".data", "uploads");
}

function objectKey(workspaceId: string, id: string) {
  // Ids are server-generated UUIDs; validate anyway before touching storage.
  if (!/^[0-9a-f-]{36}$/.test(workspaceId) || !/^[0-9a-f-]{36}$/.test(id)) throw new AppError("invalid", "Bad asset id");
  return `${workspaceId}/${id}`;
}

/**
 * Serverless hosts have no persistent disk. On Vercel, photos go to a private
 * Vercel Blob store; on Netlify, to Netlify Blobs; everywhere else to
 * UPLOADS_DIR (or .data/uploads locally).
 */
function onVercelBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function onNetlify() {
  return Boolean(process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY === "true");
}

async function blobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "uploads", consistency: "strong" });
}

async function putObject(key: string, bytes: Buffer, contentType: string) {
  if (onVercelBlob()) {
    const { put } = await import("@vercel/blob");
    await put(key, bytes, { access: "private", contentType, addRandomSuffix: false, allowOverwrite: true });
    return;
  }
  if (onNetlify()) {
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    await (await blobStore()).set(key, ab, { metadata: { contentType } });
    return;
  }
  const p = path.join(storageRoot(), key);
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, bytes);
}

async function getObject(key: string): Promise<Buffer | null> {
  if (onVercelBlob()) {
    const { get } = await import("@vercel/blob");
    const found = await get(key, { access: "private" }).catch(() => null);
    return found?.stream ? Buffer.from(await new Response(found.stream).arrayBuffer()) : null;
  }
  if (onNetlify()) {
    const data = await (await blobStore()).get(key, { type: "arrayBuffer" });
    return data ? Buffer.from(data) : null;
  }
  return readFile(path.join(storageRoot(), key)).catch(() => null);
}

async function deleteObject(key: string) {
  if (onVercelBlob()) {
    const { del } = await import("@vercel/blob");
    await del(key).catch(() => undefined);
    return;
  }
  if (onNetlify()) {
    await (await blobStore()).delete(key);
    return;
  }
  await unlink(path.join(storageRoot(), key)).catch(() => undefined);
}

export async function saveUpload(db: Db, ctx: Ctx, file: { bytes: Buffer; name: string }, rightsConfirmed: boolean) {
  requireRole(ctx, "editor");
  if (!rightsConfirmed) throw new AppError("invalid", "Confirm that you own this photo or have permission to use it.");
  if (file.bytes.length === 0) throw new AppError("invalid", "The file is empty.");
  if (file.bytes.length > MAX_UPLOAD_BYTES) throw new AppError("invalid", "Photos must be 5 MB or smaller.");
  const contentType = sniffImageType(file.bytes);
  if (!contentType) throw new AppError("invalid", "Upload a JPEG, PNG or WebP photo.");

  const [row] = await db
    .insert(assets)
    .values({
      workspaceId: ctx.workspaceId,
      uploadedBy: ctx.userId,
      contentType,
      bytes: file.bytes.length,
      sha256: createHash("sha256").update(file.bytes).digest("hex"),
      originalName: file.name.slice(0, 200),
    })
    .returning();
  await putObject(objectKey(ctx.workspaceId, row.id), file.bytes, contentType);
  await audit(db, ctx, "asset.uploaded", row.id, { bytes: row.bytes, contentType });
  return row;
}

export async function listAssets(db: Db, ctx: Ctx) {
  return db.select().from(assets).where(eq(assets.workspaceId, ctx.workspaceId)).orderBy(desc(assets.createdAt)).limit(100);
}

/** Public read for images placed on websites. Ids are unguessable UUIDs. */
export async function readAsset(db: Db, id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const [row] = await db.select().from(assets).where(eq(assets.id, id));
  if (!row) return null;
  const bytes = await getObject(objectKey(row.workspaceId, row.id));
  return bytes ? { row, bytes } : null;
}

export async function deleteAsset(db: Db, ctx: Ctx, id: string) {
  requireRole(ctx, "editor");
  const [row] = await db.delete(assets).where(and(eq(assets.id, id), eq(assets.workspaceId, ctx.workspaceId))).returning();
  if (row) await deleteObject(objectKey(row.workspaceId, row.id));
}

export function assetUrl(id: string) {
  return `${process.env.APP_URL ?? "http://localhost:3000"}/media/${id}`;
}

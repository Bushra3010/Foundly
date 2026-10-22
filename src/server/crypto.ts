import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/** Encrypts integration secrets at rest with AES-256-GCM. */
function key(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw && process.env.NODE_ENV === "production") throw new Error("ENCRYPTION_KEY is required in production");
  return createHash("sha256").update(raw || "dev-only-encryption-key").digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), enc].map((b) => b.toString("base64")).join(".");
}

export function decryptSecret(payload: string): string {
  const [iv, tag, enc] = payload.split(".").map((p) => Buffer.from(p, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

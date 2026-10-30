/**
 * Meta Pixel settings shared by the browser and the server. Nothing is sent to Meta until a
 * visitor accepts marketing cookies, and the Pixel is off entirely while no Pixel ID is set.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

/** "accepted" or "declined". Unset means the visitor has not chosen yet. */
export const CONSENT_COOKIE = "foundly-consent";
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60;

/** A server-side event the browser should repeat once, with the same ID so Meta counts it once. Stored as "Name.uuid". */
export const PENDING_EVENT_COOKIE = "foundly-meta-event";

/** Signed-in and staff pages are never tracked. */
export function isTrackedPath(pathname: string): boolean {
  return !/^\/(app|admin)(\/|$)/.test(pathname);
}

export type PendingMetaEvent = { name: string; id: string };

export function parsePendingEvent(raw: string | undefined): PendingMetaEvent | null {
  if (!raw) return null;
  const [name, id] = decodeURIComponent(raw).split(".");
  return /^[A-Za-z]{2,40}$/.test(name ?? "") && /^[\w-]{8,64}$/.test(id ?? "") ? { name, id } : null;
}

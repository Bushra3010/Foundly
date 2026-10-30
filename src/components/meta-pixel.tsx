"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { CONSENT_COOKIE, CONSENT_MAX_AGE, isTrackedPath, META_PIXEL_ID, parsePendingEvent, PENDING_EVENT_COOKIE } from "@/lib/meta-pixel";

type Fbq = (...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: Fbq;
  }
}

const CONSENT_EVENT = "foundly-consent-change";

function readCookie(name: string): string | undefined {
  return document.cookie.split("; ").find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);
}

function subscribeConsent(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}

function setConsent(value: "accepted" | "declined" | null) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = value
    ? `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`
    : `${CONSENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Reopens the cookie choice. Declining later stops the Pixel from the next page load. */
export function CookieSettingsButton({ className }: { className?: string }) {
  if (!META_PIXEL_ID) return null;
  return <button type="button" className={className} onClick={() => setConsent(null)}>Cookie settings</button>;
}

/** Runs once the Pixel script has defined fbq, waiting up to about five seconds. */
function whenPixelReady(run: (fbq: Fbq) => void, tries = 25) {
  if (window.fbq) run(window.fbq);
  else if (tries > 0) window.setTimeout(() => whenPixelReady(run, tries - 1), 200);
}

/** Sends a Pixel event if the visitor has accepted marketing cookies. Safe to call anywhere. */
export function trackMetaEvent(name: string, params?: Record<string, unknown>, custom = false) {
  if (typeof window === "undefined" || !META_PIXEL_ID || readCookie(CONSENT_COOKIE) !== "accepted") return;
  whenPixelReady((fbq) => fbq(custom ? "trackCustom" : "track", name, params ?? {}));
}

/** Fires one Pixel event when it mounts, e.g. after a free check has run. */
export function MetaEvent({ name, custom }: { name: string; custom?: boolean }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackMetaEvent(name, undefined, custom);
  }, [name, custom]);
  return null;
}

/** Meta Pixel, loaded only after consent, plus the consent banner. Renders nothing without a Pixel ID. */
export function MetaPixel() {
  const pathname = usePathname() ?? "/";
  const consent = useSyncExternalStore(subscribeConsent, () => readCookie(CONSENT_COOKIE) ?? "", () => "unknown");
  const lastPath = useRef<string | null>(null);
  const tracked = isTrackedPath(pathname);
  const accepted = consent === "accepted" && tracked;

  // PageView on client-side navigation; the first view is sent by the init script.
  useEffect(() => {
    if (!accepted) return;
    if (lastPath.current !== null && lastPath.current !== pathname) whenPixelReady((fbq) => fbq("track", "PageView"));
    lastPath.current = pathname;
  }, [accepted, pathname]);

  // Repeat an event the server already sent (such as a sign-up), with the same ID for deduplication.
  useEffect(() => {
    if (!accepted) return;
    const pending = parsePendingEvent(readCookie(PENDING_EVENT_COOKIE));
    if (!pending) return;
    document.cookie = `${PENDING_EVENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    whenPixelReady((fbq) => fbq("track", pending.name, {}, { eventID: pending.id }));
  }, [accepted, pathname]);

  if (!META_PIXEL_ID || !tracked || consent === "unknown") return null;

  if (consent === "") {
    return (
      <div className="consent-banner" role="dialog" aria-live="polite" aria-label="Cookie choice">
        <p>
          We use Meta Pixel cookies to measure our ads and show Foundly to people who may find it useful. They load only if you accept.{" "}
          <Link href="/privacy#cookies">Privacy Policy</Link>
        </p>
        <div className="consent-actions">
          <button type="button" className="consent-decline" onClick={() => setConsent("declined")}>Decline</button>
          <button type="button" className="consent-accept" onClick={() => setConsent("accepted")}>Accept</button>
        </div>
      </div>
    );
  }

  if (!accepted) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(META_PIXEL_ID)});fbq('track','PageView');`}
    </Script>
  );
}

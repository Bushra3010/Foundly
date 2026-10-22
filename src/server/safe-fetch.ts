import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";

/**
 * Fetches untrusted public URLs (owner websites) without reaching internal
 * networks. Every connection — including each redirect hop — resolves DNS
 * through `guardedLookup`, so the address that is checked is the address that
 * is connected to (no DNS-rebinding window).
 */

export class BlockedAddressError extends Error {}

export function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
      (a === 169 && b === 254) || // link-local, incl. cloud metadata
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224 // multicast and reserved
    );
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v === "::" || v === "::1") return true;
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedIp(mapped[1]);
    return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(v) || v.startsWith("64:ff9b:") || v.startsWith("2001:db8");
  }
  return true;
}

type LookupCallback = (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void;

export function guardedLookup(hostname: string, options: dns.LookupOptions, callback: LookupCallback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "");
    const list = addresses as dns.LookupAddress[];
    const bad = list.find((a) => isBlockedIp(a.address));
    if (bad || list.length === 0) {
      return callback(new BlockedAddressError(`Blocked address for ${hostname}`) as NodeJS.ErrnoException, "");
    }
    if (options.all) return callback(null, list);
    callback(null, list[0].address, list[0].family);
  });
}

export type SafeResponse = {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  redirects: string[];
  truncated: boolean;
};

export type SafeFetchOptions = { maxBytes?: number; timeoutMs?: number; maxRedirects?: number; userAgent?: string };

const DEFAULTS = { maxBytes: 1_500_000, timeoutMs: 10_000, maxRedirects: 5, userAgent: "GrowthPlatformBot/1.0 (+site audit; owner-requested)" };

function assertPublicUrl(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new BlockedAddressError("Only http and https URLs are allowed");
  if (url.username || url.password) throw new BlockedAddressError("URLs with credentials are not allowed");
  if (url.port && !["80", "443", ""].includes(url.port)) throw new BlockedAddressError("Only standard web ports are allowed");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host) && isBlockedIp(host)) throw new BlockedAddressError("Private addresses are not allowed");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || !host.includes(".")) {
    throw new BlockedAddressError("Internal hostnames are not allowed");
  }
  return url;
}

function requestOnce(url: URL, opts: Required<SafeFetchOptions>): Promise<Omit<SafeResponse, "redirects" | "url">> {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      url,
      {
        method: "GET",
        lookup: guardedLookup as unknown as typeof dns.lookup,
        headers: { "User-Agent": opts.userAgent, Accept: "text/html,application/xhtml+xml,text/plain,application/xml;q=0.9,*/*;q=0.5" },
        timeout: opts.timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        let truncated = false;
        res.on("data", (chunk: Buffer) => {
          if (truncated) return;
          size += chunk.length;
          if (size > opts.maxBytes) {
            truncated = true;
            chunks.push(chunk.subarray(0, chunk.length - (size - opts.maxBytes)));
            res.destroy();
            return;
          }
          chunks.push(chunk);
        });
        const finish = () => {
          const headers: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.headers)) if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(", ") : v;
          resolve({ status: res.statusCode ?? 0, headers, body: Buffer.concat(chunks).toString("utf8"), truncated });
        };
        res.on("end", finish);
        res.on("close", () => truncated && finish());
        res.on("error", (e) => (truncated ? finish() : reject(e)));
      },
    );
    req.on("timeout", () => req.destroy(new Error(`Timed out after ${opts.timeoutMs}ms`)));
    req.on("error", reject);
    req.end();
  });
}

export async function safeFetch(raw: string, options: SafeFetchOptions = {}): Promise<SafeResponse> {
  const opts = { ...DEFAULTS, ...options };
  let url = assertPublicUrl(raw);
  const redirects: string[] = [];
  for (let hop = 0; hop <= opts.maxRedirects; hop++) {
    const res = await requestOnce(url, opts);
    if (res.status >= 300 && res.status < 400 && res.headers.location) {
      redirects.push(url.toString());
      url = assertPublicUrl(new URL(res.headers.location, url).toString());
      continue;
    }
    return { ...res, url: url.toString(), redirects };
  }
  throw new Error(`Too many redirects (more than ${opts.maxRedirects})`);
}

/** Lower-cases and strips paths/ports so a site is identified by its host. */
export function normalizeSiteUrl(raw: string): string {
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const u = new URL(withScheme);
  return `${u.protocol}//${u.hostname.toLowerCase()}`;
}

export function hostOf(raw: string): string {
  return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname.toLowerCase().replace(/^www\./, "");
}

import dns from "node:dns/promises";
import { randomBytes } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import type { Db, DbOrTx } from "@/db";
import { customDomains, siteVersions, sites } from "@/db/schema";
import { AppError, audit, requireRole, type Ctx } from "./context";
import { getSite } from "./sites";
import { requireEntitlement } from "./billing/service";

export const DOMAIN_TXT_PREFIX = "_growth-domain";

export function cnameTarget() {
  return process.env.CUSTOM_DOMAIN_CNAME_TARGET ?? "sites.example.com";
}

const HOST_RE = /^(?=.{4,253}$)(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/;

export function normalizeHostname(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.$/, "");
}

export async function listDomains(db: DbOrTx, ctx: Ctx) {
  return db
    .select()
    .from(customDomains)
    .where(and(eq(customDomains.workspaceId, ctx.workspaceId), ne(customDomains.status, "removed")));
}

/** Connects an existing domain. Buying or renewing domains is out of scope. */
export async function addDomain(db: Db, ctx: Ctx, input: string) {
  requireRole(ctx, "owner");
  await requireEntitlement(db, ctx.workspaceId, "customDomain");
  const hostname = normalizeHostname(input);
  if (!HOST_RE.test(hostname)) throw new AppError("invalid", "Enter a domain like www.example.com");
  const appHost = process.env.APP_URL ? new URL(process.env.APP_URL).hostname : "localhost";
  const root = process.env.SITES_ROOT_DOMAIN;
  if (hostname === appHost || (root && (hostname === root || hostname.endsWith(`.${root}`)))) {
    throw new AppError("invalid", "That domain belongs to the platform.");
  }
  const site = await getSite(db, ctx);
  if (!site) throw new AppError("not_found", "Create your website first.");
  try {
    const [d] = await db
      .insert(customDomains)
      .values({ workspaceId: ctx.workspaceId, siteId: site.id, hostname, verificationToken: randomBytes(12).toString("hex") })
      .returning();
    await audit(db, ctx, "domain.added", hostname);
    return d;
  } catch {
    throw new AppError("conflict", "That domain is already connected to a website.");
  }
}

type Dns = { txt: (h: string) => Promise<string[][]>; cname: (h: string) => Promise<string[]> };
const realDns: Dns = { txt: (h) => dns.resolveTxt(h), cname: (h) => dns.resolveCname(h) };

/**
 * Verifies ownership (TXT) and routing (CNAME). The domain is only reported
 * live when both pass; certificate issuance is handled by the host.
 */
export async function verifyDomain(db: Db, ctx: Ctx, domainId: string, resolver: Dns = realDns) {
  requireRole(ctx, "owner");
  const [d] = await db
    .select()
    .from(customDomains)
    .where(and(eq(customDomains.id, domainId), eq(customDomains.workspaceId, ctx.workspaceId)));
  if (!d || d.status === "removed") throw new AppError("not_found", "Domain not found.");

  const problems: string[] = [];
  const txt = await resolver.txt(`${DOMAIN_TXT_PREFIX}.${d.hostname}`).catch(() => [] as string[][]);
  if (!txt.some((r) => r.join("") === d.verificationToken)) problems.push(`TXT record ${DOMAIN_TXT_PREFIX}.${d.hostname} not found or has a different value`);
  const cname = await resolver.cname(d.hostname).catch(() => [] as string[]);
  if (!cname.map((c) => c.replace(/\.$/, "").toLowerCase()).includes(cnameTarget())) {
    problems.push(`CNAME for ${d.hostname} should point to ${cnameTarget()}`);
  }
  const ok = problems.length === 0;
  const [updated] = await db
    .update(customDomains)
    .set({
      status: ok ? "verified" : "failed",
      lastCheckedAt: new Date(),
      lastError: ok ? null : problems.join("; "),
      verifiedAt: ok ? (d.verifiedAt ?? new Date()) : d.verifiedAt,
    })
    .where(eq(customDomains.id, d.id))
    .returning();
  await audit(db, ctx, ok ? "domain.verified" : "domain.check_failed", d.hostname);
  return updated;
}

export async function removeDomain(db: Db, ctx: Ctx, domainId: string) {
  requireRole(ctx, "owner");
  await db
    .update(customDomains)
    .set({ status: "removed" })
    .where(and(eq(customDomains.id, domainId), eq(customDomains.workspaceId, ctx.workspaceId)));
  await audit(db, ctx, "domain.removed", domainId);
}

/** Public: which live site a verified custom hostname serves. */
export async function siteSlugForHost(db: DbOrTx, hostname: string): Promise<string | null> {
  const [row] = await db
    .select({ slug: sites.slug })
    .from(customDomains)
    .innerJoin(sites, eq(sites.id, customDomains.siteId))
    .innerJoin(siteVersions, eq(siteVersions.id, sites.publishedVersionId))
    .where(and(eq(customDomains.hostname, normalizeHostname(hostname)), eq(customDomains.status, "verified")));
  return row?.slug ?? null;
}

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db";
import { improvementActions, integrations } from "@/db/schema";
import { parseFaqDraft, parseServiceDraft } from "./audit/actions";
import { AppError, audit, requireRole, type Ctx } from "./context";
import { decryptSecret, encryptSecret } from "./crypto";
import { normalizeSiteUrl, safeFetch } from "./safe-fetch";

/**
 * WordPress connector using an application password for a dedicated,
 * least-privilege user (Editor role). We only ever append a clearly marked,
 * escaped section to a page the owner picked, after they preview it, and we
 * refuse to write if the page changed since that preview.
 */

export type WpHttp = (url: string, init: { method: "GET" | "POST"; auth: string; body?: unknown }) => Promise<{ status: number; json: unknown }>;

const realHttp: WpHttp = async (url, init) => {
  const res = await safeFetch(url, {
    method: init.method,
    headers: { Authorization: `Basic ${init.auth}`, ...(init.body ? { "Content-Type": "application/json" } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
    maxBytes: 2_000_000,
    timeoutMs: 15_000,
  });
  let json: unknown = null;
  try {
    json = JSON.parse(res.body);
  } catch {
    // non-JSON error page
  }
  return { status: res.status, json };
};

const userShape = z.looseObject({ id: z.number(), name: z.string().optional(), roles: z.array(z.string()).optional(), capabilities: z.record(z.string(), z.boolean()).optional() });
const pageShape = z.looseObject({ id: z.number(), title: z.looseObject({ raw: z.string().optional(), rendered: z.string().optional() }), modified_gmt: z.string(), content: z.looseObject({ raw: z.string().optional() }).optional(), link: z.string().optional() });

const MARK_START = "<!-- growth-platform:start -->";
const MARK_END = "<!-- growth-platform:end -->";

function auth(username: string, password: string) {
  return Buffer.from(`${username}:${password.replace(/\s+/g, "")}`).toString("base64");
}

async function loadIntegration(db: Db, ctx: Ctx) {
  const [i] = await db.select().from(integrations).where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, "wordpress")));
  if (!i) throw new AppError("not_found", "Connect WordPress in Settings first.");
  return { i, auth: auth(i.username, decryptSecret(i.secretEncrypted)), api: `${i.siteUrl}/wp-json/wp/v2` };
}

export async function getWordPress(db: Db, ctx: Ctx) {
  const [i] = await db
    .select({ siteUrl: integrations.siteUrl, username: integrations.username, status: integrations.status, lastError: integrations.lastError, createdAt: integrations.createdAt })
    .from(integrations)
    .where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, "wordpress")));
  return i ?? null;
}

/** Owner-only: connecting an external account is a sensitive action. */
export async function connectWordPress(db: Db, ctx: Ctx, input: { siteUrl: string; username: string; password: string }, http: WpHttp = realHttp) {
  requireRole(ctx, "owner");
  const siteUrl = normalizeSiteUrl(input.siteUrl);
  if (!siteUrl.startsWith("https://")) throw new AppError("invalid", "Your WordPress site must use https so your password stays private.");
  const a = auth(input.username.trim(), input.password);
  const res = await http(`${siteUrl}/wp-json/wp/v2/users/me?context=edit`, { method: "GET", auth: a });
  if (res.status === 401 || res.status === 403) throw new AppError("invalid", "WordPress rejected that username or application password.");
  const me = userShape.safeParse(res.json);
  if (res.status !== 200 || !me.success) throw new AppError("invalid", "We couldn't reach the WordPress REST API on that site.");
  const roles = me.data.roles ?? [];
  if (roles.includes("administrator")) {
    throw new AppError("invalid", "Please create a separate WordPress user with the Editor role and use its application password. We don't accept administrator accounts.");
  }
  if (me.data.capabilities && !me.data.capabilities.edit_pages) throw new AppError("invalid", "That user can't edit pages. Give it the Editor role.");
  await db
    .insert(integrations)
    .values({ workspaceId: ctx.workspaceId, kind: "wordpress", siteUrl, username: input.username.trim(), secretEncrypted: encryptSecret(input.password.replace(/\s+/g, "")), connectedBy: ctx.userId })
    .onConflictDoUpdate({
      target: [integrations.workspaceId, integrations.kind],
      set: { siteUrl, username: input.username.trim(), secretEncrypted: encryptSecret(input.password.replace(/\s+/g, "")), status: "connected", lastError: null, connectedBy: ctx.userId },
    });
  await audit(db, ctx, "integration.connected", "wordpress", { siteUrl, roles });
}

export async function disconnectWordPress(db: Db, ctx: Ctx) {
  requireRole(ctx, "owner");
  await db.delete(integrations).where(and(eq(integrations.workspaceId, ctx.workspaceId), eq(integrations.kind, "wordpress")));
  await audit(db, ctx, "integration.disconnected", "wordpress");
}

export async function listPages(db: Db, ctx: Ctx, http: WpHttp = realHttp) {
  requireRole(ctx, "editor");
  const { auth: a, api } = await loadIntegration(db, ctx);
  const res = await http(`${api}/pages?per_page=50&context=edit&_fields=id,title,modified_gmt,link`, { method: "GET", auth: a });
  const parsed = z.array(pageShape).safeParse(res.json);
  if (res.status !== 200 || !parsed.success) throw new AppError("invalid", "Couldn't list your WordPress pages.");
  return parsed.data.map((p) => ({ id: p.id, title: p.title.raw ?? p.title.rendered ?? `Page ${p.id}`, modified: p.modified_gmt, link: p.link }));
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Builds the escaped HTML section for supported tasks. Owner text is never inserted as raw HTML. */
export function sectionHtml(checkKey: string, draft: string): string | null {
  if (checkKey === "faq") {
    const items = parseFaqDraft(draft);
    if (!items.length) return null;
    return `<h2>Common questions</h2>\n${items.map((i) => `<h3>${esc(i.question)}</h3>\n<p>${esc(i.answer)}</p>`).join("\n")}`;
  }
  if (checkKey === "service_coverage") {
    const items = parseServiceDraft(draft);
    if (!items.length) return null;
    return `<h2>Our services</h2>\n${items.map((i) => `<h3>${esc(i.name)}</h3>\n<p>${esc(i.description)}</p>`).join("\n")}`;
  }
  return null;
}

export const WORDPRESS_CHECKS = ["faq", "service_coverage"];

/** Records the owner's chosen page and its current revision, for the preview. */
export async function prepareWordPressChange(db: Db, ctx: Ctx, actionId: string, pageId: number, http: WpHttp = realHttp) {
  requireRole(ctx, "editor");
  const { auth: a, api } = await loadIntegration(db, ctx);
  const [action] = await db.select().from(improvementActions).where(and(eq(improvementActions.id, actionId), eq(improvementActions.workspaceId, ctx.workspaceId)));
  if (!action || !WORDPRESS_CHECKS.includes(action.checkKey)) throw new AppError("invalid", "This task can't be applied through WordPress.");
  const res = await http(`${api}/pages/${pageId}?context=edit`, { method: "GET", auth: a });
  const page = pageShape.safeParse(res.json);
  if (res.status !== 200 || !page.success) throw new AppError("not_found", "That page couldn't be loaded.");
  const target = { kind: "wordpress" as const, pageId, pageTitle: page.data.title.raw ?? `Page ${pageId}`, previewedModified: page.data.modified_gmt };
  await db
    .update(improvementActions)
    .set({ externalTarget: target, applyKind: "wordpress_append", status: action.status === "approved" ? "owner_edited" : action.status, updatedAt: new Date() })
    .where(eq(improvementActions.id, action.id));
  return target;
}

/**
 * Applies an approved WordPress change. Fails safely if the page was edited
 * after the owner's preview, so we never overwrite newer external edits.
 */
export async function applyWordPressChange(db: Db, ctx: Ctx, actionId: string, http: WpHttp = realHttp) {
  requireRole(ctx, "owner");
  const { auth: a, api } = await loadIntegration(db, ctx);
  const [action] = await db.select().from(improvementActions).where(and(eq(improvementActions.id, actionId), eq(improvementActions.workspaceId, ctx.workspaceId)));
  if (!action?.externalTarget || action.status !== "approved" || action.approvedRevision !== action.draftRevision) {
    throw new AppError("precondition_failed", "Approve the previewed change first.");
  }
  const html = sectionHtml(action.checkKey, action.draft);
  if (!html) throw new AppError("invalid", "The draft has nothing to add.");
  const t = action.externalTarget;
  const current = pageShape.safeParse((await http(`${api}/pages/${t.pageId}?context=edit`, { method: "GET", auth: a })).json);
  if (!current.success) throw new AppError("not_found", "That page couldn't be loaded.");
  if (current.data.modified_gmt !== t.previewedModified) {
    await db.update(improvementActions).set({ status: "failed", verificationNote: "The page changed in WordPress after your preview. Prepare the change again to see the latest version.", updatedAt: new Date() }).where(eq(improvementActions.id, action.id));
    throw new AppError("precondition_failed", "The page changed in WordPress after your preview. Nothing was written.");
  }
  const before = current.data.content?.raw ?? "";
  const base = before.includes(MARK_START) ? before.slice(0, before.indexOf(MARK_START)).trimEnd() : before;
  const next = `${base}\n\n${MARK_START}\n${html}\n${MARK_END}\n`;
  const res = await http(`${api}/pages/${t.pageId}`, { method: "POST", auth: a, body: { content: next } });
  const updated = pageShape.safeParse(res.json);
  if (res.status !== 200 || !updated.success) throw new AppError("invalid", `WordPress refused the update (HTTP ${res.status}). Nothing was changed.`);
  await db
    .update(improvementActions)
    .set({ status: "applied", appliedAt: new Date(), beforeSnapshot: { content: before, modified: updated.data.modified_gmt }, updatedAt: new Date() })
    .where(eq(improvementActions.id, action.id));
  await audit(db, ctx, "integration.wordpress_applied", action.id, { pageId: t.pageId });
}

/** Restores the page content from before our change, if nobody has edited it since. */
export async function rollbackWordPressChange(db: Db, ctx: Ctx, actionId: string, http: WpHttp = realHttp) {
  requireRole(ctx, "owner");
  const { auth: a, api } = await loadIntegration(db, ctx);
  const [action] = await db.select().from(improvementActions).where(and(eq(improvementActions.id, actionId), eq(improvementActions.workspaceId, ctx.workspaceId)));
  const snap = action?.beforeSnapshot as { content: string; modified: string } | null;
  if (!action?.externalTarget || !snap) throw new AppError("invalid", "Nothing to roll back.");
  const current = pageShape.safeParse((await http(`${api}/pages/${action.externalTarget.pageId}?context=edit`, { method: "GET", auth: a })).json);
  if (!current.success || current.data.modified_gmt !== snap.modified) {
    throw new AppError("precondition_failed", "The page was edited after our change, so we won't overwrite it. Remove the marked section in WordPress instead.");
  }
  await http(`${api}/pages/${action.externalTarget.pageId}`, { method: "POST", auth: a, body: { content: snap.content } });
  await db.update(improvementActions).set({ status: "rolled_back", updatedAt: new Date() }).where(eq(improvementActions.id, action.id));
  await audit(db, ctx, "integration.wordpress_rolled_back", action.id);
}

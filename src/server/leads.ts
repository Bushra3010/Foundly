import { and, desc, eq, ilike, or } from "drizzle-orm";
import type { z } from "zod";
import type { Db, DbOrTx } from "@/db";
import { leads, sites, type Lead } from "@/db/schema";
import type { leadSchema } from "@/lib/validation";
import { AppError, requireRole, type Ctx } from "./context";
import { notifyNewLead } from "./notifications";

/**
 * Public submission from a hosted site. The workspace comes from the published
 * site, never from the visitor's request.
 */
export async function submitLead(db: Db, input: z.infer<typeof leadSchema>, source: string) {
  const [site] = await db
    .select({ workspaceId: sites.workspaceId, businessId: sites.businessId, live: sites.publishedVersionId })
    .from(sites)
    .where(eq(sites.slug, input.siteSlug));
  if (!site || !site.live) throw new AppError("not_found", "This website isn't accepting enquiries right now.");
  const [lead] = await db
    .insert(leads)
    .values({
      workspaceId: site.workspaceId,
      businessId: site.businessId,
      name: input.name,
      contact: input.contact,
      message: input.message,
      source,
    })
    .returning({ id: leads.id });
  // Alerts are best-effort; a mail failure never loses the lead.
  await notifyNewLead(db, site.workspaceId, lead.id).catch((err) => console.error("[notify] lead alert failed", err));
  return lead;
}

export async function listLeads(db: DbOrTx, ctx: Ctx, opts: { q?: string; status?: Lead["status"] } = {}) {
  requireRole(ctx, "viewer");
  const filters = [eq(leads.workspaceId, ctx.workspaceId)];
  if (opts.status) filters.push(eq(leads.status, opts.status));
  if (opts.q) {
    const pattern = `%${opts.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    filters.push(or(ilike(leads.name, pattern), ilike(leads.contact, pattern), ilike(leads.message, pattern))!);
  }
  return db.select().from(leads).where(and(...filters)).orderBy(desc(leads.createdAt)).limit(200);
}

export async function updateLead(
  db: Db,
  ctx: Ctx,
  leadId: string,
  values: { status?: Lead["status"]; notes?: string | null },
) {
  requireRole(ctx, "editor");
  const [updated] = await db
    .update(leads)
    .set(values)
    .where(and(eq(leads.id, leadId), eq(leads.workspaceId, ctx.workspaceId)))
    .returning();
  if (!updated) throw new AppError("not_found", "Lead not found.");
  return updated;
}

export function leadsToCsv(rows: Lead[]): string {
  // Prefix formula-like values so spreadsheets treat them as text.
  const cell = (v: unknown) => {
    let s = v == null ? "" : String(v instanceof Date ? v.toISOString() : v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = ["Received", "Name", "Contact", "Message", "Status", "Source", "Notes"];
  const lines = rows.map((r) => [r.createdAt, r.name, r.contact, r.message, r.status, r.source, r.notes].map(cell).join(","));
  return [header.map(cell).join(","), ...lines].join("\r\n");
}

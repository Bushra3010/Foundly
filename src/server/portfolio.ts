import "server-only";
import { and, asc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { auditEvents, portfolioMedia, portfolioProjects } from "@/db/schema";
import type { Db } from "@/db";
import type { AdminCtx } from "@/server/admin";
import { AppError } from "@/server/context";
import { DISPLAY_NAMES, type NeedId, TAGLINES } from "@/lib/work-copy";

export const PORTFOLIO_CATEGORIES = ["Websites", "ERP / CRM", "Mobile apps", "SaaS", "E-commerce", "AI applications", "Management systems", "Custom software"] as const;
export const DEMO_STATUS_TEXT = { none: "Case study", coming_soon: "Demo coming soon", live: "Live demo", maintenance: "Demo under maintenance" } as const;
export type DemoStatus = keyof typeof DEMO_STATUS_TEXT;

export const MAX_MEDIA_BYTES = 2_500_000;
const MEDIA_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

type Row = typeof portfolioProjects.$inferSelect;

/** What visitors may see. The real client name is included only when the client agreed to be named. */
export type PublicProject = {
  slug: string;
  name: string;
  /** One plain-language line: what it does and for whom. */
  tagline: string;
  /** The plain-language group a client would look under. */
  need: NeedId;
  client: string;
  category: string;
  industry: string | null;
  summary: string;
  description: string | null;
  features: string[];
  techStack: string[];
  demoUrl: string | null;
  demoLogins: { role: string; login: string; secret?: string }[];
  demoStatus: DemoStatus;
  embeddable: boolean;
  media: { id: string; caption: string | null; url: string }[];
};

function toPublic(p: Row, media: { id: string; caption: string | null; url: string }[]): PublicProject {
  const live = p.demoStatus === "live" && !!p.demoUrl;
  return {
    slug: p.slug,
    name: DISPLAY_NAMES[p.slug] ?? p.name,
    tagline: TAGLINES[p.slug] ?? firstSentence(p.summary),
    need: needFor(p),
    client: p.showClient && p.clientName ? p.clientName : p.clientLabel,
    category: p.category,
    industry: p.industry,
    summary: p.summary,
    description: p.description,
    features: p.features,
    techStack: p.techStack,
    // A demo link and its logins are shown only while the demo is marked live.
    demoUrl: live ? p.demoUrl : null,
    demoLogins: live ? p.demoLogins : [],
    demoStatus: p.demoStatus === "live" && !p.demoUrl ? "coming_soon" : p.demoStatus,
    embeddable: live && p.embeddable,
    media,
  };
}

function firstSentence(text: string) {
  const m = text.match(/^.{20,}?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
}

function needFor(p: Pick<Row, "slug" | "name" | "category">): NeedId {
  if (SOFTWARE_SHOWCASE.erp.includes(p.slug)) return "erp";
  if (SOFTWARE_SHOWCASE.crm.includes(p.slug)) return "crm";
  if (SOFTWARE_SHOWCASE.app.includes(p.slug) || p.category === "Mobile apps") return "apps";
  if (p.category === "E-commerce") return "stores";
  if (p.category === "Websites") return "websites";
  if (p.category === "AI applications") return "ai";
  if (p.category === "ERP / CRM") return /crm/i.test(p.name) ? "crm" : "erp";
  if (p.category === "Management systems") return "erp";
  return "platforms";
}

/** Static screenshots are served from /public; uploaded ones from the media route. */
function mediaUrl(m: { id: string; src: string | null }) {
  return m.src ?? `/work/media/${m.id}`;
}

async function mediaFor(db: Db, ids: string[]) {
  if (ids.length === 0) return new Map<string, { id: string; caption: string | null; url: string }[]>();
  const rows = await db
    .select({ id: portfolioMedia.id, projectId: portfolioMedia.projectId, caption: portfolioMedia.caption, src: portfolioMedia.src })
    .from(portfolioMedia)
    .where(inArray(portfolioMedia.projectId, ids))
    .orderBy(asc(portfolioMedia.sortOrder), asc(portfolioMedia.createdAt));
  const map = new Map<string, { id: string; caption: string | null; url: string }[]>();
  for (const r of rows) map.set(r.projectId, [...(map.get(r.projectId) ?? []), { id: r.id, caption: r.caption, url: mediaUrl(r) }]);
  return map;
}

/** Projects kept off the public /work pages regardless of their published flag (hidden by the owner, Nov 2026). */
export const HIDDEN_PROJECT_SLUGS: readonly string[] = [
  "careeroptics-web",
  "safar-ai-travel-assistant",
  "shera-travels-booking-crm",
  "blinks-ai-strategy-landing",
  "admission-pramarsh-site",
  "admission-aasharay-site",
];

const isPublic = and(eq(portfolioProjects.published, true), notInArray(portfolioProjects.slug, [...HIDDEN_PROJECT_SLUGS]));

export async function listPublishedProjects(db: Db): Promise<PublicProject[]> {
  const rows = await db.select().from(portfolioProjects).where(isPublic).orderBy(asc(portfolioProjects.sortOrder), asc(portfolioProjects.name));
  const media = await mediaFor(db, rows.map((r) => r.id));
  return rows.map((r) => toPublic(r, media.get(r.id) ?? []));
}

/** Portfolio projects shown at the bottom of each /software/<product> page, in display order. */
export const SOFTWARE_SHOWCASE: Record<string, readonly string[]> = {
  erp: [
    "careeroptics-erp", "growus-workforce-erp", "idealdigiskills-education-erp", "keka-hr-clone", "nidhi-banking-software",
    "soil-distribution-management", "airawat-showroom", "pushpak-ac-service", "sengol-university-portal", "manas-library",
    "clatians-lms", "falcon-plus-employee-management", "gym-membership-system", "slotnova-visa-appointments",
  ],
  crm: [
    "hirenova-lead-engine", "newvisa-crm", "hotel-sales-command-center", "maheshwari-plot-sales-crm", "dcw-crm",
    "edumatch-consultancy-crm", "admission-path4u-crm", "meera-prakash-admission-crm", "hello-doctor-neet-counselling",
    "dayare-haram-tours-crm", "visa-recruitment-manager", "shera-travels-crm", "aqoss-hotel-saas",
  ],
  app: ["ridewallah", "driveway-ride-booking", "dinadena-labour", "textile-pickup", "swanidhi-admissions", "nearlane", "weddingmall-mobile-app"],
};

/** Published projects for a custom-software page, in the order listed above. Missing or hidden ones are skipped. */
export async function listShowcaseProjects(db: Db, product: string): Promise<PublicProject[]> {
  const slugs = SOFTWARE_SHOWCASE[product] ?? [];
  if (slugs.length === 0) return [];
  const rows = await db.select().from(portfolioProjects).where(and(isPublic, inArray(portfolioProjects.slug, [...slugs])));
  const media = await mediaFor(db, rows.map((r) => r.id));
  return rows.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug)).map((r) => toPublic(r, media.get(r.id) ?? []));
}

export async function getPublishedProject(db: Db, slug: string): Promise<PublicProject | null> {
  const [row] = await db.select().from(portfolioProjects).where(and(eq(portfolioProjects.slug, slug), isPublic)).limit(1);
  if (!row) return null;
  const media = await mediaFor(db, [row.id]);
  return toPublic(row, media.get(row.id) ?? []);
}

/** Screenshot bytes. Unpublished projects' screenshots are only served to admins. */
export async function getMedia(db: Db, id: string, isAdmin: boolean) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db
    .select({ bytes: portfolioMedia.bytes, contentType: portfolioMedia.contentType, published: portfolioProjects.published })
    .from(portfolioMedia)
    .innerJoin(portfolioProjects, eq(portfolioProjects.id, portfolioMedia.projectId))
    .where(eq(portfolioMedia.id, id))
    .limit(1);
  if (!row?.bytes || (!row.published && !isAdmin)) return null;
  return { ...row, bytes: row.bytes };
}

// ---------- Admin ----------

export async function adminListProjects(db: Db) {
  const rows = await db.select().from(portfolioProjects).orderBy(asc(portfolioProjects.sortOrder), asc(portfolioProjects.name));
  const counts = await db.select({ projectId: portfolioMedia.projectId, n: sql<number>`count(*)::int` }).from(portfolioMedia).groupBy(portfolioMedia.projectId);
  const byId = new Map(counts.map((c) => [c.projectId, c.n]));
  return rows.map((r) => ({ ...r, mediaCount: byId.get(r.id) ?? 0 }));
}

export async function adminGetProject(db: Db, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.id, id)).limit(1);
  if (!row) return null;
  const media = await db
    .select({ id: portfolioMedia.id, caption: portfolioMedia.caption, sortOrder: portfolioMedia.sortOrder, contentType: portfolioMedia.contentType, src: portfolioMedia.src })
    .from(portfolioMedia)
    .where(eq(portfolioMedia.projectId, id))
    .orderBy(asc(portfolioMedia.sortOrder), asc(portfolioMedia.createdAt));
  return { project: row, media: media.map((m) => ({ ...m, url: mediaUrl(m) })) };
}

export type ProjectInput = Omit<typeof portfolioProjects.$inferInsert, "id" | "createdAt" | "updatedAt">;

function audit(db: Db, admin: AdminCtx, action: string, target: string, data: Record<string, unknown> = {}) {
  return db.insert(auditEvents).values({ actorUserId: admin.userId, action: `admin.portfolio_${action}`, target, data: { ...data, admin: admin.email } });
}

export async function createProject(db: Db, admin: AdminCtx, input: ProjectInput) {
  const [row] = await db.insert(portfolioProjects).values(input).returning({ id: portfolioProjects.id });
  await audit(db, admin, "created", row.id, { slug: input.slug });
  return row.id;
}

export async function updateProject(db: Db, admin: AdminCtx, id: string, input: Partial<ProjectInput>) {
  await db.update(portfolioProjects).set({ ...input, updatedAt: new Date() }).where(eq(portfolioProjects.id, id));
  await audit(db, admin, "updated", id, { fields: Object.keys(input) });
}

export async function deleteProject(db: Db, admin: AdminCtx, id: string) {
  await db.delete(portfolioProjects).where(eq(portfolioProjects.id, id));
  await audit(db, admin, "deleted", id);
}

export async function addMedia(db: Db, admin: AdminCtx, projectId: string, file: { type: string; bytes: Buffer }, caption: string) {
  if (!MEDIA_TYPES.has(file.type)) throw new AppError("invalid", "Upload a PNG, JPEG or WebP image.");
  if (file.bytes.length === 0 || file.bytes.length > MAX_MEDIA_BYTES) throw new AppError("invalid", "Images must be under 2.5 MB.");
  const [{ next }] = await db.select({ next: sql<number>`coalesce(max(${portfolioMedia.sortOrder}), -1)::int + 1` }).from(portfolioMedia).where(eq(portfolioMedia.projectId, projectId));
  const [row] = await db.insert(portfolioMedia).values({ projectId, contentType: file.type, bytes: file.bytes, caption: caption.trim().slice(0, 140) || null, sortOrder: next }).returning({ id: portfolioMedia.id });
  await audit(db, admin, "media_added", projectId, { media: row.id });
}

export async function deleteMedia(db: Db, admin: AdminCtx, mediaId: string) {
  const [row] = await db.delete(portfolioMedia).where(eq(portfolioMedia.id, mediaId)).returning({ projectId: portfolioMedia.projectId });
  if (row) await audit(db, admin, "media_deleted", row.projectId, { media: mediaId });
}

/** Moves a screenshot to the front so it becomes the project's thumbnail. */
export async function makeCover(db: Db, admin: AdminCtx, mediaId: string) {
  const [m] = await db.select({ projectId: portfolioMedia.projectId }).from(portfolioMedia).where(eq(portfolioMedia.id, mediaId)).limit(1);
  if (!m) return;
  const all = await db.select({ id: portfolioMedia.id }).from(portfolioMedia).where(eq(portfolioMedia.projectId, m.projectId)).orderBy(asc(portfolioMedia.sortOrder), asc(portfolioMedia.createdAt));
  const order = [mediaId, ...all.map((a) => a.id).filter((x) => x !== mediaId)];
  for (const [i, id] of order.entries()) await db.update(portfolioMedia).set({ sortOrder: i }).where(eq(portfolioMedia.id, id));
  await audit(db, admin, "cover_set", m.projectId, { media: mediaId });
}

import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { SiteContent } from "@/lib/site/content";
import type { PublicProfile } from "@/lib/profile";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// ---------- Accounts ----------

export const roleEnum = pgEnum("role", ["owner", "editor", "viewer"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: createdAt(),
});

export const loginTokens = pgTable(
  "login_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("login_tokens_email_idx").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  country: text("country").notNull().default("IN"),
  currency: text("currency").notNull().default("INR"),
  createdAt: createdAt(),
});

export const memberships = pgTable(
  "memberships",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.workspaceId, t.userId] })],
);

// ---------- Business ----------

export type Service = { name: string; description?: string };
export type OpeningHours = { days: string; hours: string }[];

export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull().default(""),
    description: text("description"),
    audience: text("audience"),
    city: text("city").notNull().default(""),
    region: text("region"),
    country: text("country").notNull().default("IN"),
    address: text("address"),
    showAddress: boolean("show_address").notNull().default(false),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    email: text("email"),
    websiteUrl: text("website_url"),
    bookingUrl: text("booking_url"),
    hours: jsonb("hours").$type<OpeningHours>().notNull().default([]),
    services: jsonb("services").$type<Service[]>().notNull().default([]),
    serviceAreas: jsonb("service_areas").$type<string[]>().notNull().default([]),
    /** Other names customers use for the business, for brand matching. */
    aliases: jsonb("aliases").$type<string[]>().notNull().default([]),
    /** Domains the business owns, besides its website, for citation matching. */
    ownedDomains: jsonb("owned_domains").$type<string[]>().notNull().default([]),
    hasWebsite: boolean("has_website"),
    onboardingStep: integer("onboarding_step").notNull().default(2),
    onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
    /** Set when the owner explicitly confirms which contact fields may be public. */
    publicContactConfirmedAt: timestamp("public_contact_confirmed_at", { withTimezone: true }),
    /** Incremented on every fact change; jobs reference the version they used. */
    version: integer("version").notNull().default(1),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("businesses_workspace_idx").on(t.workspaceId)],
);

export const profileStatusEnum = pgEnum("profile_status", [
  "draft",
  "published",
  "unpublished",
  "suspended",
  "disputed",
]);

/**
 * Public projection of a business. Public routes read only `publishedData`,
 * so private fields on `businesses` never reach a public response.
 */
export const businessProfiles = pgTable(
  "business_profiles",
  {
    businessId: uuid("business_id")
      .primaryKey()
      .references(() => businesses.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    status: profileStatusEnum("status").notNull().default("draft"),
    verification: text("verification").notNull().default("none"),
    publishedData: jsonb("published_data").$type<PublicProfile>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (t) => [index("business_profiles_status_idx").on(t.status)],
);

export const claimStatusEnum = pgEnum("claim_status", ["pending", "verified", "rejected", "disputed"]);

export const ownershipClaims = pgTable(
  "ownership_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    method: text("method").notNull(),
    status: claimStatusEnum("status").notNull().default("pending"),
    /** Value the owner places in DNS or a file on their website. */
    verificationToken: text("verification_token").notNull(),
    target: text("target"),
    reviewNote: text("review_note"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("ownership_claims_business_idx").on(t.businessId)],
);

// ---------- Websites ----------

export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  businessId: uuid("business_id")
    .notNull()
    .unique()
    .references(() => businesses.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  draft: jsonb("draft").$type<SiteContent>().notNull(),
  /** Optimistic concurrency token for the draft. */
  draftRevision: integer("draft_revision").notNull().default(1),
  /** Business version the draft was last generated from. */
  generatedFromVersion: integer("generated_from_version").notNull(),
  publishedVersionId: uuid("published_version_id"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Immutable, validated snapshots. A published site points at exactly one. */
export const siteVersions = pgTable(
  "site_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    content: jsonb("content").$type<SiteContent>().notNull(),
    contentHash: text("content_hash").notNull(),
    draftRevision: integer("draft_revision").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("site_versions_site_number_idx").on(t.siteId, t.versionNumber)],
);

export const siteSlugRedirects = pgTable("site_slug_redirects", {
  oldSlug: text("old_slug").primaryKey(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
});

// ---------- Jobs ----------

export const jobStatusEnum = pgEnum("job_status", [
  "queued",
  "generating",
  "validating",
  "ready",
  "failed",
]);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    status: jobStatusEnum("status").notNull().default("queued"),
    idempotencyKey: text("idempotency_key").notNull(),
    input: jsonb("input").$type<Record<string, unknown>>().notNull().default({}),
    result: jsonb("result").$type<Record<string, unknown>>(),
    error: text("error"),
    attempts: integer("attempts").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("jobs_workspace_key_idx").on(t.workspaceId, t.idempotencyKey)],
);

// ---------- Operations ----------

export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "qualified", "closed"]);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contact: text("contact").notNull(),
    message: text("message").notNull(),
    source: text("source"),
    status: leadStatusEnum("status").notNull().default("new"),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (t) => [index("leads_workspace_idx").on(t.workspaceId, t.createdAt)],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    action: text("action").notNull(),
    target: text("target"),
    data: jsonb("data").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [index("audit_events_workspace_idx").on(t.workspaceId, t.createdAt)],
);

export type Business = typeof businesses.$inferSelect;
export type Site = typeof sites.$inferSelect;
export type SiteVersion = typeof siteVersions.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];

// ---------- Phase 2: team, claims, domains, assets ----------

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: roleEnum("role").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("invitations_workspace_idx").on(t.workspaceId)],
);

export const domainStatusEnum = pgEnum("domain_status", ["pending", "verified", "failed", "removed"]);

export const customDomains = pgTable(
  "custom_domains",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    hostname: text("hostname").notNull(),
    verificationToken: text("verification_token").notNull(),
    status: domainStatusEnum("status").notNull().default("pending"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    lastError: text("last_error"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  // Only one active claim per hostname; removed rows don't block a new claim.
  (t) => [uniqueIndex("custom_domains_active_host_idx").on(t.hostname).where(sql`status <> 'removed'`)],
);

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    contentType: text("content_type").notNull(),
    bytes: integer("bytes").notNull(),
    sha256: text("sha256").notNull(),
    originalName: text("original_name"),
    /** Owner's statement about rights to the image, kept as ownership metadata. */
    rights: text("rights").notNull().default("owner_supplied"),
    createdAt: createdAt(),
  },
  (t) => [index("assets_workspace_idx").on(t.workspaceId)],
);

// ---------- Phase 3: AI visibility monitoring ----------

export const questionGroupEnum = pgEnum("question_group", ["service", "purchase", "comparison", "location", "branded"]);

/** Immutable once created: editing a question archives it and creates a new row (a new version). */
export const trackedQuestions = pgTable(
  "tracked_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    group: questionGroupEnum("group").notNull(),
    language: text("language").notNull().default("en"),
    location: text("location"),
    replacesId: uuid("replaces_id"),
    approvedBy: uuid("approved_by")
      .notNull()
      .references(() => users.id),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("tracked_questions_workspace_idx").on(t.workspaceId)],
);

export const competitors = pgTable("competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  aliases: jsonb("aliases").$type<string[]>().notNull().default([]),
  domains: jsonb("domains").$type<string[]>().notNull().default([]),
  createdAt: createdAt(),
});

export const runStatusEnum = pgEnum("run_status", ["queued", "running", "completed", "partial", "failed", "cancelled"]);

export const monitoringRuns = pgTable(
  "monitoring_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    trigger: text("trigger").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    status: runStatusEnum("status").notNull().default("queued"),
    questionIds: jsonb("question_ids").$type<string[]>().notNull(),
    providers: jsonb("providers").$type<{ key: string; method: string; model: string; locale: string }[]>().notNull(),
    samples: integer("samples").notNull().default(1),
    /** Hash of question ids + provider config + extraction version, used to warn on unequal comparisons. */
    configHash: text("config_hash").notNull(),
    reservationId: uuid("reservation_id"),
    plannedObservations: integer("planned_observations").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("monitoring_runs_key_idx").on(t.workspaceId, t.idempotencyKey), index("monitoring_runs_ws_idx").on(t.workspaceId, t.createdAt)],
);

export const observationStatusEnum = pgEnum("observation_status", [
  "answered",
  "answered_uncited",
  "refusal",
  "partial",
  "timeout",
  "unavailable",
  "error",
]);

export type Citation = { url: string; title?: string | null };

/** Raw evidence. Never modified after capture; corrections live on brand_matches. */
export const observations = pgTable(
  "observations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    runId: uuid("run_id")
      .notNull()
      .references(() => monitoringRuns.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => trackedQuestions.id),
    questionText: text("question_text").notNull(),
    provider: text("provider").notNull(),
    sourceType: text("source_type").notNull(),
    model: text("model"),
    requestedLocale: text("requested_locale"),
    appliedLocale: text("applied_locale").notNull(),
    searchEnabled: boolean("search_enabled").notNull(),
    sample: integer("sample").notNull().default(1),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    status: observationStatusEnum("status").notNull(),
    rawAnswer: text("raw_answer"),
    citations: jsonb("citations").$type<Citation[]>().notNull().default([]),
    rawResponse: jsonb("raw_response").$type<unknown>(),
    errorMessage: text("error_message"),
    latencyMs: integer("latency_ms"),
    extractionVersion: integer("extraction_version").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("observations_ws_idx").on(t.workspaceId, t.capturedAt), index("observations_run_idx").on(t.runId)],
);

/** Derived annotations; owners can correct them without touching the raw answer. */
export const brandMatches = pgTable(
  "brand_matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    observationId: uuid("observation_id")
      .notNull()
      .references(() => observations.id, { onDelete: "cascade" }),
    /** "self" for the owner's business, otherwise a competitor id. */
    brandKey: text("brand_key").notNull(),
    brandName: text("brand_name").notNull(),
    mentioned: boolean("mentioned").notNull(),
    cited: boolean("cited").notNull(),
    matchedText: text("matched_text"),
    listedPosition: integer("listed_position"),
    ambiguous: boolean("ambiguous").notNull().default(false),
    extractionVersion: integer("extraction_version").notNull(),
    correction: text("correction"),
    correctionReason: text("correction_reason"),
    correctedBy: uuid("corrected_by").references(() => users.id),
    correctedAt: timestamp("corrected_at", { withTimezone: true }),
  },
  (t) => [index("brand_matches_obs_idx").on(t.observationId), index("brand_matches_ws_idx").on(t.workspaceId, t.brandKey)],
);

// ---------- Credits ----------

export const creditAccounts = pgTable("credit_accounts", {
  workspaceId: uuid("workspace_id")
    .primaryKey()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  updatedAt: updatedAt(),
});

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    refType: text("ref_type"),
    refId: text("ref_id"),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    createdAt: createdAt(),
  },
  (t) => [index("credit_ledger_ws_idx").on(t.workspaceId, t.createdAt)],
);

export const reservationStatusEnum = pgEnum("reservation_status", ["reserved", "settled", "released"]);

export const creditReservations = pgTable("credit_reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  settledAmount: integer("settled_amount"),
  status: reservationStatusEnum("status").notNull().default("reserved"),
  refType: text("ref_type").notNull(),
  refId: text("ref_id").notNull(),
  createdAt: createdAt(),
  settledAt: timestamp("settled_at", { withTimezone: true }),
});

export type TrackedQuestion = typeof trackedQuestions.$inferSelect;
export type Observation = typeof observations.$inferSelect;
export type BrandMatch = typeof brandMatches.$inferSelect;
export type Competitor = typeof competitors.$inferSelect;
export type MonitoringRun = typeof monitoringRuns.$inferSelect;

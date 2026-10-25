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
import type { PublicProfile } from "@/lib/profile";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// ---------- Accounts ----------

export const roleEnum = pgEnum("role", ["owner", "editor", "viewer"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  /** scrypt hash ("scrypt$N$r$p$salt$hash"). Null for accounts that only use email links. */
  passwordHash: text("password_hash"),
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

/** Fixed-window counters for sign-in and sign-up limits, shared by every server instance. */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("rate_limits_reset_idx").on(t.resetAt)],
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
    /** Verifiable specifics the owner supplies. AI answers favour businesses that state them. */
    foundedYear: integer("founded_year"),
    teamSize: integer("team_size"),
    projectsCompleted: integer("projects_completed"),
    credentials: text("credentials"),
    /** Where else the business is listed (Google Business Profile, Justdial, Instagram...). */
    listings: jsonb("listings").$type<string[]>().notNull().default([]),
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

/**
 * Website requests: owners without a website ask Foundly's team to build one.
 * The team builds it with any tool; on delivery its address becomes the
 * business's connected website.
 */
export const websiteRequestStatusEnum = pgEnum("website_request_status", ["new", "contacted", "in_progress", "delivered", "cancelled"]);
export const contactMethodEnum = pgEnum("contact_method", ["phone", "whatsapp", "video"]);

export const websiteRequests = pgTable(
  "website_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    requestedBy: uuid("requested_by").references(() => users.id, { onDelete: "set null" }),
    /** What the website should do for the business, in the owner's words. */
    goal: text("goal").notNull(),
    pages: text("pages"),
    style: text("style"),
    /** Websites the owner likes, one per line. */
    examples: text("examples"),
    contactMethod: contactMethodEnum("contact_method").notNull(),
    contactValue: text("contact_value").notNull(),
    contactTime: text("contact_time"),
    status: websiteRequestStatusEnum("status").notNull().default("new"),
    /** Latest note from the team, shown to the owner. */
    teamNote: text("team_note"),
    deliveredUrl: text("delivered_url"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("website_requests_workspace_idx").on(t.workspaceId),
    // One open request per business at a time.
    uniqueIndex("website_requests_open_idx").on(t.businessId).where(sql`${t.status} in ('new', 'contacted', 'in_progress')`),
  ],
);

export type WebsiteRequest = typeof websiteRequests.$inferSelect;

// ---------- Operations ----------

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
export type Role = (typeof roleEnum.enumValues)[number];

// ---------- Phase 2: team ----------

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

// ---------- Phase 4: audits and improvement actions ----------

export const auditStatusEnum = pgEnum("audit_status", ["queued", "running", "completed", "failed"]);

export const audits = pgTable(
  "audits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    /** "external" scans the owner's own website; "competitor" a competitor's site for Compare; "hosted" is retired. */
    kind: text("kind").notNull(),
    target: text("target").notNull(),
    status: auditStatusEnum("status").notNull().default("queued"),
    checklistVersion: integer("checklist_version").notNull(),
    pagesScanned: jsonb("pages_scanned").$type<{ url: string; status: number }[]>().notNull().default([]),
    /** Checks that couldn't run and why (blocked crawling, timeouts). */
    notRun: jsonb("not_run").$type<{ check: string; reason: string }[]>().notNull().default([]),
    error: text("error"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: createdAt(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [index("audits_ws_idx").on(t.workspaceId, t.createdAt)],
);

export const findings = pgTable(
  "findings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    auditId: uuid("audit_id")
      .notNull()
      .references(() => audits.id, { onDelete: "cascade" }),
    checkKey: text("check_key").notNull(),
    category: text("category").notNull(),
    page: text("page"),
    passed: boolean("passed").notNull(),
    severity: text("severity").notNull(),
    evidence: text("evidence").notNull(),
    /** Automated accessibility/mobile checks are partial and need manual review. */
    partial: boolean("partial").notNull().default(false),
  },
  (t) => [index("findings_audit_idx").on(t.auditId)],
);

export const actionStatusEnum = pgEnum("action_status", [
  "detected",
  "proposed",
  "owner_edited",
  "approved",
  "queued",
  "applied",
  "verified",
  "rejected",
  "failed",
  "rolled_back",
]);

export const improvementActions = pgTable(
  "improvement_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    findingId: uuid("finding_id").references(() => findings.id, { onDelete: "set null" }),
    checkKey: text("check_key").notNull(),
    /** How an approved action is applied: a fixed operation, never generated code. */
    applyKind: text("apply_kind").notNull(),
    title: text("title").notNull(),
    page: text("page"),
    evidence: text("evidence").notNull(),
    severity: text("severity").notNull(),
    priority: integer("priority").notNull(),
    hypothesis: text("hypothesis").notNull(),
    proposedChange: text("proposed_change").notNull(),
    draft: text("draft").notNull(),
    draftRevision: integer("draft_revision").notNull().default(1),
    status: actionStatusEnum("status").notNull().default("proposed"),
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedRevision: integer("approved_revision"),
    approvedHash: text("approved_hash"),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verificationNote: text("verification_note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("improvement_actions_ws_idx").on(t.workspaceId, t.status)],
);

export type Audit = typeof audits.$inferSelect;
export type Finding = typeof findings.$inferSelect;
export type ImprovementAction = typeof improvementActions.$inferSelect;

// ---------- Phase 5: billing, notifications, lifecycle, support ----------

export const planEnum = pgEnum("plan", ["free", "website", "growth", "pro", "agency"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "past_due", "cancelled"]);

export const subscriptions = pgTable("subscriptions", {
  workspaceId: uuid("workspace_id")
    .primaryKey()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  plan: planEnum("plan").notNull().default("free"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  provider: text("provider"),
  providerSubscriptionId: text("provider_subscription_id").unique(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  scheduledPlan: planEnum("scheduled_plan"),
  /** After a failed payment, features stay on until this date; content is never deleted for non-payment. */
  graceUntil: timestamp("grace_until", { withTimezone: true }),
  updatedAt: updatedAt(),
});

/** One row per external payment event; the unique key makes webhook retries no-ops. */
export const paymentEvents = pgTable(
  "payment_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    type: text("type").notNull(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
    payload: jsonb("payload").$type<unknown>().notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("payment_events_provider_event_idx").on(t.provider, t.eventId)],
);

export const notificationPrefs = pgTable(
  "notification_prefs",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    weeklySummary: boolean("weekly_summary").notNull().default(false),
    leadAlerts: boolean("lead_alerts").notNull().default(true),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.workspaceId] })],
);

export const notificationLog = pgTable("notification_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  dedupeKey: text("dedupe_key").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deletionRequests = pgTable("deletion_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  requestedBy: uuid("requested_by").references(() => users.id, { onDelete: "set null" }),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/** Time-boxed, reasoned support access. Every use is written to audit_events. */
export const supportGrants = pgTable("support_grants", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminEmail: text("admin_email").notNull(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export type Plan = (typeof planEnum.enumValues)[number];
export type Subscription = typeof subscriptions.$inferSelect;

// ---------- Connected listings (Google Business Profile, Facebook Page) ----------

export const integrations = pgTable(
  "integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    siteUrl: text("site_url").notNull(),
    username: text("username").notNull(),
    /** AES-256-GCM ciphertext of the account token; never returned to clients. */
    secretEncrypted: text("secret_encrypted").notNull(),
    status: text("status").notNull().default("connected"),
    lastError: text("last_error"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    connectedBy: uuid("connected_by").references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("integrations_ws_kind_idx").on(t.workspaceId, t.kind)],
);

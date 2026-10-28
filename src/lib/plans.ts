import type { Plan } from "@/db/schema";

/**
 * Plans are priced by keywords: each keyword is one tracked question, checked
 * on every AI source on the plan's schedule. One credit is one AI answer, so a
 * plan's monthly credits are keywords × sources × checks per month.
 * No plan includes unlimited monitoring.
 */
export type CheckSchedule = "daily" | "weekly" | "biweekly";

export type PlanSpec = {
  key: Plan;
  name: string;
  summary: string;
  features: string[];
  /** Tracked questions allowed per business. */
  keywords: number;
  /** Scheduled AI checks; null means manual checks with trial credits only. */
  checks: CheckSchedule | null;
  monthlyCredits: number;
  maxWorkspaces: number;
  priceEnv: string;
  /** No longer sold; kept so existing subscriptions still resolve. */
  retired?: boolean;
};

const AI_SOURCES = 4;
// 4.5 weekly runs covers 5-Monday months; biweekly is half that.
const RUNS_PER_MONTH: Record<CheckSchedule, number> = { daily: 30, weekly: 4.5, biweekly: 2.25 };
const credits = (keywords: number, checks: CheckSchedule) => keywords * AI_SOURCES * RUNS_PER_MONTH[checks];
const GEO = ["Weekly GEO upkeep: Bing, Google and Facebook kept fresh", "AI-ready profile page with schema and llms.txt", "GEO readiness score and next steps"];
const AI_LIST = "Checked on ChatGPT, Gemini, Perplexity and Claude";

function keywordPlan(key: Plan, name: string, keywords: number, checks: CheckSchedule, extra: string[] = []): PlanSpec {
  const schedule = checks === "daily" ? "every day" : checks === "weekly" ? "every week" : "every 2 weeks";
  return {
    key, name, summary: `Track ${keywords} keywords in AI answers`,
    features: [`${keywords} keywords checked ${schedule}`, AI_LIST, ...GEO, "GEO audits and improvement tasks", ...extra],
    keywords, checks, monthlyCredits: credits(keywords, checks), maxWorkspaces: 1,
    priceEnv: `PLAN_PRICE_${key.toUpperCase()}_INR`,
  };
}

export const PLANS: PlanSpec[] = [
  { key: "free", name: "Free", summary: "Business profile and your GEO readiness score", features: ["Directory profile", "GEO readiness score", "One-time trial credits"], keywords: 3, checks: null, monthlyCredits: 0, maxWorkspaces: 1, priceEnv: "" },
  // The old Website plan: no longer sold, still honoured for existing subscribers.
  { key: "website", name: "Base", summary: "Get your business ready for AI answers", features: GEO, keywords: 3, checks: null, monthlyCredits: 0, maxWorkspaces: 1, priceEnv: "PLAN_PRICE_WEBSITE_INR", retired: true },
  keywordPlan("growth", "Growth", 5, "biweekly"),
  keywordPlan("pro", "Pro", 10, "weekly"),
  { key: "agency", name: "Enterprise", summary: "Growth for up to 10 businesses", features: ["Growth for every business", "5 keywords per business, checked every 2 weeks", AI_LIST, "Up to 10 businesses", "Portfolio view"], keywords: 5, checks: "biweekly", monthlyCredits: credits(5, "biweekly"), maxWorkspaces: 10, priceEnv: "PLAN_PRICE_AGENCY_INR" },
];

export const planSpec = (p: Plan) => PLANS.find((x) => x.key === p)!;

export function planPrice(p: PlanSpec): number | null {
  if (!p.priceEnv) return 0;
  const v = Number(process.env[p.priceEnv]);
  return Number.isFinite(v) && v > 0 ? v : null;
}

export const PLAN_RANK: Record<Plan, number> = { free: 0, website: 1, growth: 2, pro: 3, agency: 4 };
/** Every paid plan a subscription can hold, including retired ones. */
export const PAID_PLANS = PLANS.filter((p) => p.key !== "free").map((p) => p.key) as [Plan, ...Plan[]];
export type SalePlan = "growth" | "pro" | "agency";
/** Paid plans that can be bought today, cheapest first. */
export const SALE_PLANS: SalePlan[] = ["growth", "pro", "agency"];

/** During the pilot, entitlements are displayed but not enforced unless this is set. */
export function billingEnforced() {
  return process.env.BILLING_ENFORCED === "true";
}

export function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

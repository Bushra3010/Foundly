import type { Plan } from "@/db/schema";

/**
 * Proposed plan structure (PRD §12). Prices come from configuration and are
 * shown as "to be confirmed" until set — they must be based on measured costs.
 * No plan includes unlimited monitoring.
 */
export type PlanSpec = {
  key: Plan;
  name: string;
  summary: string;
  features: string[];
  hostedSite: boolean;
  customDomain: boolean;
  monthlyCredits: number;
  maxWorkspaces: number;
  priceEnv: string;
};

export const PLANS: PlanSpec[] = [
  { key: "free", name: "Free", summary: "Business profile and a private website preview", features: ["Directory profile", "Website draft and private preview", "One-time trial credits"], hostedSite: false, customDomain: false, monthlyCredits: 0, maxWorkspaces: 1, priceEnv: "" },
  { key: "website", name: "Website", summary: "A published website with enquiry forms", features: ["Everything in Free", "Published website on a platform address", "Enquiry form and lead inbox", "Your own domain"], hostedSite: true, customDomain: true, monthlyCredits: 0, maxWorkspaces: 1, priceEnv: "PLAN_PRICE_WEBSITE_INR" },
  { key: "growth", name: "Growth", summary: "Website plus a capped AI visibility allowance", features: ["Everything in Website", "Weekly AI visibility checks", "Website audits and improvement tasks"], hostedSite: true, customDomain: true, monthlyCredits: 75, maxWorkspaces: 1, priceEnv: "PLAN_PRICE_GROWTH_INR" },
  { key: "agency", name: "Agency", summary: "Several businesses and portfolio reporting", features: ["Growth features per business", "Up to 10 businesses", "Portfolio view"], hostedSite: true, customDomain: true, monthlyCredits: 40, maxWorkspaces: 10, priceEnv: "PLAN_PRICE_AGENCY_INR" },
];

export const planSpec = (p: Plan) => PLANS.find((x) => x.key === p)!;

export function planPrice(p: PlanSpec): number | null {
  if (!p.priceEnv) return 0;
  const v = Number(process.env[p.priceEnv]);
  return Number.isFinite(v) && v > 0 ? v : null;
}

export const PLAN_RANK: Record<Plan, number> = { free: 0, website: 1, growth: 2, agency: 3 };

/** During the pilot, entitlements are displayed but not enforced unless this is set. */
export function billingEnforced() {
  return process.env.BILLING_ENFORCED === "true";
}

export function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

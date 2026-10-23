import { planPrice, PLANS } from "@/lib/plans";
import { RegionalPricing } from "./regional-pricing";

export function LandingPricing() {
  const indiaOverrides = Object.fromEntries(PLANS.filter(plan => plan.key !== "free").map(plan => [plan.key, planPrice(plan)]));
  return <RegionalPricing indiaOverrides={indiaOverrides} />;
}

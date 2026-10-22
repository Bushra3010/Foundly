import Link from "next/link";
import { Icon } from "./icon";
import { formatInr, planPrice, PLANS } from "@/lib/plans";

export function LandingPricing() {
  const hasUnpricedPlans = PLANS.some((plan) => plan.key !== "free" && planPrice(plan) === null);

  return (
    <section id="pricing" className="landing-pricing landing-section" aria-labelledby="pricing-title">
      <div className="landing-section-heading">
        <div>
          <p className="landing-eyebrow">A LITTLE START. ROOM TO GROW.</p>
          <h2 id="pricing-title">The right fit for<br />your next chapter.</h2>
        </div>
        <p>Start with a free business profile and website preview. Find the plan that fits when you’re ready for more.</p>
      </div>
      <div className="pricing-grid">
        {PLANS.map((plan) => {
          const price = planPrice(plan);
          const featured = plan.key === "growth";
          const free = plan.key === "free";
          return (
            <article className={`pricing-card${featured ? " pricing-featured" : ""}`} key={plan.key} aria-labelledby={`pricing-${plan.key}`}>
              <div className="pricing-card-top">
                <span className="pricing-plan-icon"><Icon name={free ? "business" : plan.key === "website" ? "website" : plan.key === "growth" ? "improve" : "workspaces"} size={20} /></span>
                {featured && <span className="pricing-highlight">FOR YOUR NEXT STAGE</span>}
              </div>
              <h3 id={`pricing-${plan.key}`}>{plan.name}</h3>
              <p className="pricing-summary">{plan.summary}</p>
              <div className={`pricing-amount${price === null ? " pricing-unannounced" : ""}`}>
                <strong>{free ? "₹0" : price === null ? "Coming soon" : formatInr(price)}</strong>
                {price !== null && <span>/ month</span>}
              </div>
              <p className="pricing-term">{free ? "A free place to begin" : price === null ? "Monthly pricing to be announced" : "Billed monthly in INR"}</p>
              <Link href={free ? "/login" : "/login?next=%2Fapp%2Fsettings"} className={`landing-button${featured ? "" : " secondary"}`} aria-label={free ? "Get started with the Free plan" : `Explore the ${plan.name} plan`}>
                {free ? "Start for free" : `Explore ${plan.name}`}<Icon name="arrow" size={16} />
              </Link>
              <div className="pricing-includes">{free ? "YOUR STARTING POINT" : "WHAT’S INCLUDED"}</div>
              <ul>
                {plan.features.map((feature) => <li key={feature}><Icon name="check" size={15} /><span>{feature}</span></li>)}
                {plan.monthlyCredits > 0 && <li><Icon name="check" size={15} /><span>{plan.monthlyCredits} AI credits per month{plan.key === "agency" ? " per business" : ""}</span></li>}
                <li><Icon name="check" size={15} /><span>{plan.maxWorkspaces === 1 ? "1 business workspace" : `Up to ${plan.maxWorkspaces} business workspaces`}</span></li>
              </ul>
            </article>
          );
        })}
      </div>
      <div className="pricing-footnote">
        <p><Icon name="shield" size={16} /><span>You review the price before completing a paid checkout.</span></p>
        <span>AI checks use credits: one credit collects one AI answer. Allowances are capped.</span>
        {hasUnpricedPlans && <span>Paid plan prices are being finalized. You can start with Free today.</span>}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./icon";
import { PLANS } from "@/lib/plans";
import { formatRegionalPrice, pricingCountry, PRICING_COUNTRIES, PRICING_MARKETS, regionalPrice, suggestPricingCountry } from "@/lib/regional-pricing";

export function RegionalPricing({ indiaOverrides }: { indiaOverrides: Record<string, number | null> }) {
  const [countryCode, setCountryCode] = useState("IN");
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("foundly-pricing-country"); } catch {}
    setCountryCode(pricingCountry(saved)?.code ?? suggestPricingCountry(Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.languages));
  }, []);
  const country = pricingCountry(countryCode)!;
  const market = PRICING_MARKETS[country.market];
  function chooseCountry(code: string) {
    setCountryCode(code);
    try { localStorage.setItem("foundly-pricing-country", code); } catch {}
  }
  const paidPlans = PLANS.filter((plan) => plan.key !== "free");

  return (
    <section id="pricing" className="landing-pricing landing-section landing-fit" aria-labelledby="pricing-title">
      <div className="fit-body">
      <div className="landing-section-heading">
        <div>
          <p className="landing-eyebrow">A LITTLE START. ROOM TO GROW.</p>
          <h2 id="pricing-title">The right fit for<br />your next chapter.</h2>
        </div>
        <p>Start with a free business profile and website preview. Find the plan that fits when you’re ready for more.</p>
      </div>
      <div className="pricing-region-bar">
        <p>Monthly plans. Local prices.<span>Choose your country to see regional pricing.</span></p>
        <div className="pricing-region-control">
          <label htmlFor="pricing-country">Country / region</label>
          <select id="pricing-country" value={countryCode} onChange={event => chooseCountry(event.target.value)}>
            {PRICING_COUNTRIES.map(option => <option key={option.code} value={option.code}>{option.name} · {PRICING_MARKETS[option.market].currency}</option>)}
          </select>
        </div>
      </div>
      <div className="pricing-grid" aria-live="polite" aria-atomic="true">
        {paidPlans.map((plan) => {
          const price = countryCode === "IN" ? indiaOverrides[plan.key] ?? regionalPrice(countryCode, plan.key) : regionalPrice(countryCode, plan.key);
          const featured = plan.key === "growth";
          return (
            <article className={`pricing-card${featured ? " pricing-featured" : ""}`} key={plan.key} aria-labelledby={`pricing-${plan.key}`}>
              <div className="pricing-card-top">
                <span className="pricing-plan-icon"><Icon name={plan.key === "website" ? "website" : plan.key === "growth" ? "improve" : "workspaces"} size={20} /></span>
                {featured && <span className="pricing-highlight">FOR YOUR NEXT STAGE</span>}
              </div>
              <h3 id={`pricing-${plan.key}`}>{plan.name}</h3>
              <p className="pricing-summary">{plan.summary}</p>
              <div className="pricing-amount">
                <strong>{formatRegionalPrice(price, market)}</strong>
                <span>/ month</span>
              </div>
              <p className="pricing-term">Monthly plan · {market.currency}</p>
              <Link href="/signup?next=%2Fapp%2Fsettings" className={`landing-button${featured ? "" : " secondary"}`} aria-label={`Explore the ${plan.name} plan`}>
                Explore {plan.name}<Icon name="arrow" size={16} />
              </Link>
              <div className="pricing-includes">WHAT’S INCLUDED</div>
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
        <p><Icon name="shield" size={16} /><span>Regional list prices. Applicable taxes are additional.</span></p>
        <span>AI checks use credits: one credit collects one AI answer. Allowances are capped.</span>
        <span>Billing country, payment currency and final total are confirmed before payment. Start with Free today.</span>
      </div>
      </div>
    </section>
  );
}

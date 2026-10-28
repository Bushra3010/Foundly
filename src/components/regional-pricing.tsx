"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "./icon";
import { planSpec, SALE_PLANS, type SalePlan } from "@/lib/plans";
import { formatRegionalPrice, GEO_COUNTRY_COOKIE, pricingCountry, pricingCountryFor, PRICING_COUNTRIES, PRICING_MARKETS, regionalPrice, suggestPricingCountry } from "@/lib/regional-pricing";

const SAVED_COUNTRY_KEY = "foundly-pricing-country";

/** A saved manual choice wins, then the visitor's IP location, then the device timezone. */
function detectCountry() {
  let saved: string | null = null;
  try { saved = localStorage.getItem(SAVED_COUNTRY_KEY); } catch {}
  const geo = document.cookie.match(new RegExp(`(?:^|; )${GEO_COUNTRY_COOKIE}=([A-Z]{2})`))?.[1];
  return pricingCountry(saved)?.code ?? (geo ? pricingCountryFor(geo) : suggestPricingCountry(Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.languages));
}
const noSubscribe = () => () => {};

export function RegionalPricing({ indiaOverrides }: { indiaOverrides: Record<string, number | null> }) {
  // The prerendered page shows India; the browser switches to the detected country.
  const detected = useSyncExternalStore(noSubscribe, detectCountry, () => "IN");
  const [chosen, setChosen] = useState<string | null>(null);
  const countryCode = chosen ?? detected;
  const [selected, setSelected] = useState<SalePlan>("growth");
  const country = pricingCountry(countryCode)!;
  const market = PRICING_MARKETS[country.market];
  function chooseCountry(code: string) {
    setChosen(code);
    try { localStorage.setItem(SAVED_COUNTRY_KEY, code); } catch {}
  }

  return (
    <section id="pricing" className="landing-pricing landing-section landing-fit" aria-labelledby="pricing-title">
      <div className="fit-body">
      <div className="landing-section-heading">
        <div>
          <p className="landing-eyebrow">A LITTLE START. ROOM TO GROW.</p>
          <h2 id="pricing-title">The right fit for<br />your next chapter.</h2>
        </div>
        <p>Every plan includes our ChatGPT Ads service. Choose how many AI platforms get basic GEO: ChatGPT, then Gemini, then all four.</p>
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
        {SALE_PLANS.map((key) => {
          const plan = planSpec(key);
          const price = countryCode === "IN" ? indiaOverrides[key] ?? regionalPrice(countryCode, key) : regionalPrice(countryCode, key);
          // The selected card takes the dark style; the badge marks Pro as the step up from Growth.
          const featured = key === selected;
          return (
            <article className={`pricing-card${featured ? " pricing-featured" : ""}`} key={plan.key} aria-labelledby={`pricing-${plan.key}`} onClick={() => setSelected(key)} onFocus={() => setSelected(key)}>
              <div className="pricing-card-top">
                <span className="pricing-plan-icon"><Icon name={plan.key === "agency" ? "workspaces" : "improve"} size={20} /></span>
                {key === "pro" && <span className="pricing-highlight">FOR YOUR NEXT STAGE</span>}
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
                {plan.maxWorkspaces === 1 && <li><Icon name="check" size={15} /><span>1 business workspace</span></li>}
                <li className="pricing-extra"><Icon name="spark" size={15} /><span>+1 keyword: {formatRegionalPrice(market.extraKeyword, market)} / month each · by separate order; self-service purchase unavailable</span></li>
              </ul>
            </article>
          );
        })}
      </div>
      <div className="pricing-footnote">
        <p><Icon name="shield" size={16} /><span>Regional list prices. Applicable taxes are additional.</span></p>
        <span>AI checks use credits: one credit collects one AI answer. Allowances are capped.</span>
        <span>Billing country, payment currency and final total are confirmed before payment.</span>
      </div>
      </div>
    </section>
  );
}

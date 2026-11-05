"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { whatsappLink } from "@/lib/site-schema";

const SERVICES = [
  {
    id: "erp",
    label: "ERP",
    icon: "business",
    summary: "Run operations",
    title: "Custom ERP development",
    body: "Bring HR, payroll, accounting, inventory and sales into one system built around how your business operates.",
    bestFor: "Businesses managing finance, stock and staff across separate tools or spreadsheets.",
    features: [
      { name: "HR & payroll", detail: "Track attendance, leave and pay in one place. For example, HR can review approved leave before running payroll." },
      { name: "Accounting", detail: "See invoices, payments and outstanding balances. For example, finance can find unpaid invoices and see which are overdue." },
      { name: "Inventory", detail: "Track stock across locations and set reorder alerts. For example, a warehouse manager can spot low stock before accepting a large order." },
      { name: "Sales & orders", detail: "Follow orders from quotation to delivery. For example, sales can check stock availability before confirming a delivery date." },
      { name: "Reporting", detail: "Compare sales, orders and inventory trends in one dashboard. Try changing the reporting period in the demo." },
    ],
    price: "Starting at ₹3,00,000",
    enquiry: "Discuss an ERP project",
  },
  {
    id: "app",
    label: "Mobile apps",
    icon: "website",
    summary: "Serve customers on mobile",
    title: "Custom app development",
    body: "Build an Android or iOS app around what your customers or team need, with support from design through launch.",
    bestFor: "Startups launching a mobile product and businesses bringing an existing service to mobile.",
    features: [
      { name: "Design & navigation", detail: "Plan screens around common tasks. For example, a salon app can put rebooking one tap away from the home screen." },
      { name: "Sign-in & profiles", detail: "Give customers an account where they can manage their details and see past activity." },
      { name: "Bookings", detail: "Let customers browse services and see upcoming appointments. Try switching between services and bookings in the demo." },
      { name: "Order tracking", detail: "Show customers where an order stands, from confirmation to delivery, without a call to your team." },
      { name: "Testing & launch", detail: "Check key flows on the Android and iOS devices you plan to support, then prepare the app for store submission." },
    ],
    price: "Android from ₹60,000 · iOS from ₹1,00,000",
    enquiry: "Discuss an app project",
  },
  {
    id: "crm",
    label: "CRM",
    icon: "leads",
    summary: "Manage your sales pipeline",
    title: "Custom CRM development",
    body: "Manage leads, automate follow-ups and track deals in a CRM built around your sales process.",
    bestFor: "Sales teams that need one place to see who owns each lead and what happens next.",
    features: [
      { name: "Lead & contact records", detail: "Keep contact details, notes and conversation history together. A teammate can pick up a lead and see what was already discussed." },
      { name: "Lead assignment", detail: "Give each new enquiry an owner. For example, incoming leads can go to the rep who covers their region." },
      { name: "Follow-up reminders", detail: "Set reminders when a lead needs a response. For example, a rep can get a reminder two days after sending a proposal." },
      { name: "Deal pipeline", detail: "See deals by stage and find the next action. Select any deal in the demo to see what the rep should do next." },
      { name: "Sales reports", detail: "See where deals slow down. For example, compare demos booked with proposals sent to find a stage that needs attention." },
    ],
    price: "Starting at ₹99,999",
    enquiry: "Discuss a CRM project",
  },
] as const;

const ORDER_DATA = [
  { orders: 128, lowStock: 6, bars: [40, 62, 49, 76, 65, 93, 81] },
  { orders: 104, lowStock: 9, bars: [52, 34, 66, 56, 72, 88, 64] },
];

const DEALS = [
  { stage: "New lead", name: "Oak Studio", next: "Send an introduction and confirm their needs." },
  { stage: "Demo booked", name: "River Works", next: "Prepare a walkthrough for Thursday’s demo." },
  { stage: "Proposal sent", name: "Northline", next: "Follow up on the proposal on Friday." },
];

function ServicePreview({ service }: { service: (typeof SERVICES)[number]["id"] }) {
  const [week, setWeek] = useState(0);
  const [showServices, setShowServices] = useState(false);
  const [deal, setDeal] = useState(0);
  const { orders, lowStock, bars } = ORDER_DATA[week];
  return (
    <div className={`development-preview development-preview--${service}`}>
      <span className="development-preview-label"><i /> Interactive demo · Sample data</span>
      {service === "erp" && (
        <div className="development-window">
          <div className="development-window-header">
            <strong>Operations overview</strong>
            <select aria-label="Reporting period" value={week} onChange={(event) => setWeek(Number(event.target.value))}>
              <option value={0}>This week</option>
              <option value={1}>Last week</option>
            </select>
          </div>
          <div className="development-metrics" aria-live="polite">
            <div><span>Open orders</span><strong>{orders}</strong></div>
            <div><span>Low stock items</span><strong>{lowStock}</strong></div>
          </div>
          <div className="development-chart">
            <strong>Order volume</strong>
            <div className="development-bars" aria-hidden="true">
              {bars.map((height) => <i key={height} style={{ height: `${height}%` }} />)}
            </div>
            <div className="development-chart-days"><span>Mon</span><span>Sun</span></div>
          </div>
        </div>
      )}
      {service === "app" && (
        <div className="development-phone">
          <div className="development-phone-camera" />
          <strong>Book a visit</strong>
          <div className="development-appointment" aria-live="polite">
            <span>{showServices ? "AVAILABLE SERVICE" : "UPCOMING BOOKING"}</span>
            <strong>{showServices ? "Project planning call" : "Design consultation"}</strong>
            <span>{showServices ? "30 minutes · Online" : "Friday · 10:30 AM"}</span>
          </div>
          <button type="button" className="development-phone-row" aria-pressed={showServices} onClick={() => setShowServices(true)}>Browse services <span aria-hidden="true">›</span></button>
          <button type="button" className="development-phone-row" aria-pressed={!showServices} onClick={() => setShowServices(false)}>My bookings <span aria-hidden="true">›</span></button>
        </div>
      )}
      {service === "crm" && (
        <div className="development-window">
          <div className="development-window-header"><strong>Sales pipeline</strong><span>3 deals</span></div>
          <div className="development-pipeline">
            {DEALS.map(({ stage, name }, index) => (
              <button key={name} type="button" aria-pressed={deal === index} onClick={() => setDeal(index)}>
                <span>{stage}</span><strong>{name}</strong>
              </button>
            ))}
          </div>
          <div className="development-next-step" aria-live="polite"><strong>Next step</strong><span>{DEALS[deal].next}</span></div>
        </div>
      )}
    </div>
  );
}

export function DevelopmentServices() {
  const [active, setActive] = useState(0);
  const headingId = useId();
  const featureGroupId = useId();
  const { id, title, body, bestFor, features, price, enquiry } = SERVICES[active];
  return (
    <div className="development-services">
      <div className="development-switcher" role="group" aria-label="Explore software services">
        {SERVICES.map(({ id, label, icon, summary }, index) => (
          <button key={id} type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
            <span className="development-switcher-icon"><Icon name={icon} size={19} /></span>
            <span><strong>{label}</strong><small>{summary}</small></span>
          </button>
        ))}
      </div>
      <article className="lv-feature development-service" aria-labelledby={headingId}>
        <div className="development-copy">
          <h3 id={headingId}>{title}</h3>
          <p>{body}</p>
          <p><strong>Best for</strong> {bestFor}</p>
          <div key={id} className="development-explorer" role="group" aria-label={`${title} features`}>
            <strong>Explore the features</strong>
            {features.map(({ name, detail }) => (
              <details key={name} name={featureGroupId}>
                <summary>{name}<Icon name="down" size={15} /></summary>
                <p>{detail}</p>
              </details>
            ))}
          </div>
          <p className="development-price"><strong>{price}</strong></p>
          <a
            href={whatsappLink(`Hi Foundly, I'm interested in ${title.toLowerCase()}. I'd like to discuss my requirements.`)}
            className="landing-button secondary guide-cta"
          >
            {enquiry} on WhatsApp <Icon name="arrow" size={16} />
          </a>
          <Link href={`/software/${id}`} className="landing-button secondary guide-cta">
            Explore industry features <Icon name="arrow" size={16} />
          </Link>
        </div>
        <ServicePreview key={id} service={id} />
      </article>
    </div>
  );
}

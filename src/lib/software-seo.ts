/**
 * Search copy for the custom software pages: titles and descriptions written for the phrases people search,
 * plus plain question-and-answer pairs shown on the page and marked up as FAQPage for answer engines.
 */

type SoftwareSeo = {
  /** Visible H1: the search phrase plus the promise. */
  h1: string;
  eyebrow: string;
  /** Short noun used in city pages, e.g. "ERP software". */
  short: string;
  title: string;
  description: string;
  serviceName: string;
  serviceType: string[];
  /** Lowest one-time build price in INR, from the public price on the page. */
  priceFrom: number;
  faq: { q: string; a: string }[];
};

const BASED = "Foundly is based in Pune and builds software for businesses across India and worldwide, working remotely with each team.";

export const SOFTWARE_SEO: Record<string, SoftwareSeo> = {
  erp: {
    h1: "Custom ERP software that runs your whole business",
    eyebrow: "ERP software development company in India",
    short: "ERP software",
    title: "Custom ERP Software Development Company in India",
    description: "Custom ERP software for Indian businesses: stock, sales, purchase, HR, payroll and GST billing in one system. From ₹3,00,000. Try live demos of ERPs we built.",
    serviceName: "Custom ERP software development",
    serviceType: ["ERP software development", "Custom ERP", "Inventory management software", "HR and payroll software", "Management system development"],
    priceFrom: 300000,
    faq: [
      { q: "How much does custom ERP software cost in India?", a: "Custom ERP from Foundly starts at ₹3,00,000 (one-time build cost, before GST). The final price depends on the modules, number of users and integrations you need, and we agree a fixed quote before any work starts. There are no per-user licence fees." },
      { q: "What is a custom ERP?", a: "A custom ERP is business software built around how your company already works. It connects sales, stock, purchase, production, accounts and staff in one system, so everyone works from the same numbers instead of separate Excel sheets and WhatsApp groups." },
      { q: "Can I see ERP software you have built?", a: "Yes. This page lists the ERP and management systems we've built for real businesses, such as a franchise ERP for a computer training chain, a workforce and inspection ERP and Nidhi banking software. Each one has a live demo with sample data that you can try." },
      { q: "Can the ERP work with Tally, GST and WhatsApp?", a: "Yes. We can generate GST invoices, connect the ERP to Tally so your accountant keeps working as before, and send invoices, reminders and alerts on WhatsApp where your process needs it." },
      { q: "Where is Foundly based?", a: BASED },
    ],
  },
  crm: {
    h1: "Custom CRM software so you never lose a lead again",
    eyebrow: "CRM software development company in India",
    short: "CRM software",
    title: "Custom CRM Software Development Company in India",
    description: "Custom CRM software that captures every lead from ads, WhatsApp and your website and tracks each follow-up. From ₹99,999. Try live demos of CRMs we built.",
    serviceName: "Custom CRM software development",
    serviceType: ["CRM software development", "Custom CRM", "Lead management software", "WhatsApp CRM", "Sales pipeline software"],
    priceFrom: 99999,
    faq: [
      { q: "How much does a custom CRM cost in India?", a: "A custom CRM from Foundly starts at ₹99,999 (one-time build cost, before GST). The final price depends on your lead sources, number of users and integrations such as WhatsApp or calling, and we agree a fixed quote before work starts. There are no per-user licence fees." },
      { q: "What does a CRM do for a small business?", a: "A CRM keeps every enquiry in one place, gives each lead an owner and a next step, reminds your team to follow up, and shows which ads or sources bring real sales. It stops leads from being lost in WhatsApp chats and spreadsheets." },
      { q: "Can the CRM capture leads from Facebook ads, WhatsApp and our website?", a: "Yes. We connect the CRM to your website forms, WhatsApp and ad lead forms, so new enquiries arrive automatically, are checked for duplicates and are assigned to the right person." },
      { q: "Can I see CRMs you have built?", a: "Yes. This page lists CRMs we've built for real businesses in recruitment, hotels, real estate, travel, visas and education. Each one has a live demo with sample data that you can try." },
      { q: "Where is Foundly based?", a: BASED },
    ],
  },
  app: {
    h1: "Android & iOS apps that put your business in customers' pockets",
    eyebrow: "Mobile app development company in India",
    short: "mobile app",
    title: "Android & iOS App Development Company in India",
    description: "Custom Android and iOS apps for bookings, orders, deliveries and field teams. Android from ₹60,000, iOS from ₹1,00,000. Try live demos of apps we built.",
    serviceName: "Mobile app development",
    serviceType: ["Mobile app development", "Android app development", "iOS app development", "Booking app development", "Delivery app development"],
    priceFrom: 60000,
    faq: [
      { q: "How much does it cost to build a mobile app in India?", a: "With Foundly, an Android app starts at ₹60,000 and an iOS app at ₹1,00,000 (one-time build cost, before GST). The final price depends on the screens and features, such as payments, live tracking or a separate partner app, and we agree a fixed quote before work starts." },
      { q: "Do you build both Android and iOS apps?", a: "Yes. We build Android and iOS apps for customers, staff and delivery partners, and can build both from one codebase so they stay identical and cost less to maintain." },
      { q: "Will the app be published under our name?", a: "Yes. We publish the app on Google Play and the App Store under your own developer accounts, with your name and logo, so the app belongs to you." },
      { q: "Can I see apps you have built?", a: "Yes. This page lists mobile apps we've built, including ride and parcel booking, labour booking, doorstep pickup and local discovery apps. Each one has a live demo you can try." },
      { q: "Where is Foundly based?", a: BASED },
    ],
  },
};

export const AUTOMATION_SEO = {
  title: "AI Automation Agency in India",
  description: "AI automation for sales, marketing, operations, finance, support and HR: WhatsApp AI assistants, invoice reading, lead scoring and reports. See live demos.",
};

/**
 * City pages for custom ERP and CRM (/software/erp/mumbai etc.). Each city has its own text so the pages
 * are useful on their own, not copies with the city name swapped. Only Pune has an office.
 */

export const CITY_PRODUCTS = ["erp", "crm"] as const;
export type CityProduct = (typeof CITY_PRODUCTS)[number];

type SoftwareCity = {
  slug: string;
  name: string;
  state: string;
  office: boolean;
  /** Words that identify a project's client as being in this city (matched against the client label). */
  match: RegExp;
  areas: string[];
  erp: { industries: string[]; intro: string };
  crm: { industries: string[]; intro: string };
};

export const SOFTWARE_CITIES: SoftwareCity[] = [
  {
    slug: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    office: false,
    match: /mumbai|thane|navi mumbai/i,
    areas: ["Andheri", "Powai", "Lower Parel", "BKC", "Thane", "Navi Mumbai", "Bhiwandi"],
    erp: {
      industries: ["trading and distribution", "manufacturing units in Bhiwandi, Vasai and MIDC", "logistics", "pharma distributors", "real estate"],
      intro: "Mumbai businesses run on speed: stock spread across godowns in Bhiwandi and Thane, orders coming in on WhatsApp and accounts handled in Tally. A custom ERP from Foundly puts stock, orders, purchase, dispatch and GST billing in one system that your team in the office, the warehouse and on the road all see live.",
    },
    crm: {
      industries: ["real estate brokers and builders", "education and coaching", "travel agencies", "financial services", "B2B suppliers"],
      intro: "In Mumbai a lead that waits an hour is often gone. A custom CRM from Foundly captures every enquiry from your ads, 99acres, MagicBricks, IndiaMART, WhatsApp and website, gives it to the right salesperson in seconds and reminds them to follow up until the deal is closed.",
    },
  },
  {
    slug: "pune",
    name: "Pune",
    state: "Maharashtra",
    office: true,
    match: /pune|pimpri|chinchwad|akurdi/i,
    areas: ["Pimpri-Chinchwad", "Akurdi", "Hinjewadi", "Chakan", "Kharadi", "Baner", "Hadapsar"],
    erp: {
      industries: ["auto-component and engineering units in Chakan, Bhosari and Talawade", "furniture and interiors", "education institutes", "distributors", "service companies"],
      intro: "Foundly's office is in Akurdi, Pune, so we can meet you, walk your shop floor and see how work really flows before we design anything. Our ERP for Pune businesses connects orders, production, stock, purchase, HR and GST billing in one system built around how your team already works.",
    },
    crm: {
      industries: ["real estate projects", "education and training institutes", "IT and service companies", "clinics", "B2B manufacturers"],
      intro: "Our team is based in Akurdi, Pune. We build CRMs for Pune businesses that capture every enquiry from ads, portals, WhatsApp and your website, assign it to the right person and track each follow-up, with a dashboard that shows which source brings real sales.",
    },
  },
  {
    slug: "delhi-ncr",
    name: "Delhi NCR",
    state: "Delhi, Haryana and Uttar Pradesh",
    office: false,
    match: /delhi|noida|gurgaon|gurugram|ghaziabad|faridabad/i,
    areas: ["New Delhi", "Noida", "Gurugram", "Ghaziabad", "Faridabad", "Okhla"],
    erp: {
      industries: ["traders and wholesalers", "manufacturing in Okhla, Noida and Manesar", "home-service companies", "education groups", "exporters"],
      intro: "From wholesale markets in Delhi to factories in Noida and Manesar, NCR businesses juggle many branches, dealers and staff. A custom ERP from Foundly gives the owner one live view of stock, orders, dispatch, payments and people across every location.",
    },
    crm: {
      industries: ["education consultancies", "immigration and visa services", "real estate", "healthcare", "B2B sales teams"],
      intro: "Delhi NCR runs on high lead volumes from ads and portals. A custom CRM from Foundly captures every enquiry, routes it to the right counsellor or salesperson, sends an instant WhatsApp reply and makes sure no follow-up is missed.",
    },
  },
  {
    slug: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    office: false,
    match: /bengaluru|bangalore/i,
    areas: ["Whitefield", "Electronic City", "Koramangala", "Peenya", "HSR Layout", "Yelahanka"],
    erp: {
      industries: ["manufacturing in Peenya and Bommasandra", "service and AMC companies", "start-ups scaling operations", "education", "distributors"],
      intro: "Bengaluru companies grow fast and outgrow spreadsheets faster. A custom ERP from Foundly connects operations, inventory, service visits, HR and accounts in one system that is built for how your business works today and grows with you.",
    },
    crm: {
      industries: ["start-ups and SaaS sales teams", "service businesses", "education", "real estate", "healthcare"],
      intro: "For Bengaluru sales teams, a CRM has to fit the way they sell, not the other way round. Foundly builds custom CRMs with your stages, your fields and WhatsApp built in, so every lead is captured, owned and followed up.",
    },
  },
  {
    slug: "patna",
    name: "Patna",
    state: "Bihar",
    office: false,
    match: /patna|bihar|barbigha/i,
    areas: ["Boring Road", "Kankarbagh", "Rajendra Nagar", "Bailey Road", "Danapur"],
    erp: {
      industries: ["coaching institutes and libraries", "education groups", "distributors", "gyms and fitness centres", "real estate"],
      intro: "We have built more software for Patna and Bihar businesses than for any other city: library chains, coaching institutes, admission consultancies, a gym and a plot developer. A custom ERP from Foundly brings admissions, fees, attendance, stock and accounts into one simple system your staff can use from day one.",
    },
    crm: {
      industries: ["admission and education consultancies", "coaching institutes", "real estate and plot developers", "clinics", "service businesses"],
      intro: "Many of our CRM clients are in Patna and Bihar, including admission consultancies and a plot developer. Foundly builds CRMs that capture every enquiry from ads, calls and WhatsApp, assign it to a telecaller and track it until the admission or sale is done.",
    },
  },
];

export const softwareCity = (slug: string) => SOFTWARE_CITIES.find((c) => c.slug === slug);

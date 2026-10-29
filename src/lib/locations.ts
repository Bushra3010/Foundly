/**
 * Cities Foundly's SEO, AEO and GEO service pages cover. Only Pune has an office;
 * every other city is served remotely and its page must say so.
 */

export type ServiceCity = {
  slug: string;
  name: string;
  state: string;
  office: boolean;
  areas: string[];
  industries: string[];
  languages: string[];
  queries: string[];
  note: string;
};

export const SERVICE_CITIES: ServiceCity[] = [
  {
    slug: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    office: false,
    areas: ["Andheri", "Bandra", "Powai", "Lower Parel", "Thane", "Navi Mumbai"],
    industries: ["restaurants and cafes", "clinics and diagnostic centres", "real estate", "salons", "professional services"],
    languages: ["English", "Hindi", "Marathi"],
    queries: ["Best physiotherapist in Andheri West", "Rooftop restaurant in Bandra for a birthday", "Real estate agent for 2BHK rentals in Powai"],
    note: "Mumbai searches are extremely local: people ask for a suburb or even a station, not the city. A business that names only \"Mumbai\" is easy for an assistant to overlook when someone asks about Andheri or Thane. Listing each area you actually serve, consistently across your website and listings, matters more here than almost anywhere.",
  },
  {
    slug: "delhi-ncr",
    name: "Delhi NCR",
    state: "Delhi, Haryana and Uttar Pradesh",
    office: false,
    areas: ["South Delhi", "Connaught Place", "Dwarka", "Gurugram", "Noida", "Greater Noida"],
    industries: ["coaching and education", "real estate", "clinics and hospitals", "retail", "home services"],
    languages: ["English", "Hindi"],
    queries: ["UPSC coaching in Mukherjee Nagar with small batches", "Dermatologist in Gurugram Sector 56", "RERA registered builders in Noida Extension"],
    note: "NCR spans three states, and customers rarely search for \"Delhi NCR\". They search for Gurugram, Noida or a Delhi neighbourhood. Assistants also mix up businesses with similar names across these cities, so a full address, a clear service area and consistent details on every listing help them place you correctly.",
  },
  {
    slug: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    office: false,
    areas: ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Jayanagar", "Electronic City"],
    industries: ["startups and SaaS", "cafes and restaurants", "clinics and dental practices", "fitness studios", "coworking spaces"],
    languages: ["English", "Kannada", "Hindi"],
    queries: ["Pet-friendly cafe in Indiranagar", "Pediatric dentist in HSR Layout open on Sunday", "Coworking space in Koramangala with day passes"],
    note: "Bengaluru has some of India's earliest adopters of AI assistants, so questions there are often long and specific, with budgets, timings and neighbourhoods in one sentence. Pages that state those details plainly, such as Sunday hours, price ranges and the exact layout or sector, match these questions best.",
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    office: false,
    areas: ["Gachibowli", "HITEC City", "Banjara Hills", "Jubilee Hills", "Kondapur", "Secunderabad"],
    industries: ["real estate", "hospitals and clinics", "restaurants", "IT services", "education"],
    languages: ["English", "Telugu", "Hindi", "Urdu"],
    queries: ["Best biryani near Gachibowli for a team lunch", "Orthopaedic hospital in Banjara Hills", "Gated community projects in Kondapur under 1.5 crore"],
    note: "Hyderabad's fast-growing western corridor means many businesses are new, and new businesses have little written about them online. Assistants lean on what they can verify, so complete listings, a clear website and mentions in local directories make a bigger difference here for younger businesses.",
  },
  {
    slug: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    office: false,
    areas: ["T. Nagar", "Anna Nagar", "Adyar", "Velachery", "OMR", "Porur"],
    industries: ["hospitals and specialty clinics", "education", "jewellery and textile retail", "manufacturing suppliers", "restaurants"],
    languages: ["English", "Tamil"],
    queries: ["Eye hospital in Adyar for cataract surgery", "Silk saree shop in T. Nagar", "CBSE school in Velachery with transport"],
    note: "Chennai draws patients from across India and abroad, so healthcare questions are often asked by people outside the city. Assistants answering them need treatment-level detail, doctor credentials and practical information such as location and contact routes, stated clearly in English on your website.",
  },
  {
    slug: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    office: false,
    areas: ["Salt Lake", "New Town", "Park Street", "Ballygunge", "Behala", "Howrah"],
    industries: ["sweet shops and restaurants", "education and coaching", "clinics", "retail", "event services"],
    languages: ["English", "Bengali", "Hindi"],
    queries: ["Best mishti doi shop in South Kolkata", "IIT-JEE coaching in Salt Lake", "Caterer for Durga Puja events in New Town"],
    note: "Many established Kolkata businesses are well known offline but have thin websites. AI assistants can only recommend what they can read, so putting long-standing reputation into words, such as years in business, signature products and areas served, closes the gap between offline fame and AI visibility.",
  },
  {
    slug: "pune",
    name: "Pune",
    state: "Maharashtra",
    office: true,
    areas: ["Baner", "Hinjewadi", "Kothrud", "Wakad", "Koregaon Park", "Akurdi"],
    industries: ["education and coaching", "clinics and hospitals", "real estate", "restaurants and cafes", "home services"],
    languages: ["English", "Marathi", "Hindi"],
    queries: ["Physiotherapy clinic in Baner for sports injuries", "Interior designer in Wakad for 2BHK", "Plumber in Kothrud available today"],
    note: "Pune is home to Foundly, so this is where we can meet in person. The city's growth along Hinjewadi, Wakad and Baner means competition for local AI answers is rising quickly among clinics, interior designers, coaching institutes and home service businesses.",
  },
  {
    slug: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    office: false,
    areas: ["SG Highway", "Prahlad Nagar", "Navrangpura", "Satellite", "Bopal", "Maninagar"],
    industries: ["manufacturers and exporters", "textiles", "real estate", "restaurants", "clinics"],
    languages: ["English", "Gujarati", "Hindi"],
    queries: ["Textile manufacturer in Ahmedabad for bulk orders", "Gujarati thali restaurant on SG Highway", "IVF clinic in Navrangpura"],
    note: "Ahmedabad's manufacturers and exporters are often found by buyers outside Gujarat and outside India, increasingly through AI assistants. For them, product specifications, certifications, minimum order sizes and export markets, stated in English on the website, are what let an assistant recommend them.",
  },
];

export const serviceCity = (slug: string) => SERVICE_CITIES.find((c) => c.slug === slug);

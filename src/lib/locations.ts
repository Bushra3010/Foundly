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
  /** What matters for AI answers in the city's biggest categories: local platforms, naming and the details people ask for. */
  playbook: { industry: string; question: string; advice: string }[];
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
    playbook: [
      { industry: "Restaurants and cafes", question: "Rooftop restaurant in Bandra for a birthday", advice: "Name the exact neighbourhood and nearest station, such as Bandra West or Lower Parel, and keep your Zomato and Swiggy menus, hours and prices the same as your website. Assistants cross-check these listings before they recommend a place." },
      { industry: "Clinics", question: "Physiotherapist in Andheri West open after 8 pm", advice: "Publish each doctor’s name and qualifications and your evening hours on your website and Practo. Late hours are often the deciding detail for Mumbai commuters, and an assistant can only mention them if they are written down." },
      { industry: "Real estate", question: "2BHK rental in Powai near Hiranandani", advice: "Put MahaRERA registration numbers, project localities and possession dates in plain text. Assistants are careful about recommending builders and agents they cannot verify." },
    ],
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
    playbook: [
      { industry: "Coaching", question: "UPSC coaching in Mukherjee Nagar with small batches", advice: "State batch sizes, fees, faculty and results with the year they were achieved, and the exact locality, such as Mukherjee Nagar or Old Rajinder Nagar. Claims like “best results” without numbers are passed over." },
      { industry: "Clinics", question: "Dermatologist in Gurugram Sector 56", advice: "Use the sector number your patients use. Gurugram and Noida questions often name a sector, so a page that only says “Gurugram” is a weaker match than one that says “Sector 56, Gurugram”." },
      { industry: "Real estate", question: "RERA registered builders in Noida Extension", advice: "List the UP RERA or HRERA number for every project. People call the same area Noida Extension and Greater Noida West, so mention both names." },
    ],
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
    playbook: [
      { industry: "Cafes", question: "Pet-friendly cafe in Indiranagar", advice: "Write down the specifics people ask about: pet-friendly, laptop-friendly, Wi-Fi, parking and opening hours. Keep them identical on Zomato, Google and your own site so assistants trust them." },
      { industry: "Dental practices", question: "Pediatric dentist in HSR Layout open on Sunday", advice: "Give your Sunday hours and your sector or block, such as HSR Layout Sector 2 or Jayanagar 4th Block. Bengaluru addresses are block-based, and questions often are too." },
      { industry: "Coworking and startups", question: "Coworking space in Koramangala with day passes", advice: "Publish day-pass and seat prices. Bengaluru questions often include a budget, and a page without prices cannot answer them." },
    ],
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
    playbook: [
      { industry: "Restaurants", question: "Best biryani near Gachibowli for a team lunch", advice: "Say whether you take group bookings and corporate orders, with seating capacity and price per head. Team-lunch questions are common along the HITEC City and Gachibowli corridor." },
      { industry: "Hospitals and clinics", question: "Orthopaedic hospital in Banjara Hills", advice: "List specialities, procedures, doctors’ credentials and any accreditation such as NABH. Assistants answer health questions carefully and favour facts they can verify." },
      { industry: "Real estate", question: "Gated community projects in Kondapur under 1.5 crore", advice: "Publish price bands, configurations and Telangana RERA numbers. Budget-led questions need prices on the page, not “price on request”." },
    ],
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
    playbook: [
      { industry: "Hospitals", question: "Eye hospital in Adyar for cataract surgery", advice: "Patients travel to Chennai from other states and abroad, so describe treatments, doctors, packages and how to reach you from the airport and Chennai Central, in English." },
      { industry: "Retail", question: "Silk saree shop in T. Nagar", advice: "Name your speciality, such as Kanchipuram silk or bridal wear, your street and whether you ship. T. Nagar has many similar shops, and specific details are what separate you." },
      { industry: "Schools", question: "CBSE school in Velachery with transport", advice: "Put the board affiliation, fee range, transport routes and admission dates in text on your website, not only in PDFs or images that assistants may not read." },
    ],
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
    playbook: [
      { industry: "Sweet shops and restaurants", question: "Best mishti doi shop in South Kolkata", advice: "Write down what loyal customers already know: the year you started, your signature sweets, every branch and whether you deliver. Reputation that lives only offline is invisible to AI." },
      { industry: "Coaching", question: "IIT-JEE coaching in Salt Lake", advice: "Mention the Salt Lake sector, batch timings and results with the year. Parents ask for these details and assistants repeat them when they find them." },
      { industry: "Caterers and event services", question: "Caterer for Durga Puja events in New Town", advice: "Publish menus, capacity and seasonal availability well before Puja. An assistant can only suggest a caterer whose details it can find at the moment someone asks." },
    ],
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
    playbook: [
      { industry: "Clinics", question: "Physiotherapy clinic in Baner for sports injuries", advice: "Name both your area and a well-known landmark, such as Baner–Balewadi, and list treatments and evening hours on your website and Practo." },
      { industry: "Interior designers", question: "Interior designer in Wakad for 2BHK", advice: "Describe project types and budget ranges in words next to your photos, because assistants cannot tell what a photo shows unless the page says it. Mention Pimpri-Chinchwad too if you work there, since Wakad, Akurdi and Hinjewadi customers often search under PCMC." },
      { industry: "Home services", question: "Plumber in Kothrud available today", advice: "State your service areas, same-day availability and the hours you answer calls. Urgent questions favour businesses that say plainly they can come today." },
    ],
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
    playbook: [
      { industry: "Manufacturers and exporters", question: "Textile manufacturer in Ahmedabad for bulk orders", advice: "Publish product specifications, minimum order quantities, certifications and export markets in English, and keep IndiaMART and your website consistent with each other." },
      { industry: "Restaurants", question: "Gujarati thali restaurant on SG Highway", advice: "State the thali price, whether it is unlimited, timings and Jain options. These are exactly the details people include in their questions." },
      { industry: "Clinics", question: "IVF clinic in Navrangpura", advice: "List doctors’ qualifications, the treatments you offer and how a first consultation works. Assistants handle fertility questions cautiously and favour clinics that document this clearly." },
    ],
  },
];

export const serviceCity = (slug: string) => SERVICE_CITIES.find((c) => c.slug === slug);

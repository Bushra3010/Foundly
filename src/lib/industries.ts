/** Industry landing pages: what customers in each trade ask AI, and the facts assistants need to recommend them. */

export type Industry = {
  slug: string;
  name: string;
  plural: string;
  headline: string;
  intro: string;
  questions: string[];
  facts: { title: string; body: string }[];
  sources: string[];
  pitfall: string;
  faq: { q: string; a: string }[];
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "clinics-and-dentists",
    name: "Clinics and dentists",
    plural: "clinics and dental practices",
    headline: "Get your clinic recommended when patients ask AI",
    intro: "Patients now ask ChatGPT and Gemini which dentist or doctor to see nearby, and which clinic handles their specific treatment. Foundly shows whether AI names your practice, who it names instead, and what to fix.",
    questions: ["Best dentist for root canal treatment in Koramangala", "Which clinic in Pune does painless tooth extraction?", "Dermatologist near Andheri West open on Sunday", "Affordable dental implants in Hyderabad"],
    facts: [
      { title: "Treatments, one by one", body: "List each treatment you offer, such as root canals, implants, aligners or skin procedures, in plain text with a short description. Assistants match specific treatments to specific questions." },
      { title: "Qualifications and registration", body: "State doctors' degrees, specialisations and registration with the relevant council. Assistants are cautious with health recommendations and look for verifiable credentials." },
      { title: "Timings and emergencies", body: "Opening hours, Sunday and late-evening availability, and whether you take emergency cases are among the most-asked follow-up questions." },
      { title: "Location detail", body: "Neighbourhood, landmark, parking and which areas you serve help AI answer \"near me\" questions correctly." },
    ],
    sources: ["Google Business Profile", "Practo", "Justdial", "Lybrate", "Your clinic website"],
    pitfall: "Avoid unverifiable claims like \"best\" or \"100% painless\". Health questions are sensitive, and assistants tend to favour practices described with specific, factual information.",
    faq: [
      { q: "Can AI assistants recommend a specific doctor or clinic?", a: "Yes. When asked for a dentist or clinic in a particular area, ChatGPT, Gemini, Perplexity and Claude often name specific practices, usually drawing on directories, maps listings and clinic websites." },
      { q: "Does being on Practo help with AI visibility?", a: "Health directories are frequently among the sources AI assistants read. Accurate, complete listings there, consistent with your website and Google profile, give assistants more confidence in your details." },
      { q: "Is GEO allowed under medical advertising rules?", a: "GEO is about publishing accurate, factual information about your practice. Follow the rules that apply to your profession, and avoid testimonials or claims that your regulator restricts." },
    ],
  },
  {
    slug: "restaurants-and-cafes",
    name: "Restaurants and cafes",
    plural: "restaurants and cafes",
    headline: "Get your restaurant named when diners ask AI where to eat",
    intro: "\"Where should we eat tonight?\" is now a question people type into ChatGPT, Gemini and Perplexity. Foundly tracks whether AI suggests your restaurant, which places it suggests instead, and why.",
    questions: ["Best biryani in Hyderabad for a family dinner", "Romantic rooftop restaurant in Bandra", "Pure veg cafe with Wi-Fi in Indiranagar", "Restaurants open after midnight in Connaught Place"],
    facts: [
      { title: "Cuisine and signature dishes", body: "Name your cuisine and the dishes you are known for. Assistants match dish-level questions, such as the best biryani or filter coffee, to restaurants that mention them." },
      { title: "Occasions and ambience", body: "Family-friendly, rooftop, live music, quiet for work or good for groups: these are the words diners use in their questions." },
      { title: "Dietary options", body: "Pure veg, Jain, vegan, gluten-free and halal options are common filters. State them clearly on your website and listings." },
      { title: "Hours, price range and booking", body: "Late-night hours, average cost for two and how to reserve are details an assistant can quote directly." },
    ],
    sources: ["Google Business Profile", "Zomato", "Swiggy Dineout", "TripAdvisor", "Local food blogs and lists"],
    pitfall: "Menus only in images or PDFs are hard for assistants to read. Keep at least your key dishes and prices as text on a web page.",
    faq: [
      { q: "How does ChatGPT decide which restaurants to recommend?", a: "When it searches the web, it draws on review sites, food listings, maps data and articles. Restaurants that are described consistently and specifically across these sources are easier for it to recommend." },
      { q: "Do Zomato reviews affect AI recommendations?", a: "Review platforms are often among the sources AI assistants read. Accurate details and genuine reviews there can support your visibility, alongside your own website and Google profile." },
      { q: "Should my menu be on my website?", a: "Yes, as text rather than only an image. Dish names and prices on a web page give assistants concrete facts to match and quote." },
    ],
  },
  {
    slug: "salons-and-spas",
    name: "Salons and spas",
    plural: "salons and spas",
    headline: "Get your salon recommended when clients ask AI",
    intro: "Clients ask AI for the best salon for a keratin treatment, a bridal makeup artist or a spa nearby. Foundly shows whether your name comes up and what to change so it does.",
    questions: ["Best salon for keratin treatment in Whitefield", "Bridal makeup artist in Jaipur under 30,000", "Unisex salon open late in Gurgaon Sector 29", "Couples spa in Goa with good reviews"],
    facts: [
      { title: "Services with prices", body: "List services such as haircuts, colour, keratin, facials, bridal packages and massages, with starting prices where you can. Price questions are very common." },
      { title: "Who you serve", body: "Women, men, unisex, bridal, kids: state it clearly. Assistants use it to filter recommendations." },
      { title: "Brands and specialists", body: "Products you use and stylists' specialisations give assistants distinctive, quotable facts." },
      { title: "Booking and hours", body: "Online booking, walk-ins and late or weekend hours are details clients often ask about." },
    ],
    sources: ["Google Business Profile", "Instagram", "Justdial", "Booking platforms", "Wedding directories"],
    pitfall: "Many salons rely only on Instagram. Assistants read websites and listings more easily, so mirror your key services and prices there.",
    faq: [
      { q: "Does Instagram help my salon appear in AI answers?", a: "It can help with brand recognition, but assistants find structured information on websites, Google Business Profile and directories easier to use. Keep those complete and consistent." },
      { q: "Should I publish my prices?", a: "Starting prices are useful. Many questions mention a budget, and assistants can only match you when they know your price range." },
      { q: "How do I get recommended for bridal services?", a: "Have a dedicated page for bridal packages, list what is included and your service area, and make sure wedding directories list you accurately." },
    ],
  },
  {
    slug: "real-estate",
    name: "Real estate",
    plural: "real estate agents and developers",
    headline: "Get your real estate business named when buyers ask AI",
    intro: "Buyers and tenants ask AI which builders are reliable, which agents cover a locality and which projects fit their budget. Foundly tracks whether you are named, and against whom.",
    questions: ["Trusted real estate agent in Wakad for 2BHK rentals", "Best residential projects under 1 crore in Noida Extension", "RERA registered builders in Thane West", "Commercial property consultant in Gachibowli"],
    facts: [
      { title: "Localities and property types", body: "The neighbourhoods you cover and whether you handle rentals, resale, new projects or commercial space are the core of most questions." },
      { title: "Registration and track record", body: "RERA registration numbers, years in business and completed projects are trust signals assistants can cite." },
      { title: "Project facts", body: "For developers: configuration, carpet area ranges, possession dates and amenities, stated as text on a project page." },
      { title: "Clear contact routes", body: "Office address, phone, WhatsApp and hours, consistent everywhere they appear." },
    ],
    sources: ["Google Business Profile", "MagicBricks", "99acres", "Housing.com", "State RERA websites"],
    pitfall: "Listings that change constantly can leave outdated details across portals. Keep your core business facts identical everywhere, even as individual listings change.",
    faq: [
      { q: "Do AI assistants recommend real estate agents?", a: "Yes. For questions about a specific locality, they often name agents, builders or projects, using property portals, registration databases and business websites as sources." },
      { q: "Does RERA registration help with AI visibility?", a: "Stating your RERA registration on your website gives assistants a verifiable fact, which supports trust in property recommendations." },
      { q: "Should each project have its own page?", a: "Yes. A page per project with location, configuration, price range and possession date lets assistants match specific buyer questions." },
    ],
  },
  {
    slug: "coaching-and-education",
    name: "Coaching and education",
    plural: "coaching institutes and schools",
    headline: "Get your institute recommended when students ask AI",
    intro: "Students and parents ask AI for the best coaching for NEET, IELTS or coding near them. Foundly shows whether your institute is named, and what AI says about it.",
    questions: ["Best NEET coaching in Kota with small batches", "IELTS coaching in Chandigarh with weekend classes", "Coding classes for kids in Bangalore", "CA foundation coaching online with recorded lectures"],
    facts: [
      { title: "Courses and exams", body: "Name each course, the exam it prepares for, the duration and the batch format: online, offline or hybrid." },
      { title: "Faculty and approach", body: "Faculty qualifications, batch sizes and teaching method give assistants specific reasons to recommend you." },
      { title: "Fees and schedules", body: "Fee ranges, weekend or evening batches and start dates match the way students phrase questions." },
      { title: "Results you can verify", body: "Publish results only where they are verifiable. Assistants and students both distrust inflated claims." },
    ],
    sources: ["Google Business Profile", "Shiksha", "Careers360", "Justdial", "Your institute website"],
    pitfall: "Vague claims like \"No. 1 institute\" carry little weight. Concrete facts such as batch size, schedule and faculty do more for recommendations.",
    faq: [
      { q: "How do students use AI to choose coaching?", a: "Many ask an assistant to compare institutes for a specific exam and city, often adding constraints like budget, batch timing or online options." },
      { q: "Should I list fees on my website?", a: "A fee range helps. Assistants can only match budget questions when they can find your price information." },
      { q: "Do education directories matter for AI?", a: "Education portals are commonly read by AI assistants. Keep your listings accurate and consistent with your own website." },
    ],
  },
  {
    slug: "home-services",
    name: "Home services",
    plural: "plumbers, electricians and home service providers",
    headline: "Get called first when homeowners ask AI for help",
    intro: "When a pipe bursts or the AC stops working, people ask AI who to call nearby. Foundly shows whether your business is the one AI names, and what to fix if not.",
    questions: ["Emergency plumber in Baner available now", "AC repair service in Velachery same day", "Licensed electrician for house wiring in Jaipur", "Pest control for termites in Noida Sector 62"],
    facts: [
      { title: "Every service, by name", body: "List services such as leak repair, bathroom fitting, AC gas refill and wiring separately. Questions are almost always about a specific job." },
      { title: "Areas served", body: "Name the neighbourhoods and pin codes you cover. \"Near me\" answers depend on it." },
      { title: "Availability", body: "Emergency, same-day, 24x7 and weekend service are the details people need most and ask about first." },
      { title: "Licences and guarantees", body: "Licences, years of experience and any service warranty are verifiable reasons to recommend you." },
    ],
    sources: ["Google Business Profile", "Justdial", "Urban Company", "Sulekha", "Local community groups"],
    pitfall: "A phone number that differs between listings is a common problem. AI may repeat an old number, so keep it identical everywhere.",
    faq: [
      { q: "Do people really ask AI for plumbers and electricians?", a: "Increasingly, yes, especially on phones with built-in assistants. They ask for someone nearby, available now, for a specific job." },
      { q: "What matters most for a home service business?", a: "Consistent name, phone number and area across all listings, plus a clear list of services and availability on your website." },
      { q: "Do I need a website if I'm on Justdial and Google?", a: "A simple website you control gives assistants one authoritative source for your services and areas, and it helps confirm your listings." },
    ],
  },
];

export const industryBySlug = (slug: string) => INDUSTRIES.find((i) => i.slug === slug);

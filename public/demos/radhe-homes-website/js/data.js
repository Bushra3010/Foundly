/* ==========================================================================
   Radhe Homes: data layer
   Seed content + a localStorage-backed store shared by the site and the
   admin panel. Everything the admin edits is persisted here.
   ========================================================================== */

const RR = {
  company: {
    name: "Radhe Homes",
    tagline: "Real Estate Developer",
    since: 2009,
    phone: "+91 98250 41100",
    phoneHref: "+919825041100",
    whatsapp: "919825041100",
    email: "connect@radheradhecompany.in",
    address: "Radhe Radhe House, Level 4, Sarkhej–Gandhinagar Highway, Bodakdev, Ahmedabad, Gujarat 380054",
    hours: "Mon – Sat, 10:00 AM – 7:00 PM",
    rera: "PR/GJ/AHMEDABAD/AUDA/RAA0/RR-2024",
    mapQuery: "Bodakdev, Ahmedabad, Gujarat"
  },

  /* ---------- Projects ---------- */
  projects: [
    {
      id: "skyline-residency",
      name: "Skyline Residency",
      status: "ongoing",
      category: "residential",
      location: "Shela, Ahmedabad",
      type: "Residential Apartments",
      config: "2 & 3 BHK",
      area: "1,180 – 1,845 sq. ft.",
      priceFrom: "₹ 62.5 Lakh",
      progress: 65,
      stage: "Brickwork",
      possession: "December 2027",
      launched: "2025",
      image: "img/p-skyline.jpg",
      tagline: "Elevated living on the edge of the new city",
      summary: "Skyline Residency is a 3-tower residential development planned around a raised central deck, with every apartment opening to cross ventilation and an uninterrupted west-facing skyline.",
      overview: [
        "Skyline Residency sits on a 2.4 acre parcel in Shela, one of Ahmedabad's fastest-consolidating residential corridors. The layout places all three towers along the northern edge so that the entire southern half of the site stays open as landscaped ground.",
        "Every home is planned as a corner unit: no shared internal walls between living rooms: with a wide utility balcony and a dedicated dry-yard. Structural design is RCC shear wall on raft foundation, engineered for seismic zone III with a 15% design margin.",
        "The project is registered with GujRERA and is being delivered on a fixed possession commitment, with monthly construction reports published to every buyer."
      ],
      highlights: { totalArea: "2.4 Acres", buildings: "3 Towers", units: "186 Units", configs: "2 & 3 BHK", floors: "G + 13", parking: "2 Levels Basement", possession: "Dec 2027", status: "65% Complete" },
      amenities: ["Landscaped Garden","Club House","Children's Play Area","Covered Parking","24x7 Security","CCTV Surveillance","High-Speed Lifts","Power Backup","Community Hall","Walking Track"],
      floorPlans: [
        { unit: "2 BHK: Type A", carpet: "1,180 sq. ft.", bedrooms: 2, bathrooms: 2, balcony: "2", parking: "1 Covered" },
        { unit: "2 BHK: Type B", carpet: "1,265 sq. ft.", bedrooms: 2, bathrooms: 2, balcony: "2", parking: "1 Covered" },
        { unit: "3 BHK: Type C", carpet: "1,640 sq. ft.", bedrooms: 3, bathrooms: 3, balcony: "3", parking: "1 Covered" },
        { unit: "3 BHK: Corner", carpet: "1,845 sq. ft.", bedrooms: 3, bathrooms: 3, balcony: "3", parking: "2 Covered" }
      ],
      pricing: [
        { unit: "2 BHK", area: "1,180 sq. ft.", price: "₹ 62.5 Lakh", availability: "Available", plan: "20 : 60 : 20" },
        { unit: "2 BHK Large", area: "1,265 sq. ft.", price: "₹ 68.9 Lakh", availability: "Few Left", plan: "20 : 60 : 20" },
        { unit: "3 BHK", area: "1,640 sq. ft.", price: "₹ 89.4 Lakh", availability: "Available", plan: "20 : 60 : 20" },
        { unit: "3 BHK Corner", area: "1,845 sq. ft.", price: "₹ 1.02 Cr", availability: "Sold Out", plan: "-" }
      ],
      nearby: [
        { time: "3 Min", place: "Sardar Patel Ring Road" },
        { time: "6 Min", place: "Udgam / Zebar School" },
        { time: "10 Min", place: "Shalby Multi-Speciality Hospital" },
        { time: "12 Min", place: "Ambli Bopal Retail Circle" },
        { time: "22 Min", place: "SG Highway Business District" },
        { time: "35 Min", place: "SVP International Airport" }
      ],
      timeline: ["Foundation","Structure","Brickwork","Finishing","Handover"],
      updates: [
        { date: "2026-07-28", note: "Tower B brickwork completed up to the 9th floor; plaster started on lower floors." },
        { date: "2026-06-15", note: "Tower A structure topped out. Lift shaft casting complete." },
        { date: "2026-04-02", note: "Basement 2 slab cast across the full podium footprint." }
      ],
      gallery: ["img/p-skyline.jpg","img/int-1.jpg","img/con-1.jpg","img/am-2.jpg","img/int-3.jpg","img/ext-1.jpg"],
      video: "Project walkthrough: Skyline Residency"
    },
    {
      id: "aarambh-heights",
      name: "Aarambh Heights",
      status: "ongoing",
      category: "residential",
      location: "Chandkheda, Ahmedabad",
      type: "Residential Apartments",
      config: "2 & 3 BHK",
      area: "1,050 – 1,560 sq. ft.",
      priceFrom: "₹ 48.9 Lakh",
      progress: 38,
      stage: "Structure",
      possession: "June 2028",
      launched: "2026",
      image: "img/p-aarambh.jpg",
      tagline: "A first home that holds its value",
      summary: "Aarambh Heights is planned for first-time buyers who refuse to compromise on build quality: efficient layouts, honest carpet areas and a genuinely usable amenity deck.",
      overview: [
        "Aarambh Heights occupies a 1.8 acre plot minutes from the Chandkheda–Motera corridor, with metro connectivity already operational and the riverfront extension underway.",
        "The building is designed on a compact 4-per-floor plate so that lift waiting time stays low and common-area maintenance stays affordable for residents over the long term.",
        "All apartments are handed over with vitrified flooring, modular electrical points, branded CP fittings and a fully finished kitchen platform: no hidden completion cost after possession."
      ],
      highlights: { totalArea: "1.8 Acres", buildings: "2 Towers", units: "124 Units", configs: "2 & 3 BHK", floors: "G + 11", parking: "1 Level Basement", possession: "Jun 2028", status: "38% Complete" },
      amenities: ["Landscaped Garden","Club House","Children's Play Area","Covered Parking","24x7 Security","CCTV Surveillance","Lifts","Power Backup","Indoor Games","Walking Track"],
      floorPlans: [
        { unit: "2 BHK: Type A", carpet: "1,050 sq. ft.", bedrooms: 2, bathrooms: 2, balcony: "2", parking: "1 Covered" },
        { unit: "2 BHK: Type B", carpet: "1,140 sq. ft.", bedrooms: 2, bathrooms: 2, balcony: "2", parking: "1 Covered" },
        { unit: "3 BHK: Type C", carpet: "1,560 sq. ft.", bedrooms: 3, bathrooms: 3, balcony: "2", parking: "1 Covered" }
      ],
      pricing: [
        { unit: "2 BHK", area: "1,050 sq. ft.", price: "₹ 48.9 Lakh", availability: "Available", plan: "10 : 70 : 20" },
        { unit: "2 BHK Large", area: "1,140 sq. ft.", price: "₹ 53.2 Lakh", availability: "Available", plan: "10 : 70 : 20" },
        { unit: "3 BHK", area: "1,560 sq. ft.", price: "₹ 71.8 Lakh", availability: "Few Left", plan: "10 : 70 : 20" }
      ],
      nearby: [
        { time: "4 Min", place: "Chandkheda Metro Station" },
        { time: "7 Min", place: "Vishwakarma Government Engineering College" },
        { time: "9 Min", place: "Zydus Hospital, Motera" },
        { time: "14 Min", place: "Narendra Modi Stadium" },
        { time: "18 Min", place: "Gandhinagar Infocity" },
        { time: "26 Min", place: "SVP International Airport" }
      ],
      timeline: ["Foundation","Structure","Brickwork","Finishing","Handover"],
      updates: [
        { date: "2026-08-05", note: "Tower A slab cast at the 6th floor level. Tower B at 4th floor." },
        { date: "2026-05-20", note: "Plinth completed; basement waterproofing signed off by third-party consultant." }
      ],
      gallery: ["img/p-aarambh.jpg","img/con-3.jpg","img/int-2.jpg","img/am-1.jpg","img/ext-2.jpg","img/con-4.jpg"],
      video: "Construction update: Aarambh Heights"
    },
    {
      id: "commerz-one",
      name: "Commerz One",
      status: "ongoing",
      category: "commercial",
      location: "Gota, Ahmedabad",
      type: "Commercial: Offices & Retail",
      config: "Retail, Offices",
      area: "420 – 4,200 sq. ft.",
      priceFrom: "₹ 42.0 Lakh",
      progress: 52,
      stage: "Structure",
      possession: "March 2028",
      launched: "2025",
      image: "img/p-commerz.jpg",
      tagline: "Ground-floor retail. Efficient upper-floor offices.",
      summary: "A mixed-use commercial address on a 24-metre road, planned with a double-height retail base, dedicated office lobby and structured parking for 240 cars.",
      overview: [
        "Commerz One is designed around visibility. The retail base is set back nine metres from the road edge to create a genuine forecourt, while offices above are served by a separate secure lobby and four passenger lifts.",
        "Office floors are column-free across a 12.6 metre span, so tenants can plan open floor plates or cellular cabins without structural constraint.",
        "The development is pre-wired for redundant fibre, and each floor has a dedicated DG feed sized for full-load operation."
      ],
      highlights: { totalArea: "1.2 Acres", buildings: "1 Block", units: "96 Units", configs: "Retail / Office", floors: "G + 8", parking: "2 Levels Basement", possession: "Mar 2028", status: "52% Complete" },
      amenities: ["Structured Parking","24x7 Security","CCTV Surveillance","High-Speed Lifts","Full Power Backup","Fire Safety Systems","Food Court","Common Washrooms","Signage Zone","Visitor Drop-off"],
      floorPlans: [
        { unit: "Retail: Small", carpet: "420 sq. ft.", bedrooms: "-", bathrooms: 1, balcony: "-", parking: "1" },
        { unit: "Retail: Large", carpet: "980 sq. ft.", bedrooms: "-", bathrooms: 1, balcony: "-", parking: "2" },
        { unit: "Office: Standard", carpet: "1,250 sq. ft.", bedrooms: "-", bathrooms: 2, balcony: "1", parking: "2" },
        { unit: "Office: Full Floor", carpet: "4,200 sq. ft.", bedrooms: "-", bathrooms: 4, balcony: "2", parking: "6" }
      ],
      pricing: [
        { unit: "Retail (Ground)", area: "420 sq. ft.", price: "₹ 42.0 Lakh", availability: "Few Left", plan: "30 : 50 : 20" },
        { unit: "Retail (Large)", area: "980 sq. ft.", price: "₹ 96.5 Lakh", availability: "Available", plan: "30 : 50 : 20" },
        { unit: "Office", area: "1,250 sq. ft.", price: "₹ 74.9 Lakh", availability: "Available", plan: "20 : 60 : 20" },
        { unit: "Full Floor", area: "4,200 sq. ft.", price: "₹ 2.48 Cr", availability: "Available", plan: "20 : 60 : 20" }
      ],
      nearby: [
        { time: "2 Min", place: "SG Highway Junction" },
        { time: "8 Min", place: "Gota Cross Roads Retail Belt" },
        { time: "11 Min", place: "Vaishnodevi Circle" },
        { time: "16 Min", place: "Sola Civil Hospital" },
        { time: "20 Min", place: "Ahmedabad Railway Station" },
        { time: "24 Min", place: "SVP International Airport" }
      ],
      timeline: ["Foundation","Structure","Brickwork","Finishing","Handover"],
      updates: [
        { date: "2026-07-10", note: "5th floor slab cast. Retail base facade mock-up approved." },
        { date: "2026-03-18", note: "Basement structure complete; ramp casting done." }
      ],
      gallery: ["img/p-commerz.jpg","img/ext-3.jpg","img/con-2.jpg","img/ext-4.jpg","img/con-1.jpg","img/ext-8.jpg"],
      video: "Site visit: Commerz One"
    },
    {
      id: "sanskar-enclave",
      name: "Sanskar Enclave",
      status: "completed",
      category: "residential",
      location: "Sanand Road, Ahmedabad",
      type: "Residential Villas",
      config: "3 & 4 BHK Villas",
      area: "2,400 – 3,150 sq. ft.",
      priceFrom: "₹ 1.45 Cr",
      progress: 100,
      stage: "Handed Over",
      possession: "Handed over: 2024",
      launched: "2021",
      completionYear: "2024",
      image: "img/p-sanskar.jpg",
      tagline: "42 villas. One quiet, finished neighbourhood.",
      summary: "A gated villa community delivered four months ahead of the committed possession date, with full landscaping and the club house handed over on day one.",
      overview: [
        "Sanskar Enclave was conceived as a low-density counterpoint to apartment living: 42 villas on 4.6 acres, each with a private garden and a covered double-car porch.",
        "Every villa was handed over completely finished: modular kitchen, wardrobes in all bedrooms, solar water heating and a 5 KW rooftop solar provision already installed.",
        "The community was fully occupied within eleven months of handover and today runs on a resident-elected management committee."
      ],
      highlights: { totalArea: "4.6 Acres", buildings: "42 Villas", units: "42 Units", configs: "3 & 4 BHK", floors: "G + 1", parking: "2 Car Porch", possession: "Handed Over", status: "Completed 2024" },
      amenities: ["Landscaped Garden","Club House","Children's Play Area","Private Parking","Gated Security","CCTV Surveillance","Community Area","Power Backup","Walking Area","Solar Water Heating"],
      floorPlans: [
        { unit: "3 BHK Villa", carpet: "2,400 sq. ft.", bedrooms: 3, bathrooms: 3, balcony: "2", parking: "2 Covered" },
        { unit: "4 BHK Villa", carpet: "3,150 sq. ft.", bedrooms: 4, bathrooms: 4, balcony: "3", parking: "2 Covered" }
      ],
      pricing: [
        { unit: "3 BHK Villa", area: "2,400 sq. ft.", price: "₹ 1.45 Cr", availability: "Sold Out", plan: "-" },
        { unit: "4 BHK Villa", area: "3,150 sq. ft.", price: "₹ 1.92 Cr", availability: "Sold Out", plan: "-" }
      ],
      nearby: [
        { time: "5 Min", place: "Sanand Main Road" },
        { time: "9 Min", place: "Anand Niketan School" },
        { time: "15 Min", place: "Sanand Referral Hospital" },
        { time: "18 Min", place: "Sanand GIDC Industrial Estate" },
        { time: "30 Min", place: "SG Highway" },
        { time: "45 Min", place: "SVP International Airport" }
      ],
      keyFeatures: ["42 private villas","Delivered 4 months early","100% occupancy in year one","Solar-ready rooftops"],
      timeline: ["Foundation","Structure","Brickwork","Finishing","Handover"],
      updates: [{ date: "2024-11-12", note: "Final handover completed. Club house and landscape transferred to the residents' committee." }],
      gallery: ["img/p-sanskar.jpg","img/int-4.jpg","img/am-3.jpg","img/int-5.jpg","img/ext-6.jpg","img/am-1.jpg"],
      video: "Project introduction: Sanskar Enclave"
    },
    {
      id: "vrindavan-residency",
      name: "Vrindavan Residency",
      status: "completed",
      category: "residential",
      location: "Nikol, Ahmedabad",
      type: "Residential Apartments",
      config: "2 & 3 BHK",
      area: "980 – 1,420 sq. ft.",
      priceFrom: "₹ 38.0 Lakh",
      progress: 100,
      stage: "Handed Over",
      possession: "Handed over: 2021",
      launched: "2018",
      completionYear: "2021",
      image: "img/p-vrindavan.jpg",
      tagline: "Our first apartment community, still our proudest",
      summary: "216 homes delivered across four towers, now a settled community with its own school shuttle, weekly market and a fully resident-run club.",
      overview: [
        "Vrindavan Residency is where the company's residential practice began. Four towers, 216 homes, and a brief that has not changed since: honest carpet areas and no shortcuts in the structure.",
        "The project was completed and handed over in 2021 and has since been through two monsoon-season audits with no structural remediation required.",
        "Resale values in the community are currently tracking about 34% above the original launch price."
      ],
      highlights: { totalArea: "3.1 Acres", buildings: "4 Towers", units: "216 Units", configs: "2 & 3 BHK", floors: "G + 10", parking: "Covered + Open", possession: "Handed Over", status: "Completed 2021" },
      amenities: ["Landscaped Garden","Club House","Children's Play Area","Covered Parking","24x7 Security","CCTV Surveillance","Lifts","Power Backup","Community Hall","Walking Track"],
      floorPlans: [
        { unit: "2 BHK", carpet: "980 sq. ft.", bedrooms: 2, bathrooms: 2, balcony: "2", parking: "1" },
        { unit: "3 BHK", carpet: "1,420 sq. ft.", bedrooms: 3, bathrooms: 2, balcony: "2", parking: "1" }
      ],
      pricing: [
        { unit: "2 BHK", area: "980 sq. ft.", price: "₹ 38.0 Lakh", availability: "Sold Out", plan: "-" },
        { unit: "3 BHK", area: "1,420 sq. ft.", price: "₹ 54.5 Lakh", availability: "Sold Out", plan: "-" }
      ],
      nearby: [
        { time: "4 Min", place: "Nikol Gam Road" },
        { time: "8 Min", place: "Nikol Municipal School" },
        { time: "12 Min", place: "LG Hospital" },
        { time: "15 Min", place: "Naroda Industrial Belt" },
        { time: "20 Min", place: "Ahmedabad Railway Station" },
        { time: "30 Min", place: "SVP International Airport" }
      ],
      keyFeatures: ["216 homes delivered","Zero structural remediation","34% appreciation since launch","Resident-run club house"],
      timeline: ["Foundation","Structure","Brickwork","Finishing","Handover"],
      updates: [{ date: "2021-09-30", note: "All four towers handed over. Occupancy certificate received." }],
      gallery: ["img/p-vrindavan.jpg","img/int-1.jpg","img/am-2.jpg","img/ext-5.jpg","img/int-3.jpg","img/ext-7.jpg"],
      video: "Project introduction: Vrindavan Residency"
    },
    {
      id: "business-square",
      name: "Business Square",
      status: "completed",
      category: "commercial",
      location: "Prahlad Nagar, Ahmedabad",
      type: "Commercial: Offices",
      config: "Offices",
      area: "650 – 2,800 sq. ft.",
      priceFrom: "₹ 58.0 Lakh",
      progress: 100,
      stage: "Handed Over",
      possession: "Handed over: 2023",
      launched: "2020",
      completionYear: "2023",
      image: "img/p-business.jpg",
      tagline: "A working address that fills up and stays full",
      summary: "68 office units in the Prahlad Nagar business belt, at 97% occupancy since the second year after handover.",
      overview: [
        "Business Square was built for owner-occupiers and small firms who wanted a Prahlad Nagar address without a full-floor commitment.",
        "The building runs on a central chilled-water system with individual metering, so tenants pay only for what they consume.",
        "Handed over in 2023 with all common areas, parking and services fully commissioned."
      ],
      highlights: { totalArea: "0.9 Acres", buildings: "1 Block", units: "68 Units", configs: "Office", floors: "G + 7", parking: "2 Levels Basement", possession: "Handed Over", status: "Completed 2023" },
      amenities: ["Structured Parking","24x7 Security","CCTV Surveillance","High-Speed Lifts","Full Power Backup","Fire Safety Systems","Cafeteria","Common Washrooms","Reception Lobby","Visitor Parking"],
      floorPlans: [
        { unit: "Office: Compact", carpet: "650 sq. ft.", bedrooms: "-", bathrooms: 1, balcony: "-", parking: "1" },
        { unit: "Office: Standard", carpet: "1,400 sq. ft.", bedrooms: "-", bathrooms: 2, balcony: "1", parking: "2" },
        { unit: "Office: Large", carpet: "2,800 sq. ft.", bedrooms: "-", bathrooms: 3, balcony: "2", parking: "4" }
      ],
      pricing: [
        { unit: "Compact Office", area: "650 sq. ft.", price: "₹ 58.0 Lakh", availability: "Sold Out", plan: "-" },
        { unit: "Standard Office", area: "1,400 sq. ft.", price: "₹ 1.19 Cr", availability: "Sold Out", plan: "-" },
        { unit: "Large Office", area: "2,800 sq. ft.", price: "₹ 2.32 Cr", availability: "Sold Out", plan: "-" }
      ],
      nearby: [
        { time: "2 Min", place: "Prahlad Nagar Garden" },
        { time: "5 Min", place: "Anand Nagar Cross Roads" },
        { time: "9 Min", place: "SG Highway" },
        { time: "12 Min", place: "Apollo Hospital" },
        { time: "18 Min", place: "Ahmedabad Railway Station" },
        { time: "28 Min", place: "SVP International Airport" }
      ],
      keyFeatures: ["68 office units","97% sustained occupancy","Central HVAC with sub-metering","Handed over on schedule"],
      timeline: ["Foundation","Structure","Brickwork","Finishing","Handover"],
      updates: [{ date: "2023-06-22", note: "Building handed over with occupancy certificate and commissioned services." }],
      gallery: ["img/p-business.jpg","img/ext-8.jpg","img/ext-3.jpg","img/int-2.jpg","img/ext-4.jpg","img/con-2.jpg"],
      video: "Project walkthrough: Business Square"
    },
    {
      id: "green-vistas",
      name: "Green Vistas",
      status: "upcoming",
      category: "residential",
      location: "Sindhu Bhavan Road, Ahmedabad",
      type: "Residential Apartments",
      config: "3 & 4 BHK",
      area: "1,720 – 2,480 sq. ft.",
      priceFrom: "Price on announcement",
      progress: 0,
      stage: "Pre-launch",
      possession: "Expected 2030",
      launch: "Q1 2027",
      launched: "2027",
      image: "img/p-greenvistas.jpg",
      tagline: "Large-format homes on the city's most watched road",
      summary: "A limited-release development of 3 and 4 BHK residences with private deck gardens, planned for launch in the first quarter of 2027.",
      overview: [
        "Green Vistas is planned as a two-tower, low-density residential address on Sindhu Bhavan Road, with only four homes per floor.",
        "Design development is underway with approvals targeted for late 2026. Registration of interest is open, and registered buyers get first access to the pre-launch price band.",
        "Final configurations, pricing and possession dates will be published at launch."
      ],
      highlights: { totalArea: "3.2 Acres", buildings: "2 Towers", units: "112 Units", configs: "3 & 4 BHK", floors: "G + 14", parking: "2 Levels Basement", possession: "Expected 2030", status: "Pre-launch" },
      amenities: ["Landscaped Garden","Club House","Children's Play Area","Covered Parking","24x7 Security","CCTV Surveillance","High-Speed Lifts","Power Backup","Community Area","Walking Track"],
      floorPlans: [
        { unit: "3 BHK", carpet: "1,720 sq. ft.", bedrooms: 3, bathrooms: 3, balcony: "3", parking: "2" },
        { unit: "4 BHK", carpet: "2,480 sq. ft.", bedrooms: 4, bathrooms: 4, balcony: "4", parking: "2" }
      ],
      pricing: [
        { unit: "3 BHK", area: "1,720 sq. ft.", price: "On announcement", availability: "Register Interest", plan: "-" },
        { unit: "4 BHK", area: "2,480 sq. ft.", price: "On announcement", availability: "Register Interest", plan: "-" }
      ],
      nearby: [
        { time: "3 Min", place: "Sindhu Bhavan Road Retail" },
        { time: "7 Min", place: "Zebar School for Children" },
        { time: "10 Min", place: "Shalby Hospital" },
        { time: "12 Min", place: "SG Highway" },
        { time: "20 Min", place: "Gandhinagar Infocity" },
        { time: "30 Min", place: "SVP International Airport" }
      ],
      keyHighlights: ["Only 4 homes per floor","Private deck gardens","Two-tower low-density plan","Pre-launch registration open"],
      timeline: ["Foundation","Structure","Brickwork","Finishing","Handover"],
      updates: [{ date: "2026-08-01", note: "Design development in progress. Registration of interest now open." }],
      gallery: ["img/p-greenvistas.jpg","img/ext-6.jpg","img/int-5.jpg","img/am-3.jpg","img/ext-1.jpg","img/int-4.jpg"],
      video: "Concept film: Green Vistas"
    },
    {
      id: "trade-park",
      name: "Trade Park",
      status: "upcoming",
      category: "commercial",
      location: "Sanand GIDC, Ahmedabad",
      type: "Commercial: Warehousing & Offices",
      config: "Warehouse, Office",
      area: "5,000 – 40,000 sq. ft.",
      priceFrom: "Price on announcement",
      progress: 0,
      stage: "Pre-launch",
      possession: "Expected 2029",
      launch: "Q3 2027",
      launched: "2027",
      image: "img/p-tradepark.jpg",
      tagline: "Industrial-grade space, developer-grade delivery",
      summary: "A planned warehousing and office park on the Sanand industrial corridor, sized for logistics operators and light manufacturing.",
      overview: [
        "Trade Park is planned on an 11 acre parcel inside the Sanand GIDC belt, with direct container access and a 12-metre clear internal height in the warehousing blocks.",
        "The masterplan reserves a front-of-site office block for tenant administration and a driver rest facility at the rear gate.",
        "Approvals and infrastructure design are in progress ahead of a targeted Q3 2027 launch."
      ],
      highlights: { totalArea: "11 Acres", buildings: "6 Blocks", units: "24 Units", configs: "Warehouse / Office", floors: "G + 2", parking: "Container Yard", possession: "Expected 2029", status: "Pre-launch" },
      amenities: ["Container Yard","24x7 Security","CCTV Surveillance","Full Power Backup","Fire Safety Systems","Driver Rest Facility","Weighbridge","Truck Docking Bays","Admin Block","Canteen"],
      floorPlans: [
        { unit: "Warehouse Unit", carpet: "5,000 sq. ft.", bedrooms: "-", bathrooms: 2, balcony: "-", parking: "Docking Bay" },
        { unit: "Warehouse Block", carpet: "40,000 sq. ft.", bedrooms: "-", bathrooms: 6, balcony: "-", parking: "4 Docking Bays" }
      ],
      pricing: [
        { unit: "Warehouse Unit", area: "5,000 sq. ft.", price: "On announcement", availability: "Register Interest", plan: "-" },
        { unit: "Warehouse Block", area: "40,000 sq. ft.", price: "On announcement", availability: "Register Interest", plan: "-" }
      ],
      nearby: [
        { time: "4 Min", place: "Sanand GIDC Phase II" },
        { time: "10 Min", place: "Ahmedabad–Rajkot Highway" },
        { time: "18 Min", place: "Sanand Railway Siding" },
        { time: "26 Min", place: "Bavla Junction" },
        { time: "40 Min", place: "SG Highway" },
        { time: "55 Min", place: "SVP International Airport" }
      ],
      keyHighlights: ["11 acre industrial parcel","12 m clear internal height","Direct container access","Pre-launch registration open"],
      timeline: ["Foundation","Structure","Brickwork","Finishing","Handover"],
      updates: [{ date: "2026-07-18", note: "Land parcel consolidated. Infrastructure design underway." }],
      gallery: ["img/p-tradepark.jpg","img/con-2.jpg","img/ext-2.jpg","img/con-3.jpg","img/ext-5.jpg","img/con-4.jpg"],
      video: "Concept film: Trade Park"
    }
  ],

  /* ---------- Beliefs / why us ---------- */
  beliefs: [
    { t: "Quality First", d: "Third-party tested materials, audited concrete mixes and a site engineer accountable for every pour." },
    { t: "Strategic Locations", d: "We buy land where infrastructure is already committed: not where it is merely promised." },
    { t: "Transparent Approach", d: "Carpet area, payment schedule and possession date in writing before a rupee changes hands." },
    { t: "Modern Development", d: "Efficient plans, cross ventilation and services designed for a twenty-year life, not a handover photo." },
    { t: "Timely Delivery", d: "Fourteen of our last sixteen buildings were handed over on or before the committed date." },
    { t: "Long-Term Value", d: "Low common-area load and honest construction keep resale and rental values healthy." }
  ],

  /* ---------- Journey ---------- */
  journey: [
    { yr: "2009", t: "Foundation", d: "Radhe Homes is established as a land development and contracting firm in Ahmedabad." },
    { yr: "2015", t: "Growth", d: "The company moves into full-scale real estate development with its first residential land parcel." },
    { yr: "2018", t: "Development", d: "Residential and commercial projects run in parallel; the in-house project management team is formed." },
    { yr: "2026", t: "Future", d: "Eight developments across the city, with larger mixed-use and industrial parks now in planning." }
  ],

  /* ---------- Amenities master list ---------- */
  amenityIcons: {
    "Landscaped Garden": "leaf", "Club House": "home", "Children's Play Area": "play", "Covered Parking": "car",
    "Private Parking": "car", "Structured Parking": "car", "Container Yard": "car", "24x7 Security": "shield",
    "Gated Security": "shield", "CCTV Surveillance": "cctv", "Lifts": "lift", "High-Speed Lifts": "lift",
    "Power Backup": "bolt", "Full Power Backup": "bolt", "Community Hall": "users", "Community Area": "users",
    "Walking Track": "walk", "Walking Area": "walk", "Indoor Games": "play", "Solar Water Heating": "sun",
    "Fire Safety Systems": "shield", "Food Court": "cup", "Cafeteria": "cup", "Canteen": "cup",
    "Common Washrooms": "home", "Signage Zone": "home", "Visitor Drop-off": "car", "Reception Lobby": "home",
    "Visitor Parking": "car", "Driver Rest Facility": "home", "Weighbridge": "bolt", "Truck Docking Bays": "car",
    "Admin Block": "home"
  },

  /* ---------- Testimonials ---------- */
  testimonials: [
    { name: "Hetal Shah", project: "Vrindavan Residency", rating: 5, photo: "img/int-1.jpg",
      text: "We were shown the actual carpet area on site, not a brochure number. Four years after possession the building still looks and works the way it did on handover day." },
    { name: "Rakesh Patel", project: "Sanskar Enclave", rating: 5, photo: "img/int-4.jpg",
      text: "The villa was handed over four months early and completely finished. In this market that is not normal, and it is the reason I have referred three families here." },
    { name: "Nirali Mehta", project: "Skyline Residency", rating: 4, photo: "img/int-3.jpg",
      text: "Monthly construction updates with photographs arrive without me having to chase anyone. As a first-time buyer that has been the single most reassuring thing." },
    { name: "Jignesh Trivedi", project: "Business Square", rating: 5, photo: "img/int-2.jpg",
      text: "I bought two office units as an investment. Both were tenanted within seven weeks of possession and the building has been maintained properly since." }
  ],

  /* ---------- News ---------- */
  news: [
    { id: "n1", date: "2026-08-05", cat: "Construction Update", title: "Aarambh Heights reaches the sixth floor slab",
      excerpt: "Tower A has been cast at the sixth floor level and Tower B at the fourth, keeping the project on its June 2028 possession commitment.", image: "img/con-3.jpg", project: "aarambh-heights" },
    { id: "n2", date: "2026-08-01", cat: "New Project Announcement", title: "Green Vistas opens registration of interest",
      excerpt: "Our limited-release Sindhu Bhavan Road development is now open for registration ahead of a Q1 2027 launch.", image: "img/p-greenvistas.jpg", project: "green-vistas" },
    { id: "n3", date: "2026-07-28", cat: "Construction Update", title: "Skyline Residency crosses 65% completion",
      excerpt: "Tower B brickwork is complete to the ninth floor and internal plaster has started on the lower floors.", image: "img/con-1.jpg", project: "skyline-residency" },
    { id: "n4", date: "2026-07-18", cat: "Project Milestone", title: "Trade Park land parcel consolidated at Sanand",
      excerpt: "Eleven acres inside the GIDC belt have been consolidated, with infrastructure design now underway.", image: "img/p-tradepark.jpg", project: "trade-park" },
    { id: "n5", date: "2026-06-15", cat: "Project Milestone", title: "Skyline Residency Tower A tops out",
      excerpt: "The first of three towers has reached its final structural level, with lift shaft casting complete.", image: "img/ext-1.jpg", project: "skyline-residency" },
    { id: "n6", date: "2026-05-02", cat: "Company News", title: "In-house project management team doubles in size",
      excerpt: "Eleven new site engineers and quality supervisors have joined as we run four developments in parallel.", image: "img/con-2.jpg", project: "" }
  ],

  /* ---------- FAQ ---------- */
  faqs: [
    { q: "Which projects are currently under development?", a: "Three developments are under construction: Skyline Residency at Shela, Aarambh Heights at Chandkheda and Commerz One at Gota. Two more, Green Vistas and Trade Park, are in pre-launch." },
    { q: "Where are your projects located?", a: "All current projects are within Ahmedabad and its immediate growth corridors: Shela, Chandkheda, Gota, Sanand Road, Nikol, Prahlad Nagar and Sindhu Bhavan Road." },
    { q: "What configurations are available?", a: "Residential projects offer 2, 3 and 4 BHK apartments and 3 and 4 BHK villas. Commercial projects offer retail units, offices from 650 sq. ft. and full floors up to 4,200 sq. ft." },
    { q: "What is the starting price?", a: "Residential pricing currently starts at ₹ 48.9 Lakh at Aarambh Heights. Commercial pricing starts at ₹ 42.0 Lakh at Commerz One. Pre-launch projects are priced at announcement." },
    { q: "When is possession expected?", a: "Aarambh Heights is committed for June 2028, Commerz One for March 2028 and Skyline Residency for December 2027. Each project page carries its own possession date and live construction percentage." },
    { q: "How do I schedule a site visit?", a: "Use the site visit form, pick your project along with a preferred date and time, and our team confirms the slot by phone within one working day. Site visits run every day between 10 AM and 6 PM." },
    { q: "Can I download a brochure or floor plan?", a: "Yes. Every project page has a Download Brochure button, and each unit type in the floor plans section has its own Download Floor Plan link." },
    { q: "What amenities are included?", a: "Residential projects include landscaped gardens, a club house, children's play area, covered parking, 24x7 security with CCTV, lifts, power backup, a community area and a walking track. Project pages list the full set." },
    { q: "How does the enquiry process work?", a: "Submit an enquiry or site visit request, our sales team calls you back to understand your requirement, we arrange a site visit, and you receive a written cost sheet with the payment plan before any booking." }
  ],

  /* ---------- Admin default credentials ---------- */
  adminDefault: { user: "admin", pass: "radhe@2026" }
};

/* ==========================================================================
   Store: localStorage persistence
   ========================================================================== */
const Store = {
  K: { projects: "rr.projects", leads: "rr.leads", news: "rr.news", auth: "rr.auth", seed: "rr.seed.v2" },

  init() {
    if (localStorage.getItem(this.K.seed) !== "1") {
      localStorage.setItem(this.K.projects, JSON.stringify(RR.projects));
      localStorage.setItem(this.K.news, JSON.stringify(RR.news));
      if (!localStorage.getItem(this.K.leads)) localStorage.setItem(this.K.leads, JSON.stringify(this.demoLeads()));
      localStorage.setItem(this.K.seed, "1");
    }
  },

  demoLeads() {
    const d = (n) => { const x = new Date(); x.setDate(x.getDate() - n); return x.toISOString(); };
    return [
      { id: "L1004", name: "Parth Desai", phone: "+91 98240 11223", email: "parth.desai@example.com", project: "Skyline Residency", type: "Site Visit", visitDate: "2026-08-24", message: "Interested in a 3 BHK, west facing if available.", status: "Site Visit", created: d(2) },
      { id: "L1003", name: "Anjali Rao", phone: "+91 99099 44521", email: "anjali.rao@example.com", project: "Aarambh Heights", type: "Enquiry", visitDate: "", message: "Please share the payment plan for the 2 BHK.", status: "Contacted", created: d(5) },
      { id: "L1002", name: "Mehul Joshi", phone: "+91 97250 88110", email: "mehul.j@example.com", project: "Commerz One", type: "Enquiry", visitDate: "", message: "Looking for ground floor retail, roughly 900 sq ft.", status: "Interested", created: d(9) },
      { id: "L1001", name: "Sneha Kulkarni", phone: "+91 90999 12034", email: "sneha.k@example.com", project: "Green Vistas", type: "Register Interest", visitDate: "", message: "Register me for the pre-launch price band.", status: "New", created: d(12) }
    ];
  },

  projects() { try { return JSON.parse(localStorage.getItem(this.K.projects)) || RR.projects; } catch (e) { return RR.projects; } },
  saveProjects(p) { localStorage.setItem(this.K.projects, JSON.stringify(p)); },
  project(id) { return this.projects().find(p => p.id === id); },

  news() { try { return JSON.parse(localStorage.getItem(this.K.news)) || RR.news; } catch (e) { return RR.news; } },
  saveNews(n) { localStorage.setItem(this.K.news, JSON.stringify(n)); },

  leads() { try { return JSON.parse(localStorage.getItem(this.K.leads)) || []; } catch (e) { return []; } },
  saveLeads(l) { localStorage.setItem(this.K.leads, JSON.stringify(l)); },
  addLead(lead) {
    const all = this.leads();
    let n = 1000 + all.length + 1;
    while (all.some(x => x.id === "L" + n)) n++;
    const id = "L" + n;
    all.unshift(Object.assign({ id, status: "New", created: new Date().toISOString() }, lead));
    this.saveLeads(all);
    return id;
  },

  login(u, p) {
    if (u === RR.adminDefault.user && p === RR.adminDefault.pass) {
      const token = { user: u, at: Date.now() };
      localStorage.setItem(this.K.auth, JSON.stringify(token));
      return true;
    }
    return false;
  },
  session() { try { return JSON.parse(localStorage.getItem(this.K.auth)); } catch (e) { return null; } },
  logout() { localStorage.removeItem(this.K.auth); },

  reset() { [this.K.projects, this.K.news, this.K.leads, this.K.seed].forEach(k => localStorage.removeItem(k)); this.init(); }
};

Store.init();

/* ==========================================================================
   SWAMITRA Foundation — Content data
   Edit this file to update programmes, trainings, resources, news & policies.
   ========================================================================== */

window.SWAMITRA = (function () {
  const org = {
    name: "SWAMITRA Foundation",
    tagline: "Constitutionally Aware · Legally Empowered · Civically Responsible",
    email: "info@swamitrafoundation.org",
    emailAlt: "programmes@swamitrafoundation.org",
    phone: "+91 70797 56771",
    phoneHref: "+917079756771",
    whatsapp: "+91 70797 56771",
    address: "Boring Road, Patna, Bihar 800001, India",
    hours: "Monday – Friday · 10:00 AM – 6:00 PM IST",
    social: {
      linkedin: "https://in.linkedin.com/company/swamitrafoundation",
      facebook: "https://www.facebook.com/SWAMITRAFoundation",
      x: "",
      youtube: "https://www.youtube.com/@SWAMITRAFoundation",
      instagram: "https://www.instagram.com/swamitra.foundation/"
    }
  };

  /* ---------- Homepage hero ----------
     The headline, lead and buttons stay put; the photograph behind them and
     the badge above them change together. Editable in the admin under "Hero". */
  const hero = {
    autoplay: true,
    interval: 6500,
    heading: "Building a Constitutionally Aware, Legally Empowered and Civically Responsible India",
    lead: "SWAMITRA Foundation works with schools, higher education institutions, governments, workplaces and communities to advance legal education, constitutional literacy, safe institutions and responsible citizenship.",
    primaryText: "Explore Our Programs",
    primaryHref: "programs.html",
    secondaryText: "Partner With Us",
    secondaryHref: "partnership-opportunities.html",
    points: ["Free national frameworks", "Certified training", "Evidence-based research"],
    /* Background photographs. Each carries the badge shown above the
       headline, so the pill names whichever programme is on screen. */
    images: [
      { src: "assets/img/slide2.jpg", title: "School Legal Education Project", subtitle: "Legal literacy inside every classroom",
        heading: "Empowering Every Student With Legal Awareness",
        lead: "The School Legal Education Project introduces age-appropriate legal and civic awareness to students, helping them understand their rights, responsibilities, safety and the laws that affect everyday life.",
        primaryText: "Explore School Legal Education", primaryHref: "programs.html",
        secondaryText: "Bring This Programme to Your School", secondaryHref: "programs.html" },
      { src: "assets/img/slide3.jpg", title: "Higher Legal Education Project", subtitle: "Stronger law teaching in colleges and universities",
        heading: "Preparing Young Minds for a Legally Informed Society",
        lead: "The Higher Legal Education Project promotes practical legal awareness among college and university students, connecting legal knowledge with education, career, citizenship and everyday life.",
        primaryText: "Explore the Programme", primaryHref: "programs.html",
        secondaryText: "Partner With Us", secondaryHref: "partnership-opportunities.html" },
      { src: "assets/img/slide4.jpg", title: "National Safe School Framework", subtitle: "One auditable child-protection standard for every school",
        heading: "Building Schools Where Every Child Feels Safe",
        lead: "The National Safe School Framework supports institutions in creating safer, more responsive and accountable learning environments through awareness, prevention, policies, systems and capacity building.",
        primaryText: "Explore Safe School Framework", primaryHref: "programs.html",
        secondaryText: "Make Your School Safer", secondaryHref: "programs.html" },
      { src: "assets/img/slide5.jpg", title: "National Safe Workplace Standards", subtitle: "Prevent · Respect · Report · Support",
        heading: "Building Safer, Respectful and Responsible Workplaces",
        lead: "The National Safe Workplace Standards promote safer institutional environments through awareness, prevention, compliance, accountability and effective workplace safety systems.",
        primaryText: "Explore Workplace Standards", primaryHref: "programs.html",
        secondaryText: "Partner With Us", secondaryHref: "partnership-opportunities.html" },
      { src: "assets/img/slide6.jpg", title: "POSH Capacity Building", subtitle: "Certified training for Internal Committees",
        heading: "Creating Workplaces Free From Sexual Harassment",
        lead: "SWAMITRA strengthens institutional capacity for prevention of sexual harassment through POSH awareness, training, policy understanding, Internal Committee capacity building and compliance support.",
        primaryText: "Explore POSH Training", primaryHref: "training.html",
        secondaryText: "Request Institutional Training", secondaryHref: "training.html" },
      { src: "assets/img/slide7.jpg", title: "POCSO Awareness Initiative", subtitle: "Every child deserves safety, dignity and respect",
        heading: "Protecting Children Through Awareness, Prevention and Action",
        lead: "The POCSO Awareness Initiative promotes understanding of child protection, legal responsibilities and institutional safeguards to help create safer environments for children.",
        primaryText: "Explore POCSO Programme", primaryHref: "programs.html",
        secondaryText: "Build Child-Safe Institutions", secondaryHref: "programs.html" },
      { src: "assets/img/slide8.jpg", title: "Constitutional Literacy", subtitle: "Know your rights. Understand your duties.",
        heading: "Know the Constitution. Understand Your Rights. Fulfil Your Duties.",
        lead: "SWAMITRA promotes constitutional literacy by helping citizens understand the Constitution, fundamental rights, duties, democratic values and their role in building a responsible society.",
        primaryText: "Explore Constitutional Literacy", primaryHref: "training.html",
        secondaryText: "Start Learning", secondaryHref: "training.html" },
      { src: "assets/img/slide9.jpg", title: "Legal & Civic Awareness", subtitle: "Rights explained where they are needed most",
        heading: "Making Law Understandable for Everyday Life",
        lead: "SWAMITRA brings practical legal and civic awareness closer to citizens by explaining laws, rules, rights, duties and everyday procedures in a simple and accessible way.",
        primaryText: "Explore Legal Awareness", primaryHref: "training.html",
        secondaryText: "Access Resources", secondaryHref: "resource-library.html" },
      { src: "assets/img/slide10.jpg", title: "Research & Policy Centre", subtitle: "Evidence · Insight · Impact",
        heading: "Researching Today. Shaping Better Institutions for Tomorrow.",
        lead: "SWAMITRA's Research & Policy Centre develops evidence-based research, frameworks, standards and policy resources to strengthen legal education, institutional safety, governance and civic responsibility.",
        primaryText: "Explore Research", primaryHref: "research.html",
        secondaryText: "Collaborate With Us", secondaryHref: "research.html" },
      { src: "assets/img/slide11.jpg", title: "Training & Capacity Building", subtitle: "Empowering people. Strengthening institutions.",
        heading: "Knowledge That Builds Capacity. Capacity That Creates Change.",
        lead: "SWAMITRA delivers practical training and capacity-building programmes for educators, professionals, institutions, government bodies and communities.",
        primaryText: "Explore Training", primaryHref: "training.html",
        secondaryText: "Request Institutional Training", secondaryHref: "training.html" },
      { src: "assets/img/slide12.jpg", title: "SWAMITRA Vision 2047", subtitle: "A just, educated and accountable India",
        heading: "Building the India We Aspire to See in 2047",
        lead: "SWAMITRA Vision 2047 seeks to contribute to a just, educated, aware, safe and responsible India by strengthening legal awareness, constitutional values, institutional responsibility and active citizenship.",
        primaryText: "Explore Vision 2047", primaryHref: "vision-and-mission.html",
        secondaryText: "Be Part of the Vision", secondaryHref: "get-involved.html" }
    ]
  };

  const about = {
    eyebrow: "About SWAMITRA",
    heading: "A national institution built to make legal knowledge ordinary",
    shortText: "SWAMITRA Foundation is a not-for-profit organisation committed to building a legally aware, constitutionally informed, safe and responsible society. We work through legal education, research, capacity building and institutional partnerships to strengthen individuals and institutions across India.",
    fullText: "From schools and universities to workplaces and communities, SWAMITRA promotes awareness of rights, duties, laws, safety and civic responsibility—helping people understand not only what the law says, but how it matters in everyday life. Our mission is to make legal and constitutional literacy a universal capability, not a privilege. We believe that every individual deserves to know their rights, understand their duties, and participate fully in the democratic process. Through our flagship programmes, certified training and evidence-based research, we are building a movement that reaches into every corner of Indian society.",
    figureImage: "assets/img/mark.png",
    figureCaption: "Constitutionally Aware · Legally Empowered · Civically Responsible",
    images: [
      { src: "assets/img/mark.png", alt: "SWAMITRA Foundation emblem", caption: "Constitutionally Aware · Legally Empowered · Civically Responsible" },
      { src: "assets/img/slide8.jpg", alt: "SWAMITRA Foundation work in schools and communities", caption: "Reaching schools, workplaces and communities across India" },
      { src: "assets/img/slide5.jpg", alt: "Framework and training programmes", caption: "Building systems that can be audited and trusted" },
      { src: "assets/img/slide6.jpg", alt: "Certified training programmes", caption: "Certified programmes for educators, committees and institutions" }
    ]
  };

  /* ---------- Flagship Programmes ---------- */
  const programs = [
    {
      slug: "nlem", short: "NLEM", img: "assets/img/National Legal Education Mission.jpeg",
      title: "National Legal Education Mission",
      tag: "Flagship",
      summary: "A nationwide mission to embed legal literacy and constitutional understanding across every stage of education.",
      background: "Legal knowledge in India remains concentrated within the profession, while citizens who most need it are least equipped to use it. The National Legal Education Mission is SWAMITRA's response — a structured, national effort to make legal and constitutional education a normal part of learning rather than a specialist pursuit.",
      need: "Surveys consistently show low awareness of fundamental rights, duties and grievance mechanisms among students, teachers and community members. Institutions lack a common curriculum, trained faculty and standard learning material.",
      relevance: "The Mission aligns with the constitutional promise of justice, liberty, equality and fraternity, and supports national education policy goals on values, ethics and constitutional literacy.",
      objectives: [
        "Establish a common national curriculum framework for legal and constitutional education",
        "Train educators to deliver legal literacy with confidence and accuracy",
        "Create free, high-quality learning material in multiple Indian languages",
        "Build measurable legal-awareness benchmarks for institutions",
        "Create a national network of participating schools, colleges and universities"
      ],
      audience: ["Students", "Teachers & Faculty", "Educational Institutions", "Government Bodies", "NGOs", "Community Members"],
      components: ["Curriculum Framework", "Faculty Training", "Research & Assessment", "Certification", "Awareness Campaigns", "Digital Resource Platform"],
      activities: ["Curriculum development workshops", "State and district level training", "Institutional consultations", "Publications & toolkits", "Community outreach drives"],
      outcomes: ["Higher legal awareness among students and educators", "Institutions equipped with a standard curriculum", "Improved compliance and rights awareness", "Stronger civic participation"],
      resources: ["NLEM Curriculum Framework", "Educator Handbook", "Classroom Activity Toolkit", "Assessment Templates", "Programme Brochure"],
      faqs: [
        ["Who can join the Mission?", "Any school, college, university, government body or civil-society organisation committed to delivering structured legal and constitutional education can apply to join."],
        ["Is there a participation fee?", "Core curriculum resources are provided free of cost. Customised institutional training may be chargeable on a cost-recovery basis."],
        ["Do participating institutions receive recognition?", "Yes. Institutions completing the implementation cycle receive a SWAMITRA Participating Institution recognition and are listed in the national network."]
      ]
    },
    {
      slug: "slep", short: "SLEP", img: "assets/img/School Legal Education Project.jpeg",
      title: "School Legal Education Project",
      tag: "Schools",
      summary: "Age-appropriate legal and constitutional learning for school students, delivered through teachers who are trained and supported.",
      background: "Children form their sense of fairness, rights and responsibility long before they encounter formal law. The School Legal Education Project brings constitutional values into the classroom in a way that is age-appropriate, activity-led and genuinely engaging.",
      need: "Most school curricula touch the Constitution only briefly and rarely connect it to everyday student experience — safety, dignity, consent, fairness and grievance redressal.",
      relevance: "Builds the foundation of a constitutionally competent generation and supports safe, rights-respecting school environments.",
      objectives: [
        "Introduce graded legal literacy modules from primary to senior secondary",
        "Equip teachers to handle rights, safety and dignity topics sensitively",
        "Link classroom learning to school safety and child protection practice",
        "Create student-led legal awareness clubs",
        "Measure change in student awareness over an academic cycle"
      ],
      audience: ["School Students", "Teachers", "School Leaders", "Parents", "School Management Committees"],
      components: ["Graded Curriculum", "Teacher Training", "Student Clubs", "Parent Engagement", "Assessment", "Digital Resources"],
      activities: ["Classroom modules", "Teacher orientation workshops", "Moot and mock parliament activities", "Awareness weeks", "Parent sessions"],
      outcomes: ["Students who understand their rights and duties", "Teachers confident in delivering legal literacy", "Safer, more respectful school culture", "Active student participation in civic life"],
      resources: ["Graded Module Set (Classes 6–12)", "Teacher Facilitation Guide", "Student Workbook", "School Implementation Checklist"],
      faqs: [
        ["Which classes does SLEP cover?", "Structured modules are available for Classes 6 to 12, with introductory activity sets for primary classes."],
        ["How much classroom time does it need?", "One period per fortnight is sufficient for the core module; schools may expand through clubs and activity weeks."],
        ["Are the modules available in Hindi?", "Yes. Core modules are available in English and Hindi, with additional Indian languages being added progressively."]
      ]
    },
    {
      slug: "hlep", short: "HLEP", img: "assets/img/Higher Legal Education Project.jpeg",
      title: "Higher Legal Education Project",
      tag: "Higher Education",
      summary: "Strengthening legal, constitutional and public-policy learning across colleges and universities — including non-law disciplines.",
      background: "Legal competence is no longer the preserve of law students. Engineers, doctors, managers, journalists and administrators all operate within legal frameworks they were never taught. HLEP extends structured legal education across higher education.",
      need: "Non-law students graduate without working knowledge of contracts, workplace rights, data and privacy obligations, or compliance duties they will face in their first job.",
      relevance: "Produces graduates who are employable, compliant and civically capable across every discipline.",
      objectives: [
        "Offer elective and value-added legal literacy courses in all disciplines",
        "Support law schools with clinical and community legal education",
        "Build faculty capacity for interdisciplinary legal teaching",
        "Promote student research in constitutional and public policy studies",
        "Create campus legal-aid and awareness cells"
      ],
      audience: ["Undergraduate Students", "Postgraduate Students", "Faculty", "Universities & Colleges", "Law Schools"],
      components: ["Elective Courses", "Clinical Legal Education", "Faculty Development", "Student Research", "Campus Legal Cells", "Certification"],
      activities: ["Value-added course delivery", "Faculty development programmes", "Legal aid camps", "Research colloquia", "Policy simulations"],
      outcomes: ["Legally literate graduates across disciplines", "Strengthened clinical legal education", "Campus-level access to legal information", "A pipeline of constitutional researchers"],
      resources: ["Elective Course Outline", "Clinical Legal Education Manual", "Faculty Development Kit", "Campus Legal Cell SOP"],
      faqs: [
        ["Can non-law colleges participate?", "Yes — HLEP is specifically designed to bring legal literacy to non-law disciplines alongside law schools."],
        ["How are courses credited?", "Institutions may adopt the modules as value-added, elective or audit courses in line with their academic regulations."],
        ["Is faculty training included?", "Yes. Every participating institution receives faculty development support before course rollout."]
      ]
    },
    {
      slug: "teacher-education", short: "TECB", img: "assets/img/Teacher Education & Capacity Building.jpeg",
      title: "Teacher Education & Capacity Building",
      tag: "Capacity Building",
      summary: "Preparing educators to teach constitutional values, handle rights-related situations and lead safe institutions.",
      background: "No curriculum reaches a student except through a teacher. This programme invests directly in educators — their knowledge, confidence and ability to handle sensitive situations correctly.",
      need: "Teachers are routinely the first responders to safety, discrimination and child-protection concerns, yet are seldom trained for that responsibility.",
      relevance: "Teacher capability is the single highest-leverage investment in institutional safety and constitutional literacy.",
      objectives: [
        "Build subject knowledge in constitutional and legal literacy",
        "Develop skills for handling disclosures and grievances correctly",
        "Prepare master trainers within each institution",
        "Embed reflective, values-based pedagogy",
        "Create a sustainable in-house training capability"
      ],
      audience: ["School Teachers", "College Faculty", "Teacher Educators", "School Leaders", "Education Departments"],
      components: ["Foundation Course", "Advanced Modules", "Train the Trainer", "Mentoring", "Certification", "Resource Library"],
      activities: ["Residential and online workshops", "Case-based learning", "Peer observation", "Refresher sessions", "Master trainer certification"],
      outcomes: ["Confident, well-informed educators", "Correct handling of sensitive incidents", "Institution-level training self-sufficiency", "Improved classroom culture"],
      resources: ["Teacher Foundation Manual", "Case Studies Compendium", "ToT Handbook", "Reflection Journal Template"],
      faqs: [
        ["What is the duration?", "The foundation course runs across three days; advanced and ToT tracks are scheduled separately."],
        ["Is it available online?", "Yes — online, offline and hybrid delivery modes are all supported."],
        ["Do teachers receive certification?", "Yes, assessment-based certification with digital verification is issued on successful completion."]
      ]
    },
    {
      slug: "safe-school", short: "NSSF", img: "assets/img/National Safe School Framework.jpeg",
      title: "National Safe School Framework",
      tag: "Safety Standards",
      summary: "A complete, auditable framework that helps schools become legally compliant, physically safe and emotionally secure.",
      background: "School safety is often treated as a checklist exercise after an incident. The National Safe School Framework replaces that with a standing system of policy, people, process and review.",
      need: "Schools face overlapping obligations under child protection, POCSO, safety and grievance laws without a single integrated framework to implement them.",
      relevance: "Gives every school one coherent standard covering physical safety, child protection, digital safety and emotional wellbeing.",
      objectives: [
        "Establish a national baseline standard for school safety",
        "Support schools in constituting statutory committees correctly",
        "Institutionalise reporting, response and review procedures",
        "Build staff and student awareness",
        "Enable independent safety audits"
      ],
      audience: ["Schools", "School Managements", "Teachers & Staff", "Parents", "Education Departments"],
      components: ["Safety Policy Templates", "Committee Constitution", "Staff Training", "Student Awareness", "Audit Tools", "Incident SOPs"],
      activities: ["Baseline safety audit", "Policy adoption support", "Staff and student training", "Mock drills", "Annual review"],
      outcomes: ["Legally compliant schools", "Clear reporting and response pathways", "Reduced risk and faster response", "Higher parent trust"],
      resources: ["Safe School Framework Document", "Safety Audit Checklist", "Incident Response SOP", "Committee Constitution Templates", "Parent Communication Kit"],
      faqs: [
        ["Is the framework mandatory?", "It is a voluntary national standard. Schools adopt it to demonstrate a verifiable commitment to safety and compliance."],
        ["How long does implementation take?", "A typical school completes baseline audit to certification readiness in one academic term."],
        ["Does it cover digital safety?", "Yes — online safety, cyberbullying and digital conduct are integral parts of the framework."]
      ]
    },
    {
      slug: "safe-workplace", short: "NSWS", img: "assets/img/National Safe Workplace Standards.jpeg",
      title: "National Safe Workplace Standards",
      tag: "Safety Standards",
      summary: "Standards, training and advisory support that make workplaces dignified, inclusive and demonstrably compliant.",
      background: "Workplace dignity is a legal obligation and a cultural outcome. The National Safe Workplace Standards address both — the committees, policies and records that law requires, and the everyday conduct that makes them real.",
      need: "Many organisations have a policy on paper but no trained committee, no awareness programme and no reliable record of compliance.",
      relevance: "Supports statutory compliance while building workplaces where people can actually speak up.",
      objectives: [
        "Define a clear standard for workplace dignity and safety",
        "Support correct constitution and training of internal committees",
        "Deliver employee awareness at scale",
        "Establish confidential, trustworthy reporting channels",
        "Enable annual compliance reporting and review"
      ],
      audience: ["Corporate Organisations", "HR Professionals", "Internal Committee Members", "Public Sector Bodies", "NGOs", "Educational Institutions"],
      components: ["Standards Document", "Policy Drafting", "Committee Training", "Employee Awareness", "Advisory Support", "Compliance Reporting"],
      activities: ["Compliance gap assessment", "Policy adoption", "Committee capacity building", "Employee sensitisation sessions", "Annual review"],
      outcomes: ["Demonstrable statutory compliance", "Trained and confident committees", "Safer, more inclusive culture", "Fewer unresolved grievances"],
      resources: ["Safe Workplace Standards", "Policy Template Pack", "Committee Handbook", "Employee Awareness Deck", "Annual Compliance Checklist"],
      faqs: [
        ["Do you support organisations of every size?", "Yes. The standards scale from small organisations to large multi-location employers."],
        ["Can training be conducted online?", "Yes — online, in-person and hybrid formats are available, including regional-language delivery."],
        ["Do you provide external committee members?", "We can support organisations in identifying suitably qualified external members in line with legal requirements."]
      ]
    },
    {
      slug: "posh", short: "POSH", img: "assets/img/POSH Capacity Building.jpeg",
      title: "POSH Capacity Building",
      tag: "Compliance",
      summary: "End-to-end capacity building on prevention of sexual harassment — policy, committee, awareness and inquiry practice.",
      background: "POSH compliance fails most often not from bad intent but from untrained committees and unclear process. This programme builds real, practised capability.",
      need: "Committee members are frequently appointed without training on inquiry procedure, natural justice, evidence handling or confidentiality.",
      relevance: "Protects both complainants and institutions by making the process fair, lawful and reliable.",
      objectives: [
        "Build accurate understanding of the legal framework",
        "Train internal committees in fair inquiry practice",
        "Deliver organisation-wide awareness",
        "Establish confidential reporting and record-keeping",
        "Support annual reporting obligations"
      ],
      audience: ["Internal Committee Members", "HR Professionals", "Employees", "Managers", "Institutions", "Public Bodies"],
      components: ["Legal Foundations", "Committee Training", "Inquiry Skills", "Employee Awareness", "Policy Support", "Annual Reporting"],
      activities: ["Committee certification programme", "Employee sensitisation drives", "Mock inquiry exercises", "Policy review", "Helpdesk support"],
      outcomes: ["Correctly constituted, trained committees", "Lawful and fair inquiries", "Higher employee confidence in the process", "Complete compliance records"],
      resources: ["POSH Policy Template", "Committee Training Manual", "Inquiry Procedure SOP", "Awareness Poster Set", "Annual Report Format"],
      faqs: [
        ["Who must attend committee training?", "All internal committee members, including the presiding officer and the external member, should be trained and re-trained periodically."],
        ["How often should awareness sessions run?", "At least annually, with additional sessions for new joiners and location-specific rollouts."],
        ["Do you offer regional-language sessions?", "Yes — awareness sessions are delivered in English, Hindi and additional regional languages on request."]
      ]
    },
    {
      slug: "pocso", short: "POCSO", img: "assets/img/POCSO Awareness Initiative.jpeg",
      title: "POCSO Awareness Initiative",
      tag: "Child Protection",
      summary: "Child protection awareness and response capability for schools, institutions and communities.",
      background: "Protecting children requires adults who recognise risk, respond correctly and report without delay. This initiative builds that competence across every adult in a child's environment.",
      need: "Adults around children often do not know what constitutes a reportable concern, whom to inform, or how to respond to a disclosure without causing further harm.",
      relevance: "Directly strengthens child safety and lawful reporting practice in institutions and communities.",
      objectives: [
        "Build accurate awareness of child protection obligations",
        "Train staff to receive disclosures safely and correctly",
        "Establish clear institutional reporting pathways",
        "Deliver age-appropriate child safety education",
        "Engage parents and communities"
      ],
      audience: ["Schools", "Teachers & Staff", "Parents", "Children", "NGOs", "Community Leaders", "Childcare Institutions"],
      components: ["Adult Awareness", "Staff Response Training", "Child Safety Education", "Reporting SOPs", "Parent Engagement", "Community Outreach"],
      activities: ["Institutional training", "Child-friendly safety sessions", "Parent workshops", "SOP implementation", "Community awareness camps"],
      outcomes: ["Adults who recognise and respond to risk", "Correct and timely reporting", "Children who know how to seek help", "Safer institutions and communities"],
      resources: ["Child Protection Policy Template", "Staff Response Guide", "Child Safety Session Plans", "Reporting Flowchart", "Parent Awareness Leaflet"],
      faqs: [
        ["Is the content appropriate for young children?", "Yes. Child-facing sessions are age-graded, non-alarming and developed with child-safeguarding principles."],
        ["Can non-school organisations participate?", "Yes — childcare institutions, sports academies, coaching centres, NGOs and community groups are all covered."],
        ["Do you help draft the institutional policy?", "Yes, policy drafting and reporting-pathway design are part of the implementation support."]
      ]
    },
    {
      slug: "research-policy", short: "RPC",
      title: "Research & Policy Centre",
      tag: "Research",
      summary: "Evidence, frameworks and policy recommendations that give the Foundation's programmes their factual foundation.",
      background: "Every SWAMITRA framework begins as research. The Research & Policy Centre produces the evidence base, national standards and policy briefs that guide practice.",
      need: "India lacks consolidated, comparable evidence on legal literacy, institutional safety and constitutional awareness.",
      relevance: "Positions the Foundation as a credible knowledge partner for government, academia and civil society.",
      objectives: [
        "Generate primary evidence through surveys and field studies",
        "Publish national frameworks and standards",
        "Produce accessible policy briefs and white papers",
        "Build research collaborations with universities",
        "Maintain an open national knowledge repository"
      ],
      audience: ["Researchers", "Universities", "Government Agencies", "Think Tanks", "Civil Society", "Media"],
      components: ["Primary Research", "Frameworks & Standards", "Policy Briefs", "Data & Surveys", "Academic Collaboration", "Knowledge Repository"],
      activities: ["National surveys", "Framework development", "Policy roundtables", "Working paper series", "Research fellowships"],
      outcomes: ["A credible national evidence base", "Frameworks adopted by institutions", "Informed policy conversations", "Sustained academic partnerships"],
      resources: ["Working Paper Series", "Policy Brief Archive", "National Frameworks", "Survey Datasets", "Research Collaboration Guide"],
      faqs: [
        ["Can I submit a research proposal?", "Yes. Proposals aligned with the Centre's themes may be submitted through the Research Centre page."],
        ["Are publications free to access?", "Yes — all published frameworks, briefs and reports are freely downloadable."],
        ["Do you offer research fellowships?", "Fellowship and internship opportunities are announced periodically under Get Involved."]
      ]
    },
    {
      slug: "community-legal-awareness", short: "CLAP",
      title: "Community Legal Awareness Programme",
      tag: "Community",
      summary: "Taking legal literacy beyond institutions — into neighbourhoods, panchayats, workplaces and community spaces.",
      background: "The people most affected by legal processes are often furthest from legal information. This programme takes plain-language legal awareness directly into communities.",
      need: "Community members lack accessible information on rights, entitlements, grievance mechanisms and legal aid.",
      relevance: "Advances access to justice and the Rule of Law at the level where it matters most.",
      objectives: [
        "Deliver plain-language legal awareness in communities",
        "Train community volunteers as legal awareness facilitators",
        "Connect people to legal aid and grievance mechanisms",
        "Address rights of women, children and vulnerable groups",
        "Build lasting community-level legal capability"
      ],
      audience: ["Community Members", "Women's Groups", "Youth Groups", "Panchayats & Local Bodies", "NGOs", "Volunteers"],
      components: ["Awareness Camps", "Volunteer Training", "Legal Aid Linkage", "Plain-language Material", "Helpdesk", "Follow-up Support"],
      activities: ["Community legal camps", "Volunteer facilitator training", "Street and folk awareness formats", "Helpdesk clinics", "Follow-up visits"],
      outcomes: ["Communities aware of rights and remedies", "Trained local facilitators", "Better access to legal aid", "Stronger civic participation"],
      resources: ["Community Facilitator Guide", "Plain-language Rights Booklet", "Camp Planning Toolkit", "Legal Aid Referral Directory"],
      faqs: [
        ["Can our community request a camp?", "Yes. Requests can be submitted through the Contact page and are scheduled based on region and capacity."],
        ["Do volunteers need a legal background?", "No. Volunteers are trained from first principles; a legal background is helpful but not required."],
        ["Is material available in regional languages?", "Yes, plain-language material is produced in English, Hindi and additional regional languages."]
      ]
    }
  ];

  /* ---------- Training & Certification ---------- */
  const trainings = [
    {
      slug: "posh-training", title: "POSH Training", tag: "Compliance", mode: "Online · Offline · Hybrid",
      duration: "Half-day to 2 days", level: "Foundation to Advanced",
      summary: "Statutory awareness for employees and full inquiry-practice certification for internal committee members.",
      importance: "A trained committee is the difference between a process that protects people and one that fails them. This programme builds both awareness and procedural competence.",
      benefits: ["Demonstrable statutory compliance", "Confident, correctly trained committees", "Reduced organisational risk", "Employee trust in the process"],
      objectives: ["Understand the legal framework accurately", "Recognise and classify prohibited conduct", "Conduct a fair, lawful inquiry", "Maintain confidentiality and records", "Meet annual reporting obligations"],
      participants: ["Internal Committee Members", "HR Professionals", "Managers & Supervisors", "Employees", "Institution Heads"],
      curriculum: [
        ["Module 1", "Legal framework, definitions and scope"],
        ["Module 2", "Constituting and empowering the internal committee"],
        ["Module 3", "Complaint handling, confidentiality and interim relief"],
        ["Module 4", "Inquiry procedure, natural justice and evidence"],
        ["Module 5", "Findings, recommendations and reporting"],
        ["Module 6", "Prevention, culture and annual compliance"]
      ],
      methodology: ["Instructor-led sessions", "Case studies", "Mock inquiry exercises", "Group discussion", "Assessment"],
      certification: "Assessment-based certificate with digital verification for committee members; participation certificate for awareness sessions."
    },
    {
      slug: "pocso-training", title: "POCSO Training", tag: "Child Protection", mode: "Online · Offline · Hybrid",
      duration: "Half-day to 2 days", level: "Foundation to Advanced",
      summary: "Child protection obligations, safe disclosure handling and institutional reporting practice.",
      importance: "Adults around children must know what to notice, what to say and whom to inform. Hesitation and error both cause harm.",
      benefits: ["Correct and timely reporting", "Staff confident in handling disclosures", "Clear institutional pathways", "Safer environment for children"],
      objectives: ["Understand child protection obligations", "Identify signs and reportable concerns", "Receive a disclosure safely", "Follow the correct reporting pathway", "Support the child through the process"],
      participants: ["Teachers & School Staff", "School Leaders", "Childcare Institutions", "Coaching & Sports Academies", "NGOs", "Parents"],
      curriculum: [
        ["Module 1", "Child rights and the protection framework"],
        ["Module 2", "Recognising risk, abuse and grooming behaviour"],
        ["Module 3", "Receiving disclosures without causing harm"],
        ["Module 4", "Mandatory reporting and institutional SOPs"],
        ["Module 5", "Support, follow-up and record-keeping"],
        ["Module 6", "Building a protective institutional culture"]
      ],
      methodology: ["Instructor-led sessions", "Scenario-based learning", "Role play", "Policy walkthrough", "Assessment"],
      certification: "Assessment-based certificate with digital verification."
    },
    {
      slug: "legal-awareness", title: "Legal Awareness Programme", tag: "Legal Literacy", mode: "Online · Offline",
      duration: "One day", level: "Foundation",
      summary: "Everyday law for everyday life — rights, remedies, documentation and where to seek help.",
      importance: "Most people encounter law through everyday situations — agreements, employment, consumer disputes, police interactions, family matters — without any preparation.",
      benefits: ["Practical, usable legal knowledge", "Confidence in everyday legal situations", "Awareness of remedies and legal aid", "Reduced vulnerability to exploitation"],
      objectives: ["Understand basic rights and duties", "Recognise common legal situations", "Know where and how to seek remedy", "Understand documentation and evidence", "Access legal aid mechanisms"],
      participants: ["Students", "Employees", "Community Members", "Women's Groups", "Youth Groups", "Volunteers"],
      curriculum: [
        ["Module 1", "The Constitution in everyday life"],
        ["Module 2", "Rights, duties and remedies"],
        ["Module 3", "Consumer, employment and digital rights"],
        ["Module 4", "Police, complaints and first response"],
        ["Module 5", "Legal aid, mediation and dispute resolution"]
      ],
      methodology: ["Plain-language sessions", "Real-life scenarios", "Q&A clinics", "Take-home reference material"],
      certification: "Participation certificate."
    },
    {
      slug: "constitutional-literacy", title: "Constitutional Literacy Programme", tag: "Constitution", mode: "Online · Offline · Hybrid",
      duration: "One to three days", level: "Foundation to Intermediate",
      summary: "The Constitution's philosophy, structure and values — and what constitutional competence means in practice.",
      importance: "Constitutional literacy is the foundation of every other legal competence and of responsible citizenship.",
      benefits: ["Deeper understanding of constitutional values", "Ability to apply constitutional reasoning", "Stronger civic and ethical judgement", "Preparation for leadership roles"],
      objectives: ["Understand the constitutional framework", "Apply constitutional values to real situations", "Recognise institutional roles and limits", "Engage responsibly in democratic processes"],
      participants: ["Students", "Educators", "Civil Society", "Public Officials", "Corporate Leaders", "Community Leaders"],
      curriculum: [
        ["Module 1", "Preamble, philosophy and constitutional morality"],
        ["Module 2", "Fundamental Rights and Fundamental Duties"],
        ["Module 3", "Directive Principles and social justice"],
        ["Module 4", "Institutions, separation of powers and federalism"],
        ["Module 5", "Constitutional competence in daily practice"]
      ],
      methodology: ["Lecture and dialogue", "Case discussion", "Constitutional simulations", "Reflective exercises"],
      certification: "Assessment-based certificate with digital verification."
    },
    {
      slug: "school-safety", title: "School Safety Training", tag: "Safe Schools", mode: "Online · Offline · Hybrid",
      duration: "One to two days", level: "Institutional",
      summary: "Implementing the National Safe School Framework — policy, committees, drills, response and review.",
      importance: "Safety is a system, not a poster. This programme installs that system inside the school.",
      benefits: ["Framework-ready school", "Trained staff and functioning committees", "Documented compliance", "Higher parent confidence"],
      objectives: ["Implement the Safe School Framework", "Constitute statutory committees correctly", "Run drills and incident response", "Establish reporting and review cycles", "Prepare for safety audits"],
      participants: ["School Leaders", "Teachers", "Administrative & Support Staff", "Transport Staff", "School Management", "Parent Representatives"],
      curriculum: [
        ["Module 1", "Framework overview and institutional obligations"],
        ["Module 2", "Physical, transport and infrastructure safety"],
        ["Module 3", "Child protection and emotional wellbeing"],
        ["Module 4", "Digital safety and cyber conduct"],
        ["Module 5", "Incident response, drills and documentation"],
        ["Module 6", "Audit readiness and annual review"]
      ],
      methodology: ["Institution-wide sessions", "Walkthrough audits", "Mock drills", "Policy workshops", "Assessment"],
      certification: "Institutional completion certificate and individual participation certificates."
    },
    {
      slug: "workplace-safety", title: "Workplace Safety Training", tag: "Safe Workplaces", mode: "Online · Offline · Hybrid",
      duration: "Half-day to two days", level: "Institutional",
      summary: "Dignity, inclusion, grievance handling and compliance for modern workplaces.",
      importance: "Workplace safety today includes psychological safety, dignity and inclusion — not only physical hazards.",
      benefits: ["Compliant and inclusive workplace", "Trained grievance handling", "Clear conduct standards", "Improved retention and trust"],
      objectives: ["Understand workplace dignity obligations", "Establish conduct and grievance standards", "Handle complaints professionally", "Build inclusive team practice", "Maintain compliance records"],
      participants: ["HR Professionals", "Managers", "Committee Members", "Employees", "Leadership Teams"],
      curriculum: [
        ["Module 1", "Legal and ethical foundations of workplace dignity"],
        ["Module 2", "Conduct standards and prevention"],
        ["Module 3", "Grievance channels and confidentiality"],
        ["Module 4", "Inclusion, accessibility and equal opportunity"],
        ["Module 5", "Documentation, reporting and review"]
      ],
      methodology: ["Instructor-led workshops", "Case studies", "Policy clinics", "Group exercises"],
      certification: "Participation or assessment-based certificate as selected."
    },
    {
      slug: "teacher-capacity", title: "Teacher Capacity Building", tag: "Educators", mode: "Online · Offline · Hybrid",
      duration: "Three days", level: "Foundation to Advanced",
      summary: "Subject knowledge, pedagogy and sensitivity training for educators delivering legal and constitutional literacy.",
      importance: "Teachers carry the curriculum. Their confidence determines whether legal literacy is memorised or understood.",
      benefits: ["Confident subject delivery", "Sensitive handling of difficult topics", "Reusable classroom material", "Pathway to master trainer status"],
      objectives: ["Build constitutional and legal subject knowledge", "Develop activity-based pedagogy", "Handle sensitive classroom situations", "Assess student learning meaningfully", "Mentor peer educators"],
      participants: ["School Teachers", "College Faculty", "Teacher Educators", "Curriculum Coordinators"],
      curriculum: [
        ["Module 1", "Subject foundations for educators"],
        ["Module 2", "Pedagogy for legal and civic learning"],
        ["Module 3", "Handling sensitive topics and disclosures"],
        ["Module 4", "Assessment and learning evidence"],
        ["Module 5", "Peer mentoring and classroom practice"]
      ],
      methodology: ["Workshops", "Micro-teaching", "Peer observation", "Case discussion", "Assessment"],
      certification: "Assessment-based certificate with digital verification."
    },
    {
      slug: "leadership-development", title: "Leadership Development", tag: "Leadership", mode: "Offline · Hybrid",
      duration: "Two to three days", level: "Advanced",
      summary: "Ethical, constitutional leadership for those who run institutions — schools, organisations and public bodies.",
      importance: "Institutional culture is set at the top. Leaders who understand constitutional values build organisations that reflect them.",
      benefits: ["Values-anchored leadership practice", "Better governance decisions", "Stronger institutional integrity", "Peer leadership network"],
      objectives: ["Apply constitutional values to institutional leadership", "Strengthen governance and accountability", "Lead safety and inclusion agendas", "Manage ethical dilemmas", "Build succession and culture"],
      participants: ["School & College Leaders", "Senior Management", "Board Members", "Public Officials", "Civil Society Leaders"],
      curriculum: [
        ["Module 1", "Constitutional values in institutional leadership"],
        ["Module 2", "Governance, accountability and integrity"],
        ["Module 3", "Leading safety, dignity and inclusion"],
        ["Module 4", "Ethical decision-making under pressure"],
        ["Module 5", "Culture, communication and succession"]
      ],
      methodology: ["Executive sessions", "Leadership case studies", "Peer dialogue", "Action planning"],
      certification: "Leadership programme certificate."
    },
    {
      slug: "train-the-trainer", title: "Train the Trainer (ToT)", tag: "ToT", mode: "Offline · Hybrid",
      duration: "Three to five days", level: "Advanced",
      summary: "Creating certified master trainers who can deliver SWAMITRA programmes independently within their institutions and regions.",
      importance: "Scale comes from multiplication. ToT creates the trainers who carry these programmes into places we cannot reach directly.",
      benefits: ["Institutional training self-sufficiency", "Recognised master trainer status", "Access to the trainer network", "Continuing professional support"],
      objectives: ["Master programme content end-to-end", "Develop adult facilitation skills", "Deliver and assess sessions independently", "Maintain fidelity to the framework", "Mentor new facilitators"],
      participants: ["Experienced Educators", "HR & L&D Professionals", "NGO Trainers", "Programme Coordinators", "Subject Experts"],
      curriculum: [
        ["Module 1", "Content mastery across programme modules"],
        ["Module 2", "Adult learning and facilitation skills"],
        ["Module 3", "Session design and delivery practice"],
        ["Module 4", "Assessment, feedback and quality fidelity"],
        ["Module 5", "Certification practicum and mentoring"]
      ],
      methodology: ["Intensive workshops", "Supervised practice delivery", "Peer feedback", "Practicum assessment"],
      certification: "Certified SWAMITRA Master Trainer, subject to practicum assessment and periodic revalidation."
    }
  ];

  /* ---------- Resource Centre ---------- */
  const resources = [
    { title: "National Safe School Framework", cat: "Safe Schools", type: "Toolkit", ext: "PDF", size: "3.4 MB", date: "2026-06-18", lang: "English" },
    { title: "School Safety Audit Checklist", cat: "Safe Schools", type: "Checklist", ext: "XLSX", size: "180 KB", date: "2026-06-18", lang: "English" },
    { title: "POSH Policy Template", cat: "POSH", type: "Template", ext: "DOCX", size: "96 KB", date: "2026-05-30", lang: "English" },
    { title: "Internal Committee Handbook", cat: "POSH", type: "Handbook", ext: "PDF", size: "2.1 MB", date: "2026-05-30", lang: "English" },
    { title: "POSH Awareness Poster Set", cat: "POSH", type: "Poster", ext: "ZIP", size: "8.6 MB", date: "2026-05-12", lang: "Bilingual" },
    { title: "Child Protection Policy Template", cat: "POCSO", type: "Template", ext: "DOCX", size: "88 KB", date: "2026-05-08", lang: "English" },
    { title: "Disclosure Response Guide for Staff", cat: "POCSO", type: "SOP", ext: "PDF", size: "1.2 MB", date: "2026-05-08", lang: "English" },
    { title: "Reporting Pathway Flowchart", cat: "Child Protection", type: "Infographic", ext: "PDF", size: "640 KB", date: "2026-04-26", lang: "Bilingual" },
    { title: "NLEM Curriculum Framework", cat: "Legal Education", type: "Framework", ext: "PDF", size: "4.8 MB", date: "2026-04-14", lang: "English" },
    { title: "Educator Handbook — Legal Literacy", cat: "Legal Education", type: "Handbook", ext: "PDF", size: "3.0 MB", date: "2026-04-14", lang: "English" },
    { title: "Classroom Activity Toolkit (Classes 6–12)", cat: "Legal Education", type: "Toolkit", ext: "ZIP", size: "12.4 MB", date: "2026-03-29", lang: "Bilingual" },
    { title: "Constitutional Literacy Session Plans", cat: "Constitutional Literacy", type: "Template", ext: "PPT", size: "6.2 MB", date: "2026-03-22", lang: "English" },
    { title: "Fundamental Rights & Duties Ready Reckoner", cat: "Constitutional Literacy", type: "Infographic", ext: "PDF", size: "820 KB", date: "2026-03-22", lang: "Hindi" },
    { title: "National Safe Workplace Standards", cat: "Safe Workplaces", type: "Framework", ext: "PDF", size: "2.9 MB", date: "2026-03-05", lang: "English" },
    { title: "Workplace Compliance Annual Checklist", cat: "Safe Workplaces", type: "Checklist", ext: "XLSX", size: "142 KB", date: "2026-03-05", lang: "English" },
    { title: "Governance & Ethics Policy Pack", cat: "Governance", type: "Template", ext: "ZIP", size: "1.9 MB", date: "2026-02-19", lang: "English" },
    { title: "Legal Literacy Baseline Survey Report", cat: "Research", type: "Report", ext: "PDF", size: "5.6 MB", date: "2026-02-02", lang: "English" },
    { title: "Community Facilitator Guide", cat: "Legal Education", type: "Handbook", ext: "PDF", size: "2.4 MB", date: "2026-01-20", lang: "Bilingual" }
  ];

  /* ---------- Publications ---------- */
  const publications = [
    { title: "Constitutional Literacy in Indian Schools: A Baseline Study", type: "Research Paper", theme: "Constitutional Literacy", date: "2026-06-30", pages: 74 },
    { title: "Institutional Safety Standards: A National Framework Proposal", type: "White Paper", theme: "Safe Schools", date: "2026-05-21", pages: 58 },
    { title: "Making POSH Work: From Compliance to Culture", type: "Policy Brief", theme: "Safe Workplaces", date: "2026-04-09", pages: 24 },
    { title: "Child Protection Response in Educational Institutions", type: "Working Paper", theme: "Child Protection", date: "2026-03-14", pages: 41 },
    { title: "Legal Education Beyond Law Schools", type: "Policy Paper", theme: "Legal Education", date: "2026-02-11", pages: 36 },
    { title: "Civic Responsibility and Democratic Participation Survey", type: "Survey Report", theme: "Civic Responsibility", date: "2026-01-08", pages: 92 }
  ];

  /* ---------- News & Events ---------- */
  const news = [
    { title: "SWAMITRA releases the National Safe School Framework v1.0", cat: "Announcement", date: "2026-07-24", summary: "A complete, auditable safety standard covering policy, committees, response procedure and annual review — free for every school to adopt." },
    { title: "National consultation on legal literacy in higher education", cat: "Event", date: "2026-07-10", summary: "Universities, regulators and civil society convene to discuss embedding legal literacy across non-law disciplines." },
    { title: "Master Trainer cohort completes certification practicum", cat: "Programme", date: "2026-06-27", summary: "The first cohort of certified SWAMITRA Master Trainers is now equipped to deliver programmes independently across regions." },
    { title: "Baseline study on constitutional literacy published", cat: "Research", date: "2026-06-30", summary: "The Research Centre publishes its first national baseline study measuring constitutional awareness among school students and educators." },
    { title: "POSH capacity building rolled out for institutional partners", cat: "Programme", date: "2026-06-05", summary: "Internal committee certification and organisation-wide awareness delivered across partner institutions." },
    { title: "Community legal awareness camps expand to new districts", cat: "Community", date: "2026-05-18", summary: "Plain-language legal awareness reaches new communities through trained local facilitators." }
  ];

  const events = [
    { title: "National Workshop on Safe School Implementation", date: "2026-08-22", place: "New Delhi", mode: "Hybrid", status: "upcoming" },
    { title: "POSH Internal Committee Certification — Cohort 7", date: "2026-09-05", place: "Online", mode: "Online", status: "upcoming" },
    { title: "Constitutional Literacy Educators' Conclave", date: "2026-09-27", place: "Bengaluru", mode: "In person", status: "upcoming" },
    { title: "Train the Trainer Intensive — Cohort 4", date: "2026-10-14", place: "New Delhi", mode: "In person", status: "upcoming" }
  ];

  /* ---------- Impact statistics ---------- */
  const stats = [
    { n: 18, suffix: "+", label: "States Reached" },
    { n: 640, suffix: "+", label: "Institutions Engaged" },
    { n: 310, suffix: "+", label: "Training Programmes" },
    { n: 48000, suffix: "+", label: "Participants Trained" },
    { n: 26, suffix: "", label: "Research Publications" },
    { n: 95, suffix: "+", label: "Strategic Partnerships" }
  ];

  /* ---------- Focus areas ---------- */
  const focus = [
    { icon: "scale", title: "Legal Education", text: "Structured legal learning for students, educators, professionals and communities." },
    { icon: "book", title: "Constitutional Literacy", text: "Understanding the Constitution's philosophy, values, institutions and everyday relevance." },
    { icon: "school", title: "Safe Schools", text: "Frameworks, training and audits that make schools safe, inclusive and compliant." },
    { icon: "building", title: "Safe Workplaces", text: "Standards and capacity building for dignity, inclusion and statutory compliance." },
    { icon: "shield", title: "Child Protection", text: "Awareness, response capability and reporting systems that protect children." },
    { icon: "chart", title: "Research & Policy", text: "Evidence, frameworks and policy recommendations that inform national practice." }
  ];

  /* ---------- Objects Clause (from the SWAMITRA Objects document) ---------- */
  const chapters = [
    {
      n: 1, title: "Constitutional & Legal Mission",
      intro: "SWAMITRA exists to build a Constitutionally Competent, Legally Empowered and Civically Responsible India by advancing constitutional literacy, legal education, civic leadership, institutional excellence, public participation and the Rule of Law.",
      objects: [
        ["Constitutional Literacy and Constitutional Competence", "Enable individuals and institutions to understand, appreciate and apply the Constitution of India — its philosophy, values, structure, principles and governance."],
        ["Constitutional Values and Democratic Culture", "Strengthen constitutional morality, democratic culture, Rule of Law, justice, liberty, equality, fraternity, human dignity and responsible citizenship."],
        ["Legal Education and Legal Empowerment", "Establish and strengthen legal education, literacy, awareness and empowerment through programmes, resource centres, digital platforms and publications."],
        ["Rule of Law and Access to Justice", "Promote access to justice through community legal education, legal aid initiatives, mediation, alternative dispute resolution and public legal information."],
        ["Fundamental Rights, Duties and Constitutional Responsibility", "Educate citizens and institutions on Fundamental Rights, Fundamental Duties and Directive Principles to strengthen ethical public conduct."],
        ["Constitutional Governance and Institutional Excellence", "Promote good governance, institutional integrity, transparency, accountability, ethical leadership and citizen participation."],
        ["Human Rights, Child Protection and Gender Justice", "Protect human rights, child rights, women's rights, gender equality, workplace dignity, inclusion and vulnerable persons."],
        ["Safe Institutions and Legal Compliance", "Promote legally compliant, safe and accountable educational institutions, workplaces and community organisations."],
        ["Constitutional Research, Public Policy and Knowledge Leadership", "Advance constitutional studies, legal research, socio-legal studies, evidence-based policy analysis and centres of excellence."],
        ["National Constitutional Transformation Mission", "Work towards long-term constitutional transformation by integrating constitutional education, civic intelligence and institutional excellence into national development."]
      ]
    },
    {
      n: 2, title: "Education, Learning & Capacity Building",
      intro: "To create an inclusive, innovative and lifelong learning ecosystem that empowers individuals, institutions and communities with constitutional knowledge, legal competence, civic responsibility and ethical leadership.",
      objects: [
        ["Advancement of Education", "Promote education at all levels — school, higher, vocational, continuing, professional and community — through formal, non-formal, digital and blended modes."],
        ["Constitutional and Legal Education", "Deliver structured programmes in constitutional studies, legal education, civic education, human rights, public policy, governance and ethics."],
        ["Professional Training and Capacity Building", "Build professional and institutional capability through structured training, certification and continuing education."],
        ["Curriculum, Standards and Learning Systems", "Develop curricula, learning standards, assessment systems and quality benchmarks."],
        ["Educational Innovation and Digital Learning", "Advance digital learning platforms, blended pedagogy and educational innovation."],
        ["Certification and Academic Recognition", "Provide credible certification, assessment and academic recognition pathways."],
        ["Faculty, Institutional and Leadership Development", "Strengthen faculty capability, institutional systems and educational leadership."],
        ["Scholarships, Fellowships and Academic Support", "Support learners through scholarships, fellowships and academic assistance."],
        ["Knowledge Resources and Educational Publications", "Produce and disseminate books, journals, toolkits, digital resources and educational publications."],
        ["National Learning Ecosystem", "Build a connected national ecosystem of institutions, educators, learners and knowledge partners."]
      ]
    },
    {
      n: 3, title: "Research, Think Tank & Knowledge",
      intro: "To generate evidence, frameworks and policy leadership that strengthen constitutional democracy, public institutions and informed decision-making.",
      objects: [
        ["Constitutional and Legal Research", "Conduct rigorous research in constitutional law, legal systems and socio-legal studies."],
        ["Public Policy Research and Institutional Reform", "Undertake policy research and analysis supporting institutional reform."],
        ["Think Tank and Centres of Excellence", "Establish think tanks and centres of excellence in constitutional and public policy studies."],
        ["National Knowledge Repository", "Build an accessible national repository of research, data and institutional knowledge."],
        ["Publications and Academic Communication", "Publish research papers, white papers, policy briefs, standards and frameworks."],
        ["Surveys, Data and Evidence-Based Studies", "Conduct surveys and evidence-based studies to inform practice and policy."],
        ["Innovation, Emerging Technologies and Knowledge Systems", "Apply emerging technologies responsibly to knowledge creation and dissemination."],
        ["Academic Collaboration and Research Networks", "Build collaborations with universities, institutions and research networks."],
        ["Research Capacity Building and Academic Leadership", "Develop research capability and academic leadership among scholars and institutions."],
        ["National Knowledge Leadership", "Establish national knowledge leadership in constitutional literacy and institutional excellence."]
      ]
    },
    {
      n: 4, title: "Public Welfare & Social Development",
      intro: "To advance community empowerment, social development and inclusive national progress through education, awareness and service.",
      objects: [
        ["Community Empowerment and Social Development", "Empower communities through education, awareness, participation and social development initiatives."],
        ["Women, Children and Vulnerable Communities", "Advance the rights, protection and empowerment of women, children and vulnerable communities."],
        ["Safe Schools, Safe Workplaces and Safe Communities", "Promote safety, dignity and inclusion across schools, workplaces and communities."],
        ["Health, Mental Well-being and Social Awareness", "Support health, mental wellbeing and social awareness initiatives."],
        ["Environmental Sustainability and Climate Responsibility", "Promote environmental awareness, sustainability and climate responsibility."],
        ["Consumer, Financial and Digital Literacy", "Advance consumer, financial and digital literacy for informed citizenship."],
        ["Disaster Preparedness and Community Resilience", "Build community preparedness, response capability and resilience."],
        ["Livelihood, Skills and Youth Development", "Support livelihood generation, skills development and youth advancement."],
        ["Volunteerism, Civic Participation and Public Service", "Encourage volunteerism, civic participation and public service."],
        ["Inclusive National Development", "Contribute to equitable and inclusive national development."]
      ]
    },
    {
      n: 5, title: "Institutional Development & Partnerships",
      intro: "To build institutional excellence, partnerships and sustainability that allow the Foundation's mission to endure and scale.",
      objects: [
        ["Institutional Development and Organisational Excellence", "Build strong systems, processes and organisational excellence."],
        ["Strategic Partnerships and Collaborative Action", "Develop partnerships with government, academia, industry and civil society."],
        ["National and International Networks", "Participate in national and international knowledge and collaboration networks."],
        ["Resource Mobilisation and Institutional Sustainability", "Mobilise resources lawfully to sustain and expand charitable activity."],
        ["Advisory, Technical and Institutional Support", "Provide advisory and technical support to institutions and public bodies."],
        ["Governance, Ethics and Institutional Integrity", "Uphold the highest standards of governance, ethics and integrity."],
        ["Institutional Innovation and Knowledge Exchange", "Foster innovation and structured knowledge exchange between institutions."],
        ["Digital Institutional Infrastructure", "Build digital infrastructure supporting programmes, learning and knowledge."],
        ["Institutional Recognition and Standards", "Develop recognition frameworks and institutional quality standards."],
        ["Institutional Leadership for Nation Building", "Provide institutional leadership contributing to national development."]
      ]
    },
    {
      n: 6, title: "Future Expansion, Innovation & Legacy",
      intro: "To remain future-ready, resilient and enduring — preserving knowledge and public trust across generations.",
      objects: [
        ["Institutional Innovation and Future Readiness", "Build capability to anticipate and respond to emerging national needs."],
        ["Centres of Excellence and Innovation Ecosystems", "Establish centres of excellence and innovation ecosystems."],
        ["Knowledge Preservation and Institutional Legacy", "Preserve knowledge, records and institutional legacy for future generations."],
        ["Emerging Technologies and Responsible Innovation", "Adopt emerging technologies responsibly and ethically."],
        ["National and Global Knowledge Exchange", "Enable knowledge exchange across national and global institutions."],
        ["Institutional Resilience and Continuity", "Ensure organisational resilience, continuity and risk preparedness."],
        ["Public Interest Innovation", "Drive innovation that serves the public interest."],
        ["National Knowledge and Civic Leadership", "Provide sustained national knowledge and civic leadership."],
        ["Institutional Heritage and Public Trust", "Safeguard institutional heritage and public trust."],
        ["Enduring Institutional Mission", "Sustain the Foundation's charitable mission in perpetuity."]
      ]
    }
  ];

  /* ---------- Legal / policy pages ---------- */
  const legal = {
    "privacy-policy": {
      title: "Privacy Policy",
      updated: "1 July 2026",
      intro: "SWAMITRA Foundation respects the privacy of everyone who uses this website, registers for a programme or contacts us. This policy explains what we collect, why we collect it and the choices available to you.",
      sections: [
        ["Information we collect", "We collect information you provide directly — name, organisation, email, phone, and any details submitted through enquiry, registration, volunteering or partnership forms. We also collect limited technical information such as browser type and pages visited, used only to improve the website."],
        ["How we use information", "Information is used to respond to enquiries, deliver programmes and training, issue certificates, send requested updates, and meet legal and reporting obligations. We do not sell personal information."],
        ["Newsletter and communication", "Newsletter subscription is optional and consent-based. Every communication includes an unsubscribe option, and unsubscribing is honoured promptly."],
        ["Sharing of information", "Information is shared only with authorised personnel, service providers bound by confidentiality obligations, or where disclosure is required by law."],
        ["Data of children", "Where a programme involves children, information is collected through the institution with appropriate consent, kept to the minimum necessary, and handled in line with our Child Protection Policy."],
        ["Retention and security", "Information is retained only as long as necessary for the stated purpose or as required by law, and is protected by reasonable technical and organisational safeguards."],
        ["Your rights", "You may request access to, correction of, or deletion of your personal information, and may withdraw consent for optional communication at any time by writing to us."],
        ["Contact", "For any privacy question or request, please write to the Foundation using the details on the Contact page."]
      ]
    },
    "terms-of-use": {
      title: "Terms of Use",
      updated: "1 July 2026",
      intro: "By accessing this website you agree to these terms. Please read them carefully.",
      sections: [
        ["Purpose of the website", "This website provides information about the Foundation's programmes, training, research and resources. Content is provided for general information and educational purposes."],
        ["Not legal advice", "Nothing on this website constitutes legal advice or creates a lawyer–client relationship. For advice on a specific matter, please consult a qualified legal practitioner."],
        ["Acceptable use", "You agree not to misuse the website, attempt unauthorised access, disrupt its operation, or use its content for unlawful purposes."],
        ["Registrations and programmes", "Programme registration is subject to eligibility, availability and any additional terms notified at the time of registration."],
        ["Third-party links", "Links to third-party websites are provided for convenience. The Foundation is not responsible for their content or practices."],
        ["Changes", "The Foundation may update the website and these terms at any time. Continued use constitutes acceptance of the updated terms."],
        ["Governing law", "These terms are governed by the laws of India, and the courts at the Foundation's registered office shall have jurisdiction."]
      ]
    },
    "cookie-policy": {
      title: "Cookie Policy",
      updated: "1 July 2026",
      intro: "This website uses a minimal number of cookies to function correctly and to understand how the site is used.",
      sections: [
        ["Essential cookies", "Required for basic functionality such as remembering your language preference and navigation state. These cannot be disabled without affecting the site."],
        ["Analytics cookies", "Used in aggregate to understand which pages are useful and where visitors face difficulty. No attempt is made to identify individual visitors."],
        ["Managing cookies", "Most browsers allow you to block or delete cookies through their settings. Blocking essential cookies may affect site functionality."],
        ["Changes", "This policy is updated whenever our cookie usage changes."]
      ]
    },
    "disclaimer": {
      title: "Disclaimer",
      updated: "1 July 2026",
      intro: "Information on this website is provided in good faith for general information and educational purposes.",
      sections: [
        ["Accuracy", "While every effort is made to keep information accurate and current, the Foundation makes no warranty as to completeness or accuracy and accepts no liability for reliance placed on it."],
        ["No legal advice", "Content, templates and toolkits are educational resources. They are not a substitute for professional legal advice on a specific matter."],
        ["Templates and frameworks", "Templates should be adapted to the adopting institution's context and reviewed by a qualified professional before formal adoption."],
        ["External content", "The Foundation is not responsible for the content, availability or practices of external websites referenced here."]
      ]
    },
    "accessibility-statement": {
      title: "Accessibility Statement",
      updated: "1 July 2026",
      intro: "SWAMITRA Foundation is committed to making this website usable by everyone, including people using assistive technologies.",
      sections: [
        ["Our commitment", "We aim to meet recognised accessibility standards, including sufficient colour contrast, keyboard navigability, meaningful alternative text and visible focus indicators."],
        ["Design measures", "The site uses responsive layouts, scalable text, semantic structure, descriptive link text and reduced-motion support for users who prefer it."],
        ["Documents", "We work to make downloadable documents accessible. If a document is not usable for you, please contact us and we will provide an accessible alternative."],
        ["Feedback", "If you encounter an accessibility barrier on this website, please tell us through the Contact page. We treat accessibility feedback as a priority."]
      ]
    },
    "copyright-policy": {
      title: "Copyright Policy",
      updated: "1 July 2026",
      intro: "Content on this website is owned by SWAMITRA Foundation unless otherwise stated.",
      sections: [
        ["Ownership", "All frameworks, publications, toolkits, text, graphics and the SWAMITRA name and logo are the property of the Foundation or its licensors."],
        ["Permitted use", "Educational and non-commercial use is permitted with clear attribution to SWAMITRA Foundation and without alteration of the content's meaning."],
        ["Restricted use", "Commercial reproduction, resale, rebranding or derivative distribution requires prior written permission."],
        ["Third-party rights", "Where third-party material is used, rights remain with the respective owners and are used with permission or under applicable exceptions."],
        ["Reporting infringement", "If you believe content on this site infringes your rights, please write to us with details and we will review it promptly."]
      ]
    },
    "donation-policy": {
      title: "Donation Policy",
      updated: "1 July 2026",
      intro: "Donations sustain the Foundation's charitable programmes. This policy explains how donations are accepted, used and reported.",
      sections: [
        ["Acceptance", "Donations are accepted only through authorised channels and in compliance with applicable law. The Foundation may decline any donation that conflicts with its values or legal obligations."],
        ["Utilisation", "Donations are applied to charitable objects — programmes, training, research, resources and community initiatives — in line with the Foundation's Objects Clause."],
        ["Transparency", "Aggregate utilisation is reported in the Annual Report. Donors may request information on how their contribution category was applied."],
        ["Receipts", "A receipt is issued for every donation. Tax exemption benefits, where available, are subject to applicable law and registration status."],
        ["Anonymity", "Donors may request that their contribution remain unpublished. Statutory reporting obligations still apply."],
        ["Refunds", "Donations are generally non-refundable. Genuine errors in transaction may be reviewed on written request within a reasonable period."]
      ]
    },
    "refund-policy": {
      title: "Refund & Cancellation Policy",
      updated: "1 July 2026",
      intro: "This policy applies to paid training programmes and institutional services.",
      sections: [
        ["Cancellation by participant", "Cancellation requests received well in advance of the scheduled date may be eligible for a partial refund or a transfer of registration to a future cohort."],
        ["Cancellation by the Foundation", "If a programme is cancelled or rescheduled by the Foundation, participants may choose a full refund or transfer to another date."],
        ["Substitution", "Institutions may substitute a nominated participant at no cost before the programme begins."],
        ["Processing", "Approved refunds are processed to the original payment method within a reasonable period."],
        ["Non-refundable items", "Certification fees, issued materials and completed sessions are non-refundable."]
      ]
    },
    "child-protection-policy": {
      title: "Child Protection Policy",
      updated: "1 July 2026",
      intro: "SWAMITRA Foundation has zero tolerance for any form of harm to children. Everyone who works with or for the Foundation is bound by this policy.",
      sections: [
        ["Scope", "This policy applies to all employees, trainers, volunteers, interns, consultants and partners engaged in any activity involving children."],
        ["Core commitments", "We ensure that all child-facing activity is designed to be safe, that adults are screened and trained, and that children are heard, believed and supported."],
        ["Code of conduct", "Adults must never be alone with a child in an unobservable setting, must not photograph or contact children privately, and must maintain professional boundaries at all times."],
        ["Recognising and reporting", "Any concern, disclosure or suspicion must be reported immediately to the designated Child Protection Officer and, where required by law, to the appropriate authority — without delay and without independent investigation."],
        ["Support and confidentiality", "The child's safety, dignity and best interests guide every decision. Information is shared strictly on a need-to-know basis."],
        ["Training and review", "All personnel receive child protection training. The policy is reviewed at least annually."],
        ["Reporting contact", "Concerns may be raised with the Child Protection Officer through the details on the Contact page."]
      ]
    },
    "posh-policy": {
      title: "POSH Policy",
      updated: "1 July 2026",
      intro: "SWAMITRA Foundation is committed to a workplace free from sexual harassment, where every person is treated with dignity.",
      sections: [
        ["Scope", "This policy covers all employees, trainers, volunteers, interns and consultants, at any workplace of the Foundation including field locations, training venues and virtual settings."],
        ["Prohibited conduct", "Any unwelcome physical, verbal, non-verbal or written conduct of a sexual nature, and any conduct that creates an intimidating or hostile environment, is prohibited."],
        ["Internal Committee", "A duly constituted Internal Committee, including an external member, receives and inquires into complaints in accordance with law."],
        ["Complaint process", "Complaints may be made in writing to the Internal Committee. Interim relief, confidentiality and protection from retaliation are assured throughout."],
        ["Inquiry and outcome", "Inquiries follow principles of natural justice with a fair opportunity to both parties. Findings and recommendations are acted upon promptly."],
        ["Prevention", "Regular awareness sessions and committee training are conducted, and compliance is reported annually."],
        ["Reporting contact", "The Internal Committee may be reached through the details on the Contact page."]
      ]
    },
    "code-of-ethics": {
      title: "Code of Ethics",
      updated: "1 July 2026",
      intro: "The Code of Ethics defines the standard of conduct expected of everyone associated with SWAMITRA Foundation.",
      sections: [
        ["Integrity", "We act honestly, keep our commitments and do not misrepresent our work, results or affiliations."],
        ["Constitutional values", "We uphold justice, liberty, equality, fraternity and human dignity in every programme and interaction."],
        ["Independence and objectivity", "Research and advisory work is conducted objectively and is not influenced by funding relationships."],
        ["Confidentiality", "Information received in confidence is protected and used only for its intended purpose."],
        ["Non-discrimination", "We do not discriminate on any ground and actively work to include those who are usually excluded."],
        ["Stewardship", "Resources entrusted to the Foundation are used prudently, lawfully and for the stated charitable objects."],
        ["Accountability", "We accept responsibility for our conduct, welcome scrutiny and correct errors openly."]
      ]
    },
    "conflict-of-interest-policy": {
      title: "Conflict of Interest Policy",
      updated: "1 July 2026",
      intro: "This policy ensures that decisions of the Foundation are made in its interest and in the public interest, free from improper influence.",
      sections: [
        ["What is a conflict", "A conflict arises where personal, financial, family or professional interests could improperly influence a decision taken on behalf of the Foundation."],
        ["Disclosure", "Directors, officers, employees, advisors and volunteers must disclose any actual or potential conflict as soon as it becomes known."],
        ["Recusal", "A person with a conflict must not participate in discussion or decision-making on the matter concerned."],
        ["Record", "All disclosures and the action taken are recorded and reviewed by the governing body."],
        ["Annual declaration", "An annual declaration of interests is obtained from all persons in a decision-making role."]
      ]
    },
    "whistleblower-policy": {
      title: "Whistleblower Policy",
      updated: "1 July 2026",
      intro: "This policy enables anyone to raise a genuine concern about wrongdoing without fear of retaliation.",
      sections: [
        ["What can be reported", "Concerns about fraud, misuse of funds, harassment, child safety, falsification of records, legal non-compliance or any breach of the Code of Ethics."],
        ["How to report", "Concerns may be raised in writing to the designated officer named on the Contact page. Anonymous reports are accepted and reviewed."],
        ["Protection", "The Foundation prohibits any retaliation against a person who raises a concern in good faith. Retaliation is itself a disciplinary offence."],
        ["Investigation", "Concerns are assessed promptly, investigated fairly and, where substantiated, acted upon."],
        ["Confidentiality", "The identity of the person raising a concern is protected to the fullest extent possible."],
        ["Bad faith reports", "Deliberately false or malicious reports may attract disciplinary action."]
      ]
    }
  };

  return { org, hero, about, programs, trainings, resources, publications, news, events, stats, focus, chapters, legal };
})();

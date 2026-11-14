/* ==========================================================================
   CRF admin — content model

   Every editable section of the website is described here once, and the panel
   builds its screens from this. Adding a field to the site means adding a line
   here, not writing another form by hand.

   kind
     object   one record            (org, hero, about)
     list     an ordered array      (programmes, news, events …)
     map      slug -> record        (legal pages)

   field type
     text      single line (default)          number    numeric input
     textarea  multi-line                     bool      on/off
     select    fixed choices                  image     path + media picker
     strings   list of single lines           pairs     list of two-part rows
     objects   list of sub-records            group     nested record

   tabs
     Long records are split into tabs so a form is never a wall of inputs.
     Each tab names the fields it shows; anything left out of every tab is
     appended to the last one, so a new field can never go missing.
   ========================================================================== */
window.SW_SCHEMA = (function () {

  var LINK_HINT = "A page filename such as programs.html, or a full https:// address.";

  return {
    groups: [
      { label: "Homepage",    sections: ["hero", "about", "stats", "focus"] },
      { label: "Content",     sections: ["programs", "trainings", "resources",
                                         "publications", "news", "events"] },
      { label: "Institution", sections: ["org", "chapters", "legal"] }
    ],

    sections: {

      /* ------------------------------------------------------------------ */
      hero: {
        label: "Hero banner", kind: "object", icon: "hero",
        blurb: "The full-screen banner at the top of the homepage.",
        hint: "The photograph rotates; the headline below it stays still unless a photograph carries its own.",
        tabs: [
          { label: "Headline",    fields: ["heading", "lead", "primaryText", "primaryHref",
                                           "secondaryText", "secondaryHref", "points"] },
          { label: "Photographs", fields: ["autoplay", "interval", "images"] }
        ],
        fields: [
          { k: "heading", label: "Default headline", type: "textarea", full: true,
            hint: "Used for any photograph that does not set its own headline." },
          { k: "lead",    label: "Default lead paragraph", type: "textarea", rows: 3, full: true },
          { k: "primaryText",   label: "Primary button text" },
          { k: "primaryHref",   label: "Primary button link", hint: LINK_HINT },
          { k: "secondaryText", label: "Secondary button text" },
          { k: "secondaryHref", label: "Secondary button link", hint: LINK_HINT },
          { k: "points", label: "Trust points", type: "strings", full: true,
            hint: "The short ticked lines under the buttons." },
          { k: "autoplay", label: "Rotate photographs automatically", type: "bool" },
          { k: "interval", label: "Seconds per photograph", type: "number",
            min: 2.5, max: 30, step: 0.5, scale: 1000,
            hint: "Stored in milliseconds; shown here in seconds." },
          { k: "images", label: "Photographs", type: "objects", full: true,
            titleKey: "title", fallbackTitle: "Photograph", thumbKey: "src",
            hint: "Shown in this order. The badge above the headline names whichever photograph is on screen.",
            newItem: { src: "", title: "", subtitle: "" },
            fields: [
              { k: "src",      label: "Photograph", type: "image", full: true },
              { k: "title",    label: "Badge title", hint: "Usually the programme name." },
              { k: "subtitle", label: "Badge subtitle" },
              { k: "heading",  label: "Headline for this photograph", type: "textarea", full: true,
                hint: "Optional. Leave blank to keep the default headline." },
              { k: "lead",     label: "Lead for this photograph", type: "textarea", full: true },
              { k: "primaryText",   label: "Primary button text" },
              { k: "primaryHref",   label: "Primary button link" },
              { k: "secondaryText", label: "Secondary button text" },
              { k: "secondaryHref", label: "Secondary button link" }
            ] }
        ]
      },

      /* ------------------------------------------------------------------ */
      about: {
        label: "Who We Are", kind: "object", icon: "about",
        blurb: "The introduction block on the homepage and the opening of the About page.",
        tabs: [
          { label: "Text",    fields: ["eyebrow", "heading", "shortText", "fullText"] },
          { label: "Gallery", fields: ["figureImage", "figureCaption", "images"] }
        ],
        fields: [
          { k: "eyebrow",   label: "Eyebrow" },
          { k: "heading",   label: "Heading", full: true },
          { k: "shortText", label: "Short text", type: "textarea", rows: 4, full: true,
            hint: "The homepage version." },
          { k: "fullText",  label: "Full text", type: "textarea", rows: 9, full: true,
            hint: "The About page version. Blank lines start a new paragraph." },
          { k: "figureImage",   label: "Fallback image", type: "image" },
          { k: "figureCaption", label: "Fallback caption" },
          { k: "images", label: "Gallery", type: "objects", full: true,
            titleKey: "alt", fallbackTitle: "Image", thumbKey: "src",
            newItem: { src: "", alt: "", caption: "" },
            fields: [
              { k: "src",     label: "Image", type: "image", full: true },
              { k: "alt",     label: "Alt text", full: true,
                hint: "Describes the picture for screen readers and when it fails to load." },
              { k: "caption", label: "Caption", full: true }
            ] }
        ]
      },

      /* ------------------------------------------------------------------ */
      stats: {
        label: "Impact numbers", kind: "list", icon: "chart",
        blurb: "The counters that animate on the homepage.",
        titleKey: "label", fallbackTitle: "Number",
        newItem: { n: 0, suffix: "+", label: "" },
        fields: [
          { k: "n",      label: "Number", type: "number" },
          { k: "suffix", label: "Suffix", hint: "For example + or %" },
          { k: "label",  label: "Label", full: true }
        ]
      },

      /* ------------------------------------------------------------------ */
      focus: {
        label: "Focus areas", kind: "list", icon: "sparkle",
        blurb: "The card grid of what the Foundation works on.",
        titleKey: "title", subtitleKey: "text", fallbackTitle: "Focus area",
        newItem: { icon: "check", title: "", text: "" },
        fields: [
          { k: "icon",  label: "Icon", type: "select", options: [
              "scale", "book", "school", "building", "shield", "chart", "users",
              "heart", "handshake", "globe", "award", "file", "news", "calendar",
              "sparkle", "lock", "check"
            ] },
          { k: "title", label: "Title" },
          { k: "text",  label: "Description", type: "textarea", full: true }
        ]
      },

      /* ------------------------------------------------------------------ */
      programs: {
        label: "Programmes", kind: "list", icon: "programs",
        blurb: "The flagship programmes, shown on the homepage, the programmes page and one detail page each.",
        titleKey: "title", subtitleKey: "summary", tagKey: "tag",
        thumbKey: "img", fallbackTitle: "Programme", searchable: true,
        tabs: [
          { label: "Basics",      fields: ["title", "slug", "short", "tag", "img", "summary"] },
          { label: "The case",    fields: ["background", "need", "relevance"] },
          { label: "What it does", fields: ["objectives", "audience", "components",
                                            "activities", "outcomes", "resources"] },
          { label: "FAQs",        fields: ["faqs"] }
        ],
        newItem: { slug: "", short: "", title: "New programme", tag: "Flagship",
                   img: "", summary: "", objectives: [], audience: [],
                   components: [], activities: [], outcomes: [], resources: [], faqs: [] },
        fields: [
          { k: "title", label: "Title", full: true },
          { k: "slug",  label: "Slug", hint: "Identifies the detail page. Changing it breaks existing links." },
          { k: "short", label: "Short code", hint: "For example NLEM." },
          { k: "tag",   label: "Tag", type: "select", options: [
              "Flagship", "Schools", "Higher Education", "Capacity Building",
              "Safety Standards", "Compliance", "Child Protection", "Research", "Community"
            ], hint: "Drives the filter chips on the programmes page." },
          { k: "img",   label: "Card image", type: "image" },
          { k: "summary",    label: "Summary", type: "textarea", full: true,
            hint: "The line shown on the card." },
          { k: "background", label: "Background", type: "textarea", rows: 4, full: true },
          { k: "need",       label: "Why it is needed", type: "textarea", rows: 4, full: true },
          { k: "relevance",  label: "Relevance", type: "textarea", rows: 3, full: true },
          { k: "objectives", label: "Objectives", type: "strings", full: true },
          { k: "audience",   label: "Who it is for", type: "strings", full: true },
          { k: "components", label: "Components", type: "strings", full: true },
          { k: "activities", label: "Activities", type: "strings", full: true },
          { k: "outcomes",   label: "Outcomes", type: "strings", full: true },
          { k: "resources",  label: "Resources produced", type: "strings", full: true },
          { k: "faqs", label: "Frequently asked questions", type: "pairs", full: true,
            aLabel: "Question", bLabel: "Answer", bType: "textarea" }
        ]
      },

      /* ------------------------------------------------------------------ */
      trainings: {
        label: "Trainings", kind: "list", icon: "training",
        blurb: "Certified training programmes, shown on the training page and one detail page each.",
        titleKey: "title", subtitleKey: "summary", tagKey: "tag",
        fallbackTitle: "Training", searchable: true,
        tabs: [
          { label: "Basics",     fields: ["title", "slug", "tag", "mode", "duration", "level", "summary"] },
          { label: "The case",   fields: ["importance", "benefits", "objectives", "participants"] },
          { label: "Curriculum", fields: ["curriculum", "methodology", "certification"] }
        ],
        newItem: { slug: "", title: "New training", tag: "", mode: "", duration: "",
                   level: "", summary: "", benefits: [], objectives: [],
                   participants: [], curriculum: [], methodology: [], certification: "" },
        fields: [
          { k: "title",    label: "Title", full: true },
          { k: "slug",     label: "Slug", hint: "Identifies the detail page." },
          { k: "tag",      label: "Tag" },
          { k: "mode",     label: "Mode", hint: "For example Online · Offline · Hybrid" },
          { k: "duration", label: "Duration" },
          { k: "level",    label: "Level" },
          { k: "summary",    label: "Summary", type: "textarea", full: true },
          { k: "importance", label: "Why it matters", type: "textarea", rows: 4, full: true },
          { k: "benefits",     label: "Benefits", type: "strings", full: true },
          { k: "objectives",   label: "Objectives", type: "strings", full: true },
          { k: "participants", label: "Who should attend", type: "strings", full: true },
          { k: "curriculum",   label: "Curriculum", type: "pairs", full: true,
            aLabel: "Module", bLabel: "Covers" },
          { k: "methodology",  label: "Methodology", type: "strings", full: true },
          { k: "certification", label: "Certification", type: "textarea", full: true }
        ]
      },

      /* ------------------------------------------------------------------ */
      resources: {
        label: "Resource Centre", kind: "list", icon: "resources",
        blurb: "Downloadable frameworks, templates and toolkits.",
        titleKey: "title", subtitleKey: "type", tagKey: "cat",
        fallbackTitle: "Resource", searchable: true,
        newItem: { title: "", cat: "", type: "", ext: "PDF", size: "", date: "", lang: "English" },
        fields: [
          { k: "title", label: "Title", full: true },
          { k: "cat",   label: "Category", type: "select", free: true, options: [
              "Safe Schools", "Safe Workplaces", "POSH", "POCSO", "Child Protection",
              "Legal Education", "Constitutional Literacy", "Governance", "Research"
            ] },
          { k: "type",  label: "Type", type: "select", free: true, options: [
              "Framework", "Toolkit", "Template", "Checklist", "Handbook",
              "Poster", "SOP", "Infographic", "Report"
            ] },
          { k: "ext",   label: "File format", type: "select", free: true,
            options: ["PDF", "DOCX", "XLSX", "PPT", "ZIP"] },
          { k: "size",  label: "File size", hint: "For example 3.4 MB" },
          { k: "date",  label: "Date", type: "date" },
          { k: "lang",  label: "Language", type: "select", free: true,
            options: ["English", "Hindi", "Bilingual"] }
        ]
      },

      /* ------------------------------------------------------------------ */
      publications: {
        label: "Publications", kind: "list", icon: "book",
        blurb: "Research output listed in the Research Centre.",
        titleKey: "title", subtitleKey: "theme", tagKey: "type",
        fallbackTitle: "Publication", searchable: true,
        newItem: { title: "", type: "Research Paper", theme: "", date: "", pages: 0 },
        fields: [
          { k: "title", label: "Title", full: true },
          { k: "type",  label: "Type", type: "select", free: true, options: [
              "Research Paper", "White Paper", "Policy Brief", "Policy Paper",
              "Working Paper", "Survey Report"
            ] },
          { k: "theme", label: "Theme" },
          { k: "date",  label: "Date", type: "date" },
          { k: "pages", label: "Pages", type: "number" }
        ]
      },

      /* ------------------------------------------------------------------ */
      news: {
        label: "News", kind: "list", icon: "news",
        blurb: "Sorted newest first on the site, whatever order they sit in here.",
        titleKey: "title", subtitleKey: "summary", tagKey: "cat", dateKey: "date",
        fallbackTitle: "Article", searchable: true,
        newItem: { title: "", cat: "Announcement", date: "", summary: "" },
        fields: [
          { k: "title", label: "Headline", full: true },
          { k: "cat",   label: "Category", type: "select", free: true,
            options: ["Announcement", "Event", "Programme", "Research", "Community"] },
          { k: "date",  label: "Date", type: "date" },
          { k: "summary", label: "Summary", type: "textarea", rows: 3, full: true }
        ]
      },

      /* ------------------------------------------------------------------ */
      events: {
        label: "Events", kind: "list", icon: "calendar",
        blurb: "Shown on the events calendar.",
        titleKey: "title", subtitleKey: "place", tagKey: "mode", dateKey: "date",
        fallbackTitle: "Event",
        newItem: { title: "", date: "", place: "", mode: "Online", status: "upcoming" },
        fields: [
          { k: "title",  label: "Title", full: true },
          { k: "date",   label: "Date", type: "date" },
          { k: "place",  label: "Venue" },
          { k: "mode",   label: "Mode", type: "select", free: true,
            options: ["Online", "In person", "Hybrid"] },
          { k: "status", label: "Status", type: "select",
            options: ["upcoming", "past"] }
        ]
      },

      /* ------------------------------------------------------------------ */
      org: {
        label: "Organisation", kind: "object", icon: "building",
        blurb: "Appears in the header, the footer, the contact page and the sticky WhatsApp button.",
        tabs: [
          { label: "Details", fields: ["name", "tagline", "email", "emailAlt",
                                       "phone", "whatsapp", "address", "hours"] },
          { label: "Social",  fields: ["social"] }
        ],
        fields: [
          { k: "name",     label: "Name" },
          { k: "tagline",  label: "Tagline" },
          { k: "email",    label: "Email" },
          { k: "emailAlt", label: "Alternate email" },
          { k: "phone",    label: "Phone", hint: "As it should be displayed. The tel: link is generated from this." },
          { k: "whatsapp", label: "WhatsApp number", hint: "Leave blank to hide the sticky WhatsApp button." },
          { k: "address",  label: "Address", type: "textarea", full: true },
          { k: "hours",    label: "Office hours", full: true },
          { k: "social", label: "Social links", type: "group", full: true,
            hint: "Leave a channel blank and its icon disappears from the site rather than linking nowhere.",
            fields: [
              { k: "linkedin",  label: "LinkedIn" },
              { k: "facebook",  label: "Facebook" },
              { k: "x",         label: "X (Twitter)" },
              { k: "youtube",   label: "YouTube" },
              { k: "instagram", label: "Instagram" }
            ] }
        ]
      },

      /* ------------------------------------------------------------------ */
      chapters: {
        label: "Objects clause", kind: "list", icon: "scale",
        blurb: "The chapters of the Foundation's objects, shown on the Objectives page.",
        hint: "This is a constitutional document — edit with care.",
        titleKey: "title", subtitleKey: "intro", tagKey: "n",
        fallbackTitle: "Chapter",
        newItem: { n: 0, title: "", intro: "", objects: [] },
        tabs: [
          { label: "Chapter", fields: ["n", "title", "intro"] },
          { label: "Objects", fields: ["objects"] }
        ],
        fields: [
          { k: "n",     label: "Chapter number", type: "number" },
          { k: "title", label: "Title", full: true },
          { k: "intro", label: "Introduction", type: "textarea", rows: 4, full: true },
          { k: "objects", label: "Objects", type: "pairs", full: true,
            aLabel: "Object", bLabel: "Description", bType: "textarea" }
        ]
      },

      /* ------------------------------------------------------------------ */
      legal: {
        label: "Policy pages", kind: "map", icon: "lock",
        blurb: "Privacy, terms, ethics and the other policy pages.",
        hint: "The key is the page slug — changing it breaks that page's link.",
        titleKey: "title", subtitleKey: "intro", fallbackTitle: "Policy",
        keyLabel: "Page slug", searchable: true,
        newItem: { title: "", updated: "", intro: "", sections: [] },
        fields: [
          { k: "title",   label: "Title", full: true },
          { k: "updated", label: "Last updated", hint: "Free text, for example 1 July 2026." },
          { k: "intro",   label: "Introduction", type: "textarea", rows: 3, full: true },
          { k: "sections", label: "Sections", type: "pairs", full: true,
            aLabel: "Heading", bLabel: "Text", bType: "textarea" }
        ]
      }
    }
  };
})();

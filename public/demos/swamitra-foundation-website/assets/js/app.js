/* ==========================================================================
   SWAMITRA Foundation — App shell & interactions
   Injects the header, mobile app bar, bottom tab bar, drawer and footer,
   then wires up every interactive component on the page.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.SWAMITRA || {};
  var ORG = D.org || {};
  var BASE = (document.documentElement.getAttribute("data-base") || "");
  var PAGE = document.body.getAttribute("data-page") || "";
  var TITLE = document.body.getAttribute("data-title") || "SWAMITRA";
  var SUB = document.body.hasAttribute("data-subpage");

  function u(p) { return BASE + p; }

  /* Admin-editable copy is escaped before it goes into markup */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Asset paths may live at a different depth than pages (e.g. /hi/ pages).
     Images uploaded through the admin panel arrive as full Supabase Storage
     URLs, which are already absolute and must be left alone. */
  var ASSETS = document.documentElement.getAttribute("data-assets") || BASE;
  function a(p) {
    return /^(https?:)?\/\/|^data:/.test(p) ? p : ASSETS + p;
  }

  /* ---------- UI string lookup (Hindi pages load assets/js/ui.hi.js) ---------- */
  var UI = window.SW_UI || {};
  function t(s) { return UI[s] || s; }

  /* ---------- Language ---------- */
  var LANG = document.documentElement.getAttribute("lang") === "hi" ? "hi" : "en";
  var FILE = (location.pathname.split("/").pop() || "index.html");
  function langUrl(target) {
    if (target === LANG) return "#";
    return target === "hi" ? "hi/" + FILE : "../" + FILE;
  }
  function langSwitch(style) {
    var en = LANG === "en", extra = style || "";
    return '<div class="lang-switch" role="group" aria-label="Language"' + (extra ? ' style="' + extra + '"' : "") + '>' +
      '<a href="' + langUrl("en") + '" data-lang="en" aria-current="' + (en ? "true" : "false") + '"' +
        (en ? ' class="is-active"' : "") + '>English</a><span aria-hidden="true">|</span>' +
      '<a href="' + langUrl("hi") + '" data-lang="hi" aria-current="' + (en ? "false" : "true") + '"' +
        (en ? "" : ' class="is-active"') + '>\u0939\u093f\u0928\u094d\u0926\u0940</a>' +
      "</div>";
  }

  /* ---------- Icons ---------- */
  var ICO = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9.5"/>',
    programs: '<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v14a1.6 1.6 0 0 0-1.6-1.6H3z"/><path d="M21 6.5A2.5 2.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v14a1.6 1.6 0 0 1 1.6-1.6H21z"/>',
    training: '<path d="M12 3 2.5 8 12 13l9.5-5z"/><path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5"/><path d="M21.5 8v6"/>',
    resources: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H16l4 4v10.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z"/><path d="M15 4v5h5"/><path d="M8.5 13h7M8.5 16.5h4.5"/>',
    more: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    up: '<path d="M12 19V6M5.5 12.5 12 6l6.5 6.5"/>',
    phone: '<path d="M5 3.5h3.5l1.7 4.2-2.1 1.4a12 12 0 0 0 5.8 5.8l1.4-2.1 4.2 1.7V18a2.5 2.5 0 0 1-2.7 2.5C10.3 20 4 13.7 3.5 6.2A2.5 2.5 0 0 1 6 3.5z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
    pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/>',
    scale: '<path d="M12 3v18M7 21h10"/><path d="m5 7 7-2 7 2"/><path d="m5 7-2.5 6a3.5 3.5 0 0 0 5 0z"/><path d="m19 7 2.5 6a3.5 3.5 0 0 1-5 0z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
    school: '<path d="M12 3 2.5 8 12 13l9.5-5z"/><path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2"/>',
    shield: '<path d="M12 3 5 6v6c0 4.4 3 8 7 9 4-1 7-4.6 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-4M12.5 16V8M17 16v-6"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16.5 5.4a3.2 3.2 0 0 1 0 5.2M17.5 14.6A6 6 0 0 1 21 20"/>',
    heart: '<path d="M12 20s-7-4.5-7-9.4A4 4 0 0 1 12 7.6 4 4 0 0 1 19 10.6C19 15.5 12 20 12 20z"/>',
    handshake: '<path d="m11 7 2-1.5 6 4.5v5l-2 1.5-3.5-3"/><path d="M13 5.5 11 7 8.5 5.5 5 8v6l2 1.5"/><path d="m7 15.5 3 2.5 2-1.5 2 1.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7"/>',
    file: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H15l4 4v13.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5z"/><path d="M14.5 3v5h5"/>',
    news: '<rect x="3" y="5" width="14" height="15" rx="1.5"/><path d="M17 9h3.5v9a2 2 0 0 1-2 2H17"/><path d="M6.5 9h7M6.5 12.5h7M6.5 16h4"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    sparkle: '<path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.2l-1.8-5.6L4.5 10.8 10.2 9z"/>',
    lock: '<rect x="4.5" y="10" width="15" height="10.5" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>'
  };

  function icon(name, cls) {
    var p = ICO[name] || ICO.check;
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";
  }
  window.swIcon = icon;

  /* ---------- Social icons (filled) ---------- */
  var SOCIAL = {
    linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05A4.2 4.2 0 0 1 16.6 8.7c4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9z"/>',
    facebook: '<path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.1v2.3H7.6V13h2.7v8z"/>',
    x: '<path d="M17.5 3h3l-6.6 7.5L21.7 21h-6l-4.3-5.6L6.4 21h-3l7-8L2.6 3h6.2l3.9 5.2zM16.4 19.2h1.6L8.1 4.7H6.4z"/>',
    youtube: '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.1V8.9l5.2 3.1z"/>',
    instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9s.68.82.9 1.38c.16.42.36 1.06.41 2.23C21.8 8.4 21.8 8.8 21.8 12s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38s-.82.68-1.38.9c-.42.16-1.06.36-2.23.41-1.25.07-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38s.82-.68 1.38-.9c.42-.16 1.06-.36 2.23-.41C8.4 2.2 8.8 2.2 12 2.2zm0 3.05A6.75 6.75 0 1 0 18.75 12 6.75 6.75 0 0 0 12 5.25zm0 11.13A4.38 4.38 0 1 1 16.38 12 4.38 4.38 0 0 1 12 16.38zm6.99-11.4a1.58 1.58 0 1 1-1.58-1.58 1.58 1.58 0 0 1 1.58 1.58z"/>'
  };
  var WHATSAPP_ICO = '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 5.83 2.42 8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14 0-.31-.01-.47-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>';

  function socialLinks(cls) {
    var s = ORG.social || {};
    var names = { linkedin: "LinkedIn", facebook: "Facebook", x: "X (Twitter)", youtube: "YouTube", instagram: "Instagram" };
    return Object.keys(names).filter(function (k) {
      var v = (s[k] || "").trim();          // an unset channel renders nothing
      return v && v !== "#";                // rather than a dead link
    }).map(function (k) {
      return '<a href="' + s[k] + '" aria-label="' + names[k] + '" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + SOCIAL[k] + "</svg></a>";
    }).join("");
  }


  /* ---------- Programme & training page URLs ---------- */
  var PROGRAM_PAGES = {
    "nlem": "national-legal-education-mission.html",
    "slep": "school-legal-education-project.html",
    "hlep": "higher-legal-education-project.html",
    "teacher-education": "teacher-education-and-capacity-building.html",
    "safe-school": "national-safe-school-framework.html",
    "safe-workplace": "national-safe-workplace-standards.html",
    "posh": "posh-capacity-building.html",
    "pocso": "pocso-awareness-initiative.html",
    "research-policy": "research-and-policy-centre.html",
    "community-legal-awareness": "community-legal-awareness-programme.html"
  };
  var COURSE_PAGES = {
    "posh-training": "posh-training.html",
    "pocso-training": "pocso-training.html",
    "legal-awareness": "legal-awareness-programme.html",
    "constitutional-literacy": "constitutional-literacy-programme.html",
    "school-safety": "school-safety-training.html",
    "workplace-safety": "workplace-safety-training.html",
    "teacher-capacity": "teacher-capacity-building.html",
    "leadership-development": "leadership-development.html",
    "train-the-trainer": "train-the-trainer-tot.html"
  };
  window.swProgramUrl = function (slug) { return u(PROGRAM_PAGES[slug] || "programs.html"); };
  window.swCourseUrl = function (slug) { return u(COURSE_PAGES[slug] || "training.html"); };

  /* ---------- Navigation model ---------- */
  var NAV = [
    { id: "home", label: "Home", href: "index.html" },
    {
      id: "about", label: "About", href: "about.html", children: [
        ["About SWAMITRA", "about.html"],
        ["Our Story", "our-story.html"],
        ["Vision & Mission", "vision-and-mission.html"],
        ["Core Values", "core-values.html"],
        ["Our Approach", "our-approach.html"],
        ["Leadership", "leadership.html"],
        ["Governance", "governance.html"],
        ["Advisory Council", "advisory-council.html"],
        ["Transparency & Accountability", "transparency-and-accountability.html"],
        ["Annual Reports", "annual-reports.html"],
        ["Policies", "policies.html"],
        ["Objects Clause", "objectives.html"]
      ]
    },
    {
      id: "programs", label: "Programs", href: "programs.html", children: (D.programs || []).map(function (p) {
        return [p.title, window.swProgramUrl(p.slug)];
      })
    },
    {
      id: "training", label: "Training", href: "training.html", children: (D.trainings || []).map(function (t) {
        return [t.title, window.swCourseUrl(t.slug)];
      })
    },
    {
      id: "research", label: "Research", href: "research.html", children: [
        ["Research Home", "research.html"],
        ["Research Themes", "research-themes.html"],
        ["Publications", "featured-publications.html"],
        ["Ongoing Projects", "ongoing-projects.html"],
        ["Frameworks & Standards", "national-frameworks-and-standards.html"],
        ["Research Collaborations", "research-collaborations.html"]
      ]
    },
    {
      id: "resources", label: "Resources", href: "resources.html", children: [
        ["Resource Home", "resources.html"],
        ["Toolkits & Templates", "resource-library.html"],
        ["SOPs & Guidelines", "resource-library.html"],
        ["Reports & Publications", "resource-library.html"],
        ["Multimedia Library", "multimedia-library.html"]
      ]
    },
    {
      id: "news", label: "News", href: "news.html", children: [
        ["Latest News", "news.html"],
        ["Press Releases", "press-releases.html"],
        ["Events", "events-calendar.html"],
        ["Media Gallery", "media-gallery.html"],
        ["Press Kit", "press-kit.html"]
      ]
    },
    {
      id: "get-involved", label: "Get Involved", href: "get-involved.html", children: [
        ["Ways to Get Involved", "get-involved.html"],
        ["Volunteer", "volunteer-programme.html"],
        ["Partner With Us", "partnership-opportunities.html"],
        ["Donate", "donate.html"],
        ["CSR Partnerships", "csr-collaboration.html"],
        ["Internship", "internship.html"],
        ["Careers", "careers.html"],
        ["Membership", "membership.html"]
      ]
    },
    { id: "contact", label: "Contact", href: "contact.html" }
  ];

  var TABS = [
    { id: "home", label: "Home", icon: "home", href: "index.html" },
    { id: "programs", label: "Programs", icon: "programs", href: "programs.html" },
    { id: "training", label: "Training", icon: "training", href: "training.html" },
    { id: "resources", label: "Resources", icon: "resources", href: "resources.html" },
    { id: "more", label: "More", icon: "more", href: "#more" }
  ];

  /* ---------- Build shell ---------- */
  function buildHeader() {
    var navHtml = NAV.map(function (n) {
      var active = n.id === PAGE ? ' class="active"' : "";
      var caret = n.children ? '<svg class="caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' : "";
      var dd = n.children ? '<div class="dropdown">' + n.children.map(function (c) {
        return '<a href="' + u(c[1]) + '">' + t(c[0]) + "</a>";
      }).join("") + "</div>" : "";
      return "<li" + active + '><a href="' + u(n.href) + '">' + t(n.label) + caret + "</a>" + dd + "</li>";
    }).join("");

    return '' +
      '<div class="topbar"><div class="wrap">' +
        '<div class="topbar-left">' +
          '<a href="mailto:' + ORG.email + '">' + ORG.email + "</a>" +
          '<a href="tel:' + ORG.phoneHref + '">' + ORG.phone + "</a>" +
        "</div>" +
        '<div class="topbar-right">' +
          '<div class="social-row">' + socialLinks() + "</div>" +
          langSwitch() +
          '<a class="btn btn--gold btn--sm" href="' + u("donate.html") + '">' + t("Donate") + '</a>' +
        "</div>" +
      "</div></div>" +
      '<header class="site-header"><div class="wrap header-inner">' +
        '<a class="brand" href="' + u("index.html") + '" aria-label="SWAMITRA Foundation — Home">' +
          '<img src="' + a("assets/img/logo.png") + '" alt="SWAMITRA Foundation" width="2072" height="566">' +
        "</a>" +
        '<nav aria-label="Main"><ul class="nav">' + navHtml + "</ul></nav>" +
        '<div class="header-cta">' +
          '<a class="btn btn--primary btn--sm" href="' + u("get-involved.html") + '">' + t("Join Us") + '</a>' +
        "</div>" +
      "</div></header>" +

      /* Mobile app bar */
      '<div class="app-bar">' +
        '<div class="app-bar__left">' +
          '<button class="icon-btn back-btn" type="button" aria-label="' + t("Go back") + '">' + icon("back") + "</button>" +
          '<a href="' + u("index.html") + '" aria-label="Home"><img class="app-bar__mark" src="' + a("assets/img/mark.png") + '" alt="SWAMITRA Foundation"></a>' +
          '<span class="app-bar__title">' + TITLE + "</span>" +
        "</div>" +
        '<div class="app-bar__actions">' +
          '<a class="icon-btn" href="' + u("resource-library.html") + '" aria-label="' + t("Search resources") + '">' + icon("search") + "</a>" +
          '<button class="icon-btn js-drawer-open" type="button" aria-label="Open menu" aria-expanded="false">' + icon("menu") + "</button>" +
        "</div>" +
      "</div>";
  }

  function buildTabbar() {
    return '<nav class="tabbar" aria-label="Primary">' + TABS.map(function (t) {
      var isMore = t.id === "more";
      var active = t.id === PAGE ? " active" : "";
      var attrs = isMore ? 'href="#" class="js-drawer-open' + active + '"' : 'href="' + u(t.href) + '" class="' + active.trim() + '"';
      return "<a " + attrs + '>' + icon(t.icon) + "<span>" + t.label + "</span></a>";
    }).join("") + "</nav>";
  }

  function buildDrawer() {
    var items = NAV.map(function (n) {
      if (!n.children) {
        return "<li><a href=" + '"' + u(n.href) + '"' + ">" + t(n.label) + "</a></li>";
      }
      return "<li>" +
        '<button class="dnav__toggle" type="button" aria-expanded="false">' + t(n.label) +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        '<div class="dnav__sub"><ul>' +
          '<li><a href="' + u(n.href) + '"><strong>' + t(n.label) + " " + t("Home") + "</strong></a></li>" +
          n.children.map(function (c) { return '<li><a href="' + u(c[1]) + '">' + t(c[0]) + "</a></li>"; }).join("") +
        "</ul></div></li>";
    }).join("");

    return '<div class="scrim js-drawer-close"></div>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-label="Menu" tabindex="-1">' +
        '<div class="drawer__head">' +
          '<a class="brand" href="' + u("index.html") + '">' +
            '<img src="' + a("assets/img/logo.png") + '" alt="SWAMITRA Foundation" width="2072" height="566">' +
          "</a>" +
          '<button class="icon-btn js-drawer-close" type="button" aria-label="Close menu">' + icon("close") + "</button>" +
        "</div>" +
        '<div class="drawer__body">' +
          '<ul class="dnav">' + items + "</ul>" +
          '<div class="drawer-meta">' +
            langSwitch("color:var(--muted)") +
            '<a href="mailto:' + ORG.email + '">' + ORG.email + "</a>" +
            '<a href="tel:' + ORG.phoneHref + '">' + ORG.phone + "</a>" +
            '<div class="social-row" style="color:var(--muted)">' + socialLinks() + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="drawer__foot">' +
          '<a class="btn btn--primary btn--block" href="' + u("get-involved.html") + '">' + t("Join Us") + '</a>' +
          '<a class="btn btn--outline btn--block" href="' + u("donate.html") + '">' + t("Donate") + '</a>' +
        "</div>" +
      "</aside>";
  }

  function buildFooter() {
    var progLinks = (D.programs || []).slice(0, 6).map(function (p) {
      return '<li><a href="' + window.swProgramUrl(p.slug) + '">' + p.title + "</a></li>";
    }).join("");

    return '<footer class="site-footer">' +
      '<div class="footer-news"><div class="wrap">' +
        '<div><h4>' + t("Stay Connected with SWAMITRA") + '</h4><p>' + t("Programme updates, new research and resources — a few times a year, never more.") + '</p></div>' +
        '<form class="newsletter-form js-newsletter" novalidate>' +
          '<label class="sr-only" for="nl-email">' + t("Email address") + '</label>' +
          '<input class="input" id="nl-email" type="email" name="email" placeholder="' + t("Your email address") + '" required>' +
          '<button class="btn btn--gold" type="submit">' + t("Subscribe") + '</button>' +
        "</form>" +
      "</div></div>" +
      '<div class="wrap footer-top">' +
        '<div class="footer-brand">' +
          '<img src="' + a("assets/img/logo.png") + '" alt="SWAMITRA Foundation">' +
          "<p>" + (ORG.tagline || "") + ". " + t("SWAMITRA Foundation advances legal education, constitutional literacy, safe institutions and responsible citizenship across India through education, research and partnerships.") + "</p>" +
          '<div class="footer-social">' + socialLinks() + "</div>" +
        "</div>" +
        '<div class="footer-col"><h5>' + t("About") + '</h5><ul>' +
          '<li><a href="' + u("about.html") + '">' + t("About SWAMITRA") + '</a></li>' +
          '<li><a href="' + u("vision-and-mission.html") + '">' + t("Vision & Mission") + '</a></li>' +
          '<li><a href="' + u("leadership.html") + '">' + t("Leadership") + '</a></li>' +
          '<li><a href="' + u("governance.html") + '">' + t("Governance") + '</a></li>' +
          '<li><a href="' + u("objectives.html") + '">' + t("Objects Clause") + '</a></li>' +
          '<li><a href="' + u("transparency-and-accountability.html") + '">' + t("Transparency") + '</a></li>' +
        "</ul></div>" +
        '<div class="footer-col"><h5>' + t("Programmes") + '</h5><ul>' + progLinks +
          '<li><a href="' + u("programs.html") + '">' + t("All Programmes →") + '</a></li>' +
        "</ul></div>" +
        '<div class="footer-col"><h5>' + t("Contact") + '</h5><div class="footer-contact">' +
          "<div>" + icon("pin") + "<span>" + ORG.address + "</span></div>" +
          "<div>" + icon("mail") + '<a href="mailto:' + ORG.email + '">' + ORG.email + "</a></div>" +
          "<div>" + icon("phone") + '<a href="tel:' + ORG.phoneHref + '">' + ORG.phone + "</a></div>" +
          "<div>" + icon("clock") + "<span>" + ORG.hours + "</span></div>" +
        "</div>" +
        '<a class="btn btn--ghost btn--sm mt-4" href="' + u("contact.html") + '" style="background:transparent;border-color:rgba(255,255,255,.25);color:#fff">' + t("Contact Form") + '</a>' +
        "</div>" +
      "</div>" +
      '<div class="wrap footer-legal">' +
        "<span>© " + new Date().getFullYear() + " SWAMITRA Foundation. " + t("All Rights Reserved.") + "</span>" +
        "<ul>" +
          '<li><a href="' + u("legal.html?doc=privacy-policy") + '">' + t("Privacy Policy") + '</a></li>' +
          '<li><a href="' + u("legal.html?doc=terms-of-use") + '">' + t("Terms of Use") + '</a></li>' +
          '<li><a href="' + u("legal.html?doc=cookie-policy") + '">' + t("Cookie Policy") + '</a></li>' +
          '<li><a href="' + u("legal.html?doc=accessibility-statement") + '">' + t("Accessibility") + '</a></li>' +
          '<li><a href="' + u("legal.html?doc=disclaimer") + '">' + t("Disclaimer") + '</a></li>' +
          '<li><a href="' + u("legal.html") + '">' + t("All Policies") + '</a></li>' +
        "</ul>" +
      "</div></footer>";
  }

  /* ---------- Mount ---------- */
  /* ---------- Hero carousel ---------- */
  /* The hero shows one fixed block of copy; only the photograph behind it
     rotates. Text therefore never fades or shifts as the background changes. */
  /* Each entry in hero.images may be a plain path or { src, title, subtitle }.
     The badge above the headline names whichever photograph is on screen. */
  function heroImg(im) {
    return typeof im === "string" ? { src: im } : (im || {});
  }
  function heroBadge(im) {
    var m = heroImg(im);
    if (!m.title && !m.subtitle) return "";
    return (m.title ? "<b>" + esc(m.title) + "</b>" : "") +
           (m.subtitle ? ' <span class="hero-badge__sub">' + esc(m.subtitle) + "</span>" : "");
  }

  function buildHero() {
    var H = D.hero;
    if (!H) return false;
    var host = document.getElementById("site-hero");
    if (!host) return false;

    var imgs = (H.images || []).filter(Boolean);
    if (!imgs.length) return false;

    var first = heroBadge(imgs[0]);
    var slide0 = heroImg(imgs[0]);
    var btns = "";
    if (slide0.primaryText) btns += '<a class="btn btn--gold btn--lg" href="' + u(slide0.primaryHref || "#") + '">' + esc(slide0.primaryText) + "</a>";
    if (slide0.secondaryText) btns += '<a class="btn btn--light btn--lg" href="' + u(slide0.secondaryHref || "#") + '">' + esc(slide0.secondaryText) + "</a>";
    var pts = slide0.points || [];

    var many = imgs.length > 1;

    host.innerHTML =
      '<div class="hero-bg" aria-hidden="true">' +
        imgs.map(function (im, i) {
          return '<div class="hero-media' + (i === 0 ? " is-active" : "") + '">' +
            '<img src="' + a(heroImg(im).src || "") + '" alt="" ' +
            (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') +
            ' onerror="this.closest(\'.hero-media\').classList.add(\'is-empty\')"></div>';
        }).join("") +
      "</div>" +
      '<img class="hero-flame" src="' + a("assets/img/mark.png") + '" alt="" aria-hidden="true">' +
      '<div class="wrap hero-slide__body">' +
        (first ? '<span class="hero-badge" aria-live="polite">' + first + "</span>" : "") +
        '<div class="hero-text"><h1>' + esc(slide0.heading || H.heading || "") + "</h1></div>" +
        (slide0.lead ? '<p class="lead hero-lead">' + esc(slide0.lead) + "</p>" : (H.lead ? '<p class="lead hero-lead">' + esc(H.lead) + "</p>" : "")) +
        (btns ? '<div class="hero-ctas"><div class="btn-row">' + btns + "</div></div>" : "") +
        (pts.length ? '<div class="hero-points badge-strip" style="margin-top:36px">' + pts.map(function (p) {
            return '<div style="color:rgba(255,255,255,.72)">' + icon("check") + " " + esc(p) + "</div>";
          }).join("") + "</div>" : "") +
      "</div>" +
      (many
        ? '<div class="hero-ctrl"><div class="wrap hero-ctrl__inner">' +
            '<button class="hero-arrow" type="button" data-hero="prev" aria-label="' + t("Previous image") + '">' + icon("back") + "</button>" +
            '<div class="hero-dots">' + imgs.map(function (im, i) {
              var m = heroImg(im);
              return '<button class="hero-dot' + (i === 0 ? " is-active" : "") + '" type="button" data-hero-go="' + i + '" ' +
                'aria-label="' + esc(m.title || (t("Image") + " " + (i + 1))) + '"></button>';
            }).join("") + "</div>" +
            '<button class="hero-arrow" type="button" data-hero="next" aria-label="' + t("Next image") + '">' + icon("next") + "</button>" +
          "</div></div>"
        : "");

    if (many) wireHero(host, H);
    return true;
  }

  function wireHero(host, H) {
    var layers = [].slice.call(host.querySelectorAll(".hero-media"));
    var dots = [].slice.call(host.querySelectorAll(".hero-dot"));
    var cur = 0, timer = null, hover = false, focused = false;
    var badgeEl = host.querySelector(".hero-badge");
    var lastBadge = badgeEl ? badgeEl.innerHTML : "";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var delay = Math.max(2500, +H.interval || 6500);

    function show(n) {
      cur = (n + layers.length) % layers.length;
      layers.forEach(function (el, i) { el.classList.toggle("is-active", i === cur); });
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === cur);
        d.setAttribute("aria-current", i === cur ? "true" : "false");
      });
      swapText(cur);
      swapBadge(cur);
      warm(layers[(cur + 1) % layers.length]);
    }

    /* The badge names the photograph on screen, so it fades out and back in
       rather than snapping to the new programme mid-cross-fade. */
    function swapBadge(i) {
      var next = heroBadge((H.images || [])[i]);
      if (!badgeEl || next === lastBadge) return;
      lastBadge = next;
      badgeEl.classList.add("is-swapping");
      clearTimeout(badgeEl._t);
      badgeEl._t = setTimeout(function () {
        badgeEl.innerHTML = next;
        badgeEl.classList.remove("is-swapping");
      }, 260);
    }

    /* Swap heading, lead, and buttons when the slide changes. */
    function swapText(n) {
      var slide = heroImg((H.images || [])[n]);
      var body = host.querySelector(".hero-slide__body");
      if (!body) return;
      body.classList.add("is-swapping");
      var swapTimer = setTimeout(function () {
        var wrap = body.querySelector(".hero-text");
        if (wrap) wrap.querySelector("h1").textContent = slide.heading || "";
        var leadEl = body.querySelector(".hero-lead");
        if (leadEl) { leadEl.textContent = slide.lead || ""; }
        var ctaEl = body.querySelector(".hero-ctas");
        if (ctaEl && (slide.primaryText || slide.secondaryText)) {
          var b = "";
          if (slide.primaryText) b += '<a class="btn btn--gold btn--lg" href="' + u(slide.primaryHref || "#") + '">' + esc(slide.primaryText) + "</a>";
          if (slide.secondaryText) b += '<a class="btn btn--light btn--lg" href="' + u(slide.secondaryHref || "#") + '">' + esc(slide.secondaryText) + "</a>";
          ctaEl.querySelector(".btn-row").innerHTML = b;
        }
        body.classList.remove("is-swapping");
      }, 280);
    }

    /* Fetch the next photo now, so it is decoded before its turn. Without this
       a lazy image only starts loading as its layer begins to fade in. */
    function warm(layer) {
      var img = layer && layer.querySelector("img");
      if (!img || img.dataset.warm) return;
      img.dataset.warm = "1";
      new Image().src = img.currentSrc || img.src;
    }
    function go(step) { show(cur + step); restart(); }
    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (reduce || H.autoplay === false || hover || focused || document.hidden) return;
      timer = setInterval(function () { show(cur + 1); }, delay);
    }
    var restart = start;

    host.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-hero]");
      if (nav) return go(nav.getAttribute("data-hero") === "next" ? 1 : -1);
      var jump = e.target.closest("[data-hero-go]");
      if (jump) { show(+jump.getAttribute("data-hero-go")); restart(); }
    });

    /* Pause while the visitor is reading or the tab is in the background.
       Hover and keyboard focus are tracked separately so leaving one does not
       resume the rotation while the other is still holding it. */
    host.addEventListener("mouseenter", function () { hover = true; stop(); });
    host.addEventListener("mouseleave", function () { hover = false; start(); });
    host.addEventListener("focusin", function () { focused = true; stop(); });
    host.addEventListener("focusout", function () { focused = false; start(); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    /* Swipe */
    var x0 = null;
    host.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    host.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });

    start();
  }

  /* Sticky WhatsApp button — omitted entirely if no number is configured */
  function buildWhatsApp() {
    var num = (ORG.whatsapp || "").replace(/\D/g, "");
    if (!num) return "";
    var label = t("Chat on WhatsApp");
    return '<a class="wa-fab" href="https://wa.me/' + num + '" target="_blank" rel="noopener noreferrer" ' +
      'aria-label="' + label + '" title="' + label + '">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + WHATSAPP_ICO + "</svg></a>";
  }

  function mount() {
    var h = document.getElementById("site-header");
    if (h) h.innerHTML = buildHeader();
    var f = document.getElementById("site-footer");
    if (f) f.innerHTML = buildFooter();
    buildHero();

    var shell = document.createElement("div");
    shell.innerHTML = buildTabbar() + buildDrawer() +
      '<button class="fab" type="button" aria-label="Back to top">' + icon("up") + "</button>" +
      buildWhatsApp() +
      '<div class="toast" role="status" aria-live="polite"></div>';
    while (shell.firstChild) document.body.appendChild(shell.firstChild);

    if (SUB) document.body.classList.add("is-subpage");
  }

  /* ---------- Interactions ---------- */
  function toast(msg) {
    var t = document.querySelector(".toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove("show"); }, 3400);
  }
  window.swToast = toast;

  function wireDrawer() {
    var drawer = document.querySelector(".drawer");
    var scrim = document.querySelector(".scrim");
    if (!drawer) return;
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      drawer.classList.add("open");
      scrim.classList.add("open");
      document.body.classList.add("no-scroll");
      drawer.focus();
      document.querySelectorAll(".js-drawer-open").forEach(function (b) {
        if (b.hasAttribute("aria-expanded")) b.setAttribute("aria-expanded", "true");
      });
    }
    function close() {
      drawer.classList.remove("open");
      scrim.classList.remove("open");
      document.body.classList.remove("no-scroll");
      document.querySelectorAll(".js-drawer-open").forEach(function (b) {
        if (b.hasAttribute("aria-expanded")) b.setAttribute("aria-expanded", "false");
      });
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener("click", function (e) {
      var o = e.target.closest(".js-drawer-open");
      if (o) { e.preventDefault(); open(); return; }
      var c = e.target.closest(".js-drawer-close");
      if (c) { e.preventDefault(); close(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("open")) close();
      if (e.key === "Tab" && drawer.classList.contains("open")) {
        var f = drawer.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    /* Drawer accordions */
    drawer.addEventListener("click", function (e) {
      var t = e.target.closest(".dnav__toggle");
      if (!t) return;
      var panel = t.nextElementSibling;
      var open = t.getAttribute("aria-expanded") === "true";
      drawer.querySelectorAll(".dnav__toggle").forEach(function (o) {
        if (o !== t) { o.setAttribute("aria-expanded", "false"); o.nextElementSibling.style.maxHeight = null; }
      });
      t.setAttribute("aria-expanded", String(!open));
      panel.style.maxHeight = open ? null : panel.scrollHeight + "px";
    });

    /* Auto-open the section matching the current page */
    var cur = drawer.querySelector('.dnav__toggle');
    if (cur) {
      drawer.querySelectorAll(".dnav__toggle").forEach(function (t) {
        var nav = NAV.filter(function (n) { return n.label === t.firstChild.textContent.trim(); })[0];
        if (nav && nav.id === PAGE) {
          t.setAttribute("aria-expanded", "true");
          t.nextElementSibling.style.maxHeight = t.nextElementSibling.scrollHeight + "px";
        }
      });
    }
  }

  function wireBack() {
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".back-btn")) return;
      if (history.length > 1) history.back();
      else location.href = u("index.html");
    });
  }

  function wireAccordions(root) {
    (root || document).querySelectorAll(".acc__btn").forEach(function (btn) {
      if (btn._wired) return;
      btn._wired = true;
      btn.addEventListener("click", function () {
        var panel = btn.nextElementSibling;
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        panel.style.maxHeight = open ? null : panel.scrollHeight + "px";
      });
    });
  }
  window.swAccordions = wireAccordions;

  function wireTabs(root) {
    (root || document).querySelectorAll("[data-tabs]").forEach(function (group) {
      if (group._wired) return;
      group._wired = true;
      var btns = group.querySelectorAll(".tabs button");
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          btns.forEach(function (o) { o.setAttribute("aria-selected", "false"); });
          b.setAttribute("aria-selected", "true");
          var target = b.getAttribute("aria-controls");
          group.querySelectorAll(".tabpanel").forEach(function (p) { p.hidden = p.id !== target; });
        });
      });
    });
  }
  window.swTabs = wireTabs;

  function wireCounters() {
    var els = [].slice.call(document.querySelectorAll("[data-count]"));
    if (!els.length) return;

    function run(el) {
      el._done = true;
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var dur = 1300, start = Date.now();
      var id = setInterval(function () {
        var p = Math.min(1, (Date.now() - start) / dur);
        var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString("en-IN") + suffix;
        if (p >= 1) clearInterval(id);
      }, 30);
    }
    function check() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      els = els.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh - 40 && r.bottom > 0) { run(el); return false; }
        return true;
      });
    }
    var t = null;
    window.addEventListener("scroll", function () {
      if (t) return;
      t = setTimeout(function () { t = null; check(); }, 120);
    }, { passive: true });
    check();
    /* Fail-safe: never leave a counter showing 0 */
    setTimeout(function () { els.forEach(run); els = []; }, 6000);
  }

  function wireScroll() {
    var header = document.querySelector(".site-header");
    var fab = document.querySelector(".fab");
    function onScroll() {
      var y = window.scrollY;
      if (header) header.classList.toggle("is-stuck", y > 8);
      if (fab) fab.classList.toggle("show", y > 700);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (fab) fab.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  function wireForms() {
    document.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form.matches("form")) return;
      e.preventDefault();
      var invalid = false;
      form.querySelectorAll("[required]").forEach(function (f) {
        if (!f.checkValidity()) { invalid = true; f.style.borderColor = "var(--error)"; }
        else { f.style.borderColor = ""; }
      });
      if (invalid) { toast("Please complete the highlighted fields."); return; }
      if (form.classList.contains("js-newsletter")) toast("Thank you — please check your inbox to confirm.");
      else toast("Thank you. Your submission has been recorded and our team will respond shortly.");
      form.reset();
    });
    document.addEventListener("change", function (e) {
      if (e.target.type === "file" && e.target.files.length) {
        var drop = e.target.closest(".field") && e.target.closest(".field").querySelector(".file-drop");
        if (drop) drop.textContent = e.target.files[0].name;
      }
    });
  }

  /* ---------- Init ---------- */
  /* ---------- About page ---------- */
  function renderAbout() {
    var A = D.about;
    if (!A) return;
    var eye = document.getElementById("a-eyebrow"), head = document.getElementById("a-heading");
    var short = document.getElementById("a-short"), full = document.getElementById("a-full");
    var tog = document.getElementById("a-toggle");   // optional Read More button
    var gal = document.getElementById("a-gallery");
    if (eye) eye.textContent = A.eyebrow || "About SWAMITRA";
    if (head) head.textContent = A.heading || "";
    if (short) short.textContent = A.shortText || "";
    /* About page — show full text directly (homepage is the "short" version) */
    if (full && A.fullText) {
      full.innerHTML = "<p>" + A.fullText.split("\n").filter(Boolean).join("</p><p>") + "</p>";
    }

    /* Image gallery / carousel */
    var imgs = A.images;
    if (imgs && imgs.length && gal) {
      var slides = imgs.map(function (im, idx) {
        return '<div class="about-slide" role="group" aria-roledescription="slide" aria-label="' +
          (idx + 1) + " of " + imgs.length + '" tabindex="-1">' +
          '<img src="' + a(im.src) + '" alt="' + (im.alt || "") + '" loading="lazy">' +
          (im.caption ? '<figcaption>' + im.caption + "</figcaption>" : "") +
          "</div>";
      }).join("");
      var dots = "";
      var arrows = "";
      if (imgs.length > 1) {
        dots = '<div class="about-dots">' + imgs.map(function (_, i) {
          return '<button class="about-dot' + (i === 0 ? " on" : "") + '" aria-label="Slide ' + (i + 1) +
            '" data-i="' + i + '"><span></span></button>';
        }).join("") + "</div>";
        arrows = '<div class="about-arrows">' +
          '<button class="about-arrow about-prev" aria-label="Previous"><span>&larr;</span></button>' +
          '<button class="about-arrow about-next" aria-label="Next"><span>&rarr;</span></button>' +
          "</div>";
      }
      gal.innerHTML = '<div class="about-slides" id="about-slides">' + slides + "</div>" + arrows + dots;

      var host = document.getElementById("about-slides");
      if (host && imgs.length > 1) {
        var cur = 0, timer = null, gap = 5000;

        function show(n) {
          var s = host.querySelectorAll(".about-slide");
          s.forEach(function (el, i) {
            el.classList.toggle("on", i === n);
          });
          gal.querySelectorAll(".about-dot").forEach(function (d, i) {
            d.classList.toggle("on", i === n);
          });
          cur = n;
        }
        function next() { show((cur + 1) % imgs.length); }
        function prev() { show((cur - 1 + imgs.length) % imgs.length); }
        function start() {
          stop();
          timer = setInterval(next, gap);
        }
        function stop() {
          if (timer) clearInterval(timer);
          timer = null;
        }

        show(0);
        gal.querySelectorAll(".about-arrow").forEach(function (b) {
          b.addEventListener("click", function () {
            b.classList.contains("about-prev") ? prev() : next();
          });
        });
        gal.querySelectorAll(".about-dot").forEach(function (d) {
          d.addEventListener("click", function () {
            show(+d.dataset.i);
            start();
          });
        });
        gal.addEventListener("mouseenter", stop);
        gal.addEventListener("mouseleave", start);
        host.addEventListener("touchstart", function (e) {
          if (!e.touches || !e.touches.length) return;
          var x = e.touches[0].clientX;
          host.addEventListener("touchmove", function mv(ev) {
            if (ev.touches && ev.touches.length) {
              var dx = ev.touches[0].clientX - x;
              if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); start(); }
            }
            host.removeEventListener("touchmove", mv);
          }, { once: true });
        }, { passive: true });
        host.addEventListener("keydown", function (e) {
          if (e.key === "ArrowRight") next();
          if (e.key === "ArrowLeft") prev();
        });
        start();
      }
    }

    /* Read More / Less */
    if (tog && full) {
      tog.addEventListener("click", function () {
        var open = full.style.display === "none";
        full.style.display = open ? "block" : "none";
        tog.textContent = open ? "Read Less" : "Read More";
        tog.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  /* ---------- Who We Are section on homepage ---------- */
  function renderWhoWeAre() {
    var A = D.about;
    if (!A) return;
    var isHi = document.documentElement.lang === "hi";
    var eye = document.getElementById("wwe-eyebrow");
    var head = document.getElementById("wwe-heading");
    var short = document.getElementById("wwe-short");
    var fullWrap = document.getElementById("wwe-full-wrap");
    var fig = document.getElementById("wwe-figure");
    var figCap = document.getElementById("wwe-figcaption");
    var gal = document.getElementById("wwe-gallery");

    if (eye) eye.textContent = A.eyebrow || (isHi ? "हम कौन हैं" : "Who We Are");
    if (head) head.textContent = A.heading || "";
    if (short) short.textContent = A.shortText || "";

    /* Show full text directly on homepage (no Read More toggle — button links to about.html) */
    if (fullWrap && A.fullText) {
      fullWrap.innerHTML = "<p>" + A.fullText.split("\n").filter(Boolean).join("</p><p>") + "</p>";
    }

    /* Image carousel */
    var imgs = (A.images || []).filter(function (im) { return im && im.src; });
    if (imgs.length && gal && fig) {
      var slides = imgs.map(function (im, idx) {
        return '<div class="about-slide" role="group" aria-roledescription="slide" aria-label="' +
          (idx + 1) + " of " + imgs.length + '" tabindex="-1">' +
          '<img src="' + a(im.src) + '" alt="' + (im.alt || "") + '" loading="lazy">' +
          (im.caption ? '<figcaption>' + im.caption + "</figcaption>" : "") +
          "</div>";
      }).join("");

      var dots = "";
      var arrows = "";
      if (imgs.length > 1) {
        dots = '<div class="about-dots">' + imgs.map(function (_, i) {
          return '<button class="about-dot' + (i === 0 ? " on" : "") + '" aria-label="Slide ' + (i + 1) + '" data-i="' + i + '"></button>';
        }).join("") + "</div>";
        arrows = '<div class="about-arrows"><button class="about-arr about-arr--prev" aria-label="Previous">&#8249;</button><button class="about-arr about-arr--next" aria-label="Next">&#8250;</button></div>';
      }

      gal.innerHTML = '<div class="about-slides">' + slides + "</div>" + dots + arrows;
      if (imgs.length > 1) {
        var slides2 = gal.querySelectorAll(".about-slide");
        var dotBtns = gal.querySelectorAll(".about-dot");
        var prev = gal.querySelector(".about-arr--prev");
        var next = gal.querySelector(".about-arr--next");
        var cur = 0;
        function show(n) {
          slides2.forEach(function (s, i) { s.classList.toggle("on", i === n); });
          dotBtns.forEach(function (d, i) { d.classList.toggle("on", i === n); });
          cur = n;
        }
        if (prev) prev.addEventListener("click", function () { show((cur - 1 + imgs.length) % imgs.length); });
        if (next) next.addEventListener("click", function () { show((cur + 1) % imgs.length); });
        dotBtns.forEach(function (d) {
          d.addEventListener("click", function () { show(+d.dataset.i); });
        });
        var timer = setInterval(function () { show((cur + 1) % imgs.length); }, 5000);
        gal.addEventListener("mouseenter", function () { clearInterval(timer); });
        gal.addEventListener("mouseleave", function () { timer = setInterval(function () { show((cur + 1) % imgs.length); }, 5000); });
        /* Touch swipe */
        var startX = 0;
        gal.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
        gal.addEventListener("touchend", function (e) {
          var dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) > 50) show(dx > 0 ? (cur - 1 + imgs.length) % imgs.length : (cur + 1) % imgs.length);
        });
      }

      /* Hide old single <img> and use caption from first slide */
      var oldImg = fig.querySelector("img:not(.about-slide img)");
      if (oldImg) oldImg.style.display = "none";
      if (figCap && !A.figureCaption) {
        var firstCap = imgs[0] && imgs[0].caption;
        if (firstCap) figCap.textContent = firstCap;
      }
    }
  }

  function init() {
    mount();
    wireDrawer();
    wireBack();
    wireAccordions();
    wireTabs();
    wireCounters();
    wireScroll();
    wireForms();
    if (document.getElementById("about")) renderAbout();
    if (document.getElementById("who-we-are")) renderWhoWeAre();
    document.dispatchEvent(new CustomEvent("sw:ready"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

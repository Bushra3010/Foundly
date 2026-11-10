/* ==========================================================================
   Radhe Homes: shared UI
   Header/footer, reveal, forms, lightbox, toast, PDF generation.
   ========================================================================== */

/* ---------- tiny helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const money = (s) => s;
const fmtDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const statusLabel = { ongoing: "Ongoing", completed: "Completed", upcoming: "Upcoming" };

const waLink = (text) =>
  `https://wa.me/${RR.company.whatsapp}?text=${encodeURIComponent(text || "Hello Radhe Homes, I would like to know more about your projects.")}`;
const telLink = () => `tel:${RR.company.phoneHref}`;
const mailLink = () => `mailto:${RR.company.email}`;

/* ---------- icons ---------- */
const ICONS = {
  leaf: '<path d="M4 20c0-8 6-14 16-14 0 10-6 14-16 14Z"/><path d="M4 20c4-4 7-6 12-8"/>',
  home: '<path d="M3 11 13 3l10 8"/><path d="M6 10v11h14V10"/>',
  play: '<circle cx="13" cy="13" r="9"/><path d="M11 9.5 17 13l-6 3.5Z"/>',
  car:  '<path d="M3 16v-3l2-5h16l2 5v3"/><path d="M3 16h20v3H3z"/><circle cx="7" cy="19" r="1.6"/><circle cx="19" cy="19" r="1.6"/>',
  shield: '<path d="M13 3 4 6.5V13c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6.5Z"/>',
  cctv: '<path d="M3 8h13l4 3-4 3H3z"/><path d="M8 14v4"/><path d="M5 21h6"/>',
  lift: '<rect x="5" y="3" width="16" height="19" rx="1"/><path d="M10 9l3-3 3 3"/><path d="M16 16l-3 3-3-3"/>',
  bolt: '<path d="M14 2 6 14h6l-2 9 9-13h-6Z"/>',
  users: '<circle cx="10" cy="9" r="3.2"/><path d="M4 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M18 8.5a3 3 0 1 1 0 5"/>',
  walk: '<circle cx="14" cy="4.5" r="2"/><path d="M12 22l2-7-3-3 1-5 4 3 3 1"/><path d="M11 12l-3 4"/>',
  sun:  '<circle cx="13" cy="13" r="5"/><path d="M13 2v3M13 21v3M2 13h3M21 13h3M5.6 5.6l2 2M18.4 18.4l2 2M20.4 5.6l-2 2M7.6 18.4l-2 2"/>',
  cup:  '<path d="M5 6h13v7a6.5 6.5 0 0 1-13 0Z"/><path d="M18 8h2.5a2.5 2.5 0 0 1 0 5H18"/><path d="M4 22h15"/>'
};
const icon = (name) => `<svg viewBox="0 0 26 26" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.home}</svg>`;
const arrow = '<svg width="13" height="9" viewBox="0 0 13 9" fill="none" aria-hidden="true"><path d="M0 4.5h11.5M8.2 1l3.3 3.5L8.2 8" stroke="currentColor" stroke-width="1"/></svg>';

/* ==========================================================================
   Header + footer
   ========================================================================== */
function renderChrome(active) {
  const c = RR.company;
  const nav = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "about.html", label: "About", key: "about" },
    { href: "projects.html", label: "Projects", key: "projects", drop: [
      { href: "projects.html", label: "All Projects" },
      { href: "projects.html?filter=ongoing", label: "Ongoing Projects" },
      { href: "projects.html?filter=completed", label: "Completed Projects" },
      { href: "projects.html?filter=upcoming", label: "Upcoming Projects" }
    ]},
    { href: "news.html", label: "Updates", key: "news" },
    { href: "contact.html", label: "Contact", key: "contact" }
  ];

  const navHTML = nav.map(n => n.drop
    ? `<div class="nav__item"><a href="${n.href}" class="${active === n.key ? "is-active" : ""}">${n.label}</a>
         <div class="nav__drop">${n.drop.map(d => `<a href="${d.href}">${d.label}</a>`).join("")}</div></div>`
    : `<a href="${n.href}" class="${active === n.key ? "is-active" : ""}">${n.label}</a>`).join("");

  const header = `
  <header class="hdr" id="hdr">
    <div class="wrap hdr__in">
      <a class="brand" href="index.html" aria-label="${esc(c.name)}: home">
        <img class="brand__logo" src="img/logo-mark.png" alt="" width="480" height="292" decoding="async">
        <span class="brand__txt">
          <span class="brand__mark">Radhe Homes</span>
          <span class="brand__sub">${esc(c.tagline)} · Est. ${c.since}</span>
        </span>
      </a>
      <nav class="nav" aria-label="Primary">${navHTML}</nav>
      <div class="hdr__actions">
        <a class="btn btn--solid btn--sm" href="site-visit.html">Book a Site Visit</a>
        <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav">
          <span></span><span></span>
        </button>
      </div>
    </div>
  </header>
  <div class="mobile" id="mobileNav" aria-hidden="true">
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="projects.html">Projects</a>
    <a href="projects.html?filter=ongoing">Ongoing</a>
    <a href="projects.html?filter=completed">Completed</a>
    <a href="projects.html?filter=upcoming">Upcoming</a>
    <a href="news.html">Updates</a>
    <a href="contact.html">Contact</a>
    <a class="btn btn--solid" href="site-visit.html">Book a Site Visit</a>
  </div>`;

  const footer = `
  <footer class="ftr">
    <div class="wrap">
      <div class="ftr__top">
        <div>
          <img class="ftr__logo" src="img/logo-mark.png" alt="" width="480" height="292" loading="lazy" decoding="async">
          <span class="brand__mark" style="font-size:22px">Radhe Homes</span>
          <p class="body-sm" style="margin:18px 0 22px">Building landmarks across Ahmedabad since ${c.since}. Residential and commercial developments delivered with quality, transparency and long-term value.</p>
          <p class="label" style="line-height:2">RERA ${esc(c.rera)}</p>
        </div>
        <div>
          <h5>Company</h5>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="projects.html">Our Projects</a></li>
            <li><a href="projects.html?filter=ongoing">Ongoing Projects</a></li>
            <li><a href="projects.html?filter=completed">Completed Projects</a></li>
            <li><a href="projects.html?filter=upcoming">Upcoming Projects</a></li>
          </ul>
        </div>
        <div>
          <h5>Projects</h5>
          <ul>
            <li><a href="projects.html?filter=residential">Residential</a></li>
            <li><a href="projects.html?filter=commercial">Commercial</a></li>
            <li><a href="news.html">Construction Updates</a></li>
            <li><a href="site-visit.html">Book a Site Visit</a></li>
            <li><a href="admin-login.html">Admin Panel</a></li>
          </ul>
        </div>
        <div>
          <h5>Contact</h5>
          <ul>
            <li><a href="${telLink()}">${esc(c.phone)}</a></li>
            <li><a href="${waLink()}" target="_blank" rel="noopener">WhatsApp Enquiry</a></li>
            <li><a href="${mailLink()}">${esc(c.email)}</a></li>
            <li><a href="contact.html">${esc(c.address.split(",").slice(0, 2).join(","))}</a></li>
            <li><span style="color:var(--muted-2);font-size:13.5px">${esc(c.hours)}</span></li>
          </ul>
        </div>
      </div>
      <div class="ftr__word" aria-hidden="true">RADHE HOMES</div>
      <div class="ftr__bot">
        <span>© ${new Date().getFullYear()} ${esc(c.name)}. All Rights Reserved.</span>
        <span style="display:flex;gap:22px">
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms &amp; Conditions</a>
        </span>
      </div>
    </div>
  </footer>
  <div class="fabs">
    <a class="fab fab--wa" href="${waLink()}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-5.6-4.9c-.4-.7-.9-1.6-.9-2.5 0-.9.5-1.4.7-1.6.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.5l.7 1.7c.1.2.1.4 0 .6l-.3.5-.3.3c-.1.1-.2.3-.1.5.2.4.8 1.3 1.6 2 .9.8 1.7 1.1 2 1.2.2.1.4 0 .5-.1l.7-.8c.2-.2.3-.2.5-.1l1.7.8c.2.1.4.2.4.3.1.2.1.6 0 1.1Z"/></svg>
    </a>
    <a class="fab" href="${telLink()}" aria-label="Call us">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 3Z"/></svg>
    </a>
  </div>
  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
    <button class="iconbtn lightbox__x" id="lbClose" aria-label="Close">✕</button>
    <img id="lbImg" alt="">
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;

  const h = $("#site-header"); if (h) h.outerHTML = header;
  const f = $("#site-footer"); if (f) f.outerHTML = footer;
}

/* ==========================================================================
   Behaviours
   ========================================================================== */
function initHeader() {
  const hdr = $("#hdr"), burger = $("#burger"), mob = $("#mobileNav");
  /* header solidity is driven by a zero-height sentinel at the top of the page,
     so the compositor does the work instead of a scroll handler */
  if (hdr) {
    if ("IntersectionObserver" in window) {
      const sentinel = document.createElement("div");
      sentinel.setAttribute("aria-hidden", "true");
      sentinel.style.cssText = "position:absolute;top:40px;left:0;width:1px;height:1px;pointer-events:none";
      document.body.prepend(sentinel);
      new IntersectionObserver(
        ([e]) => hdr.classList.toggle("is-solid", !e.isIntersecting)
      ).observe(sentinel);
    } else {
      hdr.classList.add("is-solid");
    }
  }

  if (burger && mob) {
    burger.addEventListener("click", () => {
      const open = mob.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      mob.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("no-scroll", open);
    });
    $$("a", mob).forEach(a => a.addEventListener("click", () => {
      mob.classList.remove("is-open"); burger.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
    }));
  }
}

/* Reveals an element when it scrolls into view. A rect-based sweep runs alongside
   the observer so nothing can ever stay stuck at opacity 0: if the observer never
   fires (background tab, restored session, no IntersectionObserver), the sweep
   still shows everything that is on screen. */
function onInView(els, reveal, opts = {}) {
  const list = Array.from(els).filter(Boolean);
  if (!list.length) return;
  const pending = new Set(list);
  const fire = (el) => { if (pending.delete(el)) reveal(el); };

  const inView = (el) => {
    const r = el.getBoundingClientRect();
    const h = window.innerHeight || document.documentElement.clientHeight;
    // anything at or above the fold counts: including content already scrolled past,
    // so a jump-scroll or a deep link can never leave a block stuck invisible
    return r.top < h * (1 - (opts.bottom === undefined ? 0.06 : opts.bottom));
  };
  const sweep = () => {
    pending.forEach(el => { if (inView(el)) fire(el); });
    if (!pending.size) detach();
  };
  const detach = () => {
    window.removeEventListener("scroll", sweep);
    window.removeEventListener("resize", sweep);
    window.removeEventListener("load", sweep);
    document.removeEventListener("visibilitychange", sweep);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { fire(e.target); io.unobserve(e.target); } });
    }, { threshold: opts.threshold || 0.12, rootMargin: opts.rootMargin || "0px 0px -8% 0px" });
    list.forEach(e => io.observe(e));
  }

  sweep();
  requestAnimationFrame(sweep);
  window.addEventListener("scroll", sweep, { passive: true });
  window.addEventListener("resize", sweep, { passive: true });
  window.addEventListener("load", sweep);
  document.addEventListener("visibilitychange", sweep);
  setTimeout(sweep, 400);
}

function initReveal() {
  onInView($$(".rv:not(.is-in), .rvm:not(.is-in)"), (el) => el.classList.add("is-in"));
  if (typeof initPolish === "function") initPolish();

  // Line-mask reveals inside the hero fire on load, not on scroll: they are already
  // in view, and waiting for an observer tick makes the first paint look broken.
  const hero = $(".hero") || $(".phero");
  const heroLines = hero ? $$(".rvl", hero) : [];
  heroLines.forEach((el, i) => {
    if (!el.style.getPropertyValue("--rvl-d")) el.style.setProperty("--rvl-d", (i * 0.09) + "s");
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    heroLines.forEach(el => el.classList.add("is-in"));
  }));

  // Everything else: reveal on scroll, staggered in document order within a block.
  const rest = $$(".rvl:not(.is-in)").filter(el => !heroLines.includes(el));
  onInView(rest, (el) => el.classList.add("is-in"));
}

function initCounters() {
  const els = $$("[data-count]");
  if (!els.length) return;
  const still = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const run = (el) => {
    const target = parseFloat(el.dataset.count), dec = (el.dataset.dec | 0);
    // reduced motion gets the number, not the count-up: no rAF, no waiting
    if (still) { el.textContent = target.toFixed(dec); return; }
    const dur = 1500, t0 = performance.now();
    let done = false;
    const step = (t) => {
      const p = Math.min(1, Math.max(0, (t - t0) / dur)), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step); else done = true;
    };
    requestAnimationFrame(step);
    // if rAF is throttled (hidden tab, reduced motion), still land on the real number
    setTimeout(() => { if (!done) el.textContent = target.toFixed(dec); }, dur + 200);
  };
  onInView(els, run, { threshold: .5, rootMargin: "0px", bottom: 0 });
}

function initProgressBars() {
  onInView($$(".prog i[data-w]"), (el) => { el.style.width = el.dataset.w + "%"; },
           { threshold: .4, rootMargin: "0px", bottom: 0 });
}

function initFAQ(root = document) {
  $$(".faq__q", root).forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq__i"), body = $(".faq__a", item), open = item.classList.contains("is-open");
      $$(".faq__i", root).forEach(i => {
        i.classList.remove("is-open");
        const b = $(".faq__a", i); if (b) b.style.maxHeight = null;
        const q = $(".faq__q", i); if (q) q.setAttribute("aria-expanded", "false");
      });
      if (!open) { item.classList.add("is-open"); body.style.maxHeight = body.scrollHeight + "px"; btn.setAttribute("aria-expanded", "true"); }
    });
  });
}

function initLightbox() {
  const lb = $("#lightbox"), img = $("#lbImg"), close = $("#lbClose");
  if (!lb) return;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lightbox]");
    if (b) { img.src = b.dataset.lightbox; img.alt = b.dataset.alt || ""; lb.classList.add("is-on"); document.body.classList.add("no-scroll"); }
  });
  const hide = () => { lb.classList.remove("is-on"); document.body.classList.remove("no-scroll"); };
  close && close.addEventListener("click", hide);
  lb.addEventListener("click", (e) => { if (e.target === lb) hide(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
}

let toastTimer;
function toast(msg) {
  const t = $("#toast"); if (!t) { alert(msg); return; }
  t.textContent = msg; t.classList.add("is-on");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("is-on"), 4200);
}

/* ==========================================================================
   Forms: validation + lead capture
   ========================================================================== */
const Validate = {
  required: (v) => v.trim().length > 0 || "This field is required.",
  name: (v) => (v.trim().length >= 2 && /^[A-Za-zÀ-ɏ .'-]+$/.test(v.trim())) || "Enter your full name.",
  phone: (v) => /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")) || "Enter a valid 10-digit mobile number.",
  email: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) || "Enter a valid email address.",
  date: (v) => {
    if (!v) return "Choose a preferred date.";
    const d = new Date(v + "T00:00:00"), today = new Date(); today.setHours(0, 0, 0, 0);
    return d >= today || "Choose today or a future date.";
  }
};

function fieldError(input, msg) {
  const f = input.closest(".field"); if (!f) return;
  f.classList.toggle("has-error", !!msg);
  const e = $(".err", f); if (e) e.textContent = msg || "";
}

function bindForm(formSel, opts = {}) {
  const form = $(formSel); if (!form) return;
  const rules = opts.rules || {};

  $$("input,select,textarea", form).forEach(inp => {
    inp.addEventListener("input", () => fieldError(inp, ""));
    inp.addEventListener("blur", () => {
      const rule = rules[inp.name]; if (!rule || !inp.value) return;
      const r = rule(inp.value); fieldError(inp, r === true ? "" : r);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true, firstBad = null;
    Object.keys(rules).forEach(nm => {
      const inp = form.elements[nm]; if (!inp) return;
      const r = rules[nm](inp.value || "");
      if (r !== true) { ok = false; fieldError(inp, r); if (!firstBad) firstBad = inp; } else fieldError(inp, "");
    });
    if (!ok) { firstBad && firstBad.focus(); toast("Please correct the highlighted fields."); return; }

    const data = {};
    new FormData(form).forEach((v, k) => { data[k] = String(v).trim(); });

    const id = Store.addLead({
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      project: data.project || opts.project || "General Enquiry",
      type: opts.type || "Enquiry",
      visitDate: data.date || "",
      visitTime: data.time || "",
      requirement: data.requirement || "",
      message: data.message || ""
    });

    const btn = $("button[type=submit]", form);
    if (btn) { btn.disabled = true; btn.dataset.old = btn.textContent; btn.textContent = "Sending…"; }

    setTimeout(() => {
      form.style.display = "none";
      const ok2 = $(opts.success || ".ok", form.parentElement) || $(opts.success || ".ok");
      if (ok2) {
        const ref = $("[data-ref]", ok2); if (ref) ref.textContent = id;
        ok2.classList.add("is-on");
        ok2.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast(`Request received. Your reference is ${id}.`);
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.old; }
      form.reset();
    }, 550);
  });
}

/* ==========================================================================
   PDF generation: brochures and floor plans, built in the browser
   ========================================================================== */
const PDF = {
  clean(s) {
    return String(s)
      .replace(/₹/g, "Rs. ").replace(/[—–]/g, "-").replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"').replace(/×/g, "x").replace(/…/g, "...")
      .replace(/[^\x20-\x7E]/g, "");
  },
  escape(s) { return this.clean(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); },
  wrap(text, max) {
    const words = this.clean(text).split(/\s+/), lines = []; let line = "";
    words.forEach(w => {
      if ((line + " " + w).trim().length > max) { if (line) lines.push(line); line = w; }
      else line = (line ? line + " " : "") + w;
    });
    if (line) lines.push(line);
    return lines;
  },

  /* blocks: [{s:'h1'|'h2'|'p'|'kv'|'rule'|'space', t, v}] */
  build(blocks, meta) {
    const W = 595, H = 842, ML = 56, MR = 56, top = 800, bottom = 64;
    const pages = []; let cur = [], y = top;

    const push = (str) => cur.push(str);
    const newPage = () => { pages.push(cur); cur = []; y = top; };

    blocks.forEach(b => {
      const need = { h1: 44, h2: 30, p: 15, kv: 17, rule: 16, space: 12 }[b.s] || 15;
      if (y - need < bottom) newPage();
      if (b.s === "h1") {
        push(`BT /F2 22 Tf 1 1 1 rg ${ML} ${y - 22} Td (${this.escape(b.t)}) Tj ET`);
        y -= 40;
      } else if (b.s === "h2") {
        push(`BT /F3 8 Tf .62 .62 .6 rg ${ML} ${y - 10} Td (${this.escape(b.t.toUpperCase())}) Tj ET`);
        y -= 22;
      } else if (b.s === "rule") {
        push(`0.35 w .45 .45 .44 RG ${ML} ${y} m ${W - MR} ${y} l S`);
        y -= 16;
      } else if (b.s === "space") {
        y -= 12;
      } else if (b.s === "kv") {
        push(`BT /F3 9 Tf .62 .62 .6 rg ${ML} ${y - 9} Td (${this.escape(b.t)}) Tj ET`);
        push(`BT /F1 10 Tf 1 1 1 rg ${ML + 170} ${y - 9} Td (${this.escape(b.v)}) Tj ET`);
        y -= 17;
      } else {
        this.wrap(b.t, 92).forEach(ln => {
          if (y - 15 < bottom) { newPage(); }
          push(`BT /F1 10 Tf .92 .92 .9 rg ${ML} ${y - 10} Td (${this.escape(ln)}) Tj ET`);
          y -= 14.5;
        });
        y -= 5;
      }
    });
    pages.push(cur);

    /* page background + footer on each page */
    const contents = pages.map((ops, i) => {
      const bg = `0.039 0.039 0.039 rg 0 0 ${W} ${H} re f`;
      const foot = `BT /F3 7.5 Tf .5 .5 .49 rg ${ML} 40 Td (${this.escape(meta.footer)}) Tj ET` +
                   `BT /F3 7.5 Tf .5 .5 .49 rg ${W - MR - 40} 40 Td (Page ${i + 1} / ${pages.length}) Tj ET`;
      const brand = `BT /F2 9 Tf .69 .55 .34 rg ${ML} ${H - 42} Td (RADHE HOMES) Tj ET`;
      return [bg, brand, ...ops, foot].join("\n");
    });

    /* assemble PDF objects */
    const objs = [];
    const nPages = contents.length;
    const kids = [];
    let objNum = 3 + 3; /* 1 catalog, 2 pages, 3,4,5 fonts */
    const pageObjNums = [], contentObjNums = [];
    for (let i = 0; i < nPages; i++) { pageObjNums.push(objNum++); contentObjNums.push(objNum++); }

    objs[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
    objs[2] = `<< /Type /Pages /Kids [${pageObjNums.map(n => n + " 0 R").join(" ")}] /Count ${nPages} >>`;
    objs[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;
    objs[4] = `<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>`;
    objs[5] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`;
    for (let i = 0; i < nPages; i++) {
      objs[pageObjNums[i]] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentObjNums[i]} 0 R >>`;
      objs[contentObjNums[i]] = `<< /Length ${contents[i].length} >>\nstream\n${contents[i]}\nendstream`;
    }

    let out = "%PDF-1.4\n";
    const offsets = [];
    for (let i = 1; i < objs.length; i++) {
      offsets[i] = out.length;
      out += `${i} 0 obj\n${objs[i]}\nendobj\n`;
    }
    const xref = out.length;
    out += `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < objs.length; i++) out += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    out += `trailer\n<< /Size ${objs.length} /Root 1 0 R /Info << /Title (${this.escape(meta.title)}) /Author (Radhe Homes) >> >>\nstartxref\n${xref}\n%%EOF`;
    return out;
  },

  download(filename, blocks, meta) {
    const pdf = this.build(blocks, meta);
    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1200);
  }
};

function downloadBrochure(p) {
  const c = RR.company;
  const b = [
    { s: "h1", t: p.name },
    { s: "p", t: `${p.type} · ${p.location}` },
    { s: "rule" },
    { s: "h2", t: "Overview" },
    ...(p.overview || [p.summary]).map(t => ({ s: "p", t })),
    { s: "h2", t: "Project Highlights" },
    { s: "kv", t: "Total Project Area", v: p.highlights.totalArea },
    { s: "kv", t: "Buildings", v: p.highlights.buildings },
    { s: "kv", t: "Total Units", v: p.highlights.units },
    { s: "kv", t: "Configurations", v: p.highlights.configs },
    { s: "kv", t: "Floors", v: p.highlights.floors },
    { s: "kv", t: "Parking", v: p.highlights.parking },
    { s: "kv", t: "Possession", v: p.highlights.possession },
    { s: "kv", t: "Project Status", v: p.highlights.status },
    { s: "space" },
    { s: "h2", t: "Pricing" },
    ...p.pricing.map(r => ({ s: "kv", t: `${r.unit} (${r.area})`, v: `${r.price} · ${r.availability}` })),
    { s: "space" },
    { s: "h2", t: "Unit Plans" },
    ...p.floorPlans.map(f => ({ s: "kv", t: f.unit, v: `${f.carpet}, ${f.bedrooms} Bed, ${f.bathrooms} Bath, ${f.parking}` })),
    { s: "space" },
    { s: "h2", t: "Amenities" },
    { s: "p", t: p.amenities.join(", ") },
    { s: "h2", t: "Location Advantage" },
    ...p.nearby.map(n => ({ s: "kv", t: n.time, v: n.place })),
    { s: "space" },
    { s: "h2", t: "Contact" },
    { s: "kv", t: "Phone", v: c.phone },
    { s: "kv", t: "Email", v: c.email },
    { s: "kv", t: "Office", v: c.address },
    { s: "kv", t: "RERA", v: c.rera },
    { s: "space" },
    { s: "p", t: "This brochure is indicative. Pricing, availability, specifications and possession dates are subject to change. Please refer to the registered agreement and the RERA-registered project details for binding information." }
  ];
  PDF.download(`${p.id}-brochure.pdf`, b, { title: `${p.name} · Brochure`, footer: `${c.name}   ${c.phone}   ${c.email}` });
  toast(`Brochure downloading: ${p.name}.`);
}

function downloadFloorPlan(p, plan) {
  const c = RR.company;
  const b = [
    { s: "h1", t: `${p.name} · ${plan.unit}` },
    { s: "p", t: `${p.type} · ${p.location}` },
    { s: "rule" },
    { s: "h2", t: "Unit Details" },
    { s: "kv", t: "Unit Type", v: plan.unit },
    { s: "kv", t: "Carpet Area", v: plan.carpet },
    { s: "kv", t: "Bedrooms", v: String(plan.bedrooms) },
    { s: "kv", t: "Bathrooms", v: String(plan.bathrooms) },
    { s: "kv", t: "Balcony", v: String(plan.balcony) },
    { s: "kv", t: "Parking", v: plan.parking },
    { s: "space" },
    { s: "h2", t: "Project Context" },
    { s: "kv", t: "Configurations", v: p.highlights.configs },
    { s: "kv", t: "Floors", v: p.highlights.floors },
    { s: "kv", t: "Possession", v: p.highlights.possession },
    { s: "kv", t: "Status", v: p.highlights.status },
    { s: "space" },
    { s: "h2", t: "Enquiries" },
    { s: "kv", t: "Phone", v: c.phone },
    { s: "kv", t: "Email", v: c.email },
    { s: "space" },
    { s: "p", t: "Dimensions shown are indicative and measured to the carpet area definition under RERA. Furniture layouts are illustrative only." }
  ];
  PDF.download(`${p.id}-${plan.unit.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`, b,
    { title: `${p.name} · ${plan.unit}`, footer: `${c.name} · ${c.phone}` });
  toast(`Floor plan downloading: ${plan.unit}.`);
}

/* ==========================================================================
   Shared renderers
   ========================================================================== */
function projectCard(p) {
  const isUp = p.status === "upcoming";
  return `
  <article class="pcard rv">
    <a class="pcard__media" href="project.html?id=${p.id}" aria-label="${esc(p.name)}">
      <span class="badge badge--${p.status} pcard__badge"><i></i>${statusLabel[p.status]}</span>
      <img src="${p.image}" alt="${esc(p.name)}, ${esc(p.location)}" loading="lazy">
    </a>
    <div class="pcard__body">
      <div class="pcard__meta"><span>${esc(p.location)}</span><span>${esc(p.category)}</span></div>
      <h3 class="h3"><a href="project.html?id=${p.id}">${esc(p.name)}</a></h3>
      <p class="body-sm" style="margin:0">${esc(p.tagline)}</p>
      <div class="pcard__meta" style="color:var(--muted-2)">
        <span>${esc(p.config)}</span><span>${esc(p.area)}</span>
      </div>
      ${p.status === "ongoing" ? `
        <div style="margin-top:4px">
          <div class="prog"><i data-w="${p.progress}"></i></div>
          <div class="pcard__meta" style="margin-top:9px;color:var(--muted-2)">
            <span>${p.progress}% complete</span><span>${esc(p.stage)}</span>
          </div>
        </div>` : ""}
      <div class="pcard__foot">
        <div class="price">
          <small>${isUp ? "Launch" : p.status === "completed" ? "Completed" : "Starting from"}</small>
          <b>${esc(isUp ? (p.launch || "Announcing soon") : p.status === "completed" ? p.completionYear : p.priceFrom)}</b>
        </div>
        <a class="link-u" href="project.html?id=${p.id}">${isUp ? "Register Interest" : "View Project"} ${arrow}</a>
      </div>
    </div>
  </article>`;
}

function amenityTile(name) {
  return `<div>${icon(RR.amenityIcons[name] || "home")}<span>${esc(name)}</span></div>`;
}

function faqHTML(list) {
  return list.map((f, i) => `
    <div class="faq__i">
      <button class="faq__q" aria-expanded="false" aria-controls="faq-${i}"><span>${esc(f.q)}</span><i></i></button>
      <div class="faq__a" id="faq-${i}"><p>${esc(f.a)}</p></div>
    </div>`).join("");
}

/* ---------- Surface polish ----------
   A single fixed grain layer, magnetic pull on primary buttons and a small
   pointer tilt on project cards. All of it is transform-only, driven straight
   from pointer events into custom properties, and skipped entirely for
   coarse pointers and reduced-motion users. */
function initPolish() {
  const fine = matchMedia("(pointer:fine)").matches;
  const still = matchMedia("(prefers-reduced-motion:reduce)").matches;

  if (!still && !$(".grain")) {
    const g = document.createElement("div");
    g.className = "grain";
    g.setAttribute("aria-hidden", "true");
    document.body.appendChild(g);
  }
  if (!fine || still) return;

  $$(".btn--solid, .btn--ghost").forEach(btn => {
    if (btn.dataset.mag) return;
    btn.dataset.mag = "1";
    let frame = 0;
    const set = (x, y) => {
      btn.style.setProperty("--mx", x.toFixed(2) + "px");
      btn.style.setProperty("--my", y.toFixed(2) + "px");
    };
    btn.addEventListener("pointermove", (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = btn.getBoundingClientRect();
        set((e.clientX - (r.left + r.width / 2)) * 0.22,
            (e.clientY - (r.top + r.height / 2)) * 0.3);
      });
    });
    btn.addEventListener("pointerenter", () => btn.classList.add("is-mag"));
    btn.addEventListener("pointerleave", () => {
      btn.classList.remove("is-mag");
      cancelAnimationFrame(frame); frame = 0;
      set(0, 0);
    });
  });

  $$(".pcard").forEach(card => {
    if (card.classList.contains("is-tilt")) return;
    card.classList.add("is-tilt");
    let frame = 0;
    card.addEventListener("pointermove", (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--ty", (((e.clientX - r.left) / r.width - .5) * 3.4).toFixed(2) + "deg");
        card.style.setProperty("--tx", (((e.clientY - r.top) / r.height - .5) * -2.6).toFixed(2) + "deg");
      });
    });
    card.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame); frame = 0;
      card.style.setProperty("--tx", "0deg");
      card.style.setProperty("--ty", "0deg");
    });
  });
}

/* ---------- boot ---------- */
function boot(active) {
  renderChrome(active);
  initHeader(); initReveal(); initCounters(); initProgressBars(); initLightbox();
  initPolish();
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
}

/* ==========================================================================
   project.html?id=…: full project detail page
   ========================================================================== */
(function () {
  boot("projects");

  const root = $("#pRoot");
  const id = new URLSearchParams(location.search).get("id");
  const p = id ? Store.project(id) : null;

  if (!p) {
    document.title = "Project not found: Skyline Homes";
    root.innerHTML = `
      <section class="section" style="padding-top:180px">
        <div class="wrap" style="text-align:center">
          <p class="eyebrow">404</p>
          <h1 class="display" style="margin:18px 0 20px">That project <span class="it">isn&rsquo;t here.</span></h1>
          <p class="body-sm" style="margin:0 auto 30px">The project you asked for may have been renamed or removed. Browse the full portfolio instead.</p>
          <a class="btn btn--solid" href="projects.html">View all projects</a>
        </div>
      </section>`;
    return;
  }

  document.title = `${p.name} · ${p.location} | Skyline Homes`;
  const meta = $('meta[name="description"]');
  if (meta) meta.setAttribute("content", `${p.name}, ${p.location}. ${p.tagline}. ${p.config}, ${p.area}. ${statusLabel[p.status]}: possession ${p.possession || "to be announced"}.`);

  const isUp = p.status === "upcoming";
  const isOn = p.status === "ongoing";
  const c = RR.company;
  const stageIdx = p.timeline.indexOf(p.stage);

  const heroFacts = [
    ["Location", p.location],
    ["Project Type", p.type],
    [isUp ? "Expected Launch" : "Starting Price", isUp ? (p.launch || "Announcing soon") : p.priceFrom],
    ["Project Status", isOn ? `${p.progress}% Complete` : statusLabel[p.status]],
    ["Possession", p.possession || "-"]
  ];

  const hl = p.highlights;
  const hlRows = [
    ["Total Project Area", hl.totalArea], ["Buildings", hl.buildings],
    ["Units", hl.units], ["Configurations", hl.configs],
    ["Floors", hl.floors], ["Parking", hl.parking],
    ["Possession", hl.possession], ["Project Status", hl.status]
  ];

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(p.location + ", " + p.name)}&output=embed`;

  root.innerHTML = `

  <!-- ========================= HERO ========================= -->
  <section class="phero">
    <div class="phero__media"><img src="${p.image}" alt="${esc(p.name)}, ${esc(p.location)}" fetchpriority="high"></div>
    <div class="wrap phero__in">
      <nav class="crumb label" aria-label="Breadcrumb">
        <a href="index.html">Home</a> <span>/</span>
        <a href="projects.html">Projects</a> <span>/</span>
        <span style="color:var(--paper)">${esc(p.name)}</span>
      </nav>
      <span class="badge badge--${p.status}"><i></i>${statusLabel[p.status]}</span>
      <h1 class="display" style="margin:18px 0 14px">${esc(p.name)}</h1>
      <p class="lead" style="max-width:46ch;margin:0 0 30px">${esc(p.tagline)}</p>
      <div class="hero__cta" style="margin-bottom:34px">
        <a class="btn btn--solid" href="site-visit.html?project=${encodeURIComponent(p.name)}">Book a Site Visit</a>
        <button class="btn btn--ghost" type="button" id="brochureBtn">Download Brochure</button>
      </div>
      <div class="kv">
        ${heroFacts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
      </div>
    </div>
  </section>

  <!-- ========================= OVERVIEW ========================= -->
  <section class="section" id="overview">
    <div class="wrap">
      <div class="shead">
        <div class="shead__l">
          <h2 class="h3 rv" style="margin:0">${esc(p.summary)}</h2>
        </div>
      </div>
      <div class="f2 rv" style="gap:clamp(24px,4vw,64px)">
        <div style="display:grid;gap:18px">
          ${p.overview.slice(0, Math.ceil(p.overview.length / 2)).map(t => `<p class="body-sm" style="margin:0">${esc(t)}</p>`).join("")}
        </div>
        <div style="display:grid;gap:18px">
          ${p.overview.slice(Math.ceil(p.overview.length / 2)).map(t => `<p class="body-sm" style="margin:0">${esc(t)}</p>`).join("")}
          <p class="formnote" style="margin:0">RERA Registration ${esc(c.rera)}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================= HIGHLIGHTS ========================= -->
  <section class="section section--tight" id="highlights">
    <div class="wrap">
      <div class="shead">
        <div class="shead__l">
          <h2 class="h3" style="margin:14px 0 0">The numbers behind ${esc(p.name)}</h2>
        </div>
      </div>
      <div class="kv kv--hl rv">
        ${hlRows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
      </div>
    </div>
  </section>

  <!-- ========================= AMENITIES ========================= -->
  <section class="section" id="amenities">
    <div class="wrap">
      <div class="shead">
        <div class="shead__l">
          <h2 class="h2" style="margin:16px 0 0">Built for the way <span class="it">people actually live.</span></h2>
        </div>
        <a class="link-u" href="site-visit.html?project=${encodeURIComponent(p.name)}">See them on site ${arrow}</a>
      </div>
      <div class="amen rv">${p.amenities.map(amenityTile).join("")}</div>
    </div>
  </section>

  <!-- ========================= FLOOR PLANS ========================= -->
  <section class="section section--tight" id="floor-plans">
    <div class="wrap">
      <div class="shead">
        <div class="shead__l">
          <h2 class="h3" style="margin:0">Unit types and layouts</h2>
        </div>
      </div>
      <div class="pgrid rv" id="planGrid">
        ${p.floorPlans.map((f, i) => `
          <article class="panel">
            <p class="label" style="margin:0 0 10px">Type 0${i + 1}</p>
            <h3 class="h4" style="margin:0 0 20px">${esc(f.unit)}</h3>
            <dl class="kv" style="grid-template-columns:1fr 1fr">
              <div><dt>Carpet Area</dt><dd>${esc(f.carpet)}</dd></div>
              <div><dt>Bedrooms</dt><dd>${esc(String(f.bedrooms))}</dd></div>
              <div><dt>Bathrooms</dt><dd>${esc(String(f.bathrooms))}</dd></div>
              <div><dt>Balcony</dt><dd>${esc(String(f.balcony))}</dd></div>
              <div><dt>Parking</dt><dd>${esc(f.parking)}</dd></div>
              <div><dt>Configuration</dt><dd>${esc(f.bedrooms)} BHK</dd></div>
            </dl>
            <button class="btn btn--ghost btn--sm btn--block" type="button" data-plan="${i}" style="margin-top:20px">Download Floor Plan</button>
          </article>`).join("")}
      </div>
    </div>
  </section>

  <!-- ========================= PRICING ========================= -->
  <section class="section" id="pricing">
    <div class="wrap">
      <div class="shead">
        <div class="shead__l">
          <h2 class="h2" style="margin:16px 0 0">Transparent pricing, <span class="it">no hidden loading.</span></h2>
        </div>
        <a class="link-u" href="contact.html">Request a cost sheet ${arrow}</a>
      </div>
      <div class="tblwrap rv">
        <table class="tbl">
          <thead><tr>
            <th>Unit Type</th><th>Area</th><th>Starting Price</th><th>Availability</th><th>Payment Plan</th><th class="t-r">Enquire</th>
          </tr></thead>
          <tbody>
            ${p.pricing.map(r => `
              <tr>
                <td>${esc(r.unit)}</td>
                <td class="tnum">${esc(r.area)}</td>
                <td class="tnum" style="font-family:var(--serif);font-size:1.05rem">${esc(r.price)}</td>
                <td><span class="chip">${esc(r.availability)}</span></td>
                <td class="tnum">${esc(r.plan)}</td>
                <td class="t-r">
                  ${/sold/i.test(r.availability)
                    ? `<span class="body-sm" style="color:var(--muted-2)">Sold out</span>`
                    : `<a class="link-u" href="#enquire" data-unit="${esc(r.unit)}">Enquire ${arrow}</a>`}
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="formnote" style="margin-top:16px">Prices are indicative starting prices, exclusive of GST, stamp duty and registration. Payment plan shown as booking : construction : possession.</p>
    </div>
  </section>

  <!-- ========================= LOCATION ========================= -->
  <section class="section section--tight" id="location">
    <div class="wrap">
      <div class="shead">
        <div class="shead__l">
          <h2 class="h2" style="margin:16px 0 0">${esc(p.location)}</h2>
        </div>
        <a class="link-u" href="https://www.google.com/maps/search/${encodeURIComponent(p.name + ", " + p.location)}" target="_blank" rel="noopener">Open in Google Maps ${arrow}</a>
      </div>
      <div class="f2 rv" style="gap:clamp(22px,3vw,40px);align-items:start">
        <iframe class="map" src="${mapSrc}" title="Map of ${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        <div class="tblwrap">
          <table class="tbl">
            <thead><tr><th>Drive Time</th><th>Landmark</th></tr></thead>
            <tbody>
              ${p.nearby.map(n => `<tr><td class="tnum" style="font-family:var(--serif);font-size:1.05rem;color:var(--brass)">${esc(n.time)}</td><td>${esc(n.place)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  ${isOn ? `
  <!-- ========================= CONSTRUCTION PROGRESS ========================= -->
  <section class="section" id="progress">
    <div class="wrap">
      <div class="shead">
        <div class="shead__l">
          <p class="eyebrow">Construction Progress</p>
          <h2 class="h2" style="margin:16px 0 0">Construction status: <span class="it">${p.progress}% completed.</span></h2>
        </div>
        <div style="text-align:right">
          <p class="label" style="margin:0 0 6px">Current stage</p>
          <p class="h4" style="margin:0">${esc(p.stage)}</p>
        </div>
      </div>

      <div class="panel rv">
        <div class="prog"><i data-w="${p.progress}"></i></div>
        <div class="timeline">
          ${p.timeline.map((s, i) => `<div class="${i <= stageIdx ? "is-done" : ""}">${esc(s)}</div>`).join("")}
        </div>
        <div style="display:grid;gap:0;margin-top:34px;border-top:1px solid var(--line)">
          ${p.updates.map(u => `
            <div style="display:flex;gap:22px;padding:18px 0;border-bottom:1px solid var(--line-2);flex-wrap:wrap">
              <span class="label" style="min-width:120px">${fmtDate(u.date)}</span>
              <span class="body-sm" style="margin:0;flex:1;min-width:220px">${esc(u.note)}</span>
            </div>`).join("")}
        </div>
      </div>

      <div class="gal rv" style="margin-top:22px">
        ${["img/con-1.jpg", "img/con-2.jpg", "img/con-3.jpg", "img/con-4.jpg"].map(src =>
          `<button type="button" data-lightbox="${src}"><img src="${src}" alt="Construction progress at ${esc(p.name)}" loading="lazy"></button>`).join("")}
      </div>
    </div>
  </section>` : ""}

  <!-- ========================= GALLERY ========================= -->
  <section class="section section--tight" id="gallery">
    <div class="wrap">
      <div class="shead">
        <div class="shead__l">
          <h2 class="h3" style="margin:0">Elevation, interiors, amenities and site</h2>
        </div>
      </div>
      <div class="gal rv">
        ${p.gallery.map(src => `<button type="button" data-lightbox="${src}"><img src="${src}" alt="${esc(p.name)} gallery image" loading="lazy"></button>`).join("")}
      </div>
      <div class="panel rv" style="margin-top:22px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap">
        <div>
          <p class="label" style="margin:0 0 8px">Video</p>
          <p class="h4" style="margin:0">${esc(p.video)}</p>
        </div>
        <button class="btn btn--ghost btn--sm" type="button" id="videoBtn">Request the walkthrough</button>
      </div>
    </div>
  </section>

  <!-- ========================= ENQUIRE ========================= -->
  <section class="section" id="enquire">
    <div class="wrap">
      <div class="f2" style="gap:clamp(28px,5vw,80px);align-items:start">
        <div>
          <h2 class="h2" style="margin:16px 0 20px">Interested in <span class="it">${esc(p.name)}?</span></h2>
          <p class="body-sm">Send your details and a project manager: not a call centre: will get back to you within one working day with availability, the full cost sheet and a site visit slot.</p>
          <div class="hero__cta" style="margin-top:26px">
            <a class="btn btn--brass btn--sm" href="${waLink("Hi, I would like details about " + p.name + ".")}" target="_blank" rel="noopener">WhatsApp us</a>
            <a class="btn btn--ghost btn--sm" href="${telLink()}">${esc(c.phone)}</a>
          </div>
        </div>

        <div>
          <form class="form" id="pForm" novalidate>
            <div class="field">
              <label for="e-name">Full Name</label>
              <input id="e-name" name="name" type="text" autocomplete="name" placeholder="Your name">
              <span class="err"></span>
            </div>
            <div class="f2">
              <div class="field">
                <label for="e-phone">Mobile Number</label>
                <input id="e-phone" name="phone" type="tel" autocomplete="tel" placeholder="10-digit mobile">
                <span class="err"></span>
              </div>
              <div class="field">
                <label for="e-email">Email</label>
                <input id="e-email" name="email" type="email" autocomplete="email" placeholder="you@example.com">
                <span class="err"></span>
              </div>
            </div>
            <div class="field">
              <label for="e-unit">Unit Interested In</label>
              <select id="e-unit" name="requirement">
                <option value="">Select a unit type</option>
                ${p.pricing.map(r => `<option value="${esc(r.unit)}">${esc(r.unit)} (${esc(r.area)}) ${esc(r.price)}</option>`).join("")}
                <option value="Not sure yet">Not sure yet</option>
              </select>
              <span class="err"></span>
            </div>
            <div class="field">
              <label for="e-msg">Message</label>
              <textarea id="e-msg" name="message" placeholder="Anything specific you would like to know?"></textarea>
              <span class="err"></span>
            </div>
            <input type="hidden" name="project" value="${esc(p.name)}">
            <button class="btn btn--solid btn--block" type="submit">Send Enquiry</button>
            <p class="formnote">By submitting you agree to be contacted about ${esc(p.name)}. We never share your details.</p>
          </form>

          <div class="ok" id="pOk">
            <h3 class="h4" style="margin:0 0 12px">Thank you: we have your enquiry.</h3>
            <p class="body-sm" style="margin:0 0 18px">Your reference number is <b class="tnum" data-ref style="color:var(--brass)"></b>. A project manager will call you within one working day.</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <button class="btn btn--ghost btn--sm" type="button" id="brochureBtn2">Download Brochure</button>
              <a class="btn btn--ghost btn--sm" href="projects.html">Browse other projects</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================= RELATED ========================= -->
  <section class="section section--tight" id="related">
    <div class="wrap">
      <div class="shead">
        <div class="shead__l">
          <h2 class="h3" style="margin:0">Other developments you may like</h2>
        </div>
        <a class="link-u" href="projects.html">All projects ${arrow}</a>
      </div>
      <div class="pgrid" id="relatedGrid"></div>
    </div>
  </section>`;

  /* ---------- related projects ---------- */
  const related = Store.projects()
    .filter(x => x.id !== p.id)
    .sort((a, b) => (b.category === p.category) - (a.category === p.category))
    .slice(0, 3);
  $("#relatedGrid").innerHTML = related.map(projectCard).join("");

  /* ---------- downloads ---------- */
  $("#brochureBtn").addEventListener("click", () => downloadBrochure(p));
  const b2 = $("#brochureBtn2"); if (b2) b2.addEventListener("click", () => downloadBrochure(p));

  $("#planGrid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-plan]"); if (!b) return;
    downloadFloorPlan(p, p.floorPlans[+b.dataset.plan]);
  });

  /* ---------- pricing-row → enquiry form ---------- */
  $$("[data-unit]").forEach(a => a.addEventListener("click", () => {
    const sel = $("#e-unit");
    const opt = $$("option", sel).find(o => o.value === a.dataset.unit);
    if (opt) sel.value = opt.value;
    setTimeout(() => $("#e-name").focus(), 500);
  }));

  /* ---------- video request ---------- */
  $("#videoBtn").addEventListener("click", () => {
    window.open(waLink(`Hi, please share the walkthrough video for ${p.name}.`), "_blank", "noopener");
    toast("Opening WhatsApp: we will send the walkthrough link.");
  });

  /* ---------- enquiry form ---------- */
  bindForm("#pForm", {
    success: "#pOk",
    type: "Project Enquiry",
    project: p.name,
    rules: {
      name: Validate.name,
      phone: Validate.phone,
      email: Validate.email
    }
  });

  initReveal(); initProgressBars(); initLightbox();
})();

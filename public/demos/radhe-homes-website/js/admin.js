/* ==========================================================================
   admin.js: project CMS + lead CRM, backed by Store (localStorage)
   ========================================================================== */
(function () {

  /* ---------- auth guard ---------- */
  if (!Store.session()) { location.replace("admin-login.html"); return; }

  const LEAD_STATUSES = ["New", "Contacted", "Site Visit", "Interested", "Booked", "Closed"];
  const view = $("#view");
  const modal = $("#modal");
  const modalBox = $("#modalBox");

  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- modal plumbing ---------- */
  function openModal(html) {
    modalBox.innerHTML = html;
    modal.classList.add("is-on");
    document.body.classList.add("no-scroll");
    const f = $("input,select,textarea,button", modalBox); if (f) f.focus();
  }
  function closeModal() {
    modal.classList.remove("is-on");
    document.body.classList.remove("no-scroll");
    modalBox.innerHTML = "";
  }
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-on")) closeModal(); });

  function confirmBox(title, body, okLabel, onOk) {
    openModal(`
      <p class="eyebrow" style="margin:0 0 12px">Confirm</p>
      <h3 class="h3" style="margin:0 0 14px">${esc(title)}</h3>
      <p class="body-sm" style="margin:0 0 26px">${esc(body)}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">
        <button class="btn btn--ghost btn--sm" type="button" data-x>Cancel</button>
        <button class="btn btn--solid btn--sm" type="button" id="confirmOk">${esc(okLabel)}</button>
      </div>`);
    $("#confirmOk").addEventListener("click", () => { closeModal(); onOk(); });
  }

  modalBox.addEventListener("click", (e) => { if (e.target.closest("[data-x]")) closeModal(); });

  /* ==========================================================================
     DASHBOARD
     ========================================================================== */
  function renderDash() {
    const ps = Store.projects(), ls = Store.leads();
    const byStatus = (s) => ps.filter(p => p.status === s).length;
    const leadsBy = (s) => ls.filter(l => l.status === s).length;
    const week = ls.filter(l => (Date.now() - new Date(l.created).getTime()) < 7 * 864e5).length;
    const units = ps.reduce((n, p) => n + (parseInt(String(p.highlights.units).replace(/\D/g, ""), 10) || 0), 0);

    view.innerHTML = `
      <div class="adm__cards">
        <div class="acard"><b class="tnum">${ps.length}</b><p class="label" style="margin-top:12px">Projects</p></div>
        <div class="acard"><b class="tnum">${byStatus("ongoing")}</b><p class="label" style="margin-top:12px">Under construction</p></div>
        <div class="acard"><b class="tnum">${units}</b><p class="label" style="margin-top:12px">Units in portfolio</p></div>
        <div class="acard"><b class="tnum">${ls.length}</b><p class="label" style="margin-top:12px">Total leads</p></div>
        <div class="acard"><b class="tnum" style="color:var(--brass)">${week}</b><p class="label" style="margin-top:12px">Leads this week</p></div>
      </div>

      <h2 class="h3" style="margin:44px 0 18px">Lead pipeline</h2>
      <div class="adm__cards adm__cards--six">
        ${LEAD_STATUSES.map(s => `
          <div class="acard" style="cursor:pointer" data-pipe="${s}">
            <b class="tnum">${leadsBy(s)}</b>
            <p class="label" style="margin-top:12px">${s}</p>
          </div>`).join("")}
      </div>

      <h2 class="h3" style="margin:44px 0 18px">Latest leads</h2>
      <div class="tblwrap">
        <table class="tbl">
          <thead><tr><th>Ref</th><th>Name</th><th>Project</th><th>Type</th><th>Received</th><th>Status</th></tr></thead>
          <tbody>
            ${ls.slice(0, 6).map(l => `
              <tr style="cursor:pointer" data-lead="${l.id}">
                <td class="tnum" style="color:var(--brass)">${esc(l.id)}</td>
                <td>${esc(l.name)}</td>
                <td>${esc(l.project)}</td>
                <td>${esc(l.type || "Enquiry")}</td>
                <td class="tnum">${fmtDate(l.created)}</td>
                <td><span class="chip">${esc(l.status)}</span></td>
              </tr>`).join("") || `<tr><td colspan="6" style="color:var(--muted-2)">No leads yet.</td></tr>`}
          </tbody>
        </table>
      </div>

      <h2 class="h3" style="margin:44px 0 18px">Construction progress</h2>
      <div style="display:grid;gap:0;border-top:1px solid var(--line)">
        ${ps.filter(p => p.status === "ongoing").map(p => `
          <div style="padding:20px 0;border-bottom:1px solid var(--line-2)">
            <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:12px">
              <b style="font-family:var(--serif);font-size:1.1rem;font-weight:400">${esc(p.name)}</b>
              <span class="label">${p.progress}% · ${esc(p.stage)}</span>
            </div>
            <div class="prog"><i style="width:${p.progress}%"></i></div>
          </div>`).join("")}
      </div>`;

    $$("[data-pipe]").forEach(el => el.addEventListener("click", () => go("leads", { status: el.dataset.pipe })));
    $$("[data-lead]").forEach(el => el.addEventListener("click", () => leadModal(el.dataset.lead)));
  }

  /* ==========================================================================
     PROJECTS
     ========================================================================== */
  let pFilter = "all";

  function renderProjects() {
    const ps = Store.projects().filter(p => pFilter === "all" || p.status === pFilter);
    view.innerHTML = `
      <div class="tabs" id="pf" style="margin-bottom:26px">
        ${["all", "ongoing", "completed", "upcoming"].map(s =>
          `<button class="tab ${pFilter === s ? "is-active" : ""}" data-s="${s}">${s === "all" ? "All" : statusLabel[s]}</button>`).join("")}
      </div>
      <div class="tblwrap">
        <table class="tbl">
          <thead><tr>
            <th>Project</th><th>Location</th><th>Type</th>
            <th>Starting Price</th><th>Progress</th><th>Possession</th><th>Status</th><th class="t-r">Actions</th>
          </tr></thead>
          <tbody>
            ${ps.map(p => `
              <tr>
                <td><a href="project.html?id=${p.id}" target="_blank" rel="noopener" style="text-decoration:none;border-bottom:1px solid var(--line-2)">${esc(p.name)}</a></td>
                <td>${esc(p.location)}</td>
                <td style="text-transform:capitalize">${esc(p.category)}</td>
                <td class="tnum">${esc(p.priceFrom)}</td>
                <td class="tnum">${p.status === "ongoing" ? p.progress + "% · " + esc(p.stage) : "-"}</td>
                <td class="tnum">${esc(p.possession || "-")}</td>
                <td><span class="chip">${statusLabel[p.status]}</span></td>
                <td class="t-r" style="white-space:nowrap">
                  <button class="btn btn--ghost btn--sm" type="button" data-edit="${p.id}">Edit</button>
                  <button class="btn btn--ghost btn--sm" type="button" data-del="${p.id}">Delete</button>
                </td>
              </tr>`).join("") || `<tr><td colspan="8" style="color:var(--muted-2)">No projects in this view.</td></tr>`}
          </tbody>
        </table>
      </div>`;

    $("#pf").addEventListener("click", (e) => {
      const b = e.target.closest(".tab"); if (!b) return;
      pFilter = b.dataset.s; renderProjects();
    });
    $$("[data-edit]").forEach(b => b.addEventListener("click", () => projectModal(b.dataset.edit)));
    $$("[data-del]").forEach(b => b.addEventListener("click", () => {
      const p = Store.project(b.dataset.del);
      confirmBox("Delete this project?", `“${p.name}” will be removed from the website. This cannot be undone.`, "Delete project", () => {
        Store.saveProjects(Store.projects().filter(x => x.id !== p.id));
        toast(`${p.name} deleted.`);
        renderProjects();
      });
    }));
  }

  const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function projectModal(id) {
    const p = id ? Store.project(id) : null;
    const g = (k, d) => (p ? (p[k] != null ? p[k] : d) : d);
    const h = (k, d) => (p && p.highlights ? (p.highlights[k] != null ? p.highlights[k] : d) : d);

    openModal(`
      <p class="eyebrow" style="margin:0 0 12px">${p ? "Edit project" : "Add project"}</p>
      <h3 class="h3" style="margin:0 0 26px">${p ? esc(p.name) : "New development"}</h3>
      <form class="form" id="pjForm" novalidate>
        <div class="f2">
          <div class="field"><label>Project Name</label><input name="name" value="${esc(g("name", ""))}"><span class="err"></span></div>
          <div class="field"><label>Location</label><input name="location" value="${esc(g("location", ""))}"><span class="err"></span></div>
        </div>
        <div class="f2">
          <div class="field"><label>Status</label>
            <select name="status">
              ${["ongoing", "completed", "upcoming"].map(s => `<option value="${s}" ${g("status", "ongoing") === s ? "selected" : ""}>${statusLabel[s]}</option>`).join("")}
            </select></div>
          <div class="field"><label>Category</label>
            <select name="category">
              ${["residential", "commercial"].map(s => `<option value="${s}" ${g("category", "residential") === s ? "selected" : ""}>${s[0].toUpperCase() + s.slice(1)}</option>`).join("")}
            </select></div>
        </div>
        <div class="f2">
          <div class="field"><label>Property Type</label><input name="type" value="${esc(g("type", "Residential Apartments"))}"></div>
          <div class="field"><label>Configuration</label><input name="config" value="${esc(g("config", "2 & 3 BHK"))}"></div>
        </div>
        <div class="f2">
          <div class="field"><label>Area Range</label><input name="area" value="${esc(g("area", ""))}"></div>
          <div class="field"><label>Starting Price</label><input name="priceFrom" value="${esc(g("priceFrom", ""))}"><span class="err"></span></div>
        </div>
        <div class="f2">
          <div class="field"><label>Construction Progress (%)</label><input name="progress" type="number" min="0" max="100" value="${g("progress", 0)}"><span class="err"></span></div>
          <div class="field"><label>Current Stage</label>
            <select name="stage">
              ${["Foundation", "Structure", "Brickwork", "Finishing", "Handover"].map(s => `<option ${g("stage", "Foundation") === s ? "selected" : ""}>${s}</option>`).join("")}
            </select></div>
        </div>
        <div class="f2">
          <div class="field"><label>Possession</label><input name="possession" value="${esc(g("possession", ""))}"></div>
          <div class="field"><label>Cover Image Path</label><input name="image" value="${esc(g("image", "img/ext-3.jpg"))}"></div>
        </div>
        <div class="field"><label>Tagline</label><input name="tagline" value="${esc(g("tagline", ""))}"></div>
        <div class="field"><label>Summary</label><textarea name="summary">${esc(g("summary", ""))}</textarea></div>
        <div class="f2">
          <div class="field"><label>Total Project Area</label><input name="h_totalArea" value="${esc(h("totalArea", ""))}"></div>
          <div class="field"><label>Buildings</label><input name="h_buildings" value="${esc(h("buildings", ""))}"></div>
        </div>
        <div class="f2">
          <div class="field"><label>Units</label><input name="h_units" value="${esc(h("units", ""))}"></div>
          <div class="field"><label>Floors</label><input name="h_floors" value="${esc(h("floors", ""))}"></div>
        </div>
        <div class="f2">
          <div class="field"><label>Parking</label><input name="h_parking" value="${esc(h("parking", ""))}"></div>
          <div class="field"><label>Amenities (comma separated)</label><input name="amenities" value="${esc((g("amenities", []) || []).join(", "))}"></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:8px">
          <button class="btn btn--ghost btn--sm" type="button" data-x>Cancel</button>
          <button class="btn btn--solid btn--sm" type="submit">${p ? "Save changes" : "Add project"}</button>
        </div>
      </form>`);

    const form = $("#pjForm");
    $$("input,select,textarea", form).forEach(i => i.addEventListener("input", () => fieldError(i, "")));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = {}; new FormData(form).forEach((v, k) => d[k] = String(v).trim());

      let ok = true;
      if (d.name.length < 3) { fieldError(form.elements.name, "Enter a project name."); ok = false; }
      if (!d.location) { fieldError(form.elements.location, "Enter a location."); ok = false; }
      if (!d.priceFrom) { fieldError(form.elements.priceFrom, "Enter a starting price."); ok = false; }
      const prog = Math.max(0, Math.min(100, parseInt(d.progress || "0", 10) || 0));
      if (String(d.progress) !== "" && isNaN(parseInt(d.progress, 10))) { fieldError(form.elements.progress, "Enter a number between 0 and 100."); ok = false; }
      if (!ok) { toast("Please correct the highlighted fields."); return; }

      const all = Store.projects();
      const amenities = d.amenities ? d.amenities.split(",").map(s => s.trim()).filter(Boolean) : [];

      if (p) {
        const i = all.findIndex(x => x.id === p.id);
        const next = Object.assign({}, all[i], {
          name: d.name, location: d.location, status: d.status, category: d.category,
          type: d.type, config: d.config, area: d.area, priceFrom: d.priceFrom,
          progress: prog, stage: d.stage, possession: d.possession, image: d.image,
          tagline: d.tagline, summary: d.summary,
          amenities: amenities.length ? amenities : all[i].amenities,
          highlights: Object.assign({}, all[i].highlights, {
            totalArea: d.h_totalArea, buildings: d.h_buildings, units: d.h_units,
            floors: d.h_floors, parking: d.h_parking, configs: d.config,
            possession: d.possession, status: d.status === "ongoing" ? prog + "% Complete" : statusLabel[d.status]
          })
        });
        all[i] = next;
        Store.saveProjects(all);
        toast(`${d.name} updated.`);
      } else {
        let id = slug(d.name) || "project";
        while (all.some(x => x.id === id)) id += "-1";
        all.unshift({
          id, name: d.name, status: d.status, category: d.category, location: d.location,
          type: d.type, config: d.config, area: d.area, priceFrom: d.priceFrom,
          progress: prog, stage: d.stage, possession: d.possession, launched: String(new Date().getFullYear()),
          image: d.image || "img/ext-3.jpg", tagline: d.tagline || d.name,
          summary: d.summary || `${d.name} is a new ${d.category} development at ${d.location}.`,
          overview: [d.summary || `${d.name} is a new ${d.category} development at ${d.location}.`],
          highlights: {
            totalArea: d.h_totalArea || "-", buildings: d.h_buildings || "-", units: d.h_units || "-",
            configs: d.config || "-", floors: d.h_floors || "-", parking: d.h_parking || "-",
            possession: d.possession || "-", status: d.status === "ongoing" ? prog + "% Complete" : statusLabel[d.status]
          },
          amenities: amenities.length ? amenities : ["Landscaped Garden", "Covered Parking", "24x7 Security", "Power Backup"],
          floorPlans: [{ unit: d.config || "Unit", carpet: d.area || "-", bedrooms: 2, bathrooms: 2, balcony: "2", parking: "1 Covered" }],
          pricing: [{ unit: d.config || "Unit", area: d.area || "-", price: d.priceFrom, availability: "Available", plan: "20 : 60 : 20" }],
          nearby: [{ time: "5 Min", place: "Main Road" }, { time: "10 Min", place: "School" }, { time: "15 Min", place: "Hospital" }],
          timeline: ["Foundation", "Structure", "Brickwork", "Finishing", "Handover"],
          updates: [{ date: new Date().toISOString().slice(0, 10), note: "Project added to the website." }],
          gallery: [d.image || "img/ext-3.jpg", "img/int-2.jpg", "img/am-1.jpg", "img/ext-5.jpg"],
          video: `Project introduction: ${d.name}`
        });
        Store.saveProjects(all);
        toast(`${d.name} added to the website.`);
      }
      closeModal();
      renderProjects();
    });
  }

  /* ==========================================================================
     LEADS
     ========================================================================== */
  let lFilter = "All", lQuery = "";

  function renderLeads() {
    const ls = Store.leads().filter(l =>
      (lFilter === "All" || l.status === lFilter) &&
      (!lQuery || [l.id, l.name, l.phone, l.email, l.project].join(" ").toLowerCase().includes(lQuery.toLowerCase()))
    );

    view.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;align-items:flex-end;margin-bottom:24px">
        <div class="tabs" id="lf">
          ${["All", ...LEAD_STATUSES].map(s => `<button class="tab ${lFilter === s ? "is-active" : ""}" data-s="${s}">${s}</button>`).join("")}
        </div>
        <div class="field" style="min-width:min(280px,100%)">
          <label for="lq">Search leads</label>
          <input id="lq" type="search" value="${esc(lQuery)}" placeholder="Name, phone, ref or project" autocomplete="off">
        </div>
      </div>

      <div class="tblwrap">
        <table class="tbl">
          <thead><tr>
            <th>Ref</th><th>Name</th><th>Contact</th><th>Interested Project</th>
            <th>Enquiry Date</th><th>Site Visit</th><th>Status</th><th class="t-r">Actions</th>
          </tr></thead>
          <tbody>
            ${ls.map(l => `
              <tr>
                <td class="tnum" style="color:var(--brass)">${esc(l.id)}</td>
                <td>${esc(l.name)}</td>
                <td style="white-space:nowrap">
                  <a class="link-u tnum" href="tel:${esc(String(l.phone).replace(/[^\d+]/g, ""))}">${esc(l.phone)}</a>
                  <a class="link-u" href="mailto:${esc(l.email)}" style="display:block;margin-top:5px;font-size:11px;color:var(--muted-2);text-transform:none;letter-spacing:0">${esc(l.email)}</a>
                </td>
                <td>${esc(l.project)}</td>
                <td class="tnum">${fmtDate(l.created)}</td>
                <td class="tnum">${l.visitDate ? fmtDate(l.visitDate) + (l.visitTime ? " · " + esc(l.visitTime) : "") : "-"}</td>
                <td>
                  <select class="chip" data-status="${l.id}" style="background:transparent;padding:5px 11px;cursor:pointer">
                    ${LEAD_STATUSES.map(s => `<option ${l.status === s ? "selected" : ""}>${s}</option>`).join("")}
                  </select>
                </td>
                <td class="t-r" style="white-space:nowrap">
                  <button class="btn btn--ghost btn--sm" type="button" data-open="${l.id}">Open</button>
                  <button class="btn btn--ghost btn--sm" type="button" data-dell="${l.id}">Delete</button>
                </td>
              </tr>`).join("") || `<tr><td colspan="8" style="color:var(--muted-2)">No leads match this view.</td></tr>`}
          </tbody>
        </table>
      </div>
      <p class="formnote" style="margin-top:16px">${ls.length} of ${Store.leads().length} leads shown. Change a lead&rsquo;s status inline, or open it for the full enquiry.</p>`;

    $("#lf").addEventListener("click", (e) => {
      const b = e.target.closest(".tab"); if (!b) return;
      lFilter = b.dataset.s; renderLeads();
    });

    let t;
    $("#lq").addEventListener("input", (e) => {
      clearTimeout(t);
      const v = e.target.value;
      t = setTimeout(() => { lQuery = v; renderLeads(); const i = $("#lq"); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } }, 220);
    });

    $$("[data-status]").forEach(sel => sel.addEventListener("change", () => {
      const all = Store.leads();
      const i = all.findIndex(x => x.id === sel.dataset.status);
      all[i].status = sel.value;
      Store.saveLeads(all);
      toast(`${all[i].name} moved to “${sel.value}”.`);
      if (lFilter !== "All") renderLeads();
    }));

    $$("[data-open]").forEach(b => b.addEventListener("click", () => leadModal(b.dataset.open)));
    $$("[data-dell]").forEach(b => b.addEventListener("click", () => {
      const l = Store.leads().find(x => x.id === b.dataset.dell);
      confirmBox("Delete this lead?", `Enquiry ${l.id} from ${l.name} will be permanently removed.`, "Delete lead", () => {
        Store.saveLeads(Store.leads().filter(x => x.id !== l.id));
        toast(`Lead ${l.id} deleted.`);
        renderLeads();
      });
    }));
  }

  function leadModal(id) {
    const l = Store.leads().find(x => x.id === id); if (!l) return;
    openModal(`
      <p class="eyebrow" style="margin:0 0 12px">Lead ${esc(l.id)}</p>
      <h3 class="h3" style="margin:0 0 22px">${esc(l.name)}</h3>
      <div class="kv" style="margin-bottom:24px">
        <div><dt>Phone</dt><dd style="font-size:1rem">${esc(l.phone)}</dd></div>
        <div><dt>Email</dt><dd style="font-size:.95rem">${esc(l.email)}</dd></div>
        <div><dt>Interested Project</dt><dd style="font-size:1rem">${esc(l.project)}</dd></div>
        <div><dt>Enquiry Type</dt><dd style="font-size:1rem">${esc(l.type || "Enquiry")}</dd></div>
        <div><dt>Enquiry Date</dt><dd style="font-size:1rem">${fmtDate(l.created)}</dd></div>
        <div><dt>Site Visit Date</dt><dd style="font-size:1rem">${l.visitDate ? fmtDate(l.visitDate) + (l.visitTime ? " · " + esc(l.visitTime) : "") : "-"}</dd></div>
      </div>
      ${l.requirement ? `<p class="label" style="margin:0 0 8px">Requirement</p><p class="body-sm" style="margin:0 0 20px">${esc(l.requirement)}</p>` : ""}
      <p class="label" style="margin:0 0 8px">Message</p>
      <p class="body-sm" style="margin:0 0 26px">${esc(l.message || "-")}</p>

      <div class="field" style="margin-bottom:24px">
        <label>Lead Status</label>
        <select id="lmStatus">${LEAD_STATUSES.map(s => `<option ${l.status === s ? "selected" : ""}>${s}</option>`).join("")}</select>
      </div>

      <div style="display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn btn--brass btn--sm" href="https://wa.me/${RR.company.whatsapp}?text=${encodeURIComponent("Hello " + l.name + ", this is Skyline Homes regarding your enquiry " + l.id + " for " + l.project + ".")}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="btn btn--ghost btn--sm" href="tel:${esc(String(l.phone).replace(/[^\d+]/g, ""))}">Call</a>
          <a class="btn btn--ghost btn--sm" href="mailto:${esc(l.email)}?subject=${encodeURIComponent("Your enquiry " + l.id + ": " + l.project)}">Email</a>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn--ghost btn--sm" type="button" data-x>Close</button>
          <button class="btn btn--solid btn--sm" type="button" id="lmSave">Save status</button>
        </div>
      </div>`);

    $("#lmSave").addEventListener("click", () => {
      const all = Store.leads();
      const i = all.findIndex(x => x.id === l.id);
      all[i].status = $("#lmStatus").value;
      Store.saveLeads(all);
      toast(`${l.name} moved to “${all[i].status}”.`);
      closeModal();
      current === "leads" ? renderLeads() : renderDash();
    });
  }

  /* ==========================================================================
     NEWS
     ========================================================================== */
  function renderNews() {
    const ns = Store.news().slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    view.innerHTML = `
      <div class="tblwrap">
        <table class="tbl">
          <thead><tr><th>Date</th><th>Category</th><th>Title</th><th>Linked project</th><th class="t-r">Actions</th></tr></thead>
          <tbody>
            ${ns.map(n => `
              <tr>
                <td class="tnum">${fmtDate(n.date)}</td>
                <td><span class="chip">${esc(n.cat)}</span></td>
                <td>${esc(n.title)}</td>
                <td>${n.project ? esc(n.project) : "-"}</td>
                <td class="t-r" style="white-space:nowrap">
                  <button class="btn btn--ghost btn--sm" type="button" data-nedit="${esc(n.id)}">Edit</button>
                  <button class="btn btn--ghost btn--sm" type="button" data-ndel="${esc(n.id)}">Delete</button>
                </td>
              </tr>`).join("") || `<tr><td colspan="5" style="color:var(--muted-2)">No updates published.</td></tr>`}
          </tbody>
        </table>
      </div>`;

    $$("[data-nedit]").forEach(b => b.addEventListener("click", () => newsModal(b.dataset.nedit)));
    $$("[data-ndel]").forEach(b => b.addEventListener("click", () => {
      const n = Store.news().find(x => x.id === b.dataset.ndel);
      confirmBox("Delete this update?", `“${n.title}” will be removed from News & Updates.`, "Delete update", () => {
        Store.saveNews(Store.news().filter(x => x.id !== n.id));
        toast("Update deleted."); renderNews();
      });
    }));
  }

  function newsModal(id) {
    const n = id ? Store.news().find(x => x.id === id) : null;
    const cats = ["Project Launch", "Construction Update", "New Project Announcement", "Possession Update", "Company News", "Event", "Project Milestone"];
    openModal(`
      <p class="eyebrow" style="margin:0 0 12px">${n ? "Edit update" : "Add update"}</p>
      <h3 class="h3" style="margin:0 0 26px">${n ? esc(n.title) : "New update"}</h3>
      <form class="form" id="nwForm" novalidate>
        <div class="f2">
          <div class="field"><label>Date</label><input name="date" type="date" value="${n ? n.date : new Date().toISOString().slice(0, 10)}"><span class="err"></span></div>
          <div class="field"><label>Category</label>
            <select name="cat">${cats.map(c => `<option ${n && n.cat === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
        </div>
        <div class="field"><label>Title</label><input name="title" value="${n ? esc(n.title) : ""}"><span class="err"></span></div>
        <div class="field"><label>Excerpt</label><textarea name="excerpt">${n ? esc(n.excerpt) : ""}</textarea><span class="err"></span></div>
        <div class="f2">
          <div class="field"><label>Image path</label><input name="image" value="${n ? esc(n.image) : "img/con-2.jpg"}"></div>
          <div class="field"><label>Linked project</label>
            <select name="project">
              <option value="">None</option>
              ${Store.projects().map(p => `<option value="${p.id}" ${n && n.project === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}
            </select></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:8px">
          <button class="btn btn--ghost btn--sm" type="button" data-x>Cancel</button>
          <button class="btn btn--solid btn--sm" type="submit">${n ? "Save changes" : "Publish update"}</button>
        </div>
      </form>`);

    const form = $("#nwForm");
    $$("input,select,textarea", form).forEach(i => i.addEventListener("input", () => fieldError(i, "")));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = {}; new FormData(form).forEach((v, k) => d[k] = String(v).trim());
      let ok = true;
      if (!d.date) { fieldError(form.elements.date, "Choose a date."); ok = false; }
      if (d.title.length < 5) { fieldError(form.elements.title, "Enter a headline."); ok = false; }
      if (d.excerpt.length < 10) { fieldError(form.elements.excerpt, "Write a short summary."); ok = false; }
      if (!ok) { toast("Please correct the highlighted fields."); return; }

      const all = Store.news();
      if (n) {
        Object.assign(all.find(x => x.id === n.id), d);
        toast("Update saved.");
      } else {
        all.unshift(Object.assign({ id: "n" + Date.now().toString(36) }, d));
        toast("Update published.");
      }
      Store.saveNews(all);
      closeModal(); renderNews();
    });
  }

  /* ==========================================================================
     ROUTER
     ========================================================================== */
  let current = "dash";

  const VIEWS = {
    dash:     { label: "Dashboard", title: "Overview",             render: renderDash,     actions: "" },
    projects: { label: "Project CMS", title: "Projects",           render: renderProjects, actions: `<button class="btn btn--solid btn--sm" type="button" id="addProject">Add Project</button>` },
    leads:    { label: "Lead CRM", title: "Leads",                 render: renderLeads,    actions: `<button class="btn btn--ghost btn--sm" type="button" id="exportLeads">Export CSV</button>` },
    news:     { label: "(Content)", title: "News &amp; Updates",     render: renderNews,     actions: `<button class="btn btn--solid btn--sm" type="button" id="addNews">Add Update</button>` }
  };

  function go(name, opts = {}) {
    current = VIEWS[name] ? name : "dash";
    const v = VIEWS[current];
    $("#vLabel").textContent = v.label;
    $("#vTitle").innerHTML = v.title;
    $("#vActions").innerHTML = v.actions;
    $$(".adm__side a[data-view]").forEach(a => a.classList.toggle("is-active", a.dataset.view === current));
    if (opts.status) lFilter = opts.status;
    v.render();
    bindActions();
    location.hash = current;
    window.scrollTo({ top: 0 });
  }

  function bindActions() {
    const ap = $("#addProject"); if (ap) ap.addEventListener("click", () => projectModal(null));
    const an = $("#addNews"); if (an) an.addEventListener("click", () => newsModal(null));
    const ex = $("#exportLeads"); if (ex) ex.addEventListener("click", exportLeads);
  }

  function exportLeads() {
    const rows = [["Ref", "Name", "Phone", "Email", "Interested Project", "Type", "Enquiry Date", "Site Visit Date", "Requirement", "Message", "Status"]];
    Store.leads().forEach(l => rows.push([
      l.id, l.name, l.phone, l.email, l.project, l.type || "Enquiry",
      new Date(l.created).toISOString().slice(0, 10), l.visitDate || "",
      l.requirement || "", (l.message || "").replace(/\s+/g, " "), l.status
    ]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `skyline-homes-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast(`${Store.leads().length} leads exported.`);
  }

  $$(".adm__side a[data-view]").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault(); go(a.dataset.view);
  }));

  $("#logout").addEventListener("click", () => {
    confirmBox("Sign out of the admin panel?", "You will need your username and password to sign back in.", "Sign out", () => {
      Store.logout();
      location.href = "admin-login.html";
    });
  });

  go((location.hash || "#dash").slice(1));
})();

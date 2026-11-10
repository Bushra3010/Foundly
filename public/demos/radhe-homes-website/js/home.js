/* ==========================================================================
   Home page
   ========================================================================== */
(function () {
  boot("home");

  const projects = Store.projects();

  /* ---------- featured carousel ---------- */
  const feat = projects.filter(p => p.status !== "upcoming").slice(0, 4);
  let fi = 0;
  const els = {
    L: $("#featL"), C: $("#featC"), R: $("#featR"),
    title: $("#featTitle"), desc: $("#featDesc"), link: $("#featLink"), dots: $("#featDots")
  };

  function paintFeat() {
    const p = feat[fi];
    const g = p.gallery || [p.image];
    els.C.src = g[0]; els.C.alt = p.name;
    els.L.src = g[1] || g[0]; els.L.alt = "";
    els.R.src = g[2] || g[0]; els.R.alt = "";
    els.title.textContent = p.name;
    els.desc.textContent = p.summary.length > 150
      ? p.summary.slice(0, 148).replace(/\s+\S*$/, "") + "…"   // cut on a word boundary, not mid-word
      : p.summary;
    els.link.href = `project.html?id=${p.id}`;
    $$("button", els.dots).forEach((b, i) => b.classList.toggle("is-active", i === fi));
  }
  els.dots.innerHTML = feat.map((_, i) => `<button aria-label="Show ${esc(feat[i].name)}"></button>`).join("");
  $$("button", els.dots).forEach((b, i) => b.addEventListener("click", () => { fi = i; paintFeat(); }));
  $("#featPrev").addEventListener("click", () => { fi = (fi - 1 + feat.length) % feat.length; paintFeat(); });
  $("#featNext").addEventListener("click", () => { fi = (fi + 1) % feat.length; paintFeat(); });
  paintFeat();
  let featTimer = setInterval(() => { fi = (fi + 1) % feat.length; paintFeat(); }, 6500);
  $("#feat").addEventListener("mouseenter", () => clearInterval(featTimer));
  $("#feat").addEventListener("mouseleave", () => { featTimer = setInterval(() => { fi = (fi + 1) % feat.length; paintFeat(); }, 6500); });

  /* ---------- project tabs ---------- */
  const grid = $("#homeProjects");
  function paintTab(status) {
    const list = projects.filter(p => p.status === status);
    grid.innerHTML = list.map(projectCard).join("");
    initReveal(); initProgressBars();
  }
  $$("#homeTabs .tab").forEach(t => t.addEventListener("click", () => {
    $$("#homeTabs .tab").forEach(x => x.classList.remove("is-active"));
    t.classList.add("is-active");
    paintTab(t.dataset.tab);
  }));
  paintTab("ongoing");

  /* ---------- beliefs ---------- */
  $("#beliefs").innerHTML = RR.beliefs.map(b => `
    <div><h3 class="h4">${esc(b.t)}</h3>
    <p class="body-sm" style="margin-top:14px">${esc(b.d)}</p></div>`).join("");

  /* ---------- amenities ---------- */
  const amenRail = [
    { photo: "img/am-1.jpg", label: "Landscaped garden", wide: true },
    { label: "Club House" },
    { label: "Children's Play Area" },
    { photo: "img/am-2.jpg", label: "Club house interiors" },
    { label: "Covered Parking" },
    { label: "24x7 Security" },
    { label: "CCTV Surveillance" },
    { photo: "img/am-3.jpg", label: "Play area", wide: true },
    { label: "High-Speed Lifts" },
    { label: "Power Backup" },
    { label: "Community Area" },
    { label: "Walking Track" }
  ];
  $("#amenGrid").innerHTML = amenRail.map(a => a.photo
    ? `<div class="rail__c rail__c--img${a.wide ? " rail__c--wide" : ""}">
         <img src="${a.photo}" alt="${esc(a.label)}" loading="lazy"><span>${esc(a.label)}</span></div>`
    : `<div class="rail__c">${icon(RR.amenityIcons[a.label] || "home")}<span>${esc(a.label)}</span></div>`
  ).join("");

  /* ---------- construction progress ---------- */
  $("#progressList").innerHTML = projects.filter(p => p.status === "ongoing").map(p => `
    <div class="panel rv">
      <div class="prow">
        <div>
          <h3 class="h3"><a href="project.html?id=${p.id}">${esc(p.name)}</a></h3>
          <p class="body-sm" style="margin:8px 0 0">${esc(p.location)} · ${esc(p.type)}</p>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
            <span class="label">Current stage: ${esc(p.stage)}</span>
            <span style="font-family:var(--serif);font-size:1.5rem">${p.progress}%</span>
          </div>
          <div class="prog"><i data-w="${p.progress}"></i></div>
          <div class="timeline timeline--slim">
            ${p.timeline.map((s, i) => `<div class="${i <= p.timeline.indexOf(p.stage) ? "is-done" : ""}">${esc(s)}</div>`).join("")}
          </div>
        </div>
        <div style="text-align:right">
          <p class="label" style="margin:0 0 6px">Latest update: ${fmtDate(p.updates[0].date)}</p>
          <p class="body-sm" style="margin:0 0 16px;margin-left:auto">${esc(p.updates[0].note)}</p>
          <a class="btn btn--ghost btn--sm" href="project.html?id=${p.id}#progress">View Progress</a>
        </div>
      </div>
    </div>`).join("");

  /* ---------- journey ---------- */
  $("#journeyGrid").innerHTML = RR.journey.map(j => `
    <div><div class="yr">${esc(j.yr)}</div><h3 class="h4">${esc(j.t)}</h3>
    <p class="body-sm" style="margin-top:12px">${esc(j.d)}</p></div>`).join("");

  /* ---------- testimonials ---------- */
  const qwrap = $("#quotes");
  qwrap.innerHTML = RR.testimonials.map((t, i) => `
    <div class="quote ${i === 0 ? "is-active" : ""}">
      <blockquote>\u201C${esc(t.text)}\u201D</blockquote>
      <div class="quote__who">
        <img src="${t.photo}" alt="" loading="lazy">
        <div>
          <div style="font-size:14px">${esc(t.name)}</div>
          <div class="label" style="margin-top:5px">${esc(t.project)}</div>
        </div>
        <div class="stars" aria-label="${t.rating} out of 5">${"\u2605".repeat(t.rating)}${"\u2606".repeat(5 - t.rating)}</div>
      </div>
    </div>`).join("");
  let qi = 0;
  const quotes = $$(".quote", qwrap);
  const qCount = $("#qCount");
  const showQ = (n) => {
    qi = (n + quotes.length) % quotes.length;
    quotes.forEach((q, i) => q.classList.toggle("is-active", i === qi));
    if (qCount) qCount.textContent = `${qi + 1} / ${quotes.length}`;
  };
  showQ(0);
  let qTimer = setInterval(() => showQ(qi + 1), 7500);
  const qBump = (d) => { clearInterval(qTimer); showQ(qi + d); qTimer = setInterval(() => showQ(qi + 1), 7500); };
  $("#qPrev").addEventListener("click", () => qBump(-1));
  $("#qNext").addEventListener("click", () => qBump(1));

  /* ---------- news ---------- */
  $("#newsGrid").innerHTML = Store.news().slice(0, 3).map(n => `
    <article class="pcard rv">
      <a class="pcard__media" href="news.html#${n.id}"><img src="${n.image}" alt="${esc(n.title)}" loading="lazy"></a>
      <div class="pcard__body">
        <div class="pcard__meta"><span>${fmtDate(n.date)}</span><span>${esc(n.cat)}</span></div>
        <h3 class="h4">${esc(n.title)}</h3>
        <p class="body-sm" style="margin:0">${esc(n.excerpt)}</p>
        <div class="pcard__foot"><a class="link-u" href="news.html#${n.id}">Read update ${arrow}</a></div>
      </div>
    </article>`).join("");

  /* ---------- faq ---------- */
  $("#faqList").innerHTML = faqHTML(RR.faqs.slice(0, 6));
  initFAQ();

  initReveal(); initProgressBars();
})();

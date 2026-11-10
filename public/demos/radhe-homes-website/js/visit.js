/* site-visit.html */
(function () {
  boot("visit");   /* the site-visit page is reached from the header CTA, not a nav item */

  const sel = $("#sv-project");
  const groups = [["ongoing", "Ongoing"], ["upcoming", "Upcoming"], ["completed", "Completed"]];
  groups.forEach(([st, lbl]) => {
    const list = Store.projects().filter(p => p.status === st);
    if (!list.length) return;
    const og = document.createElement("optgroup");
    og.label = `${lbl} Projects`;
    list.forEach(p => {
      const o = document.createElement("option");
      o.value = p.name; o.textContent = `${p.name}, ${p.location}`;
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
  const other = document.createElement("option");
  other.value = "Not decided yet"; other.textContent = "Not decided yet: advise me";
  sel.appendChild(other);

  // pre-select from ?project=
  const want = new URLSearchParams(location.search).get("project");
  if (want) {
    const hit = $$("option", sel).find(o => o.value.toLowerCase() === want.toLowerCase());
    if (hit) sel.value = hit.value;
  }

  // date input: no past dates, default tomorrow
  const d = $("#sv-date");
  const iso = (dt) => dt.toISOString().slice(0, 10);
  const today = new Date();
  d.min = iso(today);
  const max = new Date(); max.setMonth(max.getMonth() + 3); d.max = iso(max);
  const tom = new Date(); tom.setDate(tom.getDate() + 1); d.value = iso(tom);

  $("#waBtn").href = waLink("Hi, I would like to schedule a site visit.");
  $("#callBtn").href = telLink();
  $("#hoursNote").textContent = `${RR.company.phone} · ${RR.company.hours}`;

  bindForm("#svForm", {
    success: "#svOk",
    type: "Site Visit",
    rules: {
      name: Validate.name,
      phone: Validate.phone,
      email: Validate.email,
      project: (v) => v.trim().length > 0 || "Please select a project.",
      date: Validate.date,
      time: (v) => v.trim().length > 0 || "Please choose a preferred time."
    }
  });

  initReveal();
})();

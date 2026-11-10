/* ==========================================================================
   projects.html: portfolio grid with status / category filters and search
   ========================================================================== */
(function () {
  boot("projects");

  const grid   = $("#pGrid");
  const empty  = $("#pEmpty");
  const count  = $("#pCount");
  const search = $("#psearch");

  const params = new URLSearchParams(location.search);
  const initial = (params.get("filter") || "all").toLowerCase();

  const state = {
    status: ["ongoing", "completed", "upcoming"].includes(initial) ? initial : "all",
    cat: ["residential", "commercial"].includes(initial) ? initial : "all",
    q: (params.get("q") || "").trim()
  };
  if (search && state.q) search.value = state.q;

  const setActive = (wrap, attr, val) =>
    $$(".tab", wrap).forEach(b => b.classList.toggle("is-active", b.dataset[attr] === val));

  function matches(p) {
    if (state.status !== "all" && p.status !== state.status) return false;
    if (state.cat !== "all" && p.category !== state.cat) return false;
    if (state.q) {
      const hay = [p.name, p.location, p.type, p.config, p.area, p.tagline, p.status, p.category]
        .join(" ").toLowerCase();
      if (!hay.includes(state.q.toLowerCase())) return false;
    }
    return true;
  }

  function label(n) {
    const bits = [];
    if (state.status !== "all") bits.push(statusLabel[state.status]);
    if (state.cat !== "all") bits.push(state.cat.charAt(0).toUpperCase() + state.cat.slice(1));
    if (state.q) bits.push(`matching “${state.q}”`);
    return `Showing ${n} ${n === 1 ? "project" : "projects"}${bits.length ? ": " + bits.join(", ") : ""}`;
  }

  function render() {
    const list = Store.projects().filter(matches);
    grid.innerHTML = list.map(projectCard).join("");
    grid.style.display = list.length ? "" : "none";
    empty.style.display = list.length ? "none" : "block";
    count.textContent = label(list.length);

    // re-arm scroll animations + progress bars for the freshly injected cards
    initReveal(); initProgressBars();
    requestAnimationFrame(() => $$(".pcard.rv", grid).forEach(el => el.classList.add("is-in")));

    const u = new URL(location.href);
    u.searchParams.delete("filter"); u.searchParams.delete("q");
    if (state.status !== "all") u.searchParams.set("filter", state.status);
    else if (state.cat !== "all") u.searchParams.set("filter", state.cat);
    if (state.q) u.searchParams.set("q", state.q);
    history.replaceState(null, "", u.pathname + (u.search || "") );
  }

  $("#fStatus").addEventListener("click", (e) => {
    const b = e.target.closest(".tab"); if (!b) return;
    state.status = b.dataset.f; setActive($("#fStatus"), "f", state.status); render();
  });

  $("#fCat").addEventListener("click", (e) => {
    const b = e.target.closest(".tab"); if (!b) return;
    state.cat = b.dataset.c; setActive($("#fCat"), "c", state.cat); render();
  });

  let t;
  search.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = search.value.trim(); render(); }, 180);
  });
  search.addEventListener("keydown", (e) => { if (e.key === "Enter") e.preventDefault(); });

  const reset = () => {
    state.status = "all"; state.cat = "all"; state.q = "";
    search.value = "";
    setActive($("#fStatus"), "f", "all"); setActive($("#fCat"), "c", "all");
    render();
    window.scrollTo({ top: $("#pGrid").offsetTop - 160, behavior: "smooth" });
  };
  $("#pReset").addEventListener("click", reset);
  $("#pEmptyReset").addEventListener("click", reset);

  setActive($("#fStatus"), "f", state.status);
  setActive($("#fCat"), "c", state.cat);
  render();
})();

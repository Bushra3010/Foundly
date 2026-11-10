/* news.html */
(function () {
  boot("news");

  const all = Store.news().slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const cats = ["All", ...Array.from(new Set(all.map(n => n.cat)))];
  let active = "All";

  $("#nFilter").innerHTML = cats.map(c =>
    `<button class="tab ${c === "All" ? "is-active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");

  function card(n) {
    return `
    <article class="pcard rv">
      <div class="pcard__media"><img src="${n.image}" alt="${esc(n.title)}" loading="lazy"></div>
      <div class="pcard__body">
        <div class="pcard__meta"><span>${fmtDate(n.date)}</span><span style="color:var(--brass)">${esc(n.cat)}</span></div>
        <h3 class="h3">${esc(n.title)}</h3>
        <p class="body-sm" style="margin:0">${esc(n.excerpt)}</p>
        <div class="pcard__foot">
          <a class="link-u" href="${n.project ? `project.html?id=${n.project}` : "projects.html"}">${n.project ? "View project" : "View projects"} ${arrow}</a>
        </div>
      </div>
    </article>`;
  }

  function render() {
    const list = active === "All" ? all : all.filter(n => n.cat === active);
    $("#newsGrid").innerHTML = list.map(card).join("");
    $("#newsGrid").style.display = list.length ? "" : "none";
    $("#nEmpty").style.display = list.length ? "none" : "block";
    initReveal();
    requestAnimationFrame(() => $$(".pcard.rv", $("#newsGrid")).forEach(el => el.classList.add("is-in")));
  }

  $("#nFilter").addEventListener("click", (e) => {
    const b = e.target.closest(".tab"); if (!b) return;
    active = b.dataset.cat;
    $$(".tab", $("#nFilter")).forEach(x => x.classList.toggle("is-active", x === b));
    render();
  });

  $("#nReset").addEventListener("click", () => {
    active = "All";
    $$(".tab", $("#nFilter")).forEach(x => x.classList.toggle("is-active", x.dataset.cat === "All"));
    render();
  });

  render();
})();

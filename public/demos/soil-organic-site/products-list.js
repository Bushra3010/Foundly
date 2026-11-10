(function () {
  const PRODUCTS_URL = "data/products.json";
  const listEl = document.querySelector("[data-products-list]");
  const filtersEl = document.querySelector("[data-product-filters]");
  if (!listEl) return;

  const escapeHtml = (value) =>
    String(value || "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[ch]);

  const cardHtml = (product) => {
    const img = product.thumbnail || (product.photos && product.photos[0]) || product.hero || "";
    const benefits = (product.benefits || []).slice(0, 4);
    return `
      <article class="solution-row product-card" data-category="${escapeHtml(product.category)}">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(product.name)}" loading="lazy" />
        <div>
          <span>${escapeHtml(product.category)}</span>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.tagline || product.description)}</p>
          <ul class="check-list">${benefits.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
          <a href="product-detail.html?product=${encodeURIComponent(product.slug)}">View Details</a>
        </div>
      </article>`;
  };

  const renderFilters = (categories) => {
    if (!filtersEl) return;
    const buttons = ['<button class="active" type="button" data-filter="all">All</button>'];
    categories.forEach((cat) => {
      buttons.push(`<button type="button" data-filter="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`);
    });
    filtersEl.innerHTML = buttons.join("");

    filtersEl.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-filter]");
      if (!btn) return;
      filtersEl.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      listEl.querySelectorAll(".product-card").forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
      });
    });
  };

  fetch(`${PRODUCTS_URL}?t=${Date.now()}`, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("Unable to load products");
      return response.json();
    })
    .then((data) => {
      const products = Array.isArray(data.products) ? data.products : [];
      if (!products.length) {
        listEl.innerHTML = '<p class="products-loading">No products available yet.</p>';
        return;
      }
      listEl.innerHTML = products.map(cardHtml).join("");
      const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
      renderFilters(categories);
    })
    .catch(() => {
      listEl.innerHTML = '<p class="products-loading">Unable to load products right now.</p>';
    });
})();

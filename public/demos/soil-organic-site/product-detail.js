(function () {
  const PRODUCTS_URL = "data/products.json";

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("product") || "";

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value || "";
  };

  const renderList = (selector, items) => {
    const list = document.querySelector(selector);
    if (!list) return;
    list.innerHTML = (items || []).map((item) => `<li>${item}</li>`).join("");
  };

  const render = (product) => {
    document.title = `${product.name} | GreenRoot Product`;

    // Hero banner
    const heroBg = document.querySelector("[data-product-hero]");
    if (heroBg && product.hero) {
      heroBg.style.backgroundImage = `url("${product.hero}")`;
    }
    setText("[data-product-category]", product.category);
    setText("[data-product-name]", product.name);
    setText("[data-product-tagline]", product.tagline);

    // Video
    const videoSection = document.querySelector("[data-video-section]");
    const video = document.querySelector("[data-product-video]");
    if (product.video && video) {
      video.src = product.video;
      videoSection.hidden = false;
      setText("[data-video-title]", `${product.name} Video`);
    }

    // Photo gallery
    const gallery = document.querySelector("[data-product-gallery]");
    const gallerySection = document.querySelector("[data-gallery-section]");
    const photos = (product.photos || []).filter(Boolean);
    if (gallery && photos.length) {
      gallery.innerHTML = photos
        .map(
          (src) =>
            `<a class="gallery-item" href="${src}" target="_blank" rel="noopener"><img src="${src}" alt="${product.name} photo" loading="lazy" /></a>`
        )
        .join("");
      gallerySection.hidden = false;
    }

    // Details
    setText("[data-product-description]", product.description);
    setText("[data-product-category-card]", product.category);
    setText("[data-product-pack]", product.pack);
    setText("[data-product-best]", product.best);
    renderList("[data-product-benefits]", product.benefits);
    renderList("[data-product-usage]", product.usage);

    const crops = document.querySelector("[data-product-crops]");
    if (crops) {
      crops.innerHTML = (product.crops || []).map((c) => `<span>${c}</span>`).join("");
    }
  };

  const renderMissing = () => {
    setText("[data-product-name]", "Product not found");
    setText("[data-product-tagline]", "This product may have been moved or removed. Please browse all products.");
    setText("[data-product-category]", "GreenRoot Product");
  };

  fetch(`${PRODUCTS_URL}?t=${Date.now()}`, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("Unable to load products");
      return response.json();
    })
    .then((data) => {
      const list = Array.isArray(data.products) ? data.products : [];
      const product = list.find((p) => p.slug === slug) || list[0];
      if (product) {
        render(product);
      } else {
        renderMissing();
      }
    })
    .catch(renderMissing);
})();

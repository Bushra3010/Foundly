const API_URL = "/.netlify/functions/admin-content";
const CONTENT_URL = "../data/site-content.json";
const passwordKey = "soil_admin_password";

const loginPanel = document.querySelector("[data-login-panel]");
const editorPanel = document.querySelector("[data-editor]");
const loginForm = document.querySelector("[data-login-form]");
const loginStatus = document.querySelector("[data-login-status]");
const editorStatus = document.querySelector("[data-editor-status]");
const fieldsRoot = document.querySelector("[data-fields]");
const saveButton = document.querySelector("[data-save]");
const refreshButton = document.querySelector("[data-refresh]");

let content = {};
let password = sessionStorage.getItem(passwordKey) || "";

const labels = {
  home: "Home Page",
  about: "About Page",
  solutions: "Solutions Page",
  dealer: "Dealer Page",
  gallery: "Gallery Page",
  contact: "Contact Page",
  productDetail: "Product Detail Page",
  hero: "Hero Section",
  intro: "Intro Section",
  heading: "Section Heading",
  supportHeading: "Support Heading",
  mediaHeading: "Media Heading",
  form: "Form Text",
  why: "Why Choose Section",
  items: "Solution Cards",
  sections: "Gallery Headings"
};

const titleCase = (value) =>
  labels[value] ||
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/^\w/, (letter) => letter.toUpperCase())
    .trim();

const getValue = (path) => path.reduce((current, key) => current?.[key], content);

const setValue = (path, value) => {
  const last = path[path.length - 1];
  const parent = path.slice(0, -1).reduce((current, key) => current[key], content);
  parent[last] = value;
};

const setStatus = (element, message, isError = false) => {
  element.textContent = message;
  element.classList.toggle("error", isError);
};

const apiPost = async (payload) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, ...payload })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Unable to save changes");
  return result;
};

const uploadImage = async (file, path, input, preview) => {
  setStatus(editorStatus, "Uploading image...");
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
  const result = await apiPost({ action: "uploadImage", filename: file.name, dataUrl });
  setValue(path, result.path);
  input.value = result.path;
  preview.src = result.path;
  setStatus(editorStatus, "Image uploaded. Click Save Changes to publish text updates too.");
};

const createField = (path, key, value) => {
  const label = document.createElement("label");
  const isBody = key === "body";
  const isImage = key === "image";
  label.className = isBody || isImage ? "full" : "";
  label.textContent = titleCase(key);

  if (isBody) {
    const textarea = document.createElement("textarea");
    textarea.value = value || "";
    textarea.addEventListener("input", () => setValue(path, textarea.value));
    label.append(textarea);
    return label;
  }

  if (isImage) {
    label.classList.add("image-control");
    const preview = document.createElement("img");
    preview.src = value || "";
    preview.alt = "";
    const input = document.createElement("input");
    input.value = value || "";
    input.addEventListener("input", () => {
      setValue(path, input.value);
      preview.src = input.value;
    });
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    file.addEventListener("change", () => {
      if (file.files?.[0]) uploadImage(file.files[0], path, input, preview).catch((error) => setStatus(editorStatus, error.message, true));
    });
    label.append(preview, input, file);
    return label;
  }

  const input = document.createElement("input");
  input.value = value || "";
  input.addEventListener("input", () => setValue(path, input.value));
  label.append(input);
  return label;
};

const renderObjectFields = (object, basePath) => {
  const grid = document.createElement("div");
  grid.className = "field-grid";

  Object.entries(object).forEach(([key, value]) => {
    if (value && typeof value === "object") return;
    grid.append(createField([...basePath, key], key, value));
  });

  return grid;
};

const renderGroup = (title, object, basePath) => {
  const group = document.createElement("section");
  group.className = "group";
  const heading = document.createElement("h2");
  heading.textContent = title;
  group.append(heading, renderObjectFields(object, basePath));
  return group;
};

const renderContent = () => {
  fieldsRoot.innerHTML = "";

  Object.entries(content).forEach(([pageKey, pageValue]) => {
    Object.entries(pageValue).forEach(([sectionKey, sectionValue]) => {
      if (Array.isArray(sectionValue)) {
        sectionValue.forEach((item, index) => {
          fieldsRoot.append(renderGroup(`${titleCase(pageKey)} / ${titleCase(sectionKey)} ${index + 1}`, item, [pageKey, sectionKey, index]));
        });
        return;
      }
      if (sectionValue && typeof sectionValue === "object") {
        fieldsRoot.append(renderGroup(`${titleCase(pageKey)} / ${titleCase(sectionKey)}`, sectionValue, [pageKey, sectionKey]));
      }
    });
  });
};

const loadContent = async () => {
  setStatus(editorStatus, "Loading content...");
  const response = await fetch(`${CONTENT_URL}?t=${Date.now()}`);
  content = await response.json();
  renderContent();
  setStatus(editorStatus, "Ready. Update text or upload images, then click Save Changes.");
};

const openEditor = async () => {
  loginPanel.hidden = true;
  editorPanel.hidden = false;
  await loadContent();
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  password = new FormData(loginForm).get("password");
  try {
    setStatus(loginStatus, "Checking password...");
    await apiPost({ action: "checkPassword" });
    sessionStorage.setItem(passwordKey, password);
    setStatus(loginStatus, "Login successful");
    openEditor().catch((error) => setStatus(editorStatus, error.message, true));
  } catch (error) {
    setStatus(loginStatus, error.message, true);
  }
});

saveButton.addEventListener("click", async () => {
  try {
    saveButton.disabled = true;
    setStatus(editorStatus, "Saving changes to GitHub...");
    await apiPost({ action: "saveContent", content });
    setStatus(editorStatus, "Saved. Netlify will redeploy the website in a moment.");
  } catch (error) {
    setStatus(editorStatus, error.message, true);
  } finally {
    saveButton.disabled = false;
  }
});

refreshButton.addEventListener("click", () => {
  loadContent().catch((error) => setStatus(editorStatus, error.message, true));
  if (productsLoaded) loadProducts().catch((error) => setStatus(productsStatus, error.message, true));
});

if (password) {
  apiPost({ action: "checkPassword" })
    .then(() => openEditor())
    .catch(() => sessionStorage.removeItem(passwordKey));
}

/* ============================================================
   Products manager
   ============================================================ */
const PRODUCTS_URL = "../data/products.json";
const productsStatus = document.querySelector("[data-products-status]");
const productsEditor = document.querySelector("[data-products-editor]");
const addProductButton = document.querySelector("[data-add-product]");
const saveProductsButton = document.querySelector("[data-save-products]");
const tabs = document.querySelectorAll(".tab");
const tabPanels = document.querySelectorAll("[data-tab-panel]");

let productsData = [];
let productsLoaded = false;

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.toggle("active", t === tab));
    tabPanels.forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== tab.dataset.tab;
    });
    if (tab.dataset.tab === "products" && !productsLoaded) {
      loadProducts().catch((error) => setStatus(productsStatus, error.message, true));
    }
  });
});

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const uploadFile = async (file) => {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
  const result = await apiPost({ action: "uploadImage", filename: file.name, dataUrl });
  return result.path;
};

const textField = (labelText, value, onInput, full = false) => {
  const label = document.createElement("label");
  if (full) label.className = "full";
  label.textContent = labelText;
  const input = document.createElement("input");
  input.value = value || "";
  input.addEventListener("input", () => onInput(input.value));
  label.append(input);
  return label;
};

const areaField = (labelText, value, onInput, hint) => {
  const label = document.createElement("label");
  label.className = "full";
  label.textContent = labelText;
  const textarea = document.createElement("textarea");
  textarea.value = value || "";
  textarea.addEventListener("input", () => onInput(textarea.value));
  label.append(textarea);
  if (hint) {
    const small = document.createElement("small");
    small.className = "field-hint";
    small.textContent = hint;
    label.append(small);
  }
  return label;
};

const mediaField = (labelText, value, onChange, accept = "image/*") => {
  const label = document.createElement("label");
  label.className = "full media-field";
  label.textContent = labelText;

  const preview = document.createElement(accept.startsWith("video") ? "video" : "img");
  preview.className = "media-preview";
  if (value) preview.src = value;
  if (accept.startsWith("video")) preview.controls = true;

  const input = document.createElement("input");
  input.value = value || "";
  input.placeholder = "File path or URL";
  input.addEventListener("input", () => {
    onChange(input.value);
    preview.src = input.value;
  });

  const file = document.createElement("input");
  file.type = "file";
  file.accept = accept;
  file.addEventListener("change", async () => {
    if (!file.files?.[0]) return;
    try {
      setStatus(productsStatus, "Uploading file...");
      const path = await uploadFile(file.files[0]);
      input.value = path;
      preview.src = path;
      onChange(path);
      setStatus(productsStatus, "Uploaded. Click Save Products to publish.");
    } catch (error) {
      setStatus(productsStatus, error.message, true);
    }
  });

  label.append(preview, input, file);
  return label;
};

const photosField = (product, rerender) => {
  const wrap = document.createElement("div");
  wrap.className = "full photos-field";
  const heading = document.createElement("strong");
  heading.textContent = "Product Photos (gallery)";
  wrap.append(heading);

  (product.photos || []).forEach((photo, index) => {
    const row = document.createElement("div");
    row.className = "photo-row";
    const thumb = document.createElement("img");
    thumb.className = "photo-thumb";
    if (photo) thumb.src = photo;
    const input = document.createElement("input");
    input.value = photo || "";
    input.addEventListener("input", () => {
      product.photos[index] = input.value;
      thumb.src = input.value;
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "ghost small";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      product.photos.splice(index, 1);
      rerender();
    });
    row.append(thumb, input, remove);
    wrap.append(row);
  });

  const actions = document.createElement("div");
  actions.className = "photo-actions";

  const addUrl = document.createElement("button");
  addUrl.type = "button";
  addUrl.className = "ghost small";
  addUrl.textContent = "+ Add photo URL";
  addUrl.addEventListener("click", () => {
    product.photos = product.photos || [];
    product.photos.push("");
    rerender();
  });

  const uploadLabel = document.createElement("label");
  uploadLabel.className = "photo-upload";
  uploadLabel.textContent = "Upload photos";
  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.accept = "image/*";
  uploadInput.multiple = true;
  uploadInput.addEventListener("change", async () => {
    const files = Array.from(uploadInput.files || []);
    if (!files.length) return;
    product.photos = product.photos || [];
    try {
      setStatus(productsStatus, `Uploading ${files.length} photo(s)...`);
      for (const f of files) {
        const path = await uploadFile(f);
        product.photos.push(path);
      }
      setStatus(productsStatus, "Photos uploaded. Click Save Products to publish.");
      rerender();
    } catch (error) {
      setStatus(productsStatus, error.message, true);
    }
  });
  uploadLabel.append(uploadInput);

  actions.append(addUrl, uploadLabel);
  wrap.append(actions);
  return wrap;
};

const renderProductCard = (product, index) => {
  const card = document.createElement("section");
  card.className = "product-card-edit";

  const head = document.createElement("div");
  head.className = "product-card-head";
  const title = document.createElement("h3");
  title.textContent = product.name || "Untitled Product";
  const del = document.createElement("button");
  del.type = "button";
  del.className = "ghost danger small";
  del.textContent = "Delete";
  del.addEventListener("click", () => {
    if (confirm(`Delete "${product.name || "this product"}"?`)) {
      productsData.splice(index, 1);
      renderProducts();
    }
  });
  head.append(title, del);
  card.append(head);

  const grid = document.createElement("div");
  grid.className = "field-grid";

  grid.append(
    textField("Product Name", product.name, (v) => {
      product.name = v;
      title.textContent = v || "Untitled Product";
      if (!product.slug) product.slug = slugify(v);
    }),
    textField("Slug (page link id)", product.slug, (v) => (product.slug = slugify(v))),
    textField("Category", product.category, (v) => (product.category = v)),
    textField("Pack Size", product.pack, (v) => (product.pack = v)),
    textField("Tagline (short line)", product.tagline, (v) => (product.tagline = v), true),
    textField("Best For", product.best, (v) => (product.best = v), true),
    areaField("Description", product.description, (v) => (product.description = v)),
    areaField("Benefits (one per line)", (product.benefits || []).join("\n"), (v) => {
      product.benefits = v.split("\n").map((s) => s.trim()).filter(Boolean);
    }, "Each line becomes one bullet point."),
    areaField("Usage Guidance (one per line)", (product.usage || []).join("\n"), (v) => {
      product.usage = v.split("\n").map((s) => s.trim()).filter(Boolean);
    }, "Each line becomes one bullet point."),
    areaField("Recommended Crops (comma separated)", (product.crops || []).join(", "), (v) => {
      product.crops = v.split(",").map((s) => s.trim()).filter(Boolean);
    }),
    mediaField("Hero Banner Image", product.hero, (v) => (product.hero = v)),
    mediaField("Thumbnail (list card image)", product.thumbnail, (v) => (product.thumbnail = v)),
    mediaField("Product Video (optional)", product.video, (v) => (product.video = v), "video/*"),
    photosField(product, renderProducts)
  );

  card.append(grid);
  return card;
};

const renderProducts = () => {
  productsEditor.innerHTML = "";
  if (!productsData.length) {
    const empty = document.createElement("p");
    empty.className = "products-empty";
    empty.textContent = 'No products yet. Click "+ Add Product" to create one.';
    productsEditor.append(empty);
    return;
  }
  productsData.forEach((product, index) => {
    productsEditor.append(renderProductCard(product, index));
  });
};

const loadProducts = async () => {
  setStatus(productsStatus, "Loading products...");
  const response = await fetch(`${PRODUCTS_URL}?t=${Date.now()}`);
  const data = await response.json().catch(() => ({}));
  productsData = Array.isArray(data.products) ? data.products : [];
  productsLoaded = true;
  renderProducts();
  setStatus(productsStatus, `Loaded ${productsData.length} product(s).`);
};

addProductButton?.addEventListener("click", () => {
  productsData.unshift({
    slug: "",
    name: "",
    category: "",
    tagline: "",
    hero: "",
    video: "",
    thumbnail: "",
    photos: [],
    description: "",
    pack: "",
    best: "",
    benefits: [],
    usage: [],
    crops: []
  });
  renderProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

saveProductsButton?.addEventListener("click", async () => {
  // Ensure every product has a slug
  const seen = new Set();
  for (const product of productsData) {
    if (!product.name?.trim()) {
      setStatus(productsStatus, "Every product needs a name.", true);
      return;
    }
    if (!product.slug?.trim()) product.slug = slugify(product.name);
    if (seen.has(product.slug)) {
      setStatus(productsStatus, `Duplicate slug "${product.slug}". Slugs must be unique.`, true);
      return;
    }
    seen.add(product.slug);
    product.photos = (product.photos || []).filter(Boolean);
  }
  try {
    saveProductsButton.disabled = true;
    setStatus(productsStatus, "Saving products to GitHub...");
    await apiPost({ action: "saveProducts", products: productsData });
    setStatus(productsStatus, "Saved. Netlify will redeploy the website in a moment.");
  } catch (error) {
    setStatus(productsStatus, error.message, true);
  } finally {
    saveProductsButton.disabled = false;
  }
});

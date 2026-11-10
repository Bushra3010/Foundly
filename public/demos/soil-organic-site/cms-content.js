(function () {
  const contentPath = "data/site-content.json";

  const getValue = (source, path) => {
    if (!path) return undefined;
    return path.split(".").reduce((current, part) => {
      if (current === undefined || current === null) return undefined;
      return /^\d+$/.test(part) ? current[Number(part)] : current[part];
    }, source);
  };

  const setBackground = (element, imagePath) => {
    const variableName = element.classList.contains("hero-bg") ? "--hero-bg-image" : "--page-bg-image";
    element.style.setProperty(variableName, `url("${imagePath}")`);
  };

  const applyContent = (content) => {
    document.querySelectorAll("[data-cms-text]").forEach((element) => {
      const value = getValue(content, element.dataset.cmsText);
      if (typeof value === "string" && value.trim()) {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-cms-src]").forEach((element) => {
      const value = getValue(content, element.dataset.cmsSrc);
      if (typeof value === "string" && value.trim()) {
        element.setAttribute("src", value);
      }
    });

    document.querySelectorAll("[data-cms-bg]").forEach((element) => {
      const value = getValue(content, element.dataset.cmsBg);
      if (typeof value === "string" && value.trim()) {
        setBackground(element, value);
      }
    });
  };

  fetch(contentPath, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("Unable to load CMS content");
      return response.json();
    })
    .then(applyContent)
    .catch(() => {});
})();

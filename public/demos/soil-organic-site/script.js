const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const filterButtons = document.querySelectorAll("[data-filter]");
const productCards = document.querySelectorAll("[data-category]");
const form = document.querySelector("[data-form]");
const formNote = document.querySelector("[data-form-note]");

const setHeaderState = () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-active");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (nav) {
  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      header.classList.remove("nav-active");
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    productCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
  });
});

const revealTargets = document.querySelectorAll(
  ".value-grid article, .product-card, .media-card, .stats-grid > div, .section-copy, .section-heading, .benefit-panel, .image-stack, .testimonial-grid > *, .contact-copy, .enquiry-form, .role-grid > *, .solution-row, .detail-panel, .gallery-item"
);

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("revealed");
        revealObserver.unobserve(el);
        window.setTimeout(() => {
          el.classList.remove("will-reveal", "revealed");
          el.style.transitionDelay = "";
        }, 900);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" }
  );

  revealTargets.forEach((target, index) => {
    target.classList.add("will-reveal");
    target.style.transitionDelay = `${(index % 4) * 70}ms`;
    revealObserver.observe(target);
  });
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    if (data.get("company")) {
      form.reset();
      return;
    }

    const name = String(data.get("name") || "").trim();
    formNote.textContent = `Thank you${name ? `, ${name}` : ""}. Your enquiry is ready for GreenRoot follow-up.`;
    form.reset();
  });
}

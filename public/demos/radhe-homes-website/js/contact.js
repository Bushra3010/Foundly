/* contact.html */
(function () {
  boot("contact");
  const c = RR.company;

  $("#contactKV").innerHTML = [
    ["Office Address", c.address],
    ["Phone", `<a class="link-u" href="${telLink()}">${esc(c.phone)}</a>`],
    ["WhatsApp", `<a class="link-u" href="${waLink("Hi Skyline Homes, I have an enquiry.")}" target="_blank" rel="noopener">${esc(c.phone)}</a>`],
    ["Email", `<a class="link-u" href="${mailLink()}">${esc(c.email)}</a>`],
    ["Business Hours", c.hours],
    ["RERA", c.rera]
  ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd style="font-size:1rem;line-height:1.5">${/^</.test(v) ? v : esc(v)}</dd></div>`).join("");

  const sel = $("#c-project");
  Store.projects().forEach(p => {
    const o = document.createElement("option");
    o.value = p.name; o.textContent = `${p.name} (${statusLabel[p.status]})`;
    sel.appendChild(o);
  });
  ["General enquiry", "Not sure yet"].forEach(v => {
    const o = document.createElement("option"); o.value = v; o.textContent = v; sel.appendChild(o);
  });
  const want = new URLSearchParams(location.search).get("project");
  if (want) {
    const hit = $$("option", sel).find(o => o.value.toLowerCase() === want.toLowerCase());
    if (hit) sel.value = hit.value;
  }

  $("#cMap").src = `https://www.google.com/maps?q=${encodeURIComponent(c.mapQuery)}&output=embed`;
  $("#cWa").href = waLink("Hi Skyline Homes, I have an enquiry.");
  $("#cCall").href = telLink();
  $("#cMail").href = mailLink();
  $("#cDir").href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.address)}`;

  $("#cFaq").innerHTML = faqHTML(RR.faqs);
  initFAQ($("#cFaq"));

  bindForm("#cForm", {
    success: "#cOk",
    type: "Contact Enquiry",
    rules: {
      name: Validate.name,
      phone: Validate.phone,
      email: Validate.email,
      project: (v) => v.trim().length > 0 || "Please choose a project or select General enquiry.",
      requirement: (v) => v.trim().length > 0 || "Please select a requirement.",
      message: (v) => v.trim().length >= 5 || "Please tell us a little about what you need."
    }
  });

  initReveal();
})();

/* about.html */
(function () {
  boot("about");

  $("#beliefs").innerHTML = RR.beliefs.map((b, i) => `
    <div>
      <span class="num">(0${i + 1})</span>
      <h3 class="h4" style="margin:0 0 12px">${esc(b.t)}</h3>
      <p class="body-sm" style="margin:0">${esc(b.d)}</p>
    </div>`).join("");

  $("#journey").innerHTML = RR.journey.map(j => `
    <div>
      <div class="yr">${esc(j.yr)}</div>
      <h3 class="h4" style="margin:0 0 12px">${esc(j.t)}</h3>
      <p class="body-sm" style="margin:0">${esc(j.d)}</p>
    </div>`).join("");

  $("#quotesGrid").innerHTML = RR.testimonials.map(t => `
    <article class="panel">
      <div class="stars" aria-label="${t.rating} out of 5">${"★".repeat(t.rating)}${"☆".repeat(5 - t.rating)}</div>
      <blockquote style="font-family:var(--serif);font-size:clamp(1.05rem,1.5vw,1.25rem);line-height:1.5;margin:20px 0 26px">“${esc(t.text)}”</blockquote>
      <div class="quote__who">
        <img src="${t.photo}" alt="${esc(t.name)}" loading="lazy">
        <div>
          <div style="font-size:14px">${esc(t.name)}</div>
          <div class="label" style="margin-top:5px">${esc(t.project)}</div>
        </div>
      </div>
    </article>`).join("");

  initReveal(); initCounters();
})();

/* Customer QR page (p.html) and shared shortlist catalogue (c.html).
 * Ported from the original src/public.js: built only from whitelisted public fields
 * (no costs, quantities, locations or customer records). Demo: data comes from mock-db.js in this browser. */
(function () {
  'use strict';
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n, cur) => n == null ? '' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n);
  const qs = new URLSearchParams(location.search);
  const kind = document.body.dataset.page;

  function videoHtml(v) {
    const meta = `<div class="vmeta">${esc(v.title)} · ${esc(v.scope_label)} · <a href="#" data-yt-out>Open on YouTube</a></div>`;
    if (!v.embeddable) return `<div class="card">${esc(v.title)} — this video can only be watched on YouTube. <a class="btn" href="#" data-yt-out>Open on YouTube</a></div>`;
    return `<div class="video"><button data-yt="${esc(v.youtube_id)}" aria-label="Play ${esc(v.title)}"><img src="${esc(v.thumbnail)}" alt="" loading="lazy"><span>▶ Play video</span></button></div>${meta}`;
  }
  function shell(title, business, body) {
    document.title = `${title} · ${business}`;
    document.body.innerHTML = `<header><img src="mark.png" alt=""><b>${esc(business.toUpperCase())}</b></header><main>${body}</main><footer>${esc(business)}</footer>`;
    // Demo: no YouTube requests — the player is a placeholder.
    document.querySelectorAll('[data-yt]').forEach((b) => b.addEventListener('click', () => {
      b.parentNode.innerHTML = '<div class="vph">▶ In the real page the YouTube video plays here.<br><small>Video playback is turned off in this demo.</small></div>';
    }));
    document.querySelectorAll('[data-yt-out]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      const n = document.createElement('div'); n.className = 'fdemo-toast'; n.setAttribute('role', 'status'); n.textContent = 'Demo mode: in the real page this opens the video on YouTube.';
      document.body.appendChild(n); setTimeout(() => n.remove(), 3000);
    }));
  }
  function notAvailable(business) {
    shell('Not available', business, '<h1>This page is not available</h1><p>Please ask our showroom staff for details about this item.</p>');
  }
  function renderItemPage(d, token) {
    const p = d.product;
    const specs = [['Dimensions', p.dimensions], ['Material', p.material], ['Finish', d.piece && d.piece.finish_note ? d.piece.finish_note : p.finish], ['Category', p.category], ['Reference', d.piece ? d.piece.code : p.sku]]
      .filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
    const photos = d.photos.length ? `<div class="gallery">${d.photos.map((ph) => `<figure><img src="${esc(ph.url)}" alt="${esc(p.name)}" loading="lazy">${ph.exact_piece ? '<figcaption>Photo of this exact piece</figcaption>' : (d.kind === 'piece' ? '<figcaption>Same design — individual pieces vary</figcaption>' : '')}</figure>`).join('')}</div>` : '';
    const body = `${photos}
<h1>${esc(p.name)}${p.variant ? ` <span class="muted">— ${esc(p.variant)}</span>` : ''}</h1>
${d.price != null ? `<div class="price">${esc(money(d.price, d.currency))}</div>` : ''}
<div class="avail">${esc(d.availability_text)}${d.expected_date ? ` · expected ${esc(d.expected_date)}` : ''}</div>
${p.description ? `<p>${esc(p.description)}</p>` : ''}
<div class="card"><dl>${specs}</dl></div>
${p.care ? `<h2>Care</h2><p>${esc(p.care)}</p>` : ''}
${d.videos.length ? `<h2>Videos</h2>${d.videos.map(videoHtml).join('')}` : ''}
<div class="card" id="ask"><h2 style="margin-top:0">Interested?</h2>
<p>Show this screen to our showroom staff${d.showroom_contact ? `, or call <a href="tel:${esc(d.showroom_contact.replace(/\s/g, ''))}">${esc(d.showroom_contact)}</a>` : ''}. Or leave your details and we will get back to you.</p>
<form id="enq" novalidate><label>Your name<input name="name" maxlength="80" required></label><label>Phone<input name="phone" maxlength="20" inputmode="tel" required></label>
<label>Message (optional)<textarea name="message" maxlength="500" rows="2"></textarea></label><button class="btn">Send enquiry</button></form><p id="enqmsg" class="muted"></p></div>`;
    shell(p.name, d.business_name, body);
    document.getElementById('enq').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target, m = document.getElementById('enqmsg');
      try {
        window.AHS.public.enquiry(token, { name: f.name.value, phone: f.phone.value, message: f.message.value });
        f.remove(); m.textContent = 'Thank you — our team will contact you shortly.';
      } catch (err) { m.textContent = err.message || 'Could not send, please ask staff.'; }
    });
  }
  function renderCataloguePage(d) {
    const items = d.items.map((it) => {
      const p = it.product;
      const prefs = [it.qty > 1 ? `Qty ${it.qty}` : '', it.preferred_finish ? `Finish: ${it.preferred_finish}` : '', it.preferred_dimensions ? `Size: ${it.preferred_dimensions}` : ''].filter(Boolean).join(' · ');
      return `<div class="card">${it.photos.length ? `<div class="gallery">${it.photos.map((ph) => `<figure><img src="${esc(ph.url)}" alt="${esc(p.name)}" loading="lazy"></figure>`).join('')}</div>` : ''}
<h2>${esc(p.name)}${p.variant ? ` — ${esc(p.variant)}` : ''}</h2>${it.price != null ? `<div class="price">${esc(money(it.price, d.currency))}</div>` : ''}
${prefs ? `<p class="muted">${esc(prefs)}</p>` : ''}<dl>${[['Dimensions', p.dimensions], ['Material', p.material], ['Finish', p.finish], ['Reference', it.piece_code || p.sku]].filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
${p.description ? `<p>${esc(p.description)}</p>` : ''}${it.videos.map((v) => `<div class="vmeta">▶ <a href="#" data-yt-out>${esc(v.title)}</a> · ${esc(v.scope_label)}</div>`).join('')}</div>`;
    }).join('');
    shell(d.title, d.business_name, `<h1>${esc(d.title)}</h1><p class="muted">${esc(d.note)}</p>${items || '<p>No items.</p>'}`);
  }

  const P = window.AHS.public;
  if (kind === 'item') {
    let token = qs.get('t');
    if (!token && qs.get('code')) token = P.tokenForCode(qs.get('code'));
    const d = token && P.item(token);
    if (d) renderItemPage(d, token); else notAvailable(P.businessName());
  } else {
    const d = P.catalogue(qs.get('t') || '');
    if (d) renderCataloguePage(d); else notAvailable(P.businessName());
  }
})();

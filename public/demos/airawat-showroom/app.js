/* Teakwood Showroom — staff app (vanilla JS, no build step) */
'use strict';

// ---------------- helpers ----------------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => (n == null || n === '' ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n));
const view = $('#view');
let ME = null;
let LOCS = [];
const can = (p) => !!ME && ME.permissions.includes(p);

// Demo: the API is answered in the browser by mock-db.js (same endpoints and responses as the
// original Express server; data is kept in this browser's localStorage).
async function api(path, { method = 'GET', body } = {}) {
  try {
    return await window.AHS.request(method, path, body);
  } catch (err) {
    if (err.status === 401 && path !== '/login') { ME = null; location.hash = '#/login'; throw new Error('Please sign in'); }
    const e = new Error(err.message || 'Request failed'); e.data = err.data || {}; throw e;
  }
}

function toast(msg, err = false) {
  const t = $('#toast');
  t.textContent = msg; t.className = 'toast show' + (err ? ' err' : '');
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.className = 'toast'; }, err ? 4500 : 2600);
}
const fail = (e) => toast(e.message || String(e), true);

const STATUS_LABEL = { available_now: 'Available Now', reserved: 'Reserved', out_of_stock: 'Out of Stock', made_to_order: 'Made to Order', display_only: 'Display Only', damaged: 'Damaged', sold: 'Sold', in_transit: 'In Transit' };
const badge = (s, label) => `<span class="badge b-${esc(s)}">${esc(label || STATUS_LABEL[s] || s)}</span>`;
const photo = (url) => esc(url || 'mark.png');

// ---------------- bottom sheet / dialogs ----------------
const sheet = {
  el: $('#sheet'),
  open(html) {
    $('.sheet-body', this.el).innerHTML = html;
    this.el.hidden = false;
    const f = $('.sheet-body input, .sheet-body select, .sheet-body button', this.el);
    if (f) setTimeout(() => f.focus(), 30);
    return $('.sheet-body', this.el);
  },
  close() { this.el.hidden = true; $('.sheet-body', this.el).innerHTML = ''; if (this.onclose) { const f = this.onclose; this.onclose = null; f(); } },
};
sheet.el.addEventListener('click', (e) => { if (e.target.matches('[data-close]')) sheet.close(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.el.hidden) sheet.close(); });

/** Explicit confirmation step for anything that changes stock. */
function confirmAction(title, lines, label = 'Confirm', note = 'This will update stock and be recorded in the stock ledger.') {
  return new Promise((resolve) => {
    const b = sheet.open(`<h2>${esc(title)}</h2><div class="card" style="box-shadow:none;border:1px solid var(--line)">${lines.map((l) => `<div>${l}</div>`).join('')}</div>
      ${note ? `<p class="muted small">${esc(note)}</p>` : ''}
      <div class="row"><button class="btn" data-close>Cancel</button><span class="spacer"></span><button class="btn primary" id="cfm">${esc(label)}</button></div>`);
    let done = false;
    sheet.onclose = () => { if (!done) resolve(false); };
    $('#cfm', b).onclick = () => { done = true; sheet.close(); resolve(true); };
  });
}

const formData = (el) => Object.fromEntries($$('[name]', el).map((i) => [i.name, i.type === 'checkbox' ? i.checked : i.value]));
const locOptions = (sel, filter) => LOCS.filter(filter || (() => true)).map((l) => `<option value="${l.id}" ${Number(sel) === l.id ? 'selected' : ''}>${esc(l.name)} (${esc(l.type)})</option>`).join('');
const locName = (id) => (LOCS.find((l) => l.id === Number(id)) || {}).name || '—';

// ---------------- current customer shortlist ----------------
const current = {
  get() { try { return JSON.parse(localStorage.getItem('ahs_shortlist') || 'null'); } catch { return null; } },
  set(v) { try { v ? localStorage.setItem('ahs_shortlist', JSON.stringify(v)) : localStorage.removeItem('ahs_shortlist'); } catch { /* private mode */ } renderCustbar(); },
};
function renderCustbar() {
  const c = current.get(), bar = $('#custbar');
  if (!c || !ME) { bar.hidden = true; return; }
  bar.hidden = false;
  bar.innerHTML = `<a href="#/shortlist/${c.id}" title="Current customer shortlist">♡ ${esc(c.name || 'Shortlist #' + c.id)}</a><button title="Finish with this customer" aria-label="Finish shortlist">✕</button>`;
  $('button', bar).onclick = () => current.set(null);
}

// ---------------- router ----------------
const routes = {};
function route(name, fn) { routes[name] = fn; }
async function router() {
  const [pathPart, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const [name, arg] = pathPart.split('/');
  const params = new URLSearchParams(qs || '');
  if (!ME && name !== 'login') {
    try { ME = await api('/me'); LOCS = await api('/locations'); } catch (e) {
      // 401 already sent us to sign-in; anything else (e.g. first-run setup not done) is shown here
      if (!/sign in/i.test(e.message)) view.innerHTML = `<div class="notice bad" style="margin-top:20px">${esc(e.message)}</div>`;
      return;
    }
  }
  stopScanner();
  $('#tabs').hidden = !ME;
  $('#who').innerHTML = ME ? `${esc(ME.name)}` : '';
  renderCustbar();
  const tab = { product: 'find', piece: 'find', shortlist: 'shortlists', ledger: 'stock', reservations: 'stock' }[name] || name;
  $$('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab || (a.dataset.tab === 'more' && ['quotations', 'quotation', 'labels', 'labelprint', 'enquiries', 'edit', 'settings', 'users', 'locations', 'password'].includes(name))));
  const fn = routes[name] || routes.find;
  view.innerHTML = '<p class="muted">Loading…</p>';
  try { await fn(arg, params); } catch (e) { if (ME) view.innerHTML = `<div class="notice bad">${esc(e.message)}</div>`; }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', router);

// ---------------- login ----------------
// Demo staff logins (sample data only). The role buttons fill in the form.
const DEMO_LOGINS = [
  ['admin', 'Admin', 'everything, plus staff logins'],
  ['manager', 'Manager', 'sees cost & margin, edits products & settings'],
  ['sales', 'Sales', 'find, shortlist, quote, reserve'],
  ['store', 'Storekeeper', 'receive, transfer, dispatch, count'],
];
route('login', (_, params) => {
  $('#tabs').hidden = true;
  $('#who').innerHTML = '';
  const as = DEMO_LOGINS.find((l) => l[0] === params.get('as'));
  view.innerHTML = `<form class="login card" id="lf"><img src="logo.webp" alt="Teakwood Living">
    <h1 style="text-align:center">Showroom sign in</h1>
    <label>Username<input name="username" autocomplete="username" autocapitalize="none" required value="${as ? esc(as[0]) : ''}"></label>
    <label>Password<input name="password" type="password" autocomplete="current-password" required value="${as ? esc(window.AHS.DEMO_PASSWORD) : ''}"></label>
    <p id="lerr" class="check-bad small"></p><button class="btn primary block">Sign in</button>
    <div class="demo-logins"><div class="small muted">Demo logins · password <b class="mono">${esc(window.AHS.DEMO_PASSWORD)}</b></div>
      <div class="grid2">${DEMO_LOGINS.map(([u, r, what]) => `<button type="button" class="btn sm" data-demo="${u}" title="${esc(what)}">${esc(r)}<span class="small muted mono">${esc(u)}</span></button>`).join('')}</div></div></form>`;
  $$('[data-demo]').forEach((b) => { b.onclick = () => { const f = $('#lf'); f.username.value = b.dataset.demo; f.password.value = window.AHS.DEMO_PASSWORD; $('#lerr').textContent = ''; }; });
  $('#lf').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/login', { method: 'POST', body: formData(e.target) });
      ME = await api('/me'); LOCS = await api('/locations'); facetCache = null;
      if (location.hash.startsWith('#/find')) router(); else location.hash = '#/find';
    } catch (err) { $('#lerr').textContent = err.message; }
  };
});

// ---------------- scanning (camera, USB/Bluetooth, typed) ----------------
/** Resolve a code and show what it is. Read-only: nothing changes until an action is chosen and confirmed. */
async function handleScan(code, { quiet } = {}) {
  let r;
  try { r = await api('/scan?code=' + encodeURIComponent(code)); } catch (e) { if (!quiet) fail(e); return null; }
  if (navigator.vibrate) navigator.vibrate(40);
  await scanSheet(r);
  return r;
}

async function scanSheet(r) {
  const isPiece = r.type === 'piece';
  const d = isPiece ? await api('/pieces/' + r.piece_id) : await api('/products/' + r.product_id);
  const p = isPiece ? d.product : d;
  const pc = isPiece ? d.piece : null;
  const status = isPiece ? pc.status : p.availability.status;
  const where = isPiece ? `${esc(pc.location || '—')}${pc.rack ? ' · <b>' + esc(pc.rack) + '</b>' : ''}`
    : p.availability.byLocation.filter((l) => l.available > 0).map((l) => `${esc(l.location)}${l.racks.length ? ' · <b>' + esc(l.racks.join(', ')) + '</b>' : ''} (${l.available})`).join('<br>') || 'Not available at any location';
  const b = sheet.open(`<div class="item" style="box-shadow:none;padding:0"><img src="${photo(isPiece ? pc.photo : (p.photos[0] || {}).url)}" alt="">
      <div class="grow"><div class="t">${esc(p.name)}${p.variant_label ? ' — ' + esc(p.variant_label) : ''}</div>
      <div class="small muted mono">${isPiece ? 'Piece ' + esc(pc.piece_code) : esc(p.sku)} · matched ${esc(r.matched.replace('_', ' '))}</div>
      <div>${badge(status, isPiece ? pc.status_label : p.status_label)} <b>${money(isPiece ? pc.selling_price : p.selling_price)}</b></div></div></div>
    <div class="card" style="box-shadow:none;border:1px solid var(--line)"><div class="small muted">Where</div>${where}
      ${!isPiece ? `<div class="small" style="margin-top:6px">Available <b>${p.availability.totals.available}</b> · Reserved ${p.availability.totals.reserved} · Physical ${p.availability.totals.physical}</div>` : ''}
      ${isPiece && pc.display_piece && !pc.display_for_sale ? '<div class="notice">Showroom display piece — not for sale</div>' : ''}</div>
    <div class="grid2" id="sa">
      <button class="btn" data-a="open">Open details</button>
      <button class="btn" data-a="videos">Photos &amp; videos</button>
      ${can('quote') ? '<button class="btn" data-a="shortlist">♡ Add to shortlist</button><button class="btn" data-a="quote">Add to quotation</button>' : ''}
      ${can('reserve') && status === 'available_now' ? `<button class="btn primary" data-a="reserve">Reserve ${isPiece ? 'this piece' : ''}</button>` : ''}
      ${can('receive') && !isPiece ? '<button class="btn" data-a="receive">Receive</button>' : ''}
      ${can('return') && isPiece && pc.raw_status === 'sold' ? '<button class="btn" data-a="return">Inspected return</button>' : ''}
      ${can('transfer') ? '<button class="btn" data-a="transfer">Transfer</button>' : ''}
      ${can('dispatch') ? '<button class="btn" data-a="dispatch">Dispatch</button>' : ''}
      ${can('count') ? '<button class="btn" data-a="count">Count</button>' : ''}
    </div><p class="small muted">Scanning never changes stock. Choose an action and confirm it.</p>`);
  $('#sa', b).onclick = (e) => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    const act = a.dataset.a;
    sheet.close();
    const ctx = { product: p, piece: pc };
    if (act === 'open') location.hash = isPiece ? `#/piece/${pc.id}` : `#/product/${p.id}`;
    else if (act === 'videos') location.hash = (isPiece ? `#/piece/${pc.id}` : `#/product/${p.id}`) + '?v=1';
    else if (act === 'shortlist') addToShortlist(p.id, pc && pc.id);
    else if (act === 'quote') addToQuotation(p, pc);
    else stockSheet(act, ctx, () => router());
  };
}

// USB / Bluetooth keyboard-wedge scanners: fast keystrokes ending in Enter.
(function hidScanner() {
  let buf = '', last = 0, fast = 0;
  document.addEventListener('keydown', (e) => {
    if (!ME || e.ctrlKey || e.metaKey || e.altKey) return;
    const now = performance.now();
    const inField = e.target.matches('input, textarea, select');
    if (e.key === 'Enter') {
      if (!inField && buf.length >= 4 && fast >= buf.length - 2) { e.preventDefault(); handleScan(buf); }
      buf = ''; fast = 0; return;
    }
    if (e.key.length !== 1) return;
    if (now - last > 80) { buf = ''; fast = 0; } else fast++;
    buf += e.key; last = now;
  }, true);
})();

// Demo: the host site blocks the camera, so the scanner offers real sample label codes instead.
// (The original uses html5-qrcode with the phone camera; every scanned code goes through the same handler.)
let scanner = null;
async function startScanner(elId, onCode) {
  const codes = await api('/demo/sample-codes');
  $('#' + elId).innerHTML = `<div class="demo-scan"><div class="demo-frame"><span></span></div>
    <p>Camera preview is off in this demo.<br>Tap a sample label to “scan” it.</p></div>`;
  $('#samples').innerHTML = `<h2>Scan a sample label</h2><div class="list">${codes.map((c) => `<button class="item sample" data-code="${esc(c.code)}">
      <span class="code-ic">${/^QR/.test(c.kind) ? '▦' : '║▌║'}</span><span class="grow"><span class="t">${esc(c.label)}</span><span class="small muted">${esc(c.kind)}</span><span class="small mono muted code-txt">${esc(c.code)}</span></span></button>`).join('')}</div>`;
  $$('#samples [data-code]').forEach((b) => { b.onclick = () => onCode(b.dataset.code); });
}
function stopScanner() { scanner = null; }

route('scan', async (_, params) => {
  const mode = params.get('mode') || 'lookup';
  const cur = current.get();
  view.innerHTML = `<h1>Scan</h1>
    <div class="chips"><select id="mode" aria-label="Scan mode">
      <option value="lookup" ${mode === 'lookup' ? 'selected' : ''}>Look up item</option>
      <option value="shortlist" ${mode === 'shortlist' ? 'selected' : ''}>Add each scan to shortlist${cur ? ' — ' + esc(cur.name || '#' + cur.id) : ''}</option></select></div>
    <div class="scanner"><div id="reader"></div></div>
    <p id="camerr" class="small muted">Point the camera at a barcode or QR label. A USB or Bluetooth scanner also works on any screen.</p>
    <form id="manual" class="row"><input name="code" placeholder="Or type a code / SKU" autocapitalize="characters" style="flex:1"><button class="btn">Go</button></form>
    <div id="samples"></div>
    <div id="recent" class="list" style="margin-top:12px"></div>`;
  $('#mode').onchange = (e) => { location.hash = '#/scan?mode=' + e.target.value; };
  const onCode = async (code) => {
    if ($('#mode').value === 'shortlist') {
      const r = await api('/scan?code=' + encodeURIComponent(code)).catch((e) => { fail(e); return null; });
      if (r) { if (navigator.vibrate) navigator.vibrate(40); await addToShortlist(r.product_id, r.piece_id, { code }); }
    } else await handleScan(code);
  };
  $('#manual').onsubmit = (e) => { e.preventDefault(); const c = e.target.code.value.trim(); if (c) onCode(c); e.target.code.value = ''; };
  try { await startScanner('reader', onCode); } catch (e) {
    $('#camerr').innerHTML = `<span class="check-bad">Camera unavailable: ${esc(e.message || e)}.</span> Phone cameras need the app opened over HTTPS (or localhost) and camera permission. You can still type codes or use a USB/Bluetooth scanner.`;
  }
});

// ---------------- Find ----------------
let facetCache = null;
route('find', async (_, params) => {
  const q = params.get('q') || '';
  facetCache = facetCache || await api('/facets');
  const opt = (arr, sel) => arr.map((v) => `<option ${v === sel ? 'selected' : ''}>${esc(v)}</option>`).join('');
  view.innerHTML = `<form class="searchbar" id="sf" role="search">
      <input name="q" value="${esc(q)}" placeholder="Name, SKU, barcode, material, 120x60…" autocomplete="off" enterkeyhint="search" aria-label="Search products">
      <a class="btn primary" href="#/scan" title="Scan with camera" aria-label="Scan with camera">▣</a></form>
    <div class="chips">
      <select name="category" aria-label="Category"><option value="">All categories</option>${opt(facetCache.categories, params.get('category'))}</select>
      <select name="availability" aria-label="Availability"><option value="">Any availability</option>${Object.entries(STATUS_LABEL).slice(0, 6).map(([k, v]) => `<option value="${k}" ${params.get('availability') === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <select name="material" aria-label="Material"><option value="">Any material</option>${opt(facetCache.materials, params.get('material'))}</select>
      <select name="finish" aria-label="Finish"><option value="">Any finish</option>${opt(facetCache.finishes, params.get('finish'))}</select>
    </div><div id="results"></div>`;
  const form = $('#sf');
  const qInput = form.q;
  const filters = () => Object.fromEntries($$('.chips select').map((s) => [s.name, s.value]).filter(([, v]) => v));
  let seq = 0;
  async function run() {
    const my = ++seq;
    const p = new URLSearchParams({ q: qInput.value, ...filters() });
    history.replaceState(null, '', '#/find?' + p);
    const cards = await api('/search?' + p);
    if (my !== seq) return;
    $('#results').innerHTML = cards.length ? `<div class="cards">${cards.map(cardHtml).join('')}</div>` : '<p class="empty">No products match. Try fewer words, or scan the label.</p>';
  }
  let t;
  qInput.oninput = () => { clearTimeout(t); t = setTimeout(run, 180); };
  $$('.chips select').forEach((s) => { s.onchange = run; });
  form.onsubmit = async (e) => {
    e.preventDefault();
    const code = qInput.value.trim();
    // Enter (also sent by USB scanners): exact code match opens the item, otherwise search.
    if (code && !/\s/.test(code)) {
      const r = await api('/scan?code=' + encodeURIComponent(code)).catch(() => null);
      if (r) { qInput.select(); return scanSheet(r); }
    }
    run();
  };
  await run();
  if (matchMedia('(pointer:fine)').matches) qInput.focus();
});

function cardHtml(c) {
  return `<a class="pcard" href="#/product/${c.id}"><img class="ph" src="${photo(c.photo)}" alt="" loading="lazy">
    <div class="bd"><div>${badge(c.status, c.status_label)}${c.status === 'available_now' ? ` <span class="small muted">${c.available}</span>` : ''}</div>
    <div class="nm">${esc(c.name)}${c.variant_label ? ` <span class="muted">— ${esc(c.variant_label)}</span>` : ''}</div>
    <div class="meta">${esc([c.material, c.finish, c.dimensions].filter(Boolean).join(' · '))}</div>
    <div class="meta mono">${esc(c.sku)}${c.variants ? ` · ${c.variants} variants` : ''}</div>
    ${c.expected ? `<div class="meta">Expected ${esc(c.expected.date)}</div>` : ''}
    <div class="pr">${money(c.selling_price)}</div></div></a>`;
}

// ---------------- videos ----------------
function videosHtml(videos) {
  if (!videos.length) return '<p class="muted small">No videos yet.</p>';
  return videos.map((v) => {
    const blocked = v.embed_status === 'embed_disabled' || v.embed_status === 'unavailable';
    const scopeBadge = v.scope === 'exact_piece' ? badge('exact', v.scope_label) : v.scope === 'same_design' ? badge('design', v.scope_label) : '';
    return `<div class="vid"><div class="vbox" data-vid="${v.id}" data-yt="${esc(v.youtube_id)}">
      ${blocked ? `<div class="verr">${v.embed_status === 'unavailable' ? 'This video was removed or made private.' : 'Embedding is turned off for this video.'}<br><a class="btn sm" href="#" data-yt-out>Open on YouTube</a></div>`
        : `<button aria-label="Play ${esc(v.title)}"><img src="${esc(v.thumbnail)}" alt="" loading="lazy"><span class="play">▶ Play</span></button>`}</div>
      <div class="vmeta"><b>${esc(v.title)}</b></div>
      <div class="vmeta">${v.is_primary ? '★ ' : ''}<span class="badge b-out_of_stock">${esc(v.video_type)}</span>${scopeBadge}${v.visibility === 'internal' ? badge('internal', 'Internal only') : ''}
      <a href="#" data-yt-out>Open on YouTube ↗</a></div></div>`;
  }).join('');
}
// Demo: the YouTube player is replaced by a placeholder, so the demo makes no requests to YouTube.
// (The original loads the YouTube iframe API with youtube-nocookie.com and reports player errors.)
function bindVideos(root) {
  $$('.vbox > button', root).forEach((btn) => {
    btn.onclick = () => {
      btn.parentNode.innerHTML = `<div class="verr">▶ In the real app the YouTube video plays here (privacy-enhanced embed).<br><span class="small">Video playback is turned off in this demo.</span></div>`;
    };
  });
  $$('[data-yt-out]', root).forEach((a) => { a.onclick = (e) => { e.preventDefault(); toast('Demo mode: in the real app this opens the video on YouTube.'); }; });
}

// ---------------- product detail ----------------
function galleryHtml(photos, pieceView) {
  if (!photos.length) return `<div class="gallery"><figure><img src="mark.png" alt=""></figure></div>`;
  return `<div class="gallery">${photos.map((ph) => `<figure><img src="${esc(ph.url)}" alt="" loading="lazy">${pieceView ? `<figcaption>${ph.exact_piece ? 'This exact piece' : 'Same design'}</figcaption>` : ''}${!ph.is_public ? '<figcaption style="left:auto;right:8px">Internal</figcaption>' : ''}</figure>`).join('')}</div>${photos.length > 1 ? `<div class="small muted">${photos.length} photos — swipe</div>` : ''}`;
}

function costHtml(price, cost) {
  if (cost === undefined || cost === null) return '';
  const m = price ? Math.round(((price - cost) / price) * 100) : null;
  return `<div class="notice info small">Internal: cost ${money(cost)}${m != null ? ` · margin ${m}%` : ''}</div>`;
}

route('product', async (id, params) => {
  const p = await api('/products/' + id);
  const a = p.availability, t = a.totals;
  const locRows = a.byLocation.map((l) => `<tr><td><b>${esc(l.location)}</b><div class="small muted">${esc(l.type)}</div></td><td>${esc(l.racks.join(', ') || '—')}</td>
      <td class="n"><b class="check-ok">${l.available}</b></td><td class="n">${l.reserved}</td><td class="n">${l.display}${l.display_for_sale ? ` <span class="small muted">+${l.display_for_sale} for sale</span>` : ''}</td><td class="n">${l.damaged}</td><td class="n">${l.physical}</td></tr>`).join('');
  const pieces = p.pieces.map((pc) => `<a class="item" href="#/piece/${pc.id}"><img src="${photo(pc.photo)}" alt="">
      <div class="grow"><div class="t mono">${esc(pc.piece_code)}</div><div class="small muted">${esc(pc.condition)}${pc.finish_note ? ' · ' + esc(pc.finish_note) : ''}</div>
      <div class="small">${esc(pc.location || '—')}${pc.rack ? ' · <b>' + esc(pc.rack) + '</b>' : ''}</div></div>
      <div style="text-align:right">${badge(pc.status, pc.status_label)}${pc.display_piece && pc.display_for_sale ? '<div class="small muted">Display, for sale</div>' : ''}<div><b>${money(pc.selling_price)}</b></div></div></a>`).join('');
  const res = p.reservations.map((r) => `<div class="item"><div class="grow"><div class="t">${esc(r.customer_name || 'No customer name')}</div>
      <div class="small muted">${r.piece_code ? 'Piece ' + esc(r.piece_code) + ' · ' : ''}${r.qty} at ${esc(r.location || '—')} · by ${esc(r.by_name || '—')} · ${esc(r.created_at)}</div></div>
      ${can('reserve') ? `<button class="btn sm" data-release="${r.id}">Release</button>` : ''}${can('dispatch') ? `<button class="btn sm" data-dispatch-res="${r.id}">Dispatch</button>` : ''}</div>`).join('');
  view.innerHTML = `<a href="javascript:history.back()" class="small">← Back</a>
  <div class="detail"><div class="d-media">${galleryHtml(p.photos)}</div><div class="d-videos"><h2 id="videos">Videos</h2>${videosHtml(p.videos)}</div>
  <div class="d-info">
    <div class="row">${badge(a.status, p.status_label)}<span class="small muted mono">${esc(p.sku)} · ${esc(p.internal_code)}${p.mfr_barcode ? ' · Mfr ' + esc(p.mfr_barcode) : ''}</span></div>
    <h1>${esc(p.name)}${p.variant_label ? ` <span class="muted">— ${esc(p.variant_label)}</span>` : ''}</h1>
    <div class="price">${money(p.selling_price)}</div>
    ${costHtml(p.selling_price, p.cost_price)}
    ${a.expected ? `<div class="notice info">Expected availability: <b>${esc(a.expected.date)}</b> (${a.expected.source === 'made_to_order' ? `made to order, ~${a.expected.lead_time_days} days` : `incoming ${esc(a.expected.source)}, ${a.expected.qty} pcs`})</div>` : ''}
    ${t.display && !t.available ? '<div class="notice">Only showroom display stock — not for sale unless released for sale.</div>' : ''}
    <div class="kpis"><div class="kpi av"><b>${t.available}</b><span>Available now</span></div><div class="kpi"><b>${t.reserved}</b><span>Reserved</span></div><div class="kpi"><b>${t.physical}</b><span>Physical</span></div></div>
    <div class="small muted">Display (not for sale) ${t.display} · Display for sale ${t.display_for_sale} · Damaged ${t.damaged}${t.in_transit ? ' · In transit ' + t.in_transit : ''}</div>
    <div class="actions" id="pa">
      ${can('quote') ? '<button class="btn primary" data-a="shortlist">♡ Shortlist</button><button class="btn" data-a="quote">Add to quotation</button>' : ''}
      ${can('reserve') && p.tracking === 'sku' && t.available ? '<button class="btn" data-a="reserve">Reserve</button>' : ''}
      ${can('enquiry') ? '<button class="btn" data-a="enquiry">Enquiry</button>' : ''}
      ${can('quote') ? '<button class="btn" data-a="request">Purchase / production request</button>' : ''}
      ${['receive', 'transfer', 'dispatch', 'count', 'adjust', 'return'].some(can) ? '<button class="btn" data-a="stock">Stock action…</button>' : ''}
      ${can('labels') ? `<a class="btn" href="#/labels?add=product:${p.id}">Label</a>` : ''}
      ${p.public_enabled ? `<a class="btn" href="p.html?t=${esc(p.public_token)}" target="_blank" rel="noopener">Customer page ↗</a>` : ''}
      ${can('manage_products') ? `<a class="btn" href="#/edit/${p.id}">Edit</a>` : ''}
    </div>
    ${p.variants.length ? `<h2>Other variants</h2><div class="list">${p.variants.map((v) => `<a class="item" href="#/product/${v.id}"><img src="${photo(v.photo)}" alt=""><div class="grow"><div class="t">${esc(v.variant_label || v.name)}</div><div class="small muted">${esc(v.finish || '')} · ${money(v.selling_price)}</div></div>${badge(v.status, v.status_label)}</a>`).join('')}</div>` : ''}
    <h2>Where it is</h2>
    ${a.byLocation.length ? `<div class="tablewrap"><table><thead><tr><th>Location</th><th>Rack / zone</th><th class="n">Avail.</th><th class="n">Res.</th><th class="n">Display</th><th class="n">Dmg</th><th class="n">Phys.</th></tr></thead><tbody>${locRows}</tbody></table></div>` : '<p class="muted">No stock at any location.</p>'}
    ${p.tracking === 'piece' ? `<h2>Individual pieces (${p.pieces.length})</h2><div class="list">${pieces || '<p class="muted">No pieces received yet.</p>'}</div>` : ''}
    ${p.reservations.length ? `<h2>Active reservations</h2><div class="list" id="resl">${res}</div>` : ''}
    <h2>Specifications</h2><dl class="specs">${[['Category', p.category], ['Material', p.material], ['Finish', p.finish], ['Dimensions', p.dimensions ? p.dimensions + ' (L × W × H)' : null], ['Tracking', p.tracking === 'piece' ? 'Individual pieces' : 'By SKU quantity'], ['Vendor', p.vendor]].filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    ${p.description ? `<p>${esc(p.description)}</p>` : ''}${p.care ? `<p class="small"><b>Care:</b> ${esc(p.care)}</p>` : ''}
    ${p.internal_notes ? `<div class="notice info small">Internal note: ${esc(p.internal_notes)}</div>` : ''}
    ${p.alternatives.length ? `<h2>Available alternatives</h2><div class="cards">${p.alternatives.map(cardHtml).join('')}</div>` : (a.status !== 'available_now' ? '<p class="muted small">No similar items available right now — create an enquiry or request.</p>' : '')}
  </div></div>`;
  bindVideos(view);
  if (params.get('v')) $('#videos').scrollIntoView();
  $('#pa').onclick = (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const act = b.dataset.a;
    if (act === 'shortlist') addToShortlist(p.id);
    else if (act === 'quote') addToQuotation(p);
    else if (act === 'enquiry') enquirySheet(p);
    else if (act === 'request') requestSheet(p);
    else if (act === 'stock') stockMenu({ product: p });
    else if (act === 'reserve') stockSheet('reserve', { product: p }, router);
  };
  bindReservationButtons(view);
});

function bindReservationButtons(root) {
  $$('[data-release]', root).forEach((b) => { b.onclick = async () => {
    if (!(await confirmAction('Release reservation', ['The reserved stock becomes available again.'], 'Release'))) return;
    try { await api('/stock/release', { method: 'POST', body: { reservation_id: Number(b.dataset.release), confirm: true } }); toast('Reservation released'); router(); } catch (e) { fail(e); }
  }; });
  $$('[data-dispatch-res]', root).forEach((b) => { b.onclick = async () => {
    if (!(await confirmAction('Dispatch reserved stock', ['Stock leaves the location and the reservation is fulfilled.'], 'Dispatch'))) return;
    try { await api('/stock/dispatch', { method: 'POST', body: { reservation_id: Number(b.dataset.dispatchRes), confirm: true } }); toast('Dispatched'); router(); } catch (e) { fail(e); }
  }; });
}

// ---------------- piece detail ----------------
route('piece', async (id, params) => {
  const d = await api('/pieces/' + id);
  const pc = d.piece, p = d.product;
  view.innerHTML = `<a href="#/product/${p.id}" class="small">← ${esc(p.name)}</a>
  <div class="detail"><div class="d-media">${galleryHtml(d.photos, true)}</div><div class="d-videos"><h2 id="videos">Videos</h2>${videosHtml(d.videos)}</div>
  <div class="d-info">
    <div class="row">${badge(pc.status, pc.status_label)}${pc.display_piece ? `<span class="badge b-display_only">${pc.display_for_sale ? 'Display piece — for sale' : 'Display piece — not for sale'}</span>` : ''}</div>
    <h1>${esc(p.name)}${p.variant_label ? ` <span class="muted">— ${esc(p.variant_label)}</span>` : ''}</h1>
    <div class="mono">Piece ${esc(pc.piece_code)} <span class="muted">· SKU ${esc(p.sku)}${pc.mfr_barcode ? ' · Mfr ' + esc(pc.mfr_barcode) : ''}</span></div>
    <div class="price">${money(pc.selling_price)}</div>${costHtml(pc.selling_price, pc.cost_price)}
    <div class="card"><dl class="specs"><dt>Location</dt><dd><b>${esc(pc.location || '—')}</b> <span class="muted">${esc(pc.location_type || '')}</span></dd>
      <dt>Rack / zone</dt><dd><b>${esc(pc.rack || '—')}</b></dd><dt>Condition</dt><dd>${esc(pc.condition)}</dd>${pc.finish_note ? `<dt>Finish</dt><dd>${esc(pc.finish_note)}</dd>` : ''}
      <dt>Design</dt><dd>${esc([p.material, p.finish, p.dimensions].filter(Boolean).join(' · '))}</dd></dl>
      ${pc.notes ? `<p class="small muted">${esc(pc.notes)}</p>` : ''}</div>
    ${pc.reservation ? `<div class="notice">Reserved${pc.reservation.customer_name ? ' for <b>' + esc(pc.reservation.customer_name) + '</b>' : ''} by ${esc(pc.reservation.by_name || '—')} · ${esc(pc.reservation.created_at)}
      <div class="row" style="margin-top:6px">${can('reserve') ? `<button class="btn sm" data-release="${pc.reservation.id}">Release</button>` : ''}${can('dispatch') ? `<button class="btn sm" data-dispatch-res="${pc.reservation.id}">Dispatch</button>` : ''}</div></div>` : ''}
    <div class="actions" id="pa">
      ${can('reserve') && pc.status === 'available_now' ? '<button class="btn primary" data-a="reserve">Reserve this piece</button>' : ''}
      ${can('quote') ? '<button class="btn" data-a="shortlist">♡ Shortlist</button><button class="btn" data-a="quote">Add to quotation</button>' : ''}
      ${can('enquiry') ? '<button class="btn" data-a="enquiry">Enquiry</button>' : ''}
      ${['transfer', 'dispatch', 'count', 'adjust', 'return'].some(can) ? '<button class="btn" data-a="stock">Stock action…</button>' : ''}
      ${can('labels') ? `<a class="btn" href="#/labels?add=piece:${pc.id}">Label</a>` : ''}
      ${pc.public_enabled && p.public_enabled ? `<a class="btn" href="p.html?t=${esc(pc.public_token)}" target="_blank" rel="noopener">Customer page ↗</a>` : ''}
    </div>
    ${d.alternatives.length ? `<h2>Available alternatives</h2><div class="list">${d.alternatives.map((x) => x.kind === 'piece'
      ? `<a class="item" href="#/piece/${x.id}"><img src="${photo(x.photo)}" alt=""><div class="grow"><div class="t">Same design · <span class="mono">${esc(x.piece_code)}</span></div><div class="small muted">${esc(x.condition)} · ${esc(x.location || '')} ${esc(x.rack || '')}</div></div><div>${badge(x.status, x.status_label)}<div><b>${money(x.selling_price)}</b></div></div></a>`
      : `<a class="item" href="#/product/${x.id}"><img src="${photo(x.photo)}" alt=""><div class="grow"><div class="t">${esc(x.name)}</div><div class="small muted">${esc(x.sku)}</div></div><div>${badge(x.status, x.status_label)}<div><b>${money(x.selling_price)}</b></div></div></a>`).join('')}</div>` : ''}
    <h2>Movement history</h2>
    <div class="tablewrap"><table><thead><tr><th>When</th><th>Movement</th><th>From → To</th><th>By</th></tr></thead><tbody>
      ${d.history.map((h) => `<tr><td class="small">${esc(h.ts)}</td><td>${esc(h.movement.replace('_', ' '))}${h.condition ? ` <span class="small muted">${esc(h.condition)}</span>` : ''}${h.reference ? `<div class="small muted">${esc(h.reference)}</div>` : ''}${h.note ? `<div class="small muted">${esc(h.note)}</div>` : ''}</td><td class="small">${esc(h.from_loc || '')}${h.to_loc ? ' → ' + esc(h.to_loc) : ''}</td><td class="small">${esc(h.by_name || '')}</td></tr>`).join('')}
    </tbody></table></div>
  </div></div>`;
  bindVideos(view);
  bindReservationButtons(view);
  if (params.get('v')) $('#videos').scrollIntoView();
  $('#pa').onclick = (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const ctx = { product: p, piece: pc };
    ({ reserve: () => stockSheet('reserve', ctx, router), shortlist: () => addToShortlist(p.id, pc.id), quote: () => addToQuotation(p, pc), enquiry: () => enquirySheet(p, pc), stock: () => stockMenu(ctx) })[b.dataset.a]();
  };
});

// ---------------- stock actions ----------------
const OPS = { reserve: 'Reserve', receive: 'Receive stock', transfer: 'Transfer', dispatch: 'Dispatch', count: 'Stock count', condition: 'Change condition', return: 'Inspected return' };
const OP_PERM = { reserve: 'reserve', receive: 'receive', transfer: 'transfer', dispatch: 'dispatch', count: 'count', condition: 'adjust', return: 'return' };
function stockMenu(ctx) {
  const piece = ctx.piece;
  const ops = Object.keys(OPS).filter((o) => o !== 'reserve' && can(OP_PERM[o]) && !(piece && o === 'receive') && !(piece && o === 'return' && piece.raw_status !== 'sold'));
  const b = sheet.open(`<h2>Stock action</h2><p class="muted small">${esc(ctx.product.name)}${piece ? ' · piece ' + esc(piece.piece_code) : ''}</p>
    <div class="grid2">${ops.map((o) => `<button class="btn" data-op="${o}">${OPS[o]}</button>`).join('')}</div>`);
  b.onclick = (e) => { const o = e.target.closest('[data-op]'); if (o) { sheet.close(); stockSheet(o.dataset.op, ctx, router); } };
}

async function stockSheet(op, { product, piece }, after) {
  if (!can(OP_PERM[op])) return toast('You do not have permission for this action', true);
  if (product && !product.availability) product = await api('/products/' + product.id);
  const p = product;
  const isPiece = !!piece;
  if (!isPiece && p.tracking === 'piece' && !['receive'].includes(op)) {
    toast('Choose the exact piece first', true); location.hash = '#/product/' + p.id; return;
  }
  const byLoc = (id) => p.availability.byLocation.find((l) => l.location_id === Number(id)) || { available: 0, physical: 0 };
  const withStock = (l) => p.availability.byLocation.some((x) => x.location_id === l.id && x.physical > 0);
  const conds = '<option value="sellable">Sellable</option><option value="display">Display (not for sale)</option><option value="display_sale">Display — for sale</option><option value="damaged">Damaged</option>';
  let fields = '';
  if (op === 'reserve') fields = isPiece ? '<label>Customer name<input name="customer_name"></label>'
    : `<label>Location<select name="location_id">${locOptions(null, (l) => byLoc(l.id).available > 0)}</select></label><label>Quantity<input name="qty" type="number" min="1" value="1" inputmode="numeric"></label><label>Customer name<input name="customer_name"></label>`;
  if (op === 'receive') fields = `<label>Receive into<select name="location_id">${locOptions(null)}</select></label><label>Rack / zone<input name="rack"></label>
    <label>${p.tracking === 'piece' ? 'Number of pieces' : 'Quantity'}<input name="qty" type="number" min="1" value="1" inputmode="numeric"></label>
    <label>Condition<select name="condition">${conds}</select></label>
    ${p.tracking === 'piece' ? '<p class="small muted">Each piece gets its own piece ID and label. Edit cost, condition and photos per piece afterwards.</p>' : ''}
    ${p.incoming && p.incoming.length ? `<label>Against incoming order<select name="incoming_id"><option value="">—</option>${p.incoming.map((i) => `<option value="${i.id}">${esc(i.kind)} · ${i.qty} pcs · ${esc(i.expected_date || '')} ${esc(i.note || '')}</option>`).join('')}</select></label>` : ''}
    <label>Reference (GRN / invoice)<input name="reference"></label>`;
  if (op === 'transfer') fields = isPiece ? `<p>Now at <b>${esc(piece.location || '—')}</b> ${esc(piece.rack || '')}</p><label>Move to<select name="to_location_id">${locOptions(piece.location_id)}</select></label><label>Rack / zone<input name="rack" value="${esc(piece.rack || '')}"></label><label>Reference<input name="reference"></label>`
    : `<label>From<select name="from_location_id">${locOptions(null, withStock)}</select></label><label>To<select name="to_location_id">${locOptions(null)}</select></label>
      <label>Condition<select name="condition">${conds}</select></label><label>Quantity<input name="qty" type="number" min="1" value="1"></label><label>Rack / zone at destination<input name="rack"></label><label>Reference<input name="reference"></label>`;
  if (op === 'dispatch') fields = isPiece ? `<p>Dispatch piece <b class="mono">${esc(piece.piece_code)}</b> from ${esc(piece.location || '—')}. ${piece.reservation ? 'Its reservation will be fulfilled.' : ''}</p><label>Reference (invoice / order)<input name="reference"></label>`
    : `<label>From<select name="location_id">${locOptions(null, (l) => byLoc(l.id).available > 0)}</select></label><label>Quantity<input name="qty" type="number" min="1" value="1"></label><label>Reference (invoice / order)<input name="reference"></label><p class="small muted">To dispatch reserved stock, use Dispatch on the reservation.</p>`;
  if (op === 'count') fields = isPiece ? `<p>System says: <b>${esc(piece.location || '—')}</b> ${esc(piece.rack || '')}</p><label>Found at<select name="location_id">${locOptions(piece.location_id)}</select></label><label>Rack / zone<input name="rack" value="${esc(piece.rack || '')}"></label><label>Note<input name="note"></label>`
    : `<label>Location<select name="location_id" id="cloc">${locOptions(null)}</select></label><label>Condition<select name="condition" id="ccond">${conds}</select></label><p class="small">System quantity: <b id="sysq">—</b></p><label>Counted quantity<input name="counted_qty" type="number" min="0" inputmode="numeric" required></label><label>Note<input name="note"></label>`;
  if (op === 'condition') fields = isPiece ? `<p>Currently: ${badge(piece.status, piece.status_label)}</p><label>Change to<select name="to_condition"><option value="sellable">Available (sellable)</option><option value="display">Display — not for sale</option><option value="display_sale">Display — released for sale</option><option value="damaged">Damaged</option></select></label><label>Note<input name="note"></label>`
    : `<label>Location<select name="location_id">${locOptions(null, withStock)}</select></label><label>From<select name="from_condition">${conds}</select></label><label>To<select name="to_condition">${conds.replace('value="sellable"', 'value="sellable"')}</select></label><label>Quantity<input name="qty" type="number" min="1" value="1"></label><label>Note<input name="note"></label>`;
  if (op === 'return') fields = `<label>Returned to<select name="location_id">${locOptions(null)}</select></label>${isPiece ? '' : '<label>Quantity<input name="qty" type="number" min="1" value="1"></label>'}
    <label>Inspection result<select name="result"><option value="sellable">Good — back to sellable stock</option><option value="damaged">Damaged — keep out of sale</option></select></label><label>Rack / zone<input name="rack"></label><label>Reference (return / credit note)<input name="reference"></label><label>Inspection note<input name="note"></label>`;

  const b = sheet.open(`<h2>${OPS[op]}</h2><p class="muted small">${esc(p.name)}${p.variant_label ? ' — ' + esc(p.variant_label) : ''} · ${isPiece ? 'piece <span class="mono">' + esc(piece.piece_code) + '</span>' : esc(p.sku)}</p>
    <form id="sf">${fields}<div class="row" style="margin-top:12px"><button type="button" class="btn" data-close>Cancel</button><span class="spacer"></span><button class="btn primary">Review</button></div></form>`);
  if (op === 'count' && !isPiece) {
    const upd = () => {
      const l = byLoc($('#cloc', b).value), c = $('#ccond', b).value;
      $('#sysq', b).textContent = l.physical === 0 ? 0 : ({ sellable: l.physical - l.display - l.display_for_sale - l.damaged, display: l.display, display_sale: l.display_for_sale, damaged: l.damaged }[c]);
    };
    $('#cloc', b).onchange = upd; $('#ccond', b).onchange = upd; upd();
  }
  $('#sf', b).onsubmit = async (e) => {
    e.preventDefault();
    const f = formData(e.target);
    const body = { ...f, product_id: p.id, piece_id: piece ? piece.id : undefined };
    for (const k of ['qty', 'counted_qty', 'location_id', 'from_location_id', 'to_location_id', 'incoming_id']) if (body[k] !== undefined && body[k] !== '') body[k] = Number(body[k]); else if (body[k] === '') delete body[k];
    const lines = [`<b>${OPS[op]}</b> — ${esc(p.name)}${isPiece ? ' · <span class="mono">' + esc(piece.piece_code) + '</span>' : ''}`];
    if (body.qty) lines.push(`Quantity: <b>${body.qty}</b>`);
    if (body.counted_qty !== undefined) lines.push(`Counted: <b>${body.counted_qty}</b> (system ${esc($('#sysq', b).textContent)})`);
    if (body.from_location_id) lines.push(`From: ${esc(locName(body.from_location_id))}`);
    if (body.to_location_id) lines.push(`To: ${esc(locName(body.to_location_id))}${body.rack ? ' · ' + esc(body.rack) : ''}`);
    if (body.location_id) lines.push(`Location: ${esc(locName(body.location_id))}${body.rack ? ' · ' + esc(body.rack) : ''}`);
    if (body.condition) lines.push(`Condition: ${esc(body.condition)}`);
    if (body.to_condition) lines.push(`New condition: ${esc(body.from_condition ? body.from_condition + ' → ' : '')}${esc(body.to_condition)}`);
    if (body.result) lines.push(`Inspection: ${esc(body.result)}`);
    if (body.customer_name) lines.push(`Customer: ${esc(body.customer_name)}`);
    sheet.close();
    if (!(await confirmAction('Confirm ' + OPS[op].toLowerCase(), lines, OPS[op]))) return;
    try {
      const r = await api('/stock/' + op, { method: 'POST', body: { ...body, confirm: true } });
      toast(op === 'receive' && r.created && r.created.length ? `Received ${r.created.length} piece(s): ${r.created.map((c) => c.piece_code).join(', ')}` : `${OPS[op]} done`);
      if (after) after();
    } catch (err) { fail(err); }
  };
}

// ---------------- shortlist / quotation / enquiry helpers ----------------
async function addToShortlist(productId, pieceId, { code } = {}) {
  const cur = current.get();
  if (cur) {
    try { await api(`/shortlists/${cur.id}/items`, { method: 'POST', body: { product_id: productId, piece_id: pieceId } }); toast(`Added to ${cur.name || 'shortlist'} (not reserved)`); } catch (e) { fail(e); }
    return;
  }
  const lists = await api('/shortlists');
  const b = sheet.open(`<h2>Add to shortlist</h2><form id="nf"><label>Customer name<input name="customer_name" required></label><label>Phone (optional)<input name="customer_phone" inputmode="tel"></label>
    <button class="btn primary block" style="margin-top:8px">Start new shortlist</button></form>
    ${lists.length ? `<h3>Or continue</h3><div class="list">${lists.slice(0, 8).map((s) => `<button class="btn" data-sl="${s.id}" data-name="${esc(s.customer_name || '')}">${esc(s.customer_name || 'Shortlist #' + s.id)} · ${s.items} items</button>`).join('')}</div>` : ''}
    <p class="small muted">A shortlist does not reserve stock.</p>`);
  const use = async (id, name) => { current.set({ id, name }); sheet.close(); await addToShortlist(productId, pieceId, { code }); };
  $('#nf', b).onsubmit = async (e) => { e.preventDefault(); const f = formData(e.target); const r = await api('/shortlists', { method: 'POST', body: f }); use(r.id, f.customer_name); };
  $$('[data-sl]', b).forEach((x) => { x.onclick = () => use(Number(x.dataset.sl), x.dataset.name); });
}

async function addToQuotation(p, piece) {
  if (!p.pieces && p.tracking === 'piece' && !piece) p = await api('/products/' + p.id);
  const quotes = (await api('/quotations')).filter((q) => q.status === 'draft');
  const freePieces = (p.pieces || []).filter((x) => x.status === 'available_now');
  const b = sheet.open(`<h2>Add to quotation</h2><p class="small muted">${esc(p.name)}${piece ? ' · piece ' + esc(piece.piece_code) : ''}</p>
    <form id="qf"><label>Quotation<select name="qid"><option value="new">New quotation…</option>${quotes.map((q) => `<option value="${q.id}">${esc(q.number)} · ${esc(q.customer_name || '')}</option>`).join('')}</select></label>
    <div id="newq"><label>Customer name<input name="customer_name"></label><label>Phone<input name="customer_phone" inputmode="tel"></label></div>
    ${p.tracking === 'piece' && !piece ? `<label>Piece<select name="piece_id"><option value="">Choose later</option>${freePieces.map((x) => `<option value="${x.id}">${esc(x.piece_code)} · ${esc(x.condition)} · ${money(x.selling_price)}</option>`).join('')}</select></label>` : ''}
    ${piece ? '' : '<label>Quantity<input name="qty" type="number" min="1" value="1"></label>'}
    <div class="grid2"><label>Preferred finish<input name="pref_finish" value="${esc(p.finish || '')}"></label><label>Preferred size<input name="pref_dimensions"></label></div>
    <button class="btn primary block" style="margin-top:10px">Add</button></form>`);
  const sync = () => { $('#newq', b).hidden = $('[name=qid]', b).value !== 'new'; };
  $('[name=qid]', b).onchange = sync; sync();
  $('#qf', b).onsubmit = async (e) => {
    e.preventDefault();
    const f = formData(e.target);
    try {
      let qid = f.qid;
      if (qid === 'new') qid = (await api('/quotations', { method: 'POST', body: { customer_name: f.customer_name, customer_phone: f.customer_phone } })).id;
      await api(`/quotations/${qid}/items`, { method: 'POST', body: { product_id: p.id, piece_id: piece ? piece.id : (f.piece_id ? Number(f.piece_id) : null), qty: Number(f.qty || 1), pref_finish: f.pref_finish, pref_dimensions: f.pref_dimensions } });
      sheet.close(); toast('Added to quotation'); location.hash = '#/quotation/' + qid;
    } catch (err) { fail(err); }
  };
}

function enquirySheet(p, piece) {
  const b = sheet.open(`<h2>New enquiry</h2><p class="small muted">${esc(p.name)}${piece ? ' · ' + esc(piece.piece_code) : ''}</p>
    <form id="ef"><label>Customer name<input name="customer_name"></label><label>Phone<input name="customer_phone" inputmode="tel"></label><label>Requirement<textarea name="message" placeholder="Finish, size, budget, timeline…"></textarea></label>
    <button class="btn primary block">Save enquiry</button></form>`);
  $('#ef', b).onsubmit = async (e) => {
    e.preventDefault();
    try { await api('/enquiries', { method: 'POST', body: { ...formData(e.target), product_id: p.id, piece_id: piece && piece.id } }); sheet.close(); toast('Enquiry saved'); } catch (err) { fail(err); }
  };
}

function requestSheet(p) {
  const b = sheet.open(`<h2>Purchase / production request</h2><p class="small muted">${esc(p.name)} · ${esc(p.sku)}</p>
    <form id="rf"><label>Type<select name="kind"><option value="production">Production (workshop)</option><option value="purchase">Purchase (vendor)</option></select></label>
    <label>Quantity<input name="qty" type="number" min="1" value="1"></label><label>Expected date (if known)<input name="expected_date" type="date"></label><label>Note / customer<input name="note"></label>
    <button class="btn primary block">Create request</button></form>`);
  $('#rf', b).onsubmit = async (e) => {
    e.preventDefault();
    try { await api('/incoming', { method: 'POST', body: { ...formData(e.target), product_id: p.id } }); sheet.close(); toast('Request created'); router(); } catch (err) { fail(err); }
  };
}

// ---------------- shortlists ----------------
route('shortlists', async () => {
  const lists = await api('/shortlists');
  view.innerHTML = `<div class="row"><h1>Customer shortlists</h1><span class="spacer"></span><button class="btn primary" id="ns">New shortlist</button></div>
    <p class="small muted">Walk the showroom with a customer, scan items into a shortlist, then compare or turn it into a quotation. Shortlists never reserve stock.</p>
    <div class="list">${lists.map((s) => `<a class="item" href="#/shortlist/${s.id}"><div class="grow"><div class="t">${esc(s.customer_name || 'Shortlist #' + s.id)}</div><div class="small muted">${s.items} items · ${esc(s.by_name || '')} · ${esc(s.created_at)}</div></div>${s.share_enabled ? '<span class="badge b-made_to_order">Shared</span>' : ''}</a>`).join('') || '<p class="empty">No shortlists yet.</p>'}</div>`;
  $('#ns').onclick = () => {
    const b = sheet.open(`<h2>New shortlist</h2><form id="nf"><label>Customer name<input name="customer_name" required></label><label>Phone (optional)<input name="customer_phone" inputmode="tel"></label><button class="btn primary block" style="margin-top:8px">Start</button></form>`);
    $('#nf', b).onsubmit = async (e) => { e.preventDefault(); const f = formData(e.target); const r = await api('/shortlists', { method: 'POST', body: f }); current.set({ id: r.id, name: f.customer_name }); sheet.close(); location.hash = '#/shortlist/' + r.id; };
  };
});

route('shortlist', async (id, params) => {
  const s = await api('/shortlists/' + id);
  const compare = params.get('compare') === '1';
  const isCur = (current.get() || {}).id === s.id;
  const waText = `Hello${s.customer_name ? ' ' + s.customer_name.split(' ')[0] : ''}, here is your selection from ${ME.business_name}: ${s.share_url}`;
  const waPhone = (s.customer_phone || '').replace(/\D/g, '');
  const items = s.items.map((it) => `<div class="item" data-item="${it.id}"><img src="${photo(it.photo)}" alt="">
      <div class="grow"><a class="t" href="${it.piece_id ? '#/piece/' + it.piece_id : '#/product/' + it.product_id}" style="color:inherit">${esc(it.name)}${it.variant_label ? ' — ' + esc(it.variant_label) : ''}</a>
      <div class="small muted mono">${esc(it.piece_code || it.sku)}</div><div>${badge(it.status, it.status_label)} ${it.status === 'available_now' && !it.piece_id ? `<span class="small muted">${it.available} free</span>` : ''} <b>${money(it.price)}</b></div>
      <div class="grid2" style="grid-template-columns:70px 1fr 1fr;margin-top:4px"><input aria-label="Quantity" name="qty" type="number" min="1" value="${it.qty}" ${it.piece_id ? 'disabled' : ''}><input aria-label="Preferred finish" name="pref_finish" placeholder="Finish" value="${esc(it.pref_finish || '')}"><input aria-label="Preferred size" name="pref_dimensions" placeholder="Size" value="${esc(it.pref_dimensions || '')}"></div></div>
      <button class="btn sm danger" data-del="${it.id}" aria-label="Remove">✕</button></div>`).join('');
  const cmp = `<div class="compare">${s.items.map((it) => `<div class="card"><img src="${photo(it.photo)}" alt=""><h3>${esc(it.name)}${it.variant_label ? ' — ' + esc(it.variant_label) : ''}</h3>
      <div>${badge(it.status, it.status_label)}</div><div class="price" style="font-size:1.2rem">${money(it.price)}</div>
      <dl class="specs small"><dt>Size</dt><dd>${esc(it.dimensions || '—')}</dd><dt>Material</dt><dd>${esc(it.material || '—')}</dd><dt>Finish</dt><dd>${esc(it.finish || '—')}</dd>
      <dt>Wants</dt><dd>${esc([it.qty > 1 ? 'Qty ' + it.qty : '', it.pref_finish, it.pref_dimensions].filter(Boolean).join(' · ') || '—')}</dd><dt>Ref</dt><dd class="mono">${esc(it.piece_code || it.sku)}</dd></dl></div>`).join('')}</div>`;
  view.innerHTML = `<a href="#/shortlists" class="small">← Shortlists</a>
    <div class="row"><h1>${esc(s.customer_name || 'Shortlist #' + s.id)}</h1><span class="spacer"></span>${isCur ? '<span class="badge b-available_now">Current customer</span>' : '<button class="btn sm" id="mkcur">Make current</button>'}</div>
    <div class="notice info small">Availability is re-checked live. Nothing here is reserved — it is reserved only when an order is confirmed.</div>
    <div class="actions"><a class="btn primary" href="#/scan?mode=shortlist" id="scanadd">▣ Scan to add</a><a class="btn" href="#/find">Search to add</a>
      <a class="btn" href="#/shortlist/${s.id}${compare ? '' : '?compare=1'}">${compare ? 'List view' : 'Compare'}</a>
      ${s.items.length ? '<button class="btn" id="toq">Create quotation</button>' : ''}<button class="btn danger" id="dels">Delete shortlist</button></div>
    ${s.items.length ? (compare ? cmp : `<div class="list" id="sli">${items}</div>`) : '<p class="empty">Nothing added yet — scan labels as you walk the showroom.</p>'}
    <h2>Share with customer</h2>
    <div class="card"><label class="check"><input type="checkbox" id="shon" ${s.share_enabled ? 'checked' : ''}> Shareable catalogue link is on</label>
      <label class="check"><input type="checkbox" id="shpr" ${s.share_show_prices ? 'checked' : ''}> Include prices</label>
      ${s.share_enabled ? `<p class="small mono" style="word-break:break-all">${esc(s.share_url)}</p><div class="row">
        <a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}">Share on WhatsApp</a>
        <button class="btn" id="copy">Copy link</button><a class="btn" href="${esc(s.share_url)}" target="_blank" rel="noopener">Preview ↗</a></div>
        <p class="small muted">Opens WhatsApp for you to send manually. The catalogue shows approved photos, specifications, prices (if on) and customer videos only.</p>` : '<p class="small muted">Turn on to get a link with approved photos, prices, specifications and video links.</p>'}</div>`;
  if ($('#mkcur')) $('#mkcur').onclick = () => { current.set({ id: s.id, name: s.customer_name }); router(); };
  if ($('#scanadd')) $('#scanadd').onclick = () => current.set({ id: s.id, name: s.customer_name });
  const patch = async (body) => { await api('/shortlists/' + s.id, { method: 'PATCH', body }); router(); };
  $('#shon').onchange = (e) => patch({ share_enabled: e.target.checked });
  $('#shpr').onchange = (e) => patch({ share_show_prices: e.target.checked });
  if ($('#copy')) $('#copy').onclick = () => navigator.clipboard.writeText(s.share_url).then(() => toast('Link copied'), () => toast('Copy failed', true));
  if ($('#toq')) $('#toq').onclick = async () => { try { const r = await api(`/shortlists/${s.id}/quotation`, { method: 'POST', body: {} }); location.hash = '#/quotation/' + r.id; } catch (e) { fail(e); } };
  $$('[data-item]').forEach((row) => {
    $$('input', row).forEach((inp) => { inp.onchange = () => api('/shortlist-items/' + row.dataset.item, { method: 'PUT', body: formData(row) }).then(() => toast('Saved'), fail); });
  });
  $$('[data-del]').forEach((b) => { b.onclick = async () => { await api('/shortlist-items/' + b.dataset.del, { method: 'DELETE' }); router(); }; });
  $('#dels').onclick = async () => {
    if (!(await confirmAction('Delete shortlist', [`${esc(s.customer_name || 'Shortlist #' + s.id)} · ${s.items.length} items`, 'The shareable catalogue link stops working. No stock is affected.'], 'Delete', ''))) return;
    try { await api('/shortlists/' + s.id, { method: 'DELETE' }); if ((current.get() || {}).id === s.id) current.set(null); toast('Shortlist deleted'); location.hash = '#/shortlists'; } catch (e) { fail(e); }
  };
});

// ---------------- quotations ----------------
route('quotations', async () => {
  const qs = await api('/quotations');
  view.innerHTML = `<h1>Quotations &amp; orders</h1><div class="list">${qs.map((q) => `<a class="item" href="#/quotation/${q.id}"><div class="grow"><div class="t">${esc(q.number)} · ${esc(q.customer_name || '—')}</div><div class="small muted">${q.items} items · ${esc(q.created_at)}</div></div>
    <div style="text-align:right"><span class="badge b-${q.status === 'confirmed' ? 'available_now' : q.status === 'cancelled' ? 'out_of_stock' : q.status === 'dispatched' ? 'sold' : 'made_to_order'}">${esc(q.kind === 'order' ? 'Order ' + q.status : q.status)}</span><div><b>${money(q.total)}</b></div></div></a>`).join('') || '<p class="empty">No quotations yet.</p>'}</div>`;
});

route('quotation', async (id) => {
  const q = await api('/quotations/' + id);
  const editable = ['draft', 'sent'].includes(q.status);
  const pieceChoices = {};
  for (const it of q.items.filter((i) => i.needs_piece && editable)) {
    const p = await api('/products/' + it.product_id);
    pieceChoices[it.id] = p.pieces.filter((x) => x.status === 'available_now');
  }
  view.innerHTML = `<a href="#/quotations" class="small noprint">← Quotations</a>
    <div class="row"><div><img src="logo.webp" alt="" style="width:90px" class="printonly"><h1>${q.kind === 'order' ? 'Order' : 'Quotation'} ${esc(q.number)}</h1>
    <div class="muted">${esc(q.customer_name || '')} ${esc(q.customer_phone || '')} · ${esc(q.created_at)} · ${esc(q.status)}</div></div></div>
    <div class="list" style="margin-top:12px">${q.items.map((it) => `<div class="item"><img src="${photo(it.photo)}" alt=""><div class="grow">
      <div class="t">${esc(it.name)}${it.variant_label ? ' — ' + esc(it.variant_label) : ''}</div>
      <div class="small muted mono">${esc(it.piece_code ? 'Piece ' + it.piece_code : it.sku)}</div>
      ${[it.pref_finish, it.pref_dimensions].filter(Boolean).length ? `<div class="small">${esc([it.pref_finish, it.pref_dimensions].filter(Boolean).join(' · '))}</div>` : ''}
      <div class="noprint">${badge(it.status, it.status_label)} ${it.reservations.length ? '<span class="badge b-reserved">Reserved for this order</span>' : (!it.can_fulfil && editable ? '<span class="small check-bad">Not enough available</span>' : '')}</div>
      ${it.needs_piece && editable ? `<select class="noprint" data-piece="${it.id}" aria-label="Choose piece"><option value="">Choose the exact piece…</option>${pieceChoices[it.id].map((x) => `<option value="${x.id}">${esc(x.piece_code)} · ${esc(x.condition)} · ${esc(x.location || '')} ${money(x.selling_price)}</option>`).join('')}</select>` : ''}
      </div><div style="text-align:right">${it.qty} × ${money(it.unit_price)}<div><b>${money(it.qty * it.unit_price)}</b></div>${editable ? `<button class="btn sm danger noprint" data-del="${it.id}">Remove</button>` : ''}</div></div>`).join('') || '<p class="empty">No items.</p>'}</div>
    <div class="row card"><b>Total</b><span class="spacer"></span><span class="price">${money(q.total)}</span></div>
    <div class="actions">
      ${editable && can('reserve') && q.items.length ? '<button class="btn primary" id="conf">Confirm as order…</button>' : ''}
      ${q.status === 'confirmed' && can('dispatch') ? '<button class="btn primary" id="disp">Dispatch order</button>' : ''}
      ${['draft', 'sent', 'confirmed'].includes(q.status) && can('reserve') ? `<button class="btn danger" id="canc">${q.status === 'confirmed' ? 'Cancel order' : 'Cancel quotation'}</button>` : ''}
      <button class="btn" onclick="print()">Print / PDF</button></div>`;
  $$('[data-del]').forEach((b) => { b.onclick = async () => { await api('/quotation-items/' + b.dataset.del, { method: 'DELETE' }).catch(fail); router(); }; });
  $$('[data-piece]').forEach((s) => { s.onchange = async () => { await api('/quotation-items/' + s.dataset.piece, { method: 'PATCH', body: { piece_id: s.value ? Number(s.value) : null } }).catch(fail); router(); }; });
  if ($('#conf')) $('#conf').onclick = async () => {
    const fresh = await api('/quotations/' + id);   // show current availability again before confirming
    const lines = fresh.items.map((it) => `${it.can_fulfil && !it.needs_piece ? '<span class="check-ok">✓</span>' : '<span class="check-bad">✗</span>'} ${esc(it.name)}${it.piece_code ? ' · ' + esc(it.piece_code) : ''} × ${it.qty} — ${badge(it.status, it.status_label)}${!it.piece_id ? ` <span class="small muted">${it.available} available</span>` : ''}${it.needs_piece ? ' <span class="small check-bad">choose piece</span>' : ''}`);
    if (!(await confirmAction('Confirm order — current availability', lines, 'Reserve stock & confirm'))) return;
    try { await api(`/quotations/${id}/confirm`, { method: 'POST', body: { confirm: true } }); toast('Order confirmed — stock reserved'); router(); } catch (e) { fail(e); }
  };
  if ($('#disp')) $('#disp').onclick = async () => {
    if (!(await confirmAction('Dispatch order ' + q.number, q.items.map((it) => `${esc(it.name)} × ${it.qty}`), 'Dispatch'))) return;
    try { await api(`/quotations/${id}/dispatch`, { method: 'POST', body: { confirm: true } }); toast('Order dispatched'); router(); } catch (e) { fail(e); }
  };
  if ($('#canc')) $('#canc').onclick = async () => {
    if (!(await confirmAction('Cancel ' + q.number, [q.status === 'confirmed' ? 'All stock reserved for this order is released.' : 'The quotation is marked cancelled.'], 'Cancel it'))) return;
    try { await api(`/quotations/${id}/cancel`, { method: 'POST', body: { confirm: true } }); toast('Cancelled'); router(); } catch (e) { fail(e); }
  };
});

// ---------------- stock hub + ledger ----------------
route('stock', async () => {
  view.innerHTML = `<h1>Stock</h1><p class="small muted">Scan or type a code, then pick an action. Every change asks for confirmation and is written to the stock ledger.</p>
    <form id="sc" class="row"><input name="code" placeholder="Scan or type code / SKU" autocapitalize="characters" style="flex:1"><button class="btn primary">Find</button><a class="btn" href="#/scan">▣</a></form>
    <div class="menu" style="margin-top:16px"><a href="#/reservations">Active reservations <span>›</span></a><a href="#/ledger">Stock ledger <span>›</span></a><a href="#/enquiries">Incoming orders &amp; requests <span>›</span></a></div>`;
  $('#sc').onsubmit = (e) => { e.preventDefault(); const c = e.target.code.value.trim(); if (c) handleScan(c); e.target.code.select(); };
  $('#sc').code.focus();
});

// Active reservations across all products (stock hub).
route('reservations', async () => {
  const list = await api('/reservations');
  view.innerHTML = `<a href="#/stock" class="small">← Stock</a><h1>Active reservations</h1><p class="small muted">Reserved stock is held for the customer and is not available to anyone else until it is released or dispatched.</p>
    <div class="list">${list.map((r) => `<div class="item"><div class="grow"><a class="t" style="color:inherit" href="${r.piece_id ? '#/piece/' + r.piece_id : '#/product/' + r.product_id}">${esc(r.product)}${r.variant_label ? ' — ' + esc(r.variant_label) : ''}</a>
      <div class="small"><b>${esc(r.customer_name || 'No customer name')}</b>${r.quotation_number ? ` · <a href="#/quotation/${r.quotation_id}">${esc(r.quotation_number)}</a>` : ''}</div>
      <div class="small muted">${r.piece_code ? 'Piece <span class="mono">' + esc(r.piece_code) + '</span> · ' : ''}${r.qty} at ${esc(r.location || '—')} · by ${esc(r.by_name || '—')} · ${esc(r.created_at)}</div></div>
      <div class="row" style="flex-direction:column;align-items:stretch">${can('reserve') ? `<button class="btn sm" data-release="${r.id}">Release</button>` : ''}${can('dispatch') ? `<button class="btn sm" data-dispatch-res="${r.id}">Dispatch</button>` : ''}</div></div>`).join('') || '<p class="empty">No active reservations.</p>'}</div>`;
  bindReservationButtons(view);
});

route('ledger', async (_, params) => {
  const rows = await api('/ledger' + (params.get('product_id') ? '?product_id=' + params.get('product_id') : ''));
  view.innerHTML = `<h1>Stock ledger</h1><div class="tablewrap card"><table><thead><tr><th>When</th><th>Item</th><th>Movement</th><th class="n">Qty</th><th>From → To</th><th>By</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td class="small">${esc(r.ts)}</td><td><a href="${r.piece_id ? '#/piece/' + r.piece_id : '#/product/' + r.product_id}">${esc(r.product)}</a><div class="small muted mono">${esc(r.piece_code || r.sku)}</div></td>
      <td>${esc(r.movement.replace('_', ' '))}${r.condition ? `<div class="small muted">${esc(r.condition)}</div>` : ''}${r.reference ? `<div class="small muted">${esc(r.reference)}</div>` : ''}</td>
      <td class="n">${r.qty > 0 ? '+' : ''}${r.qty}</td><td class="small">${esc(r.from_loc || '')}${r.to_loc ? ' → ' + esc(r.to_loc) : ''}</td><td class="small">${esc(r.by_name || '')}</td></tr>`).join('')}</tbody></table></div>`;
});

// ---------------- enquiries & requests ----------------
route('enquiries', async () => {
  const [enq, inc] = await Promise.all([can('enquiry') ? api('/enquiries') : [], api('/incoming')]);
  view.innerHTML = `<h1>Enquiries</h1><div class="list">${enq.map((e) => `<div class="item"><div class="grow"><div class="t">${esc(e.customer_name || 'Walk-in')} ${e.customer_phone ? `<a href="tel:${esc(e.customer_phone)}">${esc(e.customer_phone)}</a>` : ''}</div>
      <div class="small"><a href="#/product/${e.product_id}">${esc(e.product || '')}</a> ${e.piece_code ? '· ' + esc(e.piece_code) : ''}</div><div class="small muted">${esc(e.message || '')}</div>
      <div class="small muted">${e.source === 'public_qr' ? 'From customer QR page' : 'By ' + esc(e.by_name || '')} · ${esc(e.created_at)}</div></div>
      <button class="btn sm" data-enq="${e.id}" data-s="${e.status === 'open' ? 'closed' : 'open'}">${e.status === 'open' ? 'Close' : 'Reopen'}</button></div>`).join('') || '<p class="empty">No enquiries.</p>'}</div>
    <h2>Incoming purchase &amp; production</h2><div class="list">${inc.map((i) => `<a class="item" href="#/product/${i.product_id}"><div class="grow"><div class="t">${esc(i.product)}</div><div class="small muted">${esc(i.kind)} · ${i.qty} pcs · ${esc(i.status)} ${esc(i.note || '')}</div></div><div>${i.expected_date ? 'Expected ' + esc(i.expected_date) : '<span class="muted">No date</span>'}</div></a>`).join('') || '<p class="empty">None open.</p>'}</div>`;
  $$('[data-enq]').forEach((b) => { b.onclick = async () => { await api('/enquiries/' + b.dataset.enq, { method: 'PATCH', body: { status: b.dataset.s } }); router(); }; });
});

// ---------------- labels ----------------
const labelState = { items: [] };
route('labels', async (_, params) => {
  const tpls = await api('/label-templates');
  const add = params.get('add');
  if (add) {
    const [type, id] = add.split(':');
    if (!labelState.items.some((i) => i.type === type && i.id === Number(id))) {
      const d = type === 'piece' ? await api('/pieces/' + id) : await api('/products/' + id);
      labelState.items.push({ type, id: Number(id), copies: 1, label: type === 'piece' ? `${d.product.name} · ${d.piece.piece_code}` : `${d.name}${d.variant_label ? ' — ' + d.variant_label : ''} · ${d.sku}`, tracking: type === 'piece' ? 'piece' : d.tracking });
    }
    history.replaceState(null, '', '#/labels');
  }
  const saved = (() => { try { return JSON.parse(localStorage.getItem('ahs_label_opts') || '{}'); } catch { return {}; } })();
  view.innerHTML = `<h1>Barcode &amp; QR labels</h1>
    <p class="small muted">Internal codes are Code 128 / QR identifiers for this business only — they are not GS1/EAN retail barcodes. Purchase cost and margin are never printed.</p>
    <form id="la" class="row"><input name="code" placeholder="Scan / type code, SKU or search name" style="flex:1"><button class="btn">Add</button></form>
    <div class="list" id="litems" style="margin-top:10px"></div>
    <div class="card"><label>Label size<select id="tpl">${tpls.map((t) => `<option value="${t.id}" ${saved.template_id === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label>
      <div class="grid2"><label>Codes<select id="content"><option value="both">Barcode + QR</option><option value="barcode">Barcode only</option><option value="qr">QR only</option></select></label>
      <label id="startw">Start at label #<input id="start" type="number" min="1" value="1"></label></div>
      <label class="check"><input type="checkbox" id="price"> Print selling price</label>
      <label class="check"><input type="checkbox" id="specs"> Print short specifications</label>
      <label class="check"><input type="checkbox" id="pid" checked> Print piece ID on piece labels</label>
      <label class="check"><input type="checkbox" id="mfr"> Use manufacturer barcode where one exists</label>
      <label class="check"><input type="checkbox" id="outline"> Draw label outlines (alignment test)</label>
      <div class="actions"><button class="btn" id="chk">Check print size</button><button class="btn primary" id="pdf">Print view</button><button class="btn" id="zpl">Download ZPL (Zebra)</button></div>
      <p class="small muted">Demo: labels open as an in-browser print view (the real app makes an A4 / thermal PDF).</p>
      <div id="checks"></div></div>
    ${can('manage_settings') ? `<details class="card"><summary><b>Add a label size</b></summary><form id="nt"><label>Name<input name="name" required></label>
      <div class="grid2"><label>Layout<select name="layout"><option value="a4">A4 sheet</option><option value="thermal">Thermal roll</option></select></label><label>Printer dpi<select name="dpi"><option>203</option><option selected>300</option><option>600</option></select></label>
      <label>Width mm<input name="width_mm" type="number" step="0.1" required></label><label>Height mm<input name="height_mm" type="number" step="0.1" required></label>
      <label>Columns<input name="cols" type="number"></label><label>Rows<input name="rows" type="number"></label><label>Top margin mm<input name="margin_top_mm" type="number" step="0.1"></label><label>Left margin mm<input name="margin_left_mm" type="number" step="0.1"></label>
      <label>Gap across mm<input name="gap_x_mm" type="number" step="0.1"></label><label>Gap down mm<input name="gap_y_mm" type="number" step="0.1"></label></div><button class="btn primary" style="margin-top:8px">Save size</button></form></details>` : ''}`;
  if (saved.content) $('#content').value = saved.content;
  ['price', 'specs', 'mfr'].forEach((k) => { if (saved[k]) $('#' + k).checked = true; });
  const tplOf = () => tpls.find((t) => t.id === Number($('#tpl').value));
  const syncTpl = () => { $('#startw').hidden = tplOf().layout !== 'a4'; $('#zpl').hidden = tplOf().layout !== 'thermal'; };
  $('#tpl').onchange = syncTpl; syncTpl();
  function drawItems() {
    $('#litems').innerHTML = labelState.items.map((it, i) => `<div class="item"><div class="grow"><div class="t">${esc(it.label)}</div><div class="small muted">${it.type === 'product_pieces' ? 'One label per piece' : it.type}</div></div>
      ${it.type === 'product' && it.tracking === 'piece' ? `<button class="btn sm" data-allp="${i}">All pieces</button>` : ''}
      <input type="number" min="1" value="${it.copies}" data-copies="${i}" aria-label="Copies" style="width:70px;min-height:34px"><button class="btn sm danger" data-rm="${i}" aria-label="Remove">✕</button></div>`).join('') || '<p class="muted small">Add products or pieces to print. Use a product\'s “Label” button, scan, or type a code.</p>';
    $$('[data-copies]').forEach((x) => { x.onchange = () => { labelState.items[x.dataset.copies].copies = Math.max(1, Number(x.value)); }; });
    $$('[data-rm]').forEach((x) => { x.onclick = () => { labelState.items.splice(Number(x.dataset.rm), 1); drawItems(); }; });
    $$('[data-allp]').forEach((x) => { x.onclick = () => { const it = labelState.items[x.dataset.allp]; it.type = 'product_pieces'; it.label += ' (all pieces)'; drawItems(); }; });
  }
  drawItems();
  $('#la').onsubmit = async (e) => {
    e.preventDefault();
    const code = e.target.code.value.trim(); if (!code) return;
    const r = await api('/scan?code=' + encodeURIComponent(code)).catch(() => null);
    if (r) { location.hash = `#/labels?add=${r.type}:${r.type === 'piece' ? r.piece_id : r.product_id}`; return; }
    const res = await api('/search?q=' + encodeURIComponent(code));
    if (!res.length) return toast('Nothing found', true);
    const b = sheet.open(`<h2>Choose product</h2><div class="list">${res.slice(0, 12).map((c) => `<button class="btn" data-pid="${c.id}">${esc(c.name)}${c.variant_label ? ' — ' + esc(c.variant_label) : ''} · ${esc(c.sku)}</button>`).join('')}</div>`);
    $$('[data-pid]', b).forEach((x) => { x.onclick = () => { sheet.close(); location.hash = '#/labels?add=product:' + x.dataset.pid; }; });
  };
  const body = () => {
    const o = { template_id: Number($('#tpl').value), content: $('#content').value, show_price: $('#price').checked, show_specs: $('#specs').checked, show_piece_id: $('#pid').checked, use_mfr: $('#mfr').checked, outline: $('#outline').checked, start_at: Number($('#start').value) || 1 };
    try { localStorage.setItem('ahs_label_opts', JSON.stringify({ template_id: o.template_id, content: o.content, price: o.show_price, specs: o.show_specs, mfr: o.use_mfr })); } catch { /* ignore */ }
    return { ...o, items: labelState.items.map(({ type, id, copies }) => ({ type, id, copies })) };
  };
  $('#chk').onclick = async () => {
    try {
      const r = await api('/labels/preview', { method: 'POST', body: body() });
      $('#checks').innerHTML = `<p><b>${r.count}</b> labels on <b>${r.pages}</b> ${tplOf().layout === 'a4' ? 'A4 sheet(s)' : 'roll labels'}.</p><div class="tablewrap"><table><thead><tr><th>Code</th><th>Barcode bar width</th><th>QR module</th></tr></thead><tbody>
        ${r.labels.map((l) => `<tr><td class="mono small">${esc(l.barcode)}</td><td>${l.checks.barcode ? `<span class="${l.checks.barcode.x_mm >= 0.249 ? 'check-ok' : 'check-bad'}">${l.checks.barcode.x_mm.toFixed(3)} mm</span>` : '—'}</td>
        <td>${l.checks.qr ? `<span class="${l.checks.qr.module_mm >= 0.33 ? 'check-ok' : 'check-bad'}">${l.checks.qr.module_mm.toFixed(2)} mm</span>` : '—'}</td></tr>${l.checks.warnings.map((w) => `<tr><td colspan="3" class="small check-bad">${esc(w)}</td></tr>`).join('')}`).join('')}</tbody></table></div>
        <p class="small muted">Barcode bars ≥ 0.25 mm and QR modules ≥ 0.33 mm scan reliably with handheld scanners and phones. Print at 100% / “Actual size”, never “Fit to page”.</p>`;
    } catch (e) { fail(e); }
  };
  $('#pdf').onclick = async () => {
    const b = body();
    try { await api('/labels/preview', { method: 'POST', body: b }); } catch (e) { return fail(e); }
    labelState.print = b;
    location.hash = '#/labelprint';
  };
  $('#zpl').onclick = async () => {
    try {
      const r = await api('/labels/zpl', { method: 'POST', body: body() });
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.text], { type: 'text/plain' })); a.download = 'labels.zpl'; a.click();
    } catch (e) { fail(e); }
  };
  if ($('#nt')) $('#nt').onsubmit = async (e) => { e.preventDefault(); try { await api('/label-templates', { method: 'POST', body: formData(e.target) }); toast('Label size saved'); router(); } catch (err) { fail(err); } };
});

// Demo: in-browser label print view (same layout engine and print sizes as the original PDF).
route('labelprint', async () => {
  if (!labelState.print) { location.hash = '#/labels'; return; }
  const r = await api('/labels/print', { method: 'POST', body: labelState.print });
  const t = r.tpl, a4 = t.layout === 'a4';
  const pw = a4 ? 210 : t.width_mm, ph = a4 ? 297 : t.height_mm;
  const pages = [];
  r.labels.forEach((lab, i) => { const p = r.placements[i]; (pages[p.page] = pages[p.page] || []).push({ lab, p }); });
  const labelHtml = ({ lab, p }) => {
    const path = lab.items.filter((it) => it.t === 'rect').map((it) => `M${it.x.toFixed(3)} ${it.y.toFixed(3)}h${it.w.toFixed(3)}v${it.h.toFixed(3)}h${(-it.w).toFixed(3)}z`).join('');
    const texts = lab.items.filter((it) => it.t === 'text').map((it) => `<div class="lp-t${it.mono ? ' mono' : ''}" style="left:${it.x}mm;top:${it.y}mm;width:${it.w}mm;font-size:${it.size}pt;font-weight:${it.bold ? 700 : 400};color:${it.brand ? '#c8102e' : '#000'};text-align:${it.align || 'left'};-webkit-line-clamp:${it.lines};max-height:${(it.size * 1.25 * it.lines).toFixed(2)}pt">${esc(it.text)}</div>`).join('');
    return `<div class="lp-label${r.outline ? ' outline' : ''}" style="left:${p.x}mm;top:${p.y}mm;width:${lab.w}mm;height:${lab.h}mm"><svg viewBox="0 0 ${lab.w} ${lab.h}" width="${lab.w}mm" height="${lab.h}mm"><path d="${path}" fill="#000" shape-rendering="crispEdges"/></svg>${texts}</div>`;
  };
  view.innerHTML = `<div class="noprint"><a href="#/labels" class="small">← Labels</a><div class="row"><h1>Label print view</h1><span class="spacer"></span><button class="btn primary" onclick="print()">Print</button></div>
    <p class="small muted">${r.labels.length} label(s) on ${pages.length} ${a4 ? 'A4 sheet(s)' : 'roll label(s)'} · ${esc(t.name)}. Print at 100% / “Actual size”, never “Fit to page”.</p></div>
    <style id="lp-page">@page { size: ${pw}mm ${ph}mm; margin: 0; }</style>
    <div class="lp-pages">${pages.map((list) => `<div class="lp-page" style="width:${pw}mm;height:${ph}mm">${list.map(labelHtml).join('')}</div>`).join('')}</div>`;
  const fit = () => { const w = view.clientWidth - 32; $$('.lp-page').forEach((pg) => { pg.style.zoom = Math.min(1, w / pg.offsetWidth); }); };
  fit();
});

// ---------------- more ----------------
route('more', async () => {
  view.innerHTML = `<h1>More</h1><div class="menu">
    ${can('quote') ? '<a href="#/quotations">Quotations &amp; orders <span>›</span></a>' : ''}
    ${can('enquiry') ? '<a href="#/enquiries">Enquiries &amp; incoming <span>›</span></a>' : ''}
    ${can('labels') ? '<a href="#/labels">Barcode &amp; QR labels <span>›</span></a>' : ''}
    <a href="#/ledger">Stock ledger <span>›</span></a>
    ${can('manage_products') ? '<a href="#/edit/new">Add a product <span>›</span></a>' : ''}
    ${can('manage_settings') ? '<a href="#/settings">Settings &amp; customer pages <span>›</span></a><a href="#/locations">Locations <span>›</span></a>' : ''}
    ${can('manage_users') ? '<a href="#/users">Staff &amp; passwords <span>›</span></a>' : ''}
    <a href="#/password">Change my password <span>›</span></a>
    <a href="#" id="logout">Sign out <span>›</span></a></div><p class="small muted">Signed in as ${esc(ME.name)} (${esc(ME.role)})</p>`;
  $('#logout').onclick = async (e) => { e.preventDefault(); await api('/logout', { method: 'POST', body: {} }); ME = null; current.set(null); location.hash = '#/login'; };
});

// ---------------- product editing ----------------
const YT_RE = /^https?:\/\/(www\.|m\.|music\.)?(youtube\.com\/(watch\?(.*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/|(www\.)?youtube-nocookie\.com\/embed\/)[A-Za-z0-9_-]{11}/;

function resizeImage(file, max = 900) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => rej(new Error('Could not read that image'));
    img.src = URL.createObjectURL(file);
  });
}

route('edit', async (id) => {
  if (!can('manage_products')) throw new Error('You do not have permission to edit products');
  const isNew = id === 'new';
  const p = isNew ? { tracking: 'sku', public_enabled: true, public_show_price: true, pieces: [], photos: [] } : await api('/products/' + id);
  const videos = isNew ? [] : await api('/videos/own?product_id=' + id);
  const f = (name, label, type = 'text', extra = '') => `<label>${label}<input name="${name}" type="${type}" value="${esc(p[name] ?? '')}" ${extra}></label>`;
  view.innerHTML = `<a href="${isNew ? '#/more' : '#/product/' + id}" class="small">← Back</a><h1>${isNew ? 'New product' : 'Edit ' + esc(p.name)}</h1>
    ${isNew ? '' : `<p class="small muted">Internal code <b class="mono">${esc(p.internal_code)}</b> and the customer QR link never change, so printed labels stay valid when names, prices or locations change.</p>`}
    <form id="pf" class="card">
      <div class="grid2">${f('name', 'Name', 'text', 'required')}${f('sku', 'SKU', 'text', 'required autocapitalize="characters"')}</div>
      <div class="grid2">${f('category', 'Category')}${f('material', 'Material')}${f('finish', 'Finish')}${f('variant_label', 'Variant label (e.g. Walnut finish)')}</div>
      <div class="grid2" style="grid-template-columns:repeat(3,1fr)">${f('length_cm', 'Length cm', 'number', 'step="0.1"')}${f('width_cm', 'Width cm', 'number', 'step="0.1"')}${f('height_cm', 'Height cm', 'number', 'step="0.1"')}</div>
      <div class="grid2">${f('selling_price', 'Selling price ₹', 'number')}${f('cost_price', 'Purchase / production cost ₹ (internal)', 'number')}${f('vendor', 'Vendor (internal)')}${f('lead_time_days', 'Lead time days (made to order)', 'number')}</div>
      <label>Parent design (for variants)<select name="parent_id"><option value="">— none —</option></select></label>
      <label>Tracking<select name="tracking" ${!isNew && (p.availability.totals.physical || p.pieces.length) ? 'disabled title="Cannot change once stock exists"' : ''}><option value="sku" ${p.tracking === 'sku' ? 'selected' : ''}>By SKU quantity (identical items)</option><option value="piece" ${p.tracking === 'piece' ? 'selected' : ''}>Individual pieces (unique / antique / varying)</option></select></label>
      <label>Existing manufacturer barcode (optional)<input name="mfr_barcode" value="${esc(p.mfr_barcode || '')}" placeholder="Scan the product's own barcode"></label><div id="mfrmsg" class="small"></div>
      <label>Description (customer-visible)<textarea name="description">${esc(p.description || '')}</textarea></label>
      <label>Care (customer-visible)<textarea name="care">${esc(p.care || '')}</textarea></label>
      <label>Short specs for labels<input name="short_specs" value="${esc(p.short_specs || '')}" maxlength="80"></label>
      <label>Internal notes (never shown to customers)<textarea name="internal_notes">${esc(p.internal_notes || '')}</textarea></label>
      <label class="check"><input type="checkbox" name="made_to_order" ${p.made_to_order ? 'checked' : ''}> Made to order</label>
      <label class="check"><input type="checkbox" name="public_enabled" ${p.public_enabled ? 'checked' : ''}> Customer QR page enabled</label>
      <label class="check"><input type="checkbox" name="public_show_price" ${p.public_show_price ? 'checked' : ''}> Show price on customer page</label>
      <button class="btn primary">${isNew ? 'Create product' : 'Save changes'}</button></form>
    ${isNew ? '' : `<h2>Photos</h2><div class="cards" id="phs">${p.photos.map((ph) => `<div class="pcard"><img class="ph" src="${esc(ph.url)}" alt=""><div class="bd"><label class="check"><input type="checkbox" data-pub="${ph.id}" ${ph.is_public ? 'checked' : ''}> Approved for customers</label><button class="btn sm danger" data-delph="${ph.id}">Delete</button></div></div>`).join('')}</div>
      <form id="phf" class="card"><label>Upload photo<input type="file" name="file" accept="image/*" capture="environment"></label><label>…or image URL (https://)<input name="url"></label>
      ${p.tracking === 'piece' ? `<label>Photo of a specific piece<select name="piece_id"><option value="">Design photo (all pieces)</option>${p.pieces.map((x) => `<option value="${x.id}">${esc(x.piece_code)}</option>`).join('')}</select></label>` : ''}
      <label class="check"><input type="checkbox" name="is_public" checked> Approved for customer pages</label><button class="btn">Add photo</button></form>
      <h2>YouTube videos</h2><div class="list">${videos.map((v) => `<div class="item"><img src="video-thumb.svg" alt=""><div class="grow"><div class="t">${v.is_primary ? '★ ' : ''}${esc(v.title)}</div>
        <div class="small muted">${esc(v.video_type)} · ${v.visibility === 'internal' ? 'Internal only' : 'Customer-visible'}${v.piece_id ? ' · piece ' + esc((p.pieces.find((x) => x.id === v.piece_id) || {}).piece_code || v.piece_id) : ''}${v.overrides_parent ? ' · overrides inherited' : ''} · status: ${esc(v.embed_status)}</div></div>
        <button class="btn sm" data-vchk="${v.id}">Check</button><button class="btn sm" data-vedit="${v.id}">Edit</button><button class="btn sm danger" data-vdel="${v.id}">✕</button></div>`).join('') || '<p class="muted small">No videos on this product. Variants and pieces inherit videos from their parent design.</p>'}</div>
      <button class="btn" id="addv" style="margin-top:8px">Add video</button>
      ${p.tracking === 'piece' ? `<h2>Pieces</h2><div class="tablewrap card"><table><thead><tr><th>Piece</th><th>Condition</th><th class="n">Price</th><th class="n">Cost</th><th>Mfr barcode</th><th>QR page</th><th></th></tr></thead><tbody>
        ${p.pieces.map((x) => `<tr><td class="mono">${esc(x.piece_code)}</td><td>${esc(x.condition)}</td><td class="n">${money(x.selling_price)}</td><td class="n">${money(x.cost_price)}</td><td class="mono small">${esc(x.mfr_barcode || '')}</td><td>${x.public_enabled ? 'On' : 'Off'}</td><td><button class="btn sm" data-pedit="${x.id}">Edit</button></td></tr>`).join('')}</tbody></table></div>` : ''}`}`;
  const all = await api('/search?q=&limit=500');
  $('[name=parent_id]').innerHTML += all.filter((x) => x.id !== Number(id)).map((x) => `<option value="${x.id}" ${p.parent_id === x.id ? 'selected' : ''}>${esc(x.name)}${x.variant_label ? ' — ' + esc(x.variant_label) : ''} (${esc(x.sku)})</option>`).join('');
  $('[name=mfr_barcode]').onchange = async (e) => {
    const v = e.target.value.trim(); if (!v) { $('#mfrmsg').textContent = ''; return; }
    const r = await api(`/barcode-check?code=${encodeURIComponent(v)}${isNew ? '' : '&type=product&id=' + id}`);
    $('#mfrmsg').innerHTML = r.ok ? '<span class="check-ok">✓ Barcode is free to use</span>' : `<span class="check-bad">${esc(r.error)}</span>`;
  };
  $('#pf').onsubmit = async (e) => {
    e.preventDefault();
    const body = formData(e.target);
    for (const k of ['length_cm', 'width_cm', 'height_cm', 'selling_price', 'cost_price', 'lead_time_days', 'parent_id']) body[k] = body[k] === '' ? null : Number(body[k]);
    if ($('[name=tracking]').disabled) delete body.tracking;
    try {
      if (isNew) { const r = await api('/products', { method: 'POST', body }); toast('Created ' + r.internal_code); location.hash = '#/edit/' + r.id; }
      else { await api('/products/' + id, { method: 'PUT', body }); toast('Saved'); }
    } catch (err) { fail(err); }
  };
  if (isNew) return;
  $$('[data-pub]').forEach((c) => { c.onchange = () => api('/photos/' + c.dataset.pub, { method: 'PATCH', body: { is_public: c.checked } }).then(() => toast('Saved'), fail); });
  $$('[data-delph]').forEach((b) => { b.onclick = async () => { if (confirm('Delete this photo?')) { await api('/photos/' + b.dataset.delph, { method: 'DELETE' }); router(); } }; });
  $('#phf').onsubmit = async (e) => {
    e.preventDefault();
    const fm = e.target, file = fm.file.files[0];
    try {
      const body = { product_id: Number(id), piece_id: fm.piece_id && fm.piece_id.value ? Number(fm.piece_id.value) : null, is_public: fm.is_public.checked };
      if (file) body.data_url = await resizeImage(file); else body.url = fm.url.value.trim();
      await api('/photos', { method: 'POST', body }); toast('Photo added'); router();
    } catch (err) { fail(err); }
  };
  const videoForm = (v = {}) => {
    const b = sheet.open(`<h2>${v.id ? 'Edit' : 'Add'} video</h2><form id="vf"><label>YouTube link<input name="url" value="${esc(v.url || '')}" required placeholder="https://www.youtube.com/watch?v=…"></label><div id="vmsg" class="small"></div>
      <label>Title<input name="title" value="${esc(v.title || '')}" required></label>
      <label>Type<select name="video_type">${['overview', 'dimensions', 'finish', 'demonstration', 'installation', 'care'].map((t) => `<option ${v.video_type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      ${p.tracking === 'piece' ? `<label>Shows<select name="piece_id"><option value="">The design (all pieces)</option>${p.pieces.map((x) => `<option value="${x.id}" ${v.piece_id === x.id ? 'selected' : ''}>This exact piece: ${esc(x.piece_code)}</option>`).join('')}</select></label>` : ''}
      <label>Visibility<select name="visibility"><option value="customer">Customer-visible</option><option value="internal" ${v.visibility === 'internal' ? 'selected' : ''}>Internal only</option></select></label>
      <label class="check"><input type="checkbox" name="is_primary" ${v.is_primary ? 'checked' : ''}> Primary video</label>
      <label class="check"><input type="checkbox" name="overrides_parent" ${v.overrides_parent ? 'checked' : ''}> Replace inherited videos of the same type</label>
      <button class="btn primary block">Save video</button></form>`);
    const u = $('[name=url]', b);
    u.oninput = () => { $('#vmsg', b).innerHTML = !u.value || YT_RE.test(u.value.trim()) ? '' : '<span class="check-bad">Not a supported YouTube video link</span>'; };
    $('#vf', b).onsubmit = async (e) => {
      e.preventDefault();
      const body = { ...formData(e.target), product_id: Number(id) };
      body.piece_id = body.piece_id ? Number(body.piece_id) : null;
      try { await api(v.id ? '/videos/' + v.id : '/videos', { method: v.id ? 'PUT' : 'POST', body }); sheet.close(); toast('Video saved'); router(); } catch (err) { fail(err); }
    };
  };
  $('#addv').onclick = () => videoForm();
  $$('[data-vedit]').forEach((b) => { b.onclick = () => videoForm(videos.find((v) => v.id === Number(b.dataset.vedit))); });
  $$('[data-vdel]').forEach((b) => { b.onclick = async () => { if (confirm('Remove this video?')) { await api('/videos/' + b.dataset.vdel, { method: 'DELETE' }); router(); } }; });
  $$('[data-vchk]').forEach((b) => { b.onclick = async () => { const r = await api(`/videos/${b.dataset.vchk}/check`, { method: 'POST', body: {} }); toast(r.error || 'Status: ' + r.embed_status, !!r.error); router(); }; });
  $$('[data-pedit]').forEach((b) => { b.onclick = () => {
    const x = p.pieces.find((y) => y.id === Number(b.dataset.pedit));
    const s = sheet.open(`<h2>Piece ${esc(x.piece_code)}</h2><form id="xf"><label>Condition<input name="condition" value="${esc(x.condition)}"></label><label>Finish note<input name="finish_note" value="${esc(x.finish_note || '')}"></label>
      <div class="grid2"><label>Selling price<input name="selling_price" type="number" value="${x.selling_price ?? ''}"></label><label>Cost (internal)<input name="cost_price" type="number" value="${x.cost_price ?? ''}"></label></div>
      <label>Manufacturer barcode<input name="mfr_barcode" value="${esc(x.mfr_barcode || '')}"></label><label>Internal notes<input name="notes" value="${esc(x.notes || '')}"></label>
      <label class="check"><input type="checkbox" name="public_enabled" ${x.public_enabled ? 'checked' : ''}> Customer QR page enabled</label><button class="btn primary block">Save</button></form>`);
    $('#xf', s).onsubmit = async (e) => {
      e.preventDefault(); const body = formData(e.target);
      for (const k of ['selling_price', 'cost_price']) body[k] = body[k] === '' ? null : Number(body[k]);
      try { await api('/pieces/' + x.id, { method: 'PUT', body }); sheet.close(); toast('Saved'); router(); } catch (err) { fail(err); }
    };
  }; });
});

// ---------------- settings ----------------
route('settings', async () => {
  if (!can('manage_settings')) throw new Error('You do not have permission to change settings');
  const s = await api('/settings');
  const w = s.availability_wording;
  view.innerHTML = `<h1>Settings</h1><form id="stf" class="card">
    <label>Business name (printed on labels)<input name="business_name" value="${esc(s.business_name || '')}"></label>
    <label>Showroom contact (customer pages)<input name="showroom_contact" value="${esc(s.showroom_contact || '')}"></label>
    <label>Public base URL for QR codes<input name="public_base_url" value="${esc(s.public_base_url || '')}" placeholder="https://showroom.teakwoodliving.example.com"></label>
    <p class="small muted">QR labels encode this address. Set it before printing labels so customer phones can reach the page. Leave blank to use the address you are using now.</p>
    <label class="check"><input type="checkbox" name="public_pages_enabled" ${s.public_pages_enabled !== '0' ? 'checked' : ''}> Customer QR pages enabled (turn off to disable every public link)</label>
    <label class="check"><input type="checkbox" name="public_show_prices" ${s.public_show_prices !== '0' ? 'checked' : ''}> Show prices on customer pages</label>
    <label class="check"><input type="checkbox" name="public_show_expected_date" ${s.public_show_expected_date === '1' ? 'checked' : ''}> Show expected availability dates on customer pages</label>
    <h2>Customer availability wording</h2><p class="small muted">Customers never see quantities — only this wording.</p>
    ${Object.entries(w).map(([k, v]) => `<label>${esc(STATUS_LABEL[k] || k)}<input data-w="${k}" value="${esc(v)}" maxlength="120"></label>`).join('')}
    <button class="btn primary" style="margin-top:10px">Save settings</button></form>`;
  $('#stf').onsubmit = async (e) => {
    e.preventDefault();
    const fm = e.target;
    const body = { business_name: fm.business_name.value, showroom_contact: fm.showroom_contact.value, public_base_url: fm.public_base_url.value.trim(),
      public_pages_enabled: fm.public_pages_enabled.checked, public_show_prices: fm.public_show_prices.checked, public_show_expected_date: fm.public_show_expected_date.checked,
      availability_wording: Object.fromEntries($$('[data-w]').map((i) => [i.dataset.w, i.value])) };
    try { await api('/settings', { method: 'PUT', body }); toast('Settings saved'); } catch (err) { fail(err); }
  };
});

// ---------------- staff users & passwords ----------------
const ROLE_INFO = {
  sales: 'Sales — find, shortlist, quote, reserve',
  storekeeper: 'Storekeeper — receive, transfer, dispatch, count',
  manager: 'Manager — everything, sees costs, edits products & settings',
  admin: 'Admin — everything, plus staff logins',
};
/** Readable random password (no look-alike characters), made in the browser. */
function makePassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const v = crypto.getRandomValues(new Uint32Array(12));
  const s = [...v].map((n) => chars[n % chars.length]).join('');
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}
function showPassword(name, pw) {
  const b = sheet.open(`<h2>Password for ${esc(name)}</h2>
    <p>Give this to them in person. It is not shown again.</p>
    <div class="card mono" style="font-size:1.3rem;text-align:center;user-select:all">${esc(pw)}</div>
    <div class="row"><button class="btn" id="cp">Copy</button><span class="spacer"></span><button class="btn primary" data-close>Done</button></div>`);
  $('#cp', b).onclick = () => navigator.clipboard.writeText(pw).then(() => toast('Copied'), () => toast('Copy failed', true));
}
const roleOptions = (sel) => Object.entries(ROLE_INFO).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${esc(v)}</option>`).join('');

route('users', async () => {
  if (!can('manage_users')) throw new Error('Only admins can manage staff logins');
  const users = await api('/users');
  view.innerHTML = `<div class="row"><h1>Staff &amp; passwords</h1><span class="spacer"></span><button class="btn primary" id="adduser">Add staff member</button></div>
    <p class="small muted">Each person gets their own login, so the stock ledger shows who did what. Changing someone's role or password signs them out on their other devices.</p>
    <div class="list">${users.map((u) => `<div class="item"><div class="grow"><div class="t">${esc(u.name)}${u.id === ME.id ? ' <span class="small muted">(you)</span>' : ''}</div>
      <div class="small muted"><span class="mono">${esc(u.username)}</span> · ${esc(u.role)}</div></div>
      ${u.active ? '' : '<span class="badge b-out_of_stock">Disabled</span>'}<button class="btn sm" data-edit="${u.id}">Edit</button></div>`).join('')}</div>`;
  $('#adduser').onclick = () => {
    const b = sheet.open(`<h2>Add staff member</h2><form id="uf">
      <label>Name<input name="name" required maxlength="80"></label>
      <label>Username (for signing in)<input name="username" required autocapitalize="none" pattern="[a-zA-Z0-9._\\-]{3,40}" placeholder="e.g. priya"></label>
      <label>Role<select name="role">${roleOptions('sales')}</select></label>
      <label>Password</label><div class="row"><input name="password" required minlength="10" style="flex:1" autocomplete="new-password" aria-label="Password"><button type="button" class="btn" id="gen">Generate</button></div>
      <p class="small muted">At least 10 characters.</p>
      <button class="btn primary block">Create login</button></form>`);
    $('#gen', b).onclick = () => { $('[name=password]', b).value = makePassword(); };
    $('[name=password]', b).value = makePassword();
    $('#uf', b).onsubmit = async (e) => {
      e.preventDefault();
      const f = formData(e.target);
      try { await api('/users', { method: 'POST', body: f }); sheet.close(); await router(); showPassword(f.name, f.password); } catch (err) { fail(err); }
    };
  };
  $$('[data-edit]').forEach((btn) => { btn.onclick = () => {
    const u = users.find((x) => x.id === Number(btn.dataset.edit));
    const self = u.id === ME.id;
    const b = sheet.open(`<h2>${esc(u.name)}</h2><p class="small muted mono">${esc(u.username)}</p><form id="ef">
      <label>Name<input name="name" value="${esc(u.name)}" maxlength="80"></label>
      <label>Role<select name="role" ${self ? 'disabled' : ''}>${roleOptions(u.role)}</select></label>
      ${self ? '<p class="small muted">You can\'t change your own role or disable yourself.</p>' : `<label class="check"><input type="checkbox" name="active" ${u.active ? 'checked' : ''}> Can sign in</label>`}
      <button class="btn primary block">Save</button></form>
      <h3>Reset password</h3><p class="small muted">Use this when someone forgets their password. They are signed out everywhere.</p>
      <button class="btn block" id="reset">Set a new password…</button>`);
    $('#ef', b).onsubmit = async (e) => {
      e.preventDefault();
      const f = formData(e.target);
      const body = { name: f.name };
      if (!self) { body.role = f.role; body.active = f.active; }
      try { await api('/users/' + u.id, { method: 'PATCH', body }); sheet.close(); toast('Saved'); router(); } catch (err) { fail(err); }
    };
    $('#reset', b).onclick = async () => {
      const pw = makePassword();
      sheet.close();
      if (!(await confirmAction(`Reset ${u.name}'s password`, [esc(`A new password is generated and shown once.`), 'They are signed out on all devices.'], 'Reset password', ''))) return;
      try { await api('/users/' + u.id, { method: 'PATCH', body: { password: pw } }); showPassword(u.name, pw); } catch (err) { fail(err); }
    };
  }; });
});

route('password', async () => {
  view.innerHTML = `<h1>Change my password</h1><form id="pf" class="card" style="max-width:420px">
    <label>Current password<input name="current_password" type="password" required autocomplete="current-password"></label>
    <label>New password<input name="new_password" type="password" required minlength="10" autocomplete="new-password"></label>
    <label>New password again<input name="again" type="password" required minlength="10" autocomplete="new-password"></label>
    <p class="small muted">At least 10 characters. You stay signed in here; other devices are signed out.</p>
    <button class="btn primary block">Change password</button></form>`;
  $('#pf').onsubmit = async (e) => {
    e.preventDefault();
    const f = formData(e.target);
    if (f.new_password !== f.again) return toast('The new passwords do not match', true);
    try { await api('/me/password', { method: 'POST', body: { current_password: f.current_password, new_password: f.new_password } }); e.target.reset(); toast('Password changed'); } catch (err) { fail(err); }
  };
});

// ---------------- locations ----------------
route('locations', async () => {
  if (!can('manage_settings')) throw new Error('You do not have permission to change locations');
  LOCS = await api('/locations');
  const typeOpts = (sel) => ['showroom', 'warehouse', 'branch'].map((t) => `<option ${t === sel ? 'selected' : ''}>${t}</option>`).join('');
  view.innerHTML = `<h1>Locations</h1><p class="small muted">Showrooms, warehouses and branches that hold stock. The rack or zone is entered per item when stock is received or moved.</p>
    <div class="list">${LOCS.map((l) => `<form class="item" data-loc="${l.id}" style="flex-wrap:wrap"><span class="mono small" style="width:46px">${esc(l.code)}</span>
      <input name="name" value="${esc(l.name)}" aria-label="Name" style="flex:1 1 180px;min-width:0"><select name="type" aria-label="Type" style="width:auto;flex:1 0 auto">${typeOpts(l.type)}</select>
      <button class="btn sm">Save</button></form>`).join('')}</div>
    <h2>Add a location</h2><form id="lf" class="card"><div class="grid2"><label>Short code<input name="code" required maxlength="10" placeholder="BR3" autocapitalize="characters"></label>
      <label>Type<select name="type">${typeOpts('branch')}</select></label></div><label>Name<input name="name" required maxlength="80" placeholder="Kothrud Branch"></label>
      <button class="btn primary" style="margin-top:8px">Add location</button></form>`;
  $$('[data-loc]').forEach((fm) => { fm.onsubmit = async (e) => {
    e.preventDefault();
    try { await api('/locations/' + fm.dataset.loc, { method: 'PATCH', body: formData(fm) }); toast('Saved'); LOCS = await api('/locations'); } catch (err) { fail(err); }
  }; });
  $('#lf').onsubmit = async (e) => {
    e.preventDefault();
    try { await api('/locations', { method: 'POST', body: formData(e.target) }); toast('Location added'); router(); } catch (err) { fail(err); }
  };
});

router();

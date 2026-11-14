/*
 * Teakwood Showroom — in-browser demo backend (Foundly portfolio demo).
 *
 * Answers the same /api endpoints, with the same response shapes and business rules, as the
 * original Express + Postgres server (src/server.js, inventory.js, catalog.js, public.js, labels.js),
 * but keeps all data in this browser's localStorage. Nothing is sent to any server.
 * Sample data is invented; "Reset demo data" in the demo panel restores it.
 */
(function (root) {
  'use strict';

  const DB_KEY = 'ahs_db';
  const SESSION_KEY = 'ahs_session';
  const DB_VERSION = 3;
  let D = null;

  // ---------------- time ----------------
  let clock = 0;            // ms into the past while seeding (so sample history has realistic dates)
  let seeding = false;
  const pad2 = (n) => String(n).padStart(2, '0');
  const fmtTs = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  const fmtDate = (d) => fmtTs(d).slice(0, 10);
  const now = () => fmtTs(new Date(Date.now() - clock));
  const dateIn = (days) => fmtDate(new Date(Date.now() - clock + days * 864e5));
  /** While seeding: set the clock to `days` ago at hh:mm. */
  function at(days, hh = 11, mm = 0) {
    const d = new Date(); d.setDate(d.getDate() - days); d.setHours(hh, mm, Math.floor(rand() * 59), 0);
    clock = Math.max(60e3, Date.now() - d.getTime());
  }

  // ---------------- errors ----------------
  class HttpError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
  class StockError extends HttpError { constructor(message, status = 409) { super(message, status); } }
  const fail = (m, s = 400) => new HttpError(m, s);

  // ---------------- random / tokens ----------------
  let rngState = 1;
  function rand() {
    if (!seeding) return Math.random();
    rngState = (rngState + 0x6D2B79F5) | 0;
    let t = rngState;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const newToken = () => Array.from({ length: 12 }, () => B64[Math.floor(rand() * 64)]).join('');

  // ---------------- tables ----------------
  const TABLES = ['users', 'sessions', 'login_failures', 'locations', 'products', 'pieces', 'photos', 'stock_balances', 'shortlists', 'quotations',
    'reservations', 'stock_ledger', 'incoming', 'enquiries', 'videos', 'quotation_items', 'shortlist_items', 'label_templates'];
  function emptyDb() {
    const d = { version: DB_VERSION, seq: {}, settings: {}, code_sequences: {} };
    for (const t of TABLES) { d[t] = []; d.seq[t] = 0; }
    return d;
  }
  function ins(t, row) { const r = { id: ++D.seq[t], ...row }; D[t].push(r); return r; }
  const get = (t, id) => D[t].find((r) => r.id === Number(id));
  const rows = (t, fn) => D[t].filter(fn);
  const remove = (t, fn) => { D[t] = D[t].filter((r) => !fn(r)); };
  const byLower = (s) => String(s ?? '').toLowerCase();
  const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

  let txDepth = 0;
  /** All-or-nothing: any error restores the data as it was before. */
  function tx(fn) {
    if (txDepth) return fn();
    const snap = JSON.stringify(D);
    txDepth++;
    try { return fn(); } catch (e) { D = JSON.parse(snap); throw e; } finally { txDepth--; }
  }

  function read() {
    let raw = null;
    try { raw = localStorage.getItem(DB_KEY); } catch { /* storage blocked */ }
    if (raw) {
      try { const d = JSON.parse(raw); if (d && d.version === DB_VERSION) { D = d; return; } } catch { /* reseed */ }
    }
    seed();
    save();
  }
  function save() {
    try { localStorage.setItem(DB_KEY, JSON.stringify(D)); } catch {
      throw fail('Browser storage is full — open the demo panel and reset the demo data', 507);
    }
  }

  // ================= codes.js =================
  const PATTERNS = ('212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 ' +
    '221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 ' +
    '231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 ' +
    '314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 ' +
    '111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 ' +
    '114131 311141 411131 211412 211214 211232 2331112').split(' ');
  const START_B = 104, START_C = 105, CODE_B = 100, CODE_C = 99, STOP = 106;
  function digitRun(s, i) { let n = 0; while (i + n < s.length && s.charCodeAt(i + n) >= 48 && s.charCodeAt(i + n) <= 57) n++; return n; }
  function code128Values(text) {
    if (typeof text !== 'string' || !text.length) throw new Error('Barcode text is empty');
    for (const ch of text) { const c = ch.charCodeAt(0); if (c < 32 || c > 126) throw new Error(`Character "${ch}" cannot be encoded in Code 128 set B/C`); }
    const values = []; let set; let i = 0;
    const run0 = digitRun(text, 0);
    if (run0 >= 4 || (run0 === text.length && run0 >= 2 && run0 % 2 === 0)) { set = 'C'; values.push(START_C); } else { set = 'B'; values.push(START_B); }
    while (i < text.length) {
      const run = digitRun(text, i);
      if (set === 'C') { if (run >= 2) { values.push(Number(text.substr(i, 2))); i += 2; continue; } values.push(CODE_B); set = 'B'; }
      if (run >= 4) { if (run % 2 === 1) { values.push(text.charCodeAt(i) - 32); i++; } values.push(CODE_C); set = 'C'; continue; }
      values.push(text.charCodeAt(i) - 32); i++;
    }
    let sum = values[0];
    for (let k = 1; k < values.length; k++) sum += values[k] * k;
    values.push(sum % 103); values.push(STOP);
    return values;
  }
  function code128Bars(text) {
    const mods = [];
    for (const v of code128Values(text)) { const p = PATTERNS[v]; for (let k = 0; k < p.length; k++) for (let w = 0; w < Number(p[k]); w++) mods.push(k % 2 === 0); }
    const bars = [];
    for (let i = 0; i < mods.length; i++) { if (!mods[i]) continue; let w = 1; while (mods[i + w]) w++; bars.push({ x: i, w }); i += w - 1; }
    return { bars, modules: mods.length };
  }
  const PRODUCT_PREFIX = 'TLP', PIECE_PREFIX = 'TLU';
  function nextCode(prefix) {
    const v = D.code_sequences[prefix] || 1;
    D.code_sequences[prefix] = v + 1;
    return `${prefix}-${String(v).padStart(6, '0')}`;
  }
  function gtinCheckDigitValid(code) {
    const digits = code.split('').map(Number); const check = digits.pop(); let sum = 0;
    digits.reverse().forEach((d, i) => { sum += d * (i % 2 === 0 ? 3 : 1); });
    return (10 - (sum % 10)) % 10 === check;
  }
  function normaliseMfrBarcode(raw) {
    if (raw == null) return null;
    const code = String(raw).trim();
    if (!code) return null;
    if (!/^[\x20-\x7e]{4,48}$/.test(code)) throw fail('Manufacturer barcode must be 4–48 printable characters');
    if (code.toUpperCase().startsWith(PRODUCT_PREFIX + '-') || code.toUpperCase().startsWith(PIECE_PREFIX + '-')) throw fail('Manufacturer barcode cannot use the internal code prefixes');
    if (/^\d+$/.test(code) && [8, 12, 13, 14].includes(code.length) && !gtinCheckDigitValid(code)) throw fail('This looks like an EAN/UPC barcode but its check digit is wrong — please re-scan');
    return code;
  }
  function assertCodeFree(code, except = {}) {
    if (!code) return;
    const hits = [
      ...D.products.filter((p) => p.internal_code === code || p.mfr_barcode === code || p.sku === code).map((p) => ({ type: 'product', id: p.id })),
      ...D.pieces.filter((p) => p.piece_code === code || p.mfr_barcode === code).map((p) => ({ type: 'piece', id: p.id })),
    ];
    const clash = hits.find((h) => !(h.type === except.type && h.id === except.id));
    if (clash) throw fail(`Barcode "${code}" is already assigned to another ${clash.type}`, 409);
  }
  const YT_ID = /^[A-Za-z0-9_-]{11}$/;
  const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'www.youtube-nocookie.com', 'youtube-nocookie.com']);
  function parseYouTube(raw) {
    let u;
    try { u = new URL(String(raw).trim()); } catch { return null; }
    if (!['https:', 'http:'].includes(u.protocol) || !YT_HOSTS.has(u.hostname.toLowerCase())) return null;
    let id = null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (u.hostname.toLowerCase() === 'youtu.be') id = parts[0];
    else if (parts[0] === 'watch') id = u.searchParams.get('v');
    else if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) id = parts[1];
    return id && YT_ID.test(id) ? id : null;
  }
  // Demo: thumbnails are a local placeholder (no requests to YouTube).
  const ytThumb = () => 'video-thumb.svg';
  const ytWatch = (id) => `https://www.youtube.com/watch?v=${id}`;

  // ================= inventory.js =================
  const ledger = (e) => ins('stock_ledger', { ts: now(), user_id: null, piece_id: null, from_location_id: null, to_location_id: null, condition: null, reference: null, note: null, ...e });
  function getProduct(id) { const p = get('products', id); if (!p) throw new StockError('Product not found', 404); return p; }
  function getPiece(id) { const p = get('pieces', id); if (!p) throw new StockError('Piece not found', 404); return p; }
  function posInt(n, what = 'Quantity') {
    const v = Number(n);
    if (!Number.isInteger(v) || v <= 0) throw new StockError(`${what} must be a whole number above zero`, 400);
    return v;
  }
  const balRow = (pid, lid, cond) => D.stock_balances.find((b) => b.product_id === Number(pid) && b.location_id === Number(lid) && b.condition === cond);
  const balance = (pid, lid, cond) => (balRow(pid, lid, cond) || { qty: 0 }).qty;
  function adjustBalance(pid, lid, cond, delta, rack) {
    const b = balRow(pid, lid, cond);
    const cur = b ? b.qty : 0;
    if (cur + delta < 0) throw new StockError(`Not enough ${cond.replace('_', ' ')} stock at this location (have ${cur})`);
    if (b) { b.qty += delta; if (rack) b.rack = rack; return; }
    D.stock_balances.push({ product_id: Number(pid), location_id: Number(lid), condition: cond, qty: delta, rack: rack || null });
  }
  const activeSkuRes = (pid, lid) => D.reservations.filter((r) => r.product_id === Number(pid) && r.piece_id == null && r.status === 'active' && (lid == null || r.location_id === Number(lid)));
  function skuAvailableAt(pid, lid) {
    const have = D.stock_balances.filter((b) => b.product_id === Number(pid) && b.location_id === Number(lid) && ['sellable', 'display_sale'].includes(b.condition)).reduce((s, b) => s + b.qty, 0);
    return Math.max(0, have - activeSkuRes(pid, lid).reduce((s, r) => s + r.qty, 0));
  }
  function bestSkuLocation(pid) {
    const list = [...D.locations].sort((a, b) => a.id - b.id).map((l) => ({ id: l.id, available: skuAvailableAt(pid, l.id) }));
    return list.sort((a, b) => b.available - a.available || a.id - b.id)[0] || null;
  }
  const LOC_RANK = { showroom: 0, warehouse: 1 };
  const locsSorted = () => [...D.locations].sort((a, b) => (LOC_RANK[a.type] ?? 2) - (LOC_RANK[b.type] ?? 2) || a.name.localeCompare(b.name));

  function expectedFrom(product, inc) {
    if (inc) return { date: inc.expected_date, source: inc.kind, qty: inc.qty };
    if (product.made_to_order && product.lead_time_days) {
      const d = new Date(Date.now() + product.lead_time_days * 864e5);
      return { date: d.toISOString().slice(0, 10), source: 'made_to_order', lead_time_days: product.lead_time_days };
    }
    return null;
  }
  function classify({ available, reserved, display, damaged }, madeToOrder) {
    if (available > 0) return 'available_now';
    if (madeToOrder) return 'made_to_order';
    if (reserved > 0) return 'reserved';
    if (display > 0) return 'display_only';
    if (damaged > 0) return 'damaged';
    return 'out_of_stock';
  }
  function availabilityMany(productIds) {
    const ids = [...new Set(productIds.map(Number).filter(Number.isFinite))];
    const out = new Map();
    const locs = locsSorted();
    for (const id of ids) {
      const product = get('products', id);
      if (!product) continue;
      const bal = D.stock_balances.filter((b) => b.product_id === id);
      const resMap = new Map();
      for (const r of activeSkuRes(id)) resMap.set(r.location_id, (resMap.get(r.location_id) || 0) + r.qty);
      const res = [...resMap].map(([location_id, n]) => ({ location_id, n }));
      const pcs = D.pieces.filter((p) => p.product_id === id && p.status !== 'sold');
      const inc = D.incoming.filter((i) => i.product_id === id && ['requested', 'ordered'].includes(i.status) && i.expected_date).sort((a, b) => a.expected_date.localeCompare(b.expected_date))[0];
      out.set(id, computeAvailability(product, locs, bal, res, pcs, inc));
    }
    return out;
  }
  function computeAvailability(product, locs, bal, res, pieces, inc) {
    const byLocation = [];
    let inTransit = 0;
    if (product.tracking === 'sku') {
      for (const loc of locs) {
        const b = (c) => (bal.find((x) => x.location_id === loc.id && x.condition === c) || { qty: 0 }).qty;
        const sellable = b('sellable'), displaySale = b('display_sale'), display = b('display'), damaged = b('damaged');
        const reserved = (res.find((r) => r.location_id === loc.id) || { n: 0 }).n;
        const racks = [...new Set(bal.filter((x) => x.location_id === loc.id && x.qty > 0 && x.rack).map((x) => x.rack))];
        const row = { physical: sellable + displaySale + display + damaged, reserved, available: Math.max(0, sellable + displaySale - reserved), display, display_for_sale: displaySale, damaged, racks };
        if (row.physical > 0 || row.reserved > 0) byLocation.push({ location_id: loc.id, location: loc.name, location_code: loc.code, type: loc.type, ...row });
      }
    } else {
      inTransit = pieces.filter((p) => p.status === 'in_transit').length;
      for (const loc of locs) {
        const ps = pieces.filter((p) => p.location_id === loc.id && p.status !== 'in_transit');
        const row = {
          physical: ps.length,
          reserved: ps.filter((p) => p.status === 'reserved').length,
          available: ps.filter((p) => p.status === 'available' || (p.status === 'display' && p.display_for_sale)).length,
          display: ps.filter((p) => p.status === 'display' && !p.display_for_sale).length,
          display_for_sale: ps.filter((p) => p.status === 'display' && p.display_for_sale).length,
          damaged: ps.filter((p) => p.status === 'damaged').length,
          racks: [...new Set(ps.map((p) => p.rack).filter(Boolean))],
        };
        if (row.physical > 0 || row.reserved > 0) byLocation.push({ location_id: loc.id, location: loc.name, location_code: loc.code, type: loc.type, ...row });
      }
    }
    const sum = (k) => byLocation.reduce((s, r) => s + r[k], 0);
    const totals = { physical: sum('physical'), reserved: sum('reserved'), available: sum('available'), display: sum('display'), display_for_sale: sum('display_for_sale'), damaged: sum('damaged'), in_transit: inTransit };
    return { product_id: product.id, tracking: product.tracking, totals, byLocation, status: classify(totals, product.made_to_order), expected: totals.available > 0 ? null : expectedFrom(product, inc) };
  }
  function productAvailability(id) {
    const a = availabilityMany([id]).get(Number(id));
    if (!a) throw new StockError('Product not found', 404);
    return a;
  }
  function pieceStatus(piece) {
    if (piece.status === 'display') return piece.display_for_sale ? 'available_now' : 'display_only';
    return { available: 'available_now', reserved: 'reserved', sold: 'sold', damaged: 'damaged', in_transit: 'in_transit' }[piece.status];
  }
  const saleablePiece = (p) => p.status === 'available' || (p.status === 'display' && p.display_for_sale);

  function reserve({ productId, pieceId, locationId, qty = 1, customerName, quotationId, userId }) {
    return tx(() => {
      if (pieceId) {
        const before = getPiece(pieceId);
        const taken = D.reservations.some((r) => r.piece_id === before.id && r.status === 'active');
        if (!saleablePiece(before) || taken) {
          throw new StockError(before.status === 'reserved' || taken ? 'This piece has just been reserved by someone else' : `This piece is not available to reserve (${pieceStatus(before).replace('_', ' ')})`);
        }
        const prev = before.status;
        before.status = 'reserved';
        const r = ins('reservations', { product_id: before.product_id, piece_id: before.id, location_id: before.location_id, qty: 1, piece_prev_status: prev, customer_name: customerName || null,
          quotation_id: quotationId || null, status: 'active', created_by: userId, created_at: now(), closed_at: null });
        ledger({ user_id: userId, movement: 'reserve', product_id: before.product_id, piece_id: before.id, from_location_id: before.location_id, qty: 1, reference: `RES-${r.id}`, note: customerName || null });
        return r.id;
      }
      const product = getProduct(productId);
      if (product.tracking === 'piece') throw new StockError('This product is tracked by individual piece — choose the exact piece to reserve', 400);
      const n = posInt(qty);
      let loc = locationId ? Number(locationId) : null;
      let avail;
      if (loc) avail = skuAvailableAt(product.id, loc);
      else ({ id: loc, available: avail } = bestSkuLocation(product.id) || { id: null, available: 0 });
      if (avail < n) throw new StockError(`Only ${avail} available to reserve at this location`);
      const r = ins('reservations', { product_id: product.id, piece_id: null, location_id: loc, qty: n, piece_prev_status: null, customer_name: customerName || null, quotation_id: quotationId || null,
        status: 'active', created_by: userId, created_at: now(), closed_at: null });
      ledger({ user_id: userId, movement: 'reserve', product_id: product.id, from_location_id: loc, qty: n, reference: `RES-${r.id}`, note: customerName || null });
      return r.id;
    });
  }
  function releaseReservation(reservationId, userId, reason = 'cancelled') {
    return tx(() => {
      const r = get('reservations', reservationId);
      if (!r) throw new StockError('Reservation not found', 404);
      if (r.status !== 'active') throw new StockError('Reservation is no longer active');
      r.status = 'released'; r.closed_at = now();
      if (r.piece_id) { const pc = get('pieces', r.piece_id); if (pc && pc.status === 'reserved') pc.status = r.piece_prev_status || 'available'; }
      ledger({ user_id: userId, movement: 'release', product_id: r.product_id, piece_id: r.piece_id, from_location_id: r.location_id, qty: r.qty, reference: `RES-${r.id}`, note: reason });
    });
  }
  function receive({ productId, locationId, rack, qty, condition = 'sellable', pieces, incomingId, reference, userId }) {
    return tx(() => {
      const product = getProduct(productId);
      if (!locationId) throw new StockError('Choose a receiving location', 400);
      if (!get('locations', locationId)) throw new StockError('Location not found', 404);
      const created = [];
      if (product.tracking === 'piece') {
        const list = Array.isArray(pieces) && pieces.length ? pieces : Array.from({ length: posInt(qty) }, () => ({}));
        for (const spec of list) {
          const status = spec.status || (condition === 'damaged' ? 'damaged' : condition === 'display' ? 'display' : 'available');
          const code = nextCode(PIECE_PREFIX);
          const r = ins('pieces', { piece_code: code, public_token: newToken(), product_id: product.id, mfr_barcode: null, condition: spec.condition || 'New', finish_note: spec.finish_note || null,
            location_id: Number(locationId), rack: spec.rack || rack || null, status, display_for_sale: spec.display_for_sale ? 1 : 0,
            cost_price: spec.cost_price ?? product.cost_price, selling_price: spec.selling_price ?? product.selling_price, notes: spec.notes || null, public_enabled: 1, created_at: now() });
          ledger({ user_id: userId, movement: 'receive', product_id: product.id, piece_id: r.id, to_location_id: Number(locationId), condition: status, qty: 1, reference: reference || null });
          created.push({ id: r.id, piece_code: code });
        }
      } else {
        if (!['sellable', 'display', 'display_sale', 'damaged'].includes(condition)) throw new StockError('Unknown condition', 400);
        const n = posInt(qty);
        adjustBalance(product.id, locationId, condition, n, rack);
        ledger({ user_id: userId, movement: 'receive', product_id: product.id, to_location_id: Number(locationId), condition, qty: n, reference: reference || null });
      }
      if (incomingId) { const inc = get('incoming', incomingId); if (inc && inc.product_id === product.id) inc.status = 'received'; }
      return { created };
    });
  }
  function transfer({ productId, pieceId, fromLocationId, toLocationId, qty, condition = 'sellable', rack, reference, userId }) {
    return tx(() => {
      if (!toLocationId) throw new StockError('Choose a destination', 400);
      if (pieceId) {
        const piece = getPiece(pieceId);
        if (piece.status === 'sold') throw new StockError('This piece has been sold');
        if (piece.location_id === Number(toLocationId) && (rack || null) === piece.rack) throw new StockError('Piece is already at this location', 400);
        const from = piece.location_id;
        piece.location_id = Number(toLocationId); piece.rack = rack || null;
        D.reservations.filter((r) => r.piece_id === piece.id && r.status === 'active').forEach((r) => { r.location_id = Number(toLocationId); });
        ledger({ user_id: userId, movement: 'transfer', product_id: piece.product_id, piece_id: piece.id, from_location_id: from, to_location_id: Number(toLocationId), qty: 1, reference: reference || null, note: rack ? `rack ${rack}` : null });
        return;
      }
      const product = getProduct(productId);
      if (product.tracking === 'piece') throw new StockError('Choose the exact piece to transfer', 400);
      if (!fromLocationId || Number(fromLocationId) === Number(toLocationId)) throw new StockError('Choose two different locations', 400);
      const n = posInt(qty);
      if (condition === 'sellable' || condition === 'display_sale') {
        const free = skuAvailableAt(product.id, fromLocationId);
        if (free < n) throw new StockError(`Only ${free} unreserved units can be moved from this location`);
      }
      adjustBalance(product.id, fromLocationId, condition, -n);
      adjustBalance(product.id, toLocationId, condition, n, rack);
      ledger({ user_id: userId, movement: 'transfer', product_id: product.id, from_location_id: Number(fromLocationId), to_location_id: Number(toLocationId), condition, qty: n, reference: reference || null });
    });
  }
  function dispatch({ productId, pieceId, locationId, qty, reservationId, reference, userId }) {
    return tx(() => {
      let res = null;
      if (reservationId) {
        res = D.reservations.find((r) => r.id === Number(reservationId) && r.status === 'active');
        if (!res) throw new StockError('Reservation is not active');
        pieceId = res.piece_id; productId = res.product_id; locationId = res.location_id; qty = res.qty;
      }
      if (pieceId) {
        const piece = getPiece(pieceId);
        if (!res) {
          res = D.reservations.find((r) => r.piece_id === piece.id && r.status === 'active') || null;
          if (!res && !saleablePiece(piece)) throw new StockError(`This piece cannot be dispatched (${pieceStatus(piece).replace('_', ' ')})`);
        }
        piece.status = 'sold';
        if (res) { res.status = 'fulfilled'; res.closed_at = now(); }
        ledger({ user_id: userId, movement: 'dispatch', product_id: piece.product_id, piece_id: piece.id, from_location_id: piece.location_id, qty: -1, reference: reference || null });
        return;
      }
      const product = getProduct(productId);
      if (product.tracking === 'piece') throw new StockError('Choose the exact piece to dispatch', 400);
      if (!locationId) throw new StockError('Choose the dispatch location', 400);
      const n = posInt(qty);
      if (!res && skuAvailableAt(product.id, locationId) < n) throw new StockError('Not enough unreserved stock to dispatch');
      const fromSellable = Math.min(n, balance(product.id, locationId, 'sellable'));
      if (fromSellable) adjustBalance(product.id, locationId, 'sellable', -fromSellable);
      if (n - fromSellable) adjustBalance(product.id, locationId, 'display_sale', -(n - fromSellable));
      if (res) { res.status = 'fulfilled'; res.closed_at = now(); }
      ledger({ user_id: userId, movement: 'dispatch', product_id: product.id, from_location_id: Number(locationId), condition: 'sellable', qty: -n, reference: reference || (res ? `RES-${res.id}` : null) });
    });
  }
  function count({ productId, pieceId, locationId, condition = 'sellable', countedQty, rack, userId, note }) {
    return tx(() => {
      if (pieceId) {
        const piece = getPiece(pieceId);
        if (locationId && Number(locationId) !== piece.location_id) {
          const from = piece.location_id;
          piece.location_id = Number(locationId); if (rack) piece.rack = rack;
          ledger({ user_id: userId, movement: 'count_relocate', product_id: piece.product_id, piece_id: piece.id, from_location_id: from, to_location_id: Number(locationId), qty: 0, note: note || 'Found at a different location during count' });
        } else {
          ledger({ user_id: userId, movement: 'count_verify', product_id: piece.product_id, piece_id: piece.id, from_location_id: piece.location_id, qty: 0, note: note || null });
        }
        return { delta: 0 };
      }
      const product = getProduct(productId);
      if (!locationId) throw new StockError('Choose the count location', 400);
      const counted = Number(countedQty);
      if (countedQty === '' || countedQty == null || !Number.isInteger(counted) || counted < 0) throw new StockError('Counted quantity must be zero or more', 400);
      const delta = counted - balance(product.id, locationId, condition);
      if (delta !== 0) adjustBalance(product.id, locationId, condition, delta, rack);
      ledger({ user_id: userId, movement: 'count_adjust', product_id: product.id, to_location_id: Number(locationId), condition, qty: delta, note: note || `Counted ${counted}` });
      return { delta };
    });
  }
  function changeCondition({ productId, pieceId, locationId, fromCondition, toCondition, qty, userId, note }) {
    const valid = ['sellable', 'display', 'display_sale', 'damaged'];
    if (!valid.includes(toCondition)) throw new StockError('Unknown condition', 400);
    return tx(() => {
      if (pieceId) {
        const piece = getPiece(pieceId);
        if (['reserved', 'sold'].includes(piece.status)) throw new StockError(`A ${piece.status} piece cannot be re-classified`);
        const before = piece.status;
        piece.status = { sellable: 'available', display: 'display', display_sale: 'display', damaged: 'damaged' }[toCondition];
        piece.display_for_sale = toCondition === 'display_sale' ? 1 : 0;
        ledger({ user_id: userId, movement: 'reclassify', product_id: piece.product_id, piece_id: piece.id, from_location_id: piece.location_id, condition: toCondition, qty: 0, note: note || `${before} → ${toCondition}` });
        return;
      }
      const product = getProduct(productId);
      if (!valid.includes(fromCondition) || fromCondition === toCondition) throw new StockError('Choose two different conditions', 400);
      const n = posInt(qty);
      if (fromCondition === 'sellable' || fromCondition === 'display_sale') {
        const free = skuAvailableAt(product.id, locationId);
        if (free < n) throw new StockError(`Only ${free} unreserved units can be re-classified`);
      }
      adjustBalance(product.id, locationId, fromCondition, -n);
      adjustBalance(product.id, locationId, toCondition, n);
      ledger({ user_id: userId, movement: 'reclassify', product_id: product.id, from_location_id: Number(locationId), to_location_id: Number(locationId), condition: `${fromCondition}→${toCondition}`, qty: n, note: note || null });
    });
  }
  function returnInspected({ productId, pieceId, locationId, qty = 1, result, rack, reference, userId, note }) {
    if (!['sellable', 'damaged'].includes(result)) throw new StockError('Inspection result must be sellable or damaged', 400);
    if (!locationId) throw new StockError('Choose where the return is stored', 400);
    return tx(() => {
      if (pieceId) {
        const piece = getPiece(pieceId);
        if (piece.status !== 'sold') throw new StockError('Only a sold piece can be returned');
        Object.assign(piece, { status: result === 'sellable' ? 'available' : 'damaged', display_for_sale: 0, location_id: Number(locationId), rack: rack || null });
        ledger({ user_id: userId, movement: 'return', product_id: piece.product_id, piece_id: piece.id, to_location_id: Number(locationId), condition: result, qty: 1, reference: reference || null, note: note || null });
        return;
      }
      const product = getProduct(productId);
      const n = posInt(qty);
      adjustBalance(product.id, locationId, result, n, rack);
      ledger({ user_id: userId, movement: 'return', product_id: product.id, to_location_id: Number(locationId), condition: result, qty: n, reference: reference || null, note: note || null });
    });
  }

  // ================= catalog.js =================
  const STATUS_LABEL = { available_now: 'Available Now', reserved: 'Reserved', out_of_stock: 'Out of Stock', made_to_order: 'Made to Order', display_only: 'Display Only', damaged: 'Damaged', sold: 'Sold', in_transit: 'In Transit' };
  const STATUS_RANK = ['available_now', 'made_to_order', 'reserved', 'display_only', 'damaged', 'out_of_stock'];
  const photoSort = (a, b) => a.sort - b.sort || a.id - b.id;
  function photoMaps(productIds, pieceIds = []) {
    const product = new Map(), piece = new Map();
    for (const pid of new Set(productIds.map(Number))) {
      const pr = get('products', pid); if (!pr) continue;
      const ph = D.photos.filter((x) => x.piece_id == null && (x.product_id === pr.id || (pr.parent_id && x.product_id === pr.parent_id)))
        .sort((a, b) => (b.product_id === pr.id) - (a.product_id === pr.id) || photoSort(a, b))[0];
      if (ph) product.set(pid, ph.url);
    }
    for (const cid of new Set(pieceIds.filter(Boolean).map(Number))) {
      const ph = D.photos.filter((x) => x.piece_id === cid).sort(photoSort)[0];
      if (ph) piece.set(cid, ph.url);
    }
    return { product, piece };
  }
  function dims(p) {
    const d = [p.length_cm, p.width_cm, p.height_cm].filter((x) => x != null && x !== '');
    return d.length ? `${d.map((x) => +x).join(' × ')} cm` : null;
  }
  function cardsFor(list) {
    if (!list.length) return [];
    const ids = list.map((p) => p.id);
    const kids = D.products.filter((k) => k.parent_id && ids.includes(k.parent_id) && k.active);
    const avail = availabilityMany([...ids, ...kids.map((k) => k.id)]);
    const photos = photoMaps(ids);
    return list.map((p) => {
      const a = avail.get(p.id);
      let { status } = a, available = a.totals.available, variants = 0;
      const mine = kids.filter((k) => k.parent_id === p.id);
      if (mine.length && a.totals.physical === 0) {
        const ka = mine.map((k) => avail.get(k.id));
        available = ka.reduce((s, x) => s + x.totals.available, 0);
        status = ka.map((x) => x.status).sort((x, y) => STATUS_RANK.indexOf(x) - STATUS_RANK.indexOf(y))[0];
        variants = mine.length;
      }
      return { variants, id: p.id, sku: p.sku, name: p.name, variant_label: p.variant_label, category: p.category, material: p.material, finish: p.finish,
        dimensions: dims(p), selling_price: p.selling_price, tracking: p.tracking, photo: photos.product.get(p.id) || null,
        status, status_label: STATUS_LABEL[status], available, expected: a.expected };
    });
  }
  function search({ q = '', category, material, finish, availability, limit = 60 } = {}) {
    const tokens = String(q).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
    const has = (v, t) => byLower(v).includes(t);
    const list = D.products.filter((pr) => {
      if (!pr.active) return false;
      for (const t of tokens) {
        const pieceMatch = D.pieces.some((pc) => pc.product_id === pr.id && (has(pc.piece_code, t) || has(pc.mfr_barcode, t) || has(pc.finish_note, t)));
        const dim = t.replace(/cm$/, '').match(/^(\d+(?:\.\d+)?)(?:[x×*](\d+(?:\.\d+)?))?(?:[x×*](\d+(?:\.\d+)?))?$/);
        if (dim) {
          const nums = dim.slice(1).filter(Boolean).map(Number);
          const near = (v, n) => v != null && Math.abs(Number(v) - n) <= 3;
          const dimOk = nums.every((n) => near(pr.length_cm, n) || near(pr.width_cm, n) || near(pr.height_cm, n));
          if (!(dimOk || has(pr.sku, t) || has(pr.internal_code, t) || has(pr.mfr_barcode, t) || pieceMatch)) return false;
          continue;
        }
        if (!(has(pr.name, t) || has(pr.sku, t) || has(pr.internal_code, t) || has(pr.mfr_barcode, t) || has(pr.category, t) || has(pr.material, t) || has(pr.finish, t) || has(pr.variant_label, t) || pieceMatch)) return false;
      }
      if (category && pr.category !== category) return false;
      if (material && pr.material !== material) return false;
      if (finish && pr.finish !== finish) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id).slice(0, 500);
    let cards = cardsFor(list);
    if (availability) cards = cards.filter((c) => c.status === availability);
    return cards.slice(0, Number(limit) || 60);
  }
  function facets() {
    const act = D.products.filter((p) => p.active);
    const u = (k) => [...new Set(act.map((p) => p[k]).filter((v) => v != null && v !== ''))].sort((x, y) => x.localeCompare(y));
    return { categories: u('category'), materials: u('material'), finishes: u('finish') };
  }
  function resolveCode(raw) {
    const code = String(raw || '').trim().slice(0, 300);
    if (!code) return null;
    const m = code.match(/(?:\/p\/|p(?:\.html)?\?t=)([A-Za-z0-9_-]{8,})\/?(?:[&#].*)?$/);
    if (m) {
      const piece = D.pieces.find((p) => p.public_token === m[1]);
      if (piece) return { type: 'piece', piece_id: piece.id, product_id: piece.product_id, matched: 'qr' };
      const product = D.products.find((p) => p.public_token === m[1]);
      if (product) return { type: 'product', product_id: product.id, matched: 'qr' };
      return null;
    }
    const up = code.toUpperCase();
    const piece = D.pieces.find((p) => p.piece_code.toUpperCase() === up || p.mfr_barcode === code);
    if (piece) return { type: 'piece', piece_id: piece.id, product_id: piece.product_id, matched: piece.piece_code.toUpperCase() === up ? 'piece_code' : 'mfr_barcode' };
    const product = D.products.find((p) => p.internal_code.toUpperCase() === up || p.mfr_barcode === code || p.sku.toUpperCase() === up);
    if (product) return { type: 'product', product_id: product.id, matched: product.internal_code.toUpperCase() === up ? 'internal_code' : product.sku.toUpperCase() === up ? 'sku' : 'mfr_barcode' };
    return null;
  }
  function videosFor({ productId, pieceId }, { includeInternal = true } = {}) {
    productId = Number(productId); pieceId = pieceId ? Number(pieceId) : null;
    const parentId = (get('products', productId) || {}).parent_id || null;
    const all = D.videos.filter((v) => (v.piece_id != null && v.piece_id === pieceId) || (v.piece_id == null && (v.product_id === productId || (parentId && v.product_id === parentId)))).sort((a, b) => a.id - b.id);
    const levels = [];
    if (pieceId) levels.push({ rows: all.filter((v) => v.piece_id), scope: 'exact_piece' });
    levels.push({ rows: all.filter((v) => !v.piece_id && v.product_id === productId), scope: pieceId ? 'same_design' : 'this_product' });
    levels.push({ rows: all.filter((v) => !v.piece_id && v.product_id !== productId), scope: 'same_design' });
    const out = []; const overridden = new Set();
    for (const level of levels) {
      const newly = [];
      for (const v of level.rows) {
        if (!includeInternal && v.visibility !== 'customer') continue;
        if (overridden.has(v.video_type)) continue;
        if (v.overrides_parent) newly.push(v.video_type);
        out.push({ id: v.id, title: v.title, youtube_id: v.youtube_id, url: ytWatch(v.youtube_id), thumbnail: ytThumb(v.youtube_id),
          video_type: v.video_type, visibility: v.visibility, embed_status: v.embed_status, inherited: level.scope !== levels[0].scope,
          scope: level.scope, is_primary: !!v.is_primary, source_product_id: v.product_id, source_piece_id: v.piece_id,
          scope_label: level.scope === 'exact_piece' ? 'Shows this exact piece' : level.scope === 'this_product' ? 'This product' : 'Same design — not this exact piece' });
      }
      newly.forEach((t) => overridden.add(t));
    }
    let primarySeen = false;
    for (const v of out) { if (v.is_primary && !primarySeen) primarySeen = true; else v.is_primary = false; }
    if (!primarySeen && out.length) out[0].is_primary = true;
    return out.sort((a, b) => b.is_primary - a.is_primary);
  }
  function photosFor(productId, pieceId, publicOnly = false) {
    productId = Number(productId); pieceId = pieceId ? Number(pieceId) : null;
    const parentId = (get('products', productId) || {}).parent_id || null;
    const list = D.photos.filter((r) => ((r.piece_id != null && r.piece_id === pieceId) || (r.piece_id == null && (r.product_id === productId || (parentId && r.product_id === parentId)))) && (!publicOnly || r.is_public)).sort(photoSort);
    const shape = (r, exact) => ({ id: r.id, url: r.url, caption: r.caption, is_public: r.is_public, exact_piece: exact });
    const own = list.filter((r) => !r.piece_id && r.product_id === productId);
    const design = own.length ? own : list.filter((r) => !r.piece_id && r.product_id !== productId);
    return [...list.filter((r) => r.piece_id).map((r) => shape(r, 1)), ...design.map((r) => shape(r, 0))];
  }
  function alternatives(productId, limit = 6, product) {
    const p = product || get('products', productId);
    if (!p) return [];
    const cands = D.products.filter((c) => c.active && c.id !== p.id && (c.category === p.category || c.parent_id === p.id || c.id === (p.parent_id || -1) || c.parent_id === (p.parent_id || -1)));
    const cards = cardsFor(cands);
    const scored = [];
    cands.forEach((c, i) => {
      const cc = cards[i];
      if (cc.status !== 'available_now') return;
      let score = 0;
      if (p.parent_id && (c.parent_id === p.parent_id || c.id === p.parent_id)) score += 5;
      if (c.material && c.material === p.material) score += 2;
      if (c.finish && c.finish === p.finish) score += 1;
      if (p.selling_price && c.selling_price) score += Math.max(0, 2 - Math.abs(c.selling_price - p.selling_price) / p.selling_price * 4);
      for (const k of ['length_cm', 'width_cm', 'height_cm']) if (p[k] && c[k]) score += Math.max(0, 1 - Math.abs(c[k] - p[k]) / p[k] * 3);
      scored.push({ ...cc, score: +score.toFixed(2) });
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  const userName = (id) => (get('users', id) || {}).name || null;
  const locOf = (id) => get('locations', id) || null;
  function pieceView(piece, { includeCost }, designPhoto = null) {
    const status = pieceStatus(piece);
    const loc = locOf(piece.location_id);
    const res = D.reservations.find((r) => r.piece_id === piece.id && r.status === 'active');
    const ph = D.photos.filter((x) => x.piece_id === piece.id).sort(photoSort)[0];
    return {
      id: piece.id, piece_code: piece.piece_code, mfr_barcode: piece.mfr_barcode, condition: piece.condition, finish_note: piece.finish_note,
      location_id: piece.location_id, location: loc ? loc.name : null, location_type: loc ? loc.type : null, rack: piece.rack,
      status, status_label: STATUS_LABEL[status], raw_status: piece.status, display_piece: piece.status === 'display', display_for_sale: !!piece.display_for_sale,
      selling_price: piece.selling_price, cost_price: includeCost ? piece.cost_price : undefined,
      public_enabled: !!piece.public_enabled, public_token: piece.public_token, notes: includeCost ? piece.notes : undefined,
      reservation: res ? { id: res.id, customer_name: res.customer_name, created_at: res.created_at, by_name: userName(res.created_by) } : null,
      photo: (ph && ph.url) || designPhoto,
    };
  }
  const PIECE_ORDER = { available: 0, display: 1, reserved: 2, damaged: 3 };
  function productDetail(productId, { includeCost = false } = {}) {
    const p = get('products', productId);
    if (!p) return null;
    const availability = productAvailability(p.id);
    const designPhoto = photoMaps([p.id]).product.get(p.id) || null;
    const pieces = p.tracking === 'piece'
      ? D.pieces.filter((x) => x.product_id === p.id).sort((a, b) => (PIECE_ORDER[a.status] ?? 4) - (PIECE_ORDER[b.status] ?? 4) || a.piece_code.localeCompare(b.piece_code)).map((x) => pieceView(x, { includeCost }, designPhoto))
      : [];
    const variantRows = D.products.filter((x) => x.active && x.id !== p.id && ((x.parent_id != null && x.parent_id === (p.parent_id || -1)) || x.parent_id === p.id || x.id === (p.parent_id || -1)));
    const reservations = D.reservations.filter((r) => r.product_id === p.id && r.status === 'active').sort((a, b) => b.created_at.localeCompare(a.created_at)).map((r) => ({
      ...r, location: (locOf(r.location_id) || {}).name || null, by_name: userName(r.created_by), piece_code: r.piece_id ? (get('pieces', r.piece_id) || {}).piece_code : null }));
    const incoming = D.incoming.filter((i) => i.product_id === p.id && ['requested', 'ordered'].includes(i.status)).sort((a, b) => String(a.expected_date || '9999').localeCompare(String(b.expected_date || '9999')));
    const out = {
      id: p.id, sku: p.sku, internal_code: p.internal_code, mfr_barcode: p.mfr_barcode, name: p.name, variant_label: p.variant_label, parent_id: p.parent_id,
      category: p.category, material: p.material, finish: p.finish, length_cm: p.length_cm, width_cm: p.width_cm, height_cm: p.height_cm,
      dimensions: dims(p), description: p.description, care: p.care, short_specs: p.short_specs, selling_price: p.selling_price,
      tracking: p.tracking, made_to_order: !!p.made_to_order, lead_time_days: p.lead_time_days,
      public_enabled: !!p.public_enabled, public_show_price: !!p.public_show_price, public_token: p.public_token,
      status_label: STATUS_LABEL[availability.status], availability, pieces, variants: cardsFor(variantRows), reservations, incoming,
      photos: photosFor(p.id), videos: videosFor({ productId: p.id }), alternatives: availability.status === 'available_now' ? [] : alternatives(p.id, 6, p),
    };
    if (includeCost) Object.assign(out, { cost_price: p.cost_price, vendor: p.vendor, internal_notes: p.internal_notes });
    return out;
  }
  function ledgerView(sl) {
    const pr = get('products', sl.product_id) || {};
    return { ...sl, product: pr.name, sku: pr.sku, piece_code: sl.piece_id ? (get('pieces', sl.piece_id) || {}).piece_code : null,
      from_loc: (locOf(sl.from_location_id) || {}).name || null, to_loc: (locOf(sl.to_location_id) || {}).name || null, by_name: userName(sl.user_id) };
  }
  function pieceDetail(pieceId, opts = {}) {
    const piece = get('pieces', pieceId);
    if (!piece) return null;
    const product = productDetail(piece.product_id, opts);
    const history = D.stock_ledger.filter((s) => s.piece_id === piece.id).sort((a, b) => b.id - a.id).map((s) => {
      const v = ledgerView(s);
      return { ts: v.ts, movement: v.movement, qty: v.qty, condition: v.condition, reference: v.reference, note: v.note, from_loc: v.from_loc, to_loc: v.to_loc, by_name: v.by_name };
    });
    const view = product.pieces.find((x) => x.id === piece.id);
    let alts = [];
    if (view.status !== 'available_now') {
      const otherProducts = product.alternatives.length ? product.alternatives : alternatives(piece.product_id, 4);
      alts = [
        ...product.pieces.filter((x) => x.id !== piece.id && x.status === 'available_now').slice(0, 4).map((x) => ({ ...x, kind: 'piece', name: product.name })),
        ...otherProducts.slice(0, 4).map((x) => ({ ...x, kind: 'product' })),
      ];
    }
    return { piece: view, product, history, alternatives: alts, photos: photosFor(piece.product_id, piece.id), videos: videosFor({ productId: piece.product_id, pieceId: piece.id }) };
  }

  // ================= public.js =================
  const DEFAULT_WORDING = {
    available_now: 'Available — ask our showroom team', reserved: 'Currently reserved — ask us about similar pieces', out_of_stock: 'Currently unavailable — ask us about similar pieces',
    made_to_order: 'Made to order', display_only: 'Showroom display piece', damaged: 'Please ask showroom staff', sold: 'This piece has been sold — ask us about similar pieces', in_transit: 'Please ask showroom staff',
  };
  function pubSettings() {
    const s = D.settings;
    let wording = DEFAULT_WORDING;
    try { wording = { ...DEFAULT_WORDING, ...JSON.parse(s.availability_wording || '{}') }; } catch { /* keep defaults */ }
    return { business_name: s.business_name || 'Teakwood Living', public_pages_enabled: s.public_pages_enabled !== '0', public_show_prices: s.public_show_prices !== '0',
      public_show_expected_date: s.public_show_expected_date === '1', currency: s.currency || 'INR', showroom_contact: s.showroom_contact || '', wording };
  }
  const publicProductFields = (p) => ({ name: p.name, variant: p.variant_label || null, sku: p.sku, category: p.category || null, material: p.material || null, finish: p.finish || null,
    dimensions: dims(p), length_cm: p.length_cm, width_cm: p.width_cm, height_cm: p.height_cm, description: p.description || null, care: p.care || null });
  const publicVideos = (productId, pieceId) => videosFor({ productId, pieceId }, { includeInternal: false }).map((v) => ({
    title: v.title, youtube_id: v.youtube_id, url: v.url, thumbnail: v.thumbnail, video_type: v.video_type, is_primary: v.is_primary, scope_label: v.scope_label,
    embeddable: v.embed_status !== 'embed_disabled' && v.embed_status !== 'unavailable', unavailable: v.embed_status === 'unavailable' })).filter((v) => !v.unavailable);
  const publicPhotos = (productId, pieceId) => photosFor(productId, pieceId, true).map((ph) => ({ url: ph.url, caption: ph.caption || null, exact_piece: !!ph.exact_piece }));
  function publicItem(token) {
    if (!/^[A-Za-z0-9_-]{8,32}$/.test(String(token))) return null;
    const s = pubSettings();
    const piece = D.pieces.find((x) => x.public_token === token) || null;
    const product = piece ? get('products', piece.product_id) : D.products.find((x) => x.public_token === token);
    if (!s.public_pages_enabled || !product) return null;
    if (piece && !piece.public_enabled) return null;
    if (!product.public_enabled || !product.active) return null;
    const avail = piece ? null : productAvailability(product.id);
    const status = piece ? pieceStatus(piece) : avail.status;
    const showPrice = s.public_show_prices && !!product.public_show_price && !['sold', 'display_only', 'damaged'].includes(status);
    const price = piece ? (piece.selling_price ?? product.selling_price) : product.selling_price;
    const expected = s.public_show_expected_date && avail && status !== 'available_now' && avail.expected ? avail.expected.date : null;
    return { business_name: s.business_name, showroom_contact: s.showroom_contact, currency: s.currency, kind: piece ? 'piece' : 'product',
      piece: piece ? { code: piece.piece_code, condition: piece.condition, finish_note: piece.finish_note || null } : null,
      product: publicProductFields(product), price: showPrice && price != null ? price : null, availability_text: s.wording[status] || s.wording.out_of_stock,
      expected_date: expected, photos: publicPhotos(product.id, piece && piece.id), videos: publicVideos(product.id, piece && piece.id) };
  }
  function publicCatalogue(token) {
    const s = pubSettings();
    if (!/^[A-Za-z0-9_-]{8,32}$/.test(String(token))) return null;
    const sl = D.shortlists.find((x) => x.share_token === token && x.share_enabled);
    if (!sl) return null;
    const items = D.shortlist_items.filter((it) => it.shortlist_id === sl.id).sort((a, b) => a.id - b.id).map((it) => {
      const p = get('products', it.product_id);
      const piece = it.piece_id ? get('pieces', it.piece_id) : null;
      const price = piece ? (piece.selling_price ?? p.selling_price) : p.selling_price;
      return { product: publicProductFields(p), piece_code: piece ? piece.piece_code : null, qty: it.qty, preferred_finish: it.pref_finish || null, preferred_dimensions: it.pref_dimensions || null,
        price: s.public_show_prices && sl.share_show_prices && p.public_show_price && price != null ? price : null,
        photos: publicPhotos(p.id, piece && piece.id).slice(0, 4).map((ph) => ({ url: ph.url, caption: ph.caption })), videos: publicVideos(p.id, piece && piece.id) };
    });
    return { business_name: s.business_name, showroom_contact: s.showroom_contact, currency: s.currency,
      title: sl.customer_name ? `Selection for ${sl.customer_name.split(' ')[0]}` : 'Your selection', items, note: 'Prices and availability are confirmed by our team at the time of order.' };
  }

  // ================= labels.js =================
  const PT_MM = 25.4 / 72;
  const MIN_X_MM = 0.25, MIN_QR_MODULE_MM = 0.33, MIN_BAR_H_MM = 5;
  const DEFAULT_TEMPLATES = [
    { name: 'A4 sheet — 63.5 × 38.1 mm (21 per sheet)', layout: 'a4', width_mm: 63.5, height_mm: 38.1, cols: 3, rows: 7, margin_top_mm: 15.15, margin_left_mm: 7.2, gap_x_mm: 2.5, gap_y_mm: 0, dpi: 600 },
    { name: 'A4 sheet — 99.1 × 38.1 mm (14 per sheet)', layout: 'a4', width_mm: 99.1, height_mm: 38.1, cols: 2, rows: 7, margin_top_mm: 15.15, margin_left_mm: 4.65, gap_x_mm: 2.5, gap_y_mm: 0, dpi: 600 },
    { name: 'A4 sheet — 38.1 × 21.2 mm (65 per sheet, QR recommended)', layout: 'a4', width_mm: 38.1, height_mm: 21.2, cols: 5, rows: 13, margin_top_mm: 10.7, margin_left_mm: 4.65, gap_x_mm: 2.5, gap_y_mm: 0, dpi: 600 },
    { name: 'Thermal roll — 50 × 25 mm (203 dpi, barcode or QR)', layout: 'thermal', width_mm: 50, height_mm: 25, dpi: 203 },
    { name: 'Thermal roll — 75 × 50 mm (203 dpi)', layout: 'thermal', width_mm: 75, height_mm: 50, dpi: 203 },
    { name: 'Thermal roll — 100 × 50 mm (300 dpi)', layout: 'thermal', width_mm: 100, height_mm: 50, dpi: 300 },
  ];
  const qrCache = new Map();
  function makeQr(text) {
    if (qrCache.has(text)) return qrCache.get(text);
    if (!root.QRCodeCore) throw fail('QR encoder not loaded', 500);
    const qr = root.QRCodeCore.create(text, { errorCorrectionLevel: 'M' });
    const m = { size: qr.modules.size, data: Array.from(qr.modules.data) };
    if (qrCache.size > 500) qrCache.clear();
    qrCache.set(text, { modules: m });
    return qrCache.get(text);
  }
  const fmtPrice = (n) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;
  function labelData({ type, id }, opts, baseUrl, businessName) {
    if (type === 'piece') {
      const pc = get('pieces', id);
      if (!pc) throw fail(`Piece ${id} not found`, 404);
      const p = get('products', pc.product_id);
      return { business: businessName, name: p.variant_label ? `${p.name} — ${p.variant_label}` : p.name, sku: p.sku, piece_code: opts.show_piece_id === false ? null : pc.piece_code,
        barcode: (opts.use_mfr && pc.mfr_barcode) || pc.piece_code, qr: `${baseUrl}/p.html?t=${pc.public_token}`,
        price: opts.show_price ? (pc.selling_price ?? p.selling_price) : null, specs: opts.show_specs ? (p.short_specs || [dims(p), p.material, pc.finish_note || p.finish].filter(Boolean).join(' · ')) : null };
    }
    const p = get('products', id);
    if (!p) throw fail(`Product ${id} not found`, 404);
    return { business: businessName, name: p.variant_label ? `${p.name} — ${p.variant_label}` : p.name, sku: p.sku, piece_code: null,
      barcode: (opts.use_mfr && p.mfr_barcode) || p.internal_code, qr: `${baseUrl}/p.html?t=${p.public_token}`,
      price: opts.show_price ? p.selling_price : null, specs: opts.show_specs ? (p.short_specs || [dims(p), p.material, p.finish].filter(Boolean).join(' · ')) : null };
  }
  function layoutLabel(data, tpl, opts = {}) {
    const content = opts.content || 'both';
    const w = tpl.width_mm, h = tpl.height_mm;
    const dpmm = tpl.dpi / 25.4;
    const snap = (mm) => Math.round(mm * dpmm) / dpmm;
    const pad = Math.max(1.2, Math.min(w, h) * 0.05);
    const innerW = w - 2 * pad, innerH = h - 2 * pad;
    const items = []; const checks = { warnings: [] };
    let leftW = innerW;
    if (content !== 'barcode') {
      const qr = makeQr(data.qr);
      const n = qr.modules.size;
      let maxSize = Math.min(innerH, innerW * (content === 'qr' ? 0.5 : 0.45), n * (content === 'both' ? 0.75 : 1.0));
      if (content === 'both') {
        const minDots = Math.ceil(MIN_X_MM * dpmm - 1e-9);
        const barcodeW = (code128Bars(data.barcode).modules + 20) * (minDots / dpmm);
        const gapFactor = 1 + Math.max(4 / n, 1.5 / maxSize);
        maxSize = Math.max(Math.min(maxSize, (innerW - barcodeW) / gapFactor), innerW * 0.25);
      }
      const modDots = Math.floor((maxSize * dpmm) / n);
      const mod = modDots / dpmm;
      const size = mod * n;
      const x0 = snap(w - pad - size), y0 = snap(pad + (innerH - size) / 2);
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        if (!qr.modules.data[r * n + c]) continue;
        let run = 1;
        while (c + run < n && qr.modules.data[r * n + c + run]) run++;
        items.push({ t: 'rect', x: x0 + c * mod, y: y0 + r * mod, w: run * mod, h: mod, qr: true });
        c += run - 1;
      }
      checks.qr = { modules: n, module_mm: +mod.toFixed(3), module_dots: modDots, size_mm: +size.toFixed(2), x: x0, y: y0 };
      if (modDots < 2 || mod < MIN_QR_MODULE_MM) checks.warnings.push(`QR modules are ${mod.toFixed(2)} mm — too small for reliable phone scanning; use a larger label`);
      leftW = innerW - size - Math.max(4 * mod, 1.5);
    }
    let textBottom = h - pad;
    if (content !== 'qr') {
      const { bars, modules } = code128Bars(data.barcode);
      const total = modules + 20;
      const xDots = Math.floor((leftW * dpmm) / total);
      const X = xDots / dpmm;
      const hrSize = Math.min(7, Math.max(5, h * 0.2));
      const hrH = hrSize * PT_MM * 1.15;
      const barH = Math.min(15, Math.max(MIN_BAR_H_MM, innerH * 0.36));
      const by = snap(h - pad - hrH - barH);
      const bx = snap(pad + 10 * X);
      for (const b of bars) items.push({ t: 'rect', x: bx + b.x * X, y: by, w: b.w * X, h: barH, barcode: true });
      items.push({ t: 'text', x: pad, y: by + barH + 0.2, w: leftW, size: hrSize, text: data.barcode, align: 'center', mono: true, lines: 1, hr: true });
      checks.barcode = { value: data.barcode, modules, x_mm: +X.toFixed(4), x_dots: xDots, width_mm: +(modules * X).toFixed(2), height_mm: +barH.toFixed(2), x: bx, y: by, quiet_mm: +(10 * X).toFixed(2) };
      if (xDots < 1 || X < MIN_X_MM - 0.001) checks.warnings.push(`Barcode bars are ${X.toFixed(3)} mm wide (minimum ${MIN_X_MM} mm) — scanners may fail; use QR only or a wider label`);
      textBottom = by - 0.6;
    }
    const scale = Math.min(1.5, Math.max(0.75, h / 30));
    const lines = [
      { key: 'business', text: data.business.toUpperCase(), size: 5.5 * scale, bold: true, brand: true },
      { key: 'name', text: data.name, size: 8 * scale, bold: true, lines: 2 },
      { key: 'sku', text: `SKU ${data.sku}`, size: 6 * scale },
      data.piece_code ? { key: 'piece', text: `Piece ID ${data.piece_code}`, size: 6 * scale, bold: true } : null,
      data.price != null ? { key: 'price', text: fmtPrice(data.price), size: 9 * scale, bold: true } : null,
      data.specs ? { key: 'specs', text: data.specs, size: 5.5 * scale, lines: 2, optional: true } : null,
    ].filter(Boolean);
    const height = (l, n) => l.size * PT_MM * 1.22 * n;
    const avail = textBottom - pad;
    let used = lines.reduce((s, l) => s + height(l, l.lines || 1), 0);
    if (used > avail) { const i = lines.findIndex((l) => l.optional); if (i >= 0) { used -= height(lines[i], lines[i].lines); lines.splice(i, 1); } }
    const nameLine = lines.find((l) => l.key === 'name');
    if (used > avail && nameLine.lines === 2) { used -= height(nameLine, 1); nameLine.lines = 1; }
    if (used > avail) {
      const f = Math.max(0.55, avail / used);
      lines.forEach((l) => { l.size *= f; });
      if (avail / used < 0.55) checks.warnings.push('Label is too small for all text; some text may be clipped');
    }
    let y = pad;
    for (const l of lines) {
      const n = l.lines || 1;
      items.push({ t: 'text', x: pad, y, w: leftW, size: +l.size.toFixed(2), bold: !!l.bold, brand: !!l.brand, text: l.text, lines: n, key: l.key });
      y += height(l, n);
    }
    return { w, h, items, checks };
  }
  function placements(tpl, n, startAt = 1) {
    const out = [];
    if (tpl.layout === 'thermal') { for (let i = 0; i < n; i++) out.push({ page: i, x: 0, y: 0 }); return out; }
    const perPage = tpl.cols * tpl.rows;
    for (let i = 0; i < n; i++) {
      const slot = i + (startAt - 1);
      const page = Math.floor(slot / perPage), k = slot % perPage;
      const col = k % tpl.cols, row = Math.floor(k / tpl.cols);
      out.push({ page, x: tpl.margin_left_mm + col * (tpl.width_mm + tpl.gap_x_mm), y: tpl.margin_top_mm + row * (tpl.height_mm + tpl.gap_y_mm) });
    }
    return out;
  }
  function renderZpl(datas, tpl, opts) {
    const dpmm = tpl.dpi / 25.4;
    const d = (mm) => Math.round(mm * dpmm);
    return datas.map((data) => {
      const lab = layoutLabel(data, tpl, opts);
      const out = ['^XA', '^CI28', `^PW${d(tpl.width_mm)}`, `^LL${d(tpl.height_mm)}`];
      for (const it of lab.items) {
        if (it.t !== 'text' || it.hr) continue;
        const fh = Math.max(12, Math.round(it.size * PT_MM * dpmm));
        out.push(`^FO${d(it.x)},${d(it.y)}^A0N,${fh},${fh}^FB${d(it.w)},${it.lines},0,L^FD${it.text.replace(/[\^~]/g, ' ')}^FS`);
      }
      if (lab.checks.barcode) { const b = lab.checks.barcode; out.push(`^FO${d(b.x)},${d(b.y)}^BY${Math.max(1, b.x_dots)}^BCN,${d(b.height_mm)},Y,N,N,A^FD${data.barcode.replace(/[\^~]/g, '')}^FS`); }
      if (lab.checks.qr) { const q = lab.checks.qr; out.push(`^FO${d(q.x)},${Math.max(0, d(q.y) - 10)}^BQN,2,${Math.max(1, Math.min(10, q.module_dots))}^FDMA,${data.qr}^FS`); }
      out.push('^PQ1', '^XZ');
      return out.join('\n');
    }).join('\n');
  }

  // ================= server.js (routes) =================
  const ROLE_PERMS = {
    admin: ['*'],
    manager: ['view', 'view_cost', 'reserve', 'quote', 'receive', 'transfer', 'dispatch', 'count', 'adjust', 'return', 'labels', 'manage_products', 'manage_settings', 'enquiry'],
    sales: ['view', 'reserve', 'quote', 'enquiry', 'labels'],
    storekeeper: ['view', 'receive', 'transfer', 'dispatch', 'count', 'adjust', 'return', 'labels', 'enquiry'],
  };
  const can = (user, perm) => !!user && (ROLE_PERMS[user.role].includes('*') || ROLE_PERMS[user.role].includes(perm));
  const permsOf = (user) => (ROLE_PERMS[user.role].includes('*') ? ROLE_PERMS.manager.concat(['manage_users']) : ROLE_PERMS[user.role]);
  // Demo: passwords are stored with a simple salted hash so the sample data never holds them in plain text.
  function hashPassword(pw, salt) {
    salt = salt || newToken();
    let h = 2166136261;
    const s = salt + ':' + String(pw);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    for (let k = 0; k < 3; k++) { h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); }
    return `${salt}:${(h >>> 0).toString(16)}`;
  }
  const verifyPassword = (pw, stored) => { const [salt] = String(stored).split(':'); return hashPassword(pw, salt) === stored; };
  function baseUrl() {
    const s = D.settings.public_base_url;
    if (s) return s.replace(/\/+$/, '');
    if (typeof location === 'undefined') return 'http://localhost';
    return new URL('.', (typeof document !== 'undefined' && document.baseURI) || location.href).href.replace(/\/+$/, '');
  }
  const businessName = () => pubSettings().business_name;

  const routes = [];
  function on(method, pattern, perm, handler, confirmNeeded = false) {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    routes.push({ method, re, keys, perm, handler, confirmNeeded });
  }
  const PUBLIC = Symbol('public');

  function sessionUser() {
    let tok = null;
    try { tok = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { /* none */ }
    if (!tok) return null;
    const s = D.sessions.find((x) => x.token === tok.token && x.expires_at > Date.now());
    if (!s) return null;
    const u = get('users', s.user_id);
    if (!u || !u.active) return null;
    return { user: { id: u.id, name: u.name, role: u.role, username: u.username }, token: s.token };
  }

  // ---- auth ----
  const MAX_FAILURES = 8;
  on('POST', '/login', PUBLIC, (req) => {
    const username = String(req.body.username || '').trim().toLowerCase().slice(0, 60);
    const recent = D.login_failures.filter((f) => f.username === username && f.ts > Date.now() - 15 * 60e3).length;
    if (recent >= MAX_FAILURES) throw fail('Too many wrong passwords — wait 15 minutes or ask an admin to reset it', 429);
    const u = D.users.find((x) => x.username === username && x.active);
    if (!u || !verifyPassword(req.body.password || '', u.pass_hash)) {
      D.login_failures.push({ id: ++D.seq.login_failures, username, ts: Date.now() });
      throw fail('Wrong username or password', 401);
    }
    remove('login_failures', (f) => f.username === username);
    const token = newToken() + newToken();
    D.sessions.push({ id: ++D.seq.sessions, token, user_id: u.id, expires_at: Date.now() + 12 * 3600e3 });
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ token })); } catch { /* ignore */ }
    return { id: u.id, name: u.name, role: u.role, permissions: permsOf(u) };
  });
  on('POST', '/logout', null, (req) => {
    remove('sessions', (s) => s.token === req.sessionToken);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    return { ok: true };
  });
  on('GET', '/me', null, (req) => ({ ...req.user, permissions: permsOf(req.user), business_name: businessName() }));
  on('GET', '/locations', 'view', () => locsSorted().map((l) => ({ ...l })));

  // ---- staff users ----
  const MIN_PW = 10;
  const checkPw = (pw) => { if (String(pw || '').length < MIN_PW) throw fail(`Password must be at least ${MIN_PW} characters`); };
  const userCols = (u) => ({ id: u.id, username: u.username, name: u.name, role: u.role, active: u.active });
  on('POST', '/me/password', null, (req) => {
    const u = get('users', req.user.id);
    if (!verifyPassword(req.body.current_password || '', u.pass_hash)) throw fail('Current password is wrong', 403);
    checkPw(req.body.new_password);
    u.pass_hash = hashPassword(req.body.new_password);
    remove('sessions', (s) => s.user_id === u.id && s.token !== req.sessionToken);
    return { ok: true };
  });
  on('GET', '/users', 'manage_users', () => [...D.users].sort((a, b) => b.active - a.active || a.role.localeCompare(b.role) || a.name.localeCompare(b.name)).map(userCols));
  on('POST', '/users', 'manage_users', (req) => {
    const x = req.body;
    const username = String(x.username || '').trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,40}$/.test(username)) throw fail('Username: 3–40 letters, numbers, dots, dashes or underscores');
    if (!ROLE_PERMS[x.role]) throw fail('Choose a role');
    if (!String(x.name || '').trim()) throw fail('Enter the person\'s name');
    checkPw(x.password);
    if (D.users.some((u) => u.username === username)) throw fail('That username is taken', 409);
    return userCols(ins('users', { username, name: String(x.name).trim().slice(0, 80), role: x.role, pass_hash: hashPassword(x.password), active: 1 }));
  });
  on('PATCH', '/users/:id', 'manage_users', (req) => {
    const x = req.body; const u = get('users', req.params.id);
    if (!u) throw fail('User not found', 404);
    const demoting = ('role' in x && x.role !== 'admin') || ('active' in x && !x.active);
    if (u.role === 'admin' && demoting && !D.users.some((o) => o.role === 'admin' && o.active && o.id !== u.id)) throw fail('Keep at least one active admin');
    if ('role' in x) { if (!ROLE_PERMS[x.role]) throw fail('Choose a role'); u.role = x.role; }
    if ('name' in x && String(x.name).trim()) u.name = String(x.name).trim().slice(0, 80);
    if ('active' in x) u.active = x.active ? 1 : 0;
    if ('password' in x) { checkPw(x.password); u.pass_hash = hashPassword(x.password); remove('login_failures', (f) => f.username === u.username); }
    if ('role' in x || 'active' in x || 'password' in x) remove('sessions', (s) => s.user_id === u.id && s.token !== req.sessionToken);
    return userCols(u);
  });

  // ---- locations ----
  const LOC_TYPES = ['showroom', 'warehouse', 'branch'];
  on('POST', '/locations', 'manage_settings', (req) => {
    const x = req.body;
    const code = String(x.code || '').trim().toUpperCase();
    if (!/^[A-Z0-9-]{2,10}$/.test(code)) throw fail('Code: 2–10 letters or numbers');
    if (!String(x.name || '').trim()) throw fail('Enter a name');
    if (!LOC_TYPES.includes(x.type)) throw fail('Choose showroom, warehouse or branch');
    if (D.locations.some((l) => l.code === code)) throw fail('That code is already used', 409);
    return { ...ins('locations', { code, name: String(x.name).trim().slice(0, 80), type: x.type }) };
  });
  on('PATCH', '/locations/:id', 'manage_settings', (req) => {
    const x = req.body; const l = get('locations', req.params.id);
    if (!l) throw fail('Location not found', 404);
    if ('name' in x && String(x.name).trim()) l.name = String(x.name).trim().slice(0, 80);
    if ('type' in x) { if (!LOC_TYPES.includes(x.type)) throw fail('Choose showroom, warehouse or branch'); l.type = x.type; }
    return { ...l };
  });

  // ---- finder ----
  on('GET', '/search', 'view', (req) => search(req.query));
  on('GET', '/facets', 'view', () => facets());
  on('GET', '/scan', 'view', (req) => {
    const r = resolveCode(req.query.code);
    if (!r) throw fail(`No product or piece found for "${String(req.query.code || '').slice(0, 60)}"`, 404);
    const actions = ['view', 'quote', 'reserve', 'receive', 'transfer', 'dispatch', 'count'].filter((a) => can(req.user, a));
    return { ...r, tracking: get('products', r.product_id).tracking, actions };
  });
  on('GET', '/products/:id', 'view', (req) => {
    const d = productDetail(Number(req.params.id), { includeCost: can(req.user, 'view_cost') });
    if (!d) throw fail('Product not found', 404);
    return d;
  });
  on('GET', '/pieces/:id', 'view', (req) => {
    const d = pieceDetail(Number(req.params.id), { includeCost: can(req.user, 'view_cost') });
    if (!d) throw fail('Piece not found', 404);
    return d;
  });
  on('GET', '/products/:id/alternatives', 'view', (req) => alternatives(Number(req.params.id), 8));

  // ---- product admin ----
  const PRODUCT_FIELDS = ['sku', 'parent_id', 'variant_label', 'name', 'category', 'material', 'finish', 'length_cm', 'width_cm', 'height_cm', 'description', 'care', 'short_specs',
    'selling_price', 'cost_price', 'vendor', 'internal_notes', 'tracking', 'made_to_order', 'lead_time_days', 'mfr_barcode', 'public_enabled', 'public_show_price', 'active'];
  function cleanProduct(body, existing) {
    const out = {};
    for (const k of PRODUCT_FIELDS) if (k in body) out[k] = body[k] === '' ? null : body[k];
    for (const k of ['made_to_order', 'public_enabled', 'public_show_price', 'active']) if (k in out) out[k] = out[k] ? 1 : 0;
    for (const k of ['length_cm', 'width_cm', 'height_cm', 'selling_price', 'cost_price', 'lead_time_days', 'parent_id']) if (k in out && out[k] != null) {
      if (!Number.isFinite(Number(out[k]))) throw fail('Invalid request');
      out[k] = Number(out[k]);
    }
    for (const k of ['name', 'category', 'material', 'finish', 'variant_label', 'vendor']) if (k in out && out[k] != null) out[k] = String(out[k]).trim() || null;
    if ('tracking' in out && !['sku', 'piece'].includes(out.tracking)) throw fail('Unknown tracking type');
    if ('parent_id' in out && out.parent_id != null && (!get('products', out.parent_id) || (existing && out.parent_id === existing.id))) throw fail('Choose a valid parent design');
    if ('mfr_barcode' in out) { out.mfr_barcode = normaliseMfrBarcode(out.mfr_barcode); assertCodeFree(out.mfr_barcode, existing ? { type: 'product', id: existing.id } : {}); }
    if ('sku' in out) {
      out.sku = String(out.sku || '').trim().toUpperCase();
      if (!out.sku) throw fail('SKU is required');
      if (D.products.some((p) => p.sku === out.sku && p.id !== (existing ? existing.id : -1))) throw fail('SKU already exists', 409);
    }
    if (existing && 'tracking' in out && out.tracking !== existing.tracking) {
      const has = D.stock_balances.some((b) => b.product_id === existing.id && b.qty > 0) || D.pieces.some((p) => p.product_id === existing.id);
      if (has) throw fail('Tracking type cannot change once stock exists', 409);
    }
    return out;
  }
  const PRODUCT_DEFAULTS = { parent_id: null, variant_label: null, category: null, material: null, finish: null, length_cm: null, width_cm: null, height_cm: null, description: null, care: null,
    short_specs: null, selling_price: null, cost_price: null, vendor: null, internal_notes: null, tracking: 'sku', made_to_order: 0, lead_time_days: null, mfr_barcode: null,
    public_enabled: 1, public_show_price: 1, active: 1 };
  function createProduct(data) {
    return ins('products', { ...PRODUCT_DEFAULTS, ...data, internal_code: nextCode(PRODUCT_PREFIX), public_token: newToken(), created_at: now(), updated_at: now() });
  }
  on('POST', '/products', 'manage_products', (req) => {
    const data = cleanProduct(req.body);
    if (!data.name) throw fail('Name is required');
    if (!data.sku) throw fail('SKU is required');
    data.tracking = data.tracking || 'sku';
    const r = createProduct(data);
    return { id: r.id, internal_code: r.internal_code };
  });
  on('PUT', '/products/:id', 'manage_products', (req) => {
    const existing = get('products', req.params.id);
    if (!existing) throw fail('Product not found', 404);
    const data = cleanProduct(req.body, existing);
    if ('name' in data && !data.name) throw fail('Name is required');
    if (!Object.keys(data).length) return { ok: true };
    Object.assign(existing, data, { updated_at: now() });
    return { ok: true };
  });
  // Demo addition: products can be archived (hidden from search), which is how the real app retires items ("active").
  on('DELETE', '/products/:id', 'manage_products', (req) => {
    const p = get('products', req.params.id);
    if (!p) throw fail('Product not found', 404);
    if (D.reservations.some((r) => r.product_id === p.id && r.status === 'active')) throw fail('Release its reservations first', 409);
    p.active = 0; p.updated_at = now();
    return { ok: true };
  });
  on('PUT', '/pieces/:id', 'manage_products', (req) => {
    const pc = get('pieces', req.params.id);
    if (!pc) throw fail('Piece not found', 404);
    const data = {};
    for (const k of ['condition', 'finish_note', 'selling_price', 'cost_price', 'notes', 'mfr_barcode', 'public_enabled', 'rack']) if (k in req.body) data[k] = req.body[k] === '' ? null : req.body[k];
    if ('public_enabled' in data) data.public_enabled = data.public_enabled ? 1 : 0;
    if ('mfr_barcode' in data) { data.mfr_barcode = normaliseMfrBarcode(data.mfr_barcode); assertCodeFree(data.mfr_barcode, { type: 'piece', id: pc.id }); }
    if ('condition' in data && !data.condition) throw fail('Condition is required');
    Object.assign(pc, data);
    return { ok: true };
  });
  on('GET', '/barcode-check', 'view', (req) => {
    try {
      const code = normaliseMfrBarcode(req.query.code);
      assertCodeFree(code, req.query.type ? { type: req.query.type, id: Number(req.query.id) } : {});
      return { ok: true, code };
    } catch (e) { return { ok: false, error: e.message }; }
  });
  on('POST', '/photos', 'manage_products', (req) => {
    const { product_id, piece_id, url, data_url, caption, is_public = true } = req.body;
    if (!get('products', product_id)) throw fail('Product not found', 404);
    let finalUrl = url;
    if (data_url) {
      const m = String(data_url).match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
      if (!m) throw fail('Photo must be a JPEG, PNG or WebP image');
      if (m[2].length * 0.75 > 1.2e6) throw fail('Photo is too large for the demo (browser storage) — try a smaller image');
      finalUrl = data_url;
    } else if (!/^(https:\/\/|\/|seed-img\/)/.test(String(url || ''))) {
      throw fail('Photo URL must start with https://');
    }
    const sort = D.photos.filter((p) => p.product_id === Number(product_id)).reduce((s, p) => Math.max(s, p.sort), 0) + 1;
    const r = ins('photos', { product_id: Number(product_id), piece_id: piece_id ? Number(piece_id) : null, url: finalUrl, storage_path: null, caption: caption || null, is_public: is_public ? 1 : 0, sort });
    return { id: r.id, url: finalUrl };
  });
  on('PATCH', '/photos/:id', 'manage_products', (req) => {
    const ph = get('photos', req.params.id);
    if (ph && 'is_public' in req.body) ph.is_public = req.body.is_public ? 1 : 0;
    if (ph && 'caption' in req.body) ph.caption = req.body.caption || null;
    return { ok: true };
  });
  on('DELETE', '/photos/:id', 'manage_products', (req) => { remove('photos', (p) => p.id === Number(req.params.id)); return { ok: true }; });

  // ---- videos ----
  const VIDEO_TYPES = ['overview', 'dimensions', 'finish', 'demonstration', 'installation', 'care'];
  function cleanVideo(body, existing = {}) {
    const v = { ...existing, ...body };
    const id = parseYouTube(v.url);
    if (!id) throw fail('Enter a YouTube video link (youtube.com/watch?v=…, youtu.be/…, /shorts/… or /embed/…)');
    if (!VIDEO_TYPES.includes(v.video_type)) throw fail('Choose a video type');
    if (!String(v.title || '').trim()) throw fail('Title is required');
    if (v.piece_id) { const pc = get('pieces', v.piece_id); if (!pc || pc.product_id !== Number(v.product_id)) throw fail('Piece does not belong to this product'); }
    return { product_id: Number(v.product_id), piece_id: v.piece_id ? Number(v.piece_id) : null, title: String(v.title).trim().slice(0, 200), url: String(v.url).trim(), youtube_id: id,
      video_type: v.video_type, is_primary: v.is_primary ? 1 : 0, visibility: v.visibility === 'internal' ? 'internal' : 'customer', overrides_parent: v.overrides_parent ? 1 : 0,
      embed_status: existing.youtube_id === id ? existing.embed_status : 'unchecked' };
  }
  function clearOtherPrimaries(v, id) {
    if (v.is_primary) D.videos.filter((x) => x.product_id === v.product_id && (x.piece_id || 0) === (v.piece_id || 0) && x.id !== id).forEach((x) => { x.is_primary = 0; });
  }
  on('GET', '/videos', 'view', (req) => videosFor({ productId: Number(req.query.product_id), pieceId: req.query.piece_id ? Number(req.query.piece_id) : null }));
  on('GET', '/videos/own', 'view', (req) => D.videos.filter((v) => v.product_id === Number(req.query.product_id)).sort((a, b) => (a.piece_id != null) - (b.piece_id != null) || (a.piece_id || 0) - (b.piece_id || 0) || b.is_primary - a.is_primary || a.id - b.id).map((v) => ({ ...v })));
  on('POST', '/videos', 'manage_products', (req) => {
    const v = cleanVideo(req.body);
    return tx(() => { const r = ins('videos', { ...v, checked_at: null, created_at: now() }); clearOtherPrimaries(v, r.id); return { id: r.id, youtube_id: v.youtube_id }; });
  });
  on('PUT', '/videos/:id', 'manage_products', (req) => {
    const existing = get('videos', req.params.id);
    if (!existing) throw fail('Video not found', 404);
    const v = cleanVideo(req.body, existing);
    return tx(() => { Object.assign(existing, v); clearOtherPrimaries(v, existing.id); return { ok: true }; });
  });
  on('DELETE', '/videos/:id', 'manage_products', (req) => { remove('videos', (v) => v.id === Number(req.params.id)); return { ok: true }; });
  // Demo: the YouTube availability check is simulated (no request leaves the browser).
  on('POST', '/videos/:id/check', 'view', (req) => {
    const v = get('videos', req.params.id);
    if (!v) throw fail('Video not found', 404);
    v.embed_status = 'ok'; v.checked_at = now();
    return { embed_status: 'ok' };
  });
  on('POST', '/videos/:id/player-error', 'view', (req) => {
    const code = Number(req.body.code);
    const status = code === 100 ? 'unavailable' : (code === 101 || code === 150) ? 'embed_disabled' : null;
    const v = get('videos', req.params.id);
    if (status && v) { v.embed_status = status; v.checked_at = now(); }
    return { embed_status: status };
  });

  // ---- stock movements ----
  const uid = (req) => req.user.id;
  on('POST', '/stock/reserve', 'reserve', (req) => { const b = req.body; return { reservation_id: reserve({ productId: b.product_id, pieceId: b.piece_id, locationId: b.location_id, qty: b.qty, customerName: b.customer_name, quotationId: b.quotation_id, userId: uid(req) }) }; }, true);
  on('POST', '/stock/release', 'reserve', (req) => { releaseReservation(req.body.reservation_id, uid(req), req.body.reason || 'cancelled'); return { ok: true }; }, true);
  on('POST', '/stock/receive', 'receive', (req) => { const b = req.body; return receive({ productId: b.product_id, locationId: b.location_id, rack: b.rack, qty: b.qty, condition: b.condition, pieces: b.pieces, incomingId: b.incoming_id, reference: b.reference, userId: uid(req) }); }, true);
  on('POST', '/stock/transfer', 'transfer', (req) => { const b = req.body; transfer({ productId: b.product_id, pieceId: b.piece_id, fromLocationId: b.from_location_id, toLocationId: b.to_location_id, qty: b.qty, condition: b.condition, rack: b.rack, reference: b.reference, userId: uid(req) }); return { ok: true }; }, true);
  on('POST', '/stock/dispatch', 'dispatch', (req) => { const b = req.body; dispatch({ productId: b.product_id, pieceId: b.piece_id, locationId: b.location_id, qty: b.qty, reservationId: b.reservation_id, reference: b.reference, userId: uid(req) }); return { ok: true }; }, true);
  on('POST', '/stock/count', 'count', (req) => { const b = req.body; return count({ productId: b.product_id, pieceId: b.piece_id, locationId: b.location_id, condition: b.condition, countedQty: b.counted_qty, rack: b.rack, note: b.note, userId: uid(req) }); }, true);
  on('POST', '/stock/condition', 'adjust', (req) => { const b = req.body; changeCondition({ productId: b.product_id, pieceId: b.piece_id, locationId: b.location_id, fromCondition: b.from_condition, toCondition: b.to_condition, qty: b.qty, note: b.note, userId: uid(req) }); return { ok: true }; }, true);
  on('POST', '/stock/return', 'return', (req) => { const b = req.body; returnInspected({ productId: b.product_id, pieceId: b.piece_id, locationId: b.location_id, qty: b.qty, result: b.result, rack: b.rack, reference: b.reference, note: b.note, userId: uid(req) }); return { ok: true }; }, true);
  on('GET', '/ledger', 'view', (req) => {
    const pid = req.query.product_id ? Number(req.query.product_id) : null, cid = req.query.piece_id ? Number(req.query.piece_id) : null;
    return D.stock_ledger.filter((s) => (pid == null || s.product_id === pid) && (cid == null || s.piece_id === cid)).sort((a, b) => b.id - a.id).slice(0, 300).map(ledgerView);
  });
  // Demo addition: active reservations across all products (the Stock hub lists them).
  on('GET', '/reservations', 'view', () => D.reservations.filter((r) => r.status === 'active').sort((a, b) => b.created_at.localeCompare(a.created_at)).map((r) => {
    const p = get('products', r.product_id) || {};
    return { ...r, product: p.name, sku: p.sku, variant_label: p.variant_label, location: (locOf(r.location_id) || {}).name || null, by_name: userName(r.created_by),
      piece_code: r.piece_id ? (get('pieces', r.piece_id) || {}).piece_code : null, quotation_number: r.quotation_id ? (get('quotations', r.quotation_id) || {}).number : null };
  }));

  // ---- enquiries & incoming ----
  const enquiryView = (e) => {
    const p = get('products', e.product_id) || {};
    return { ...e, product: p.name || null, sku: p.sku || null, piece_code: e.piece_id ? (get('pieces', e.piece_id) || {}).piece_code : null, by_name: userName(e.created_by) };
  };
  on('POST', '/enquiries', 'enquiry', (req) => {
    const x = req.body;
    if (!x.product_id) throw fail('Product is required');
    if (!String(x.customer_name || '').trim() && !String(x.customer_phone || '').trim() && !String(x.message || '').trim()) throw fail('Enter the customer\'s name, phone or requirement');
    const r = ins('enquiries', { product_id: Number(x.product_id), piece_id: x.piece_id || null, source: 'staff', customer_name: x.customer_name || null, customer_phone: x.customer_phone || null,
      message: x.message || null, status: 'open', created_by: uid(req), created_at: now() });
    return { id: r.id };
  });
  on('GET', '/enquiries', 'enquiry', () => [...D.enquiries].sort((a, b) => a.status.localeCompare(b.status) || b.id - a.id).slice(0, 200).map(enquiryView));
  on('PATCH', '/enquiries/:id', 'enquiry', (req) => { const e = get('enquiries', req.params.id); if (e) e.status = req.body.status === 'closed' ? 'closed' : 'open'; return { ok: true }; });
  on('POST', '/incoming', 'quote', (req) => {
    const x = req.body;
    if (!['purchase', 'production'].includes(x.kind)) throw fail('Choose purchase or production');
    if (!get('products', x.product_id)) throw fail('Product not found', 404);
    const r = ins('incoming', { product_id: Number(x.product_id), kind: x.kind, qty: Math.max(1, Number(x.qty) || 1), expected_date: x.expected_date || null, status: 'requested', note: x.note || null, created_by: uid(req), created_at: now() });
    return { id: r.id };
  });
  on('GET', '/incoming', 'view', () => D.incoming.filter((i) => ['requested', 'ordered'].includes(i.status)).sort((a, b) => String(a.expected_date || '9999').localeCompare(String(b.expected_date || '9999'))).map((i) => {
    const p = get('products', i.product_id) || {};
    return { ...i, product: p.name, sku: p.sku };
  }));
  on('PATCH', '/incoming/:id', 'manage_products', (req) => {
    const i = get('incoming', req.params.id);
    if (i) { if (req.body.status) i.status = req.body.status; if (req.body.expected_date) i.expected_date = req.body.expected_date; }
    return { ok: true };
  });

  // ---- shortlists ----
  function lineContext(lines) {
    const avail = availabilityMany(lines.map((r) => r.product_id));
    const pieces = new Map(lines.filter((r) => r.piece_id).map((r) => [r.piece_id, get('pieces', r.piece_id)]));
    return { avail, pieces, photos: photoMaps(lines.map((r) => r.product_id), lines.map((r) => r.piece_id)) };
  }
  function shortlistItems(id) {
    const list = D.shortlist_items.filter((si) => si.shortlist_id === id).sort((a, b) => a.id - b.id).map((si) => {
      const p = get('products', si.product_id); const pc = si.piece_id ? get('pieces', si.piece_id) : null;
      return { ...si, name: p.name, sku: p.sku, variant_label: p.variant_label, material: p.material, finish: p.finish, length_cm: p.length_cm, width_cm: p.width_cm, height_cm: p.height_cm,
        selling_price: p.selling_price, tracking: p.tracking, piece_code: pc ? pc.piece_code : null, piece_price: pc ? pc.selling_price : null };
    });
    const { avail, pieces, photos } = lineContext(list);
    return list.map((it) => {
      const a = avail.get(it.product_id);
      const pieceRow = it.piece_id && pieces.get(it.piece_id);
      const status = pieceRow ? pieceStatus(pieceRow) : a.status;
      return { ...it, dimensions: dims(it), price: it.piece_price ?? it.selling_price, photo: photos.piece.get(it.piece_id) || photos.product.get(it.product_id) || null,
        status, status_label: STATUS_LABEL[status], available: pieceRow ? (status === 'available_now' ? 1 : 0) : a.totals.available };
    });
  }
  on('GET', '/shortlists', 'quote', () => [...D.shortlists].sort((a, b) => b.id - a.id).slice(0, 100).map((s) => ({ ...s, by_name: userName(s.created_by), items: D.shortlist_items.filter((i) => i.shortlist_id === s.id).length })));
  function createShortlist(x, userId, token) {
    return ins('shortlists', { customer_name: x.customer_name || null, customer_phone: x.customer_phone || null, share_token: token || newToken(), share_enabled: 0, share_show_prices: 1, created_by: userId, created_at: now() });
  }
  on('POST', '/shortlists', 'quote', (req) => {
    if (!String(req.body.customer_name || '').trim()) throw fail('Enter the customer\'s name');
    return { id: createShortlist(req.body, uid(req)).id };
  });
  on('GET', '/shortlists/:id', 'quote', (req) => {
    const s = get('shortlists', req.params.id);
    if (!s) throw fail('Shortlist not found', 404);
    return { ...s, share_url: `${baseUrl()}/c.html?t=${s.share_token}`, items: shortlistItems(s.id) };
  });
  on('PATCH', '/shortlists/:id', 'quote', (req) => {
    const x = req.body; const s = get('shortlists', req.params.id);
    if (!s) throw fail('Shortlist not found', 404);
    for (const k of ['customer_name', 'customer_phone']) if (k in x) s[k] = x[k] || null;
    for (const k of ['share_enabled', 'share_show_prices']) if (k in x) s[k] = x[k] ? 1 : 0;
    return { ok: true };
  });
  // Demo addition: delete a whole shortlist (it never holds stock).
  on('DELETE', '/shortlists/:id', 'quote', (req) => {
    const id = Number(req.params.id);
    if (D.quotations.some((q) => q.shortlist_id === id)) D.quotations.filter((q) => q.shortlist_id === id).forEach((q) => { q.shortlist_id = null; });
    remove('shortlist_items', (i) => i.shortlist_id === id); remove('shortlists', (s) => s.id === id);
    return { ok: true };
  });
  function addShortlistItem(slId, x) {
    let productId = x.product_id, pieceId = x.piece_id || null;
    if (x.code) { const r = resolveCode(x.code); if (!r) throw fail('Code not recognised', 404); productId = r.product_id; pieceId = r.piece_id || null; }
    if (!get('shortlists', slId)) throw fail('Shortlist not found', 404);
    if (!get('products', productId)) throw fail('Product not found', 404);
    return ins('shortlist_items', { shortlist_id: Number(slId), product_id: Number(productId), piece_id: pieceId ? Number(pieceId) : null, qty: Math.max(1, Number(x.qty) || 1),
      pref_finish: x.pref_finish || null, pref_dimensions: x.pref_dimensions || null, note: x.note || null });
  }
  on('POST', '/shortlists/:id/items', 'quote', (req) => ({ id: addShortlistItem(req.params.id, req.body).id }));
  on('PUT', '/shortlist-items/:id', 'quote', (req) => {
    const x = req.body; const it = get('shortlist_items', req.params.id);
    if (it) { if (x.qty) it.qty = Math.max(1, Number(x.qty)); it.pref_finish = x.pref_finish || null; it.pref_dimensions = x.pref_dimensions || null; it.note = x.note || null; }
    return { ok: true };
  });
  on('DELETE', '/shortlist-items/:id', 'quote', (req) => { remove('shortlist_items', (i) => i.id === Number(req.params.id)); return { ok: true }; });

  // ---- quotations / orders ----
  function newQuoteNumber() { return nextCode(`Q${new Date(Date.now() - clock).getFullYear()}`).replace(/-0+(\d{4,})$/, '-$1'); }
  function addQuoteItem(qid, it) {
    const p = get('products', it.product_id);
    if (!p) throw fail('Product not found', 404);
    const pc = it.piece_id ? D.pieces.find((x) => x.id === Number(it.piece_id) && x.product_id === p.id) : null;
    if (it.piece_id && !pc) throw fail('Piece does not belong to this product');
    const price = it.unit_price != null && it.unit_price !== '' ? Number(it.unit_price) : (pc ? pc.selling_price ?? p.selling_price : p.selling_price);
    ins('quotation_items', { quotation_id: Number(qid), product_id: p.id, piece_id: pc ? pc.id : null, qty: pc ? 1 : Math.max(1, Number(it.qty) || 1), unit_price: price || 0,
      pref_finish: it.pref_finish || null, pref_dimensions: it.pref_dimensions || null, note: it.note || null });
  }
  function createQuotation({ customer_name, customer_phone, shortlist_id, items = [] }, userId) {
    return tx(() => {
      const r = ins('quotations', { number: newQuoteNumber(), kind: 'quotation', status: 'draft', customer_name: customer_name || null, customer_phone: customer_phone || null,
        shortlist_id: shortlist_id || null, created_by: userId, created_at: now() });
      for (const it of items) addQuoteItem(r.id, it);
      return r.id;
    });
  }
  function quotationView(id) {
    const q = get('quotations', id);
    if (!q) throw fail('Quotation not found', 404);
    const lines = D.quotation_items.filter((qi) => qi.quotation_id === q.id).sort((a, b) => a.id - b.id).map((qi) => {
      const p = get('products', qi.product_id); const pc = qi.piece_id ? get('pieces', qi.piece_id) : null;
      return { ...qi, name: p.name, sku: p.sku, variant_label: p.variant_label, tracking: p.tracking, made_to_order: p.made_to_order, piece_code: pc ? pc.piece_code : null };
    });
    const allRes = D.reservations.filter((r) => r.quotation_id === q.id && r.status === 'active');
    const { avail, pieces, photos } = lineContext(lines);
    const items = lines.map((it) => {
      const piece = it.piece_id && pieces.get(it.piece_id);
      const a = avail.get(it.product_id);
      const status = piece ? pieceStatus(piece) : a.status;
      const resv = allRes.filter((r) => r.product_id === it.product_id && (r.piece_id || 0) === (it.piece_id || 0)).map(({ id: rid, qty, location_id }) => ({ id: rid, qty, location_id }));
      const heldByThis = resv.reduce((s, r) => s + r.qty, 0);
      const canFulfil = heldByThis >= it.qty || (piece ? status === 'available_now' : a.totals.available >= it.qty);
      return { ...it, status, status_label: STATUS_LABEL[status], available: piece ? (status === 'available_now' ? 1 : 0) : a.totals.available,
        reservations: resv, can_fulfil: canFulfil, needs_piece: it.tracking === 'piece' && !it.piece_id, photo: photos.piece.get(it.piece_id) || photos.product.get(it.product_id) || null };
    });
    return { ...q, by_name: userName(q.created_by), items, total: items.reduce((s, i) => s + i.qty * i.unit_price, 0) };
  }
  const editableQuote = (qid) => { const q = get('quotations', qid); if (!q || !['draft', 'sent'].includes(q.status)) throw fail('Only draft quotations can be changed', 409); };
  function confirmQuotation(id, userId) {
    return tx(() => {
      const q = get('quotations', id);
      if (!q) throw fail('Quotation not found', 404);
      if (!['draft', 'sent'].includes(q.status)) throw fail('Quotation is already ' + q.status, 409);
      const items = D.quotation_items.filter((qi) => qi.quotation_id === q.id).sort((a, b) => a.id - b.id);
      if (!items.length) throw fail('Quotation has no items');
      const problems = [];
      for (const it of items) {
        const p = get('products', it.product_id); const pc = it.piece_id ? get('pieces', it.piece_id) : null;
        if (p.tracking === 'piece' && !it.piece_id) { problems.push(`${p.name}: choose the exact piece`); continue; }
        try { reserve({ productId: it.product_id, pieceId: it.piece_id, qty: it.qty, customerName: q.customer_name, quotationId: q.id, userId }); } catch (e) {
          if (!e.status) throw e;
          problems.push(`${p.name}${pc ? ` (${pc.piece_code})` : ''}: ${e.message}`);
        }
      }
      if (problems.length) { const e = fail(`Cannot confirm — ${problems.join('; ')}`, 409); e.data = { problems }; throw e; }
      q.kind = 'order'; q.status = 'confirmed';
      return { id: q.id, number: q.number, kind: 'order', status: 'confirmed' };
    });
  }
  function cancelQuotation(id, userId) {
    return tx(() => {
      const q = get('quotations', id);
      if (!q) throw fail('Quotation not found', 404);
      for (const r of D.reservations.filter((x) => x.quotation_id === q.id && x.status === 'active')) releaseReservation(r.id, userId, 'Order cancelled');
      q.status = 'cancelled';
    });
  }
  function dispatchQuotation(id, userId) {
    return tx(() => {
      const q = get('quotations', id);
      if (!q || q.status !== 'confirmed') throw fail('Only confirmed orders can be dispatched', 409);
      for (const r of D.reservations.filter((x) => x.quotation_id === q.id && x.status === 'active')) dispatch({ reservationId: r.id, reference: q.number, userId });
      q.status = 'dispatched';
    });
  }
  on('GET', '/quotations', 'quote', () => [...D.quotations].sort((a, b) => b.id - a.id).slice(0, 100).map((q) => {
    const its = D.quotation_items.filter((i) => i.quotation_id === q.id);
    return { ...q, total: its.length ? its.reduce((s, i) => s + i.qty * i.unit_price, 0) : null, items: its.length };
  }));
  on('POST', '/quotations', 'quote', (req) => ({ id: createQuotation(req.body, uid(req)) }));
  on('GET', '/quotations/:id', 'quote', (req) => quotationView(Number(req.params.id)));
  on('POST', '/quotations/:id/items', 'quote', (req) => { editableQuote(Number(req.params.id)); addQuoteItem(Number(req.params.id), req.body); return { ok: true }; });
  on('PATCH', '/quotation-items/:id', 'quote', (req) => {
    const it = get('quotation_items', req.params.id);
    const q = it && get('quotations', it.quotation_id);
    if (!it || !['draft', 'sent'].includes(q.status)) throw fail('Only draft quotations can be changed', 409);
    if ('piece_id' in req.body) {
      const pc = req.body.piece_id ? D.pieces.find((x) => x.id === Number(req.body.piece_id) && x.product_id === it.product_id) : null;
      if (req.body.piece_id && !pc) throw fail('Piece does not belong to this product');
      it.piece_id = pc ? pc.id : null; it.qty = 1; if (pc && pc.selling_price != null) it.unit_price = pc.selling_price;
    }
    if ('qty' in req.body && !it.piece_id) it.qty = Math.max(1, Number(req.body.qty) || 1);
    if ('unit_price' in req.body) it.unit_price = Math.max(0, Number(req.body.unit_price) || 0);
    return { ok: true };
  });
  on('DELETE', '/quotation-items/:id', 'quote', (req) => {
    const it = get('quotation_items', req.params.id);
    const q = it && get('quotations', it.quotation_id);
    if (!it || !['draft', 'sent'].includes(q.status)) throw fail('Only draft quotations can be changed', 409);
    remove('quotation_items', (x) => x.id === it.id); return { ok: true };
  });
  on('POST', '/shortlists/:id/quotation', 'quote', (req) => {
    const s = get('shortlists', req.params.id);
    if (!s) throw fail('Shortlist not found', 404);
    const items = D.shortlist_items.filter((i) => i.shortlist_id === s.id).sort((a, b) => a.id - b.id);
    if (!items.length) throw fail('Shortlist is empty');
    return { id: createQuotation({ customer_name: s.customer_name, customer_phone: s.customer_phone, shortlist_id: s.id, items }, uid(req)) };
  });
  on('POST', '/quotations/:id/confirm', 'reserve', (req) => confirmQuotation(Number(req.params.id), uid(req)), true);
  on('POST', '/quotations/:id/cancel', 'reserve', (req) => { cancelQuotation(Number(req.params.id), uid(req)); return quotationView(Number(req.params.id)); }, true);
  on('POST', '/quotations/:id/dispatch', 'dispatch', (req) => { dispatchQuotation(Number(req.params.id), uid(req)); return quotationView(Number(req.params.id)); }, true);

  // ---- labels ----
  const MAX_LABELS = 600;
  on('GET', '/label-templates', 'labels', () => D.label_templates.map((t) => ({ ...t })));
  on('POST', '/label-templates', 'manage_settings', (req) => {
    const x = req.body;
    const t = { name: String(x.name || '').trim(), layout: x.layout === 'thermal' ? 'thermal' : 'a4', width_mm: +x.width_mm, height_mm: +x.height_mm, cols: +x.cols || null, rows: +x.rows || null,
      margin_top_mm: +x.margin_top_mm || 0, margin_left_mm: +x.margin_left_mm || 0, gap_x_mm: +x.gap_x_mm || 0, gap_y_mm: +x.gap_y_mm || 0, dpi: [203, 300, 600].includes(+x.dpi) ? +x.dpi : 300 };
    if (!t.name || !(t.width_mm > 10 && t.height_mm > 8)) throw fail('Enter a name and a size of at least 10 × 8 mm');
    if (t.layout === 'a4') {
      if (!(t.cols >= 1 && t.rows >= 1)) throw fail('Enter columns and rows for the sheet');
      if (t.margin_left_mm + t.cols * t.width_mm + (t.cols - 1) * t.gap_x_mm > 210.5 || t.margin_top_mm + t.rows * t.height_mm + (t.rows - 1) * t.gap_y_mm > 297.5) throw fail('These labels do not fit on an A4 sheet');
    }
    return { id: ins('label_templates', t).id };
  });
  function buildLabels(x) {
    const tpl0 = get('label_templates', x.template_id);
    if (!tpl0) throw fail('Choose a label size');
    const tpl = { ...tpl0, start_at: Math.max(1, Number(x.start_at) || 1) };
    const opts = { content: ['barcode', 'qr', 'both'].includes(x.content) ? x.content : 'both', show_price: !!x.show_price, show_specs: !!x.show_specs, show_piece_id: x.show_piece_id !== false, use_mfr: !!x.use_mfr };
    const items = Array.isArray(x.items) ? x.items : [];
    if (!items.length) throw fail('Add at least one item');
    const expanded = [];
    for (const it of items) {
      const copies = Math.min(500, Math.max(1, Number(it.copies) || 1));
      if (it.type === 'product_pieces') {
        for (const pc of D.pieces.filter((p) => p.product_id === Number(it.id) && p.status !== 'sold').sort((a, b) => a.piece_code.localeCompare(b.piece_code))) for (let i = 0; i < copies; i++) expanded.push({ type: 'piece', id: pc.id });
      } else for (let i = 0; i < copies; i++) expanded.push({ type: it.type === 'piece' ? 'piece' : 'product', id: Number(it.id) });
      if (expanded.length > MAX_LABELS) throw fail(`Too many labels in one batch (max ${MAX_LABELS})`);
    }
    const base = baseUrl(), biz = businessName();
    const cache = new Map(); const datas = [];
    for (const it of expanded) { const k = `${it.type}:${it.id}`; if (!cache.has(k)) cache.set(k, labelData(it, opts, base, biz)); datas.push(cache.get(k)); }
    return { tpl, opts, datas };
  }
  on('POST', '/labels/preview', 'labels', (req) => {
    const { tpl, opts, datas } = buildLabels(req.body);
    const seen = new Map();
    for (const d of datas) if (!seen.has(d.barcode)) seen.set(d.barcode, { ...d, checks: layoutLabel(d, tpl, opts).checks });
    const perPage = tpl.layout === 'a4' ? tpl.cols * tpl.rows : 1;
    return { count: datas.length, pages: Math.ceil((datas.length + tpl.start_at - 1) / perPage), labels: [...seen.values()] };
  });
  // Demo: instead of a PDFKit PDF, the app renders this layout as an in-browser print view.
  on('POST', '/labels/print', 'labels', (req) => {
    const { tpl, opts, datas } = buildLabels(req.body);
    const cache = new Map();
    const labels = datas.map((d) => { const k = d.barcode + '|' + d.qr; if (!cache.has(k)) cache.set(k, layoutLabel(d, tpl, opts)); return cache.get(k); });
    return { tpl, outline: !!req.body.outline, labels, placements: placements(tpl, labels.length, tpl.start_at) };
  });
  on('POST', '/labels/zpl', 'labels', (req) => { const { tpl, opts, datas } = buildLabels(req.body); return { text: renderZpl(datas, tpl, opts) }; });

  // ---- settings ----
  const SETTING_KEYS = ['business_name', 'public_pages_enabled', 'public_show_prices', 'public_show_expected_date', 'public_base_url', 'showroom_contact', 'availability_wording', 'currency'];
  on('GET', '/settings', 'view', () => ({ ...D.settings, availability_wording: pubSettings().wording }));
  on('PUT', '/settings', 'manage_settings', (req) => {
    for (const k of SETTING_KEYS) {
      if (!(k in req.body)) continue;
      let v = req.body[k];
      if (k === 'availability_wording') v = JSON.stringify(Object.fromEntries(Object.entries(v || {}).filter(([kk]) => kk in DEFAULT_WORDING).map(([kk, vv]) => [kk, String(vv).slice(0, 120)])));
      if (typeof v === 'boolean') v = v ? '1' : '0';
      if (k === 'public_base_url' && v && !/^https?:\/\/[^\s/]+(\/[^\s]*)?$/.test(v)) throw fail('Public base URL must start with http:// or https://');
      if (k === 'business_name' && !String(v || '').trim()) throw fail('Business name is required');
      D.settings[k] = String(v ?? '');
    }
    return { ok: true };
  });

  // ---- demo helpers ----
  on('GET', '/demo/sample-codes', 'view', () => {
    const hutchPiece = D.pieces.find((p) => p.status === 'available') || D.pieces[0];
    const dispPiece = D.pieces.find((p) => p.status === 'display') || D.pieces[0];
    const byS = (sku) => D.products.find((p) => p.sku === sku) || D.products[0];
    const out = [];
    if (hutchPiece) out.push({ kind: 'Code 128 · piece label', label: `${get('products', hutchPiece.product_id).name}`, code: hutchPiece.piece_code });
    out.push({ kind: 'Code 128 · product label', label: byS('TL-DIN-6S-WAL').name + ' — Walnut', code: byS('TL-DIN-6S-WAL').internal_code });
    out.push({ kind: 'EAN-13 · manufacturer barcode', label: byS('TL-IDL-GANESH-M').name, code: byS('TL-IDL-GANESH-M').mfr_barcode });
    if (dispPiece) out.push({ kind: 'QR · customer page of a display piece', label: get('products', dispPiece.product_id).name, code: `${baseUrl()}/p.html?t=${dispPiece.public_token}` });
    out.push({ kind: 'QR · product label', label: byS('TL-TVU-180').name, code: `${baseUrl()}/p.html?t=${byS('TL-TVU-180').public_token}` });
    out.push({ kind: 'Unknown label', label: 'A code that is not in the system', code: 'TLP-999999' });
    return out;
  });

  // ---------------- request entry point ----------------
  function request(method, path, body) {
    read();
    const u = new URL(path, 'http://x');
    const query = Object.fromEntries(u.searchParams);
    const route = routes.find((r) => r.method === method && r.re.test(u.pathname));
    if (!route) throw fail('Not found', 404);
    const m = u.pathname.match(route.re);
    const params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    const req = { method, params, query, body: body || {} };
    if (route.perm !== PUBLIC) {
      const s = sessionUser();
      if (!s) throw fail('Please sign in', 401);
      req.user = s.user; req.sessionToken = s.token;
      if (route.perm && !can(s.user, route.perm)) throw fail('You do not have permission for this action', 403);
    }
    if (route.confirmNeeded && !(req.body && req.body.confirm === true)) { const e = fail('Stock changes need explicit confirmation'); e.data = { needs_confirmation: true }; throw e; }
    try {
      const out = route.handler(req);
      return clone(out);
    } finally {
      if (method !== 'GET' || route.perm === PUBLIC) save();
    }
  }

  // Public (no login) — only the whitelisted customer views, like the original /p/ and /c/ routes.
  const publicApi = {
    item(token) { read(); return clone(publicItem(token)); },
    tokenForCode(code) { read(); const r = resolveCode(code); if (!r) return null; return r.piece_id ? get('pieces', r.piece_id).public_token : get('products', r.product_id).public_token; },
    catalogue(token) { read(); return clone(publicCatalogue(token)); },
    businessName() { read(); return businessName(); },
    enquiry(token, body) {
      read();
      if (!publicItem(token)) throw fail('Not available', 404);
      const piece = D.pieces.find((p) => p.public_token === token);
      const productId = piece ? piece.product_id : D.products.find((p) => p.public_token === token).id;
      const recent = D.enquiries.filter((e) => e.source === 'public_qr' && e.product_id === productId && e.created_at > fmtTs(new Date(Date.now() - 10 * 60e3))).length;
      if (recent >= 20) throw fail('Too many requests — please ask showroom staff', 429);
      const name = String(body.name || '').trim().slice(0, 80);
      const phone = String(body.phone || '').trim().slice(0, 20);
      if (!name || !/^[+\d][\d\s-]{6,19}$/.test(phone)) throw fail('Please enter your name and a valid phone number');
      ins('enquiries', { product_id: productId, piece_id: piece ? piece.id : null, source: 'public_qr', customer_name: name, customer_phone: phone, message: String(body.message || '').slice(0, 500) || null,
        status: 'open', created_by: null, created_at: now() });
      save();
      return { ok: true };
    },
  };

  // ================= sample data (invented) =================
  // Demo staff logins — new passwords for this demo only (not the original project's).
  const DEMO_PASSWORD = 'showroom@demo';
  const USERS = [
    ['admin', 'Kavita (Admin)', 'admin'],
    ['manager', 'Sameer (Manager)', 'manager'],
    ['sales', 'Neha (Sales)', 'sales'],
    ['store', 'Ganesh (Store)', 'storekeeper'],
    ['sales2', 'Farhan (Sales)', 'sales'],
  ];
  const care = 'Dust with a soft dry cloth. Avoid direct sunlight and moisture. Polish with wax every 6 months.';
  const brassCare = 'Wipe with a dry cloth. Clean occasionally with a brass cleaner.';
  const SEED_PRODUCTS = [
    { key: 'hutch', sku: 'TL-CAB-HUTCH', name: 'Sheesham Hutch Cabinet', category: 'Cabinets', material: 'Sheesham wood', finish: 'Honey', length_cm: 120, width_cm: 45, height_cm: 180,
      description: 'Hand-carved solid Sheesham hutch with glass-panel upper doors and brass fittings. Each cabinet is finished by hand, so grain and tone vary slightly.',
      care, selling_price: 68000, cost_price: 41000, vendor: 'Jodhpur Woodcraft Works', internal_notes: 'Negotiable to 62k for showroom pieces', tracking: 'piece', shape: 'cabinet' },
    { key: 'dining', sku: 'TL-DIN-6S', name: 'Sheesham 6 Seater Dining Set', category: 'Dining Room', material: 'Sheesham wood', length_cm: 180, width_cm: 90, height_cm: 76,
      description: 'Six-seater dining table with six cushioned chairs. Available in two finishes.', care, selling_price: 89000, cost_price: 54000, vendor: 'Jodhpur Woodcraft Works', shape: 'table' },
    { key: 'diningHoney', parent: 'dining', sku: 'TL-DIN-6S-HON', variant_label: 'Honey finish', name: 'Sheesham 6 Seater Dining Set', category: 'Dining Room', material: 'Sheesham wood', finish: 'Honey',
      length_cm: 180, width_cm: 90, height_cm: 76, care, selling_price: 89000, cost_price: 54000, vendor: 'Jodhpur Woodcraft Works', shape: 'table', bg: '#f6ead4' },
    { key: 'diningWalnut', parent: 'dining', sku: 'TL-DIN-6S-WAL', variant_label: 'Walnut finish', name: 'Sheesham 6 Seater Dining Set', category: 'Dining Room', material: 'Sheesham wood', finish: 'Walnut',
      length_cm: 180, width_cm: 90, height_cm: 76, care, selling_price: 92000, cost_price: 55500, vendor: 'Jodhpur Woodcraft Works', shape: 'table', bg: '#e9dccb' },
    { key: 'bed', sku: 'TL-BED-POSTER-K', name: 'Teak Poster Bed — King', category: 'Bedroom', material: 'Teak wood', finish: 'Natural teak', length_cm: 213, width_cm: 198, height_cm: 210,
      description: 'Four-poster king bed in seasoned teak with carved headboard. Made to order in your choice of finish.', care, selling_price: 145000, cost_price: 88000, vendor: 'In-house workshop',
      made_to_order: 1, lead_time_days: 45, shape: 'bed' },
    { key: 'ganesha', sku: 'TL-IDL-GANESH-M', name: 'Brass Ganesha Idol — Medium', category: 'Temple/Statues', material: 'Brass', finish: 'Antique gold', length_cm: 20, width_cm: 15, height_cm: 30,
      description: 'Solid brass Ganesha with antique gold finish.', care: brassCare, selling_price: 7800, cost_price: 4100, vendor: 'Moradabad Metal Arts',
      mfr_barcode: '8901234567890', shape: 'idol', bg: '#f7efdc', short_specs: 'Brass · 30 cm tall' },
    { key: 'jhula', sku: 'TL-SWG-ANTQ', name: 'Antique Carved Jhula (Swing)', category: 'Showpieces', material: 'Teak wood', finish: 'Aged natural', length_cm: 150, width_cm: 60, height_cm: 200,
      description: 'Restored antique teak jhula with brass chains. One of a kind.', care, selling_price: 210000, cost_price: 120000, vendor: 'Private collection', tracking: 'piece', shape: 'swing' },
    { key: 'chest', sku: 'TL-CHD-MANGO-4', name: 'Mango Wood Chest of 4 Drawers', category: 'Chest of Drawers', material: 'Mango wood', finish: 'Honey oak', length_cm: 80, width_cm: 45, height_cm: 95,
      description: 'Four-drawer chest with ceramic knobs.', care, selling_price: 24500, cost_price: 14000, vendor: 'Saharanpur Craft Co.', shape: 'drawers' },
    { key: 'chest2', sku: 'TL-CHD-SHEE-5', name: 'Sheesham Chest of 5 Drawers', category: 'Chest of Drawers', material: 'Sheesham wood', finish: 'Honey', length_cm: 85, width_cm: 45, height_cm: 110,
      description: 'Five-drawer chest with brass handles.', care, selling_price: 27500, cost_price: 16500, vendor: 'Jodhpur Woodcraft Works', shape: 'drawers', bg: '#f6ead4' },
    { key: 'sofa', sku: 'TL-SCB-3S', name: 'Sofa Cum Bed — 3 Seater', category: 'Sofa Cum Beds', material: 'Sheesham wood', finish: 'Walnut', length_cm: 195, width_cm: 85, height_cm: 85,
      description: 'Pull-out sofa cum bed with upholstered cushions.', care, selling_price: 52000, cost_price: 31000, vendor: 'Pune Upholstery', shape: 'sofa' },
    { key: 'tv', sku: 'TL-TVU-180', name: 'Carved TV Unit 180', category: 'TV Units', material: 'Sheesham wood', finish: 'Provincial teak', length_cm: 180, width_cm: 45, height_cm: 55,
      description: 'Low TV unit with two cabinets and an open shelf.', care, selling_price: 38500, cost_price: 22000, vendor: 'Jodhpur Woodcraft Works', shape: 'tv' },
    { key: 'shelf', sku: 'TL-BKS-5T', name: 'Five Tier Book Shelf', category: 'Book Shelves', material: 'Sheesham wood', finish: 'Natural', length_cm: 90, width_cm: 35, height_cm: 180,
      description: 'Tall open bookshelf with five tiers.', care, selling_price: 21000, cost_price: 12500, vendor: 'Jodhpur Woodcraft Works', shape: 'shelf' },
    { key: 'desk', sku: 'TL-STD-120', name: 'Study Table with Drawers', category: 'Office & Study', material: 'Sheesham wood', finish: 'Walnut', length_cm: 120, width_cm: 60, height_cm: 76,
      description: 'Study table with three drawers on one side.', care, selling_price: 26000, cost_price: 15500, vendor: 'Jodhpur Woodcraft Works', shape: 'desk' },
    // more sample catalogue (invented)
    { key: 'bar', sku: 'TL-CAB-BAR', name: 'Carved Bar Cabinet', category: 'Cabinets', material: 'Sheesham wood', finish: 'Walnut', length_cm: 100, width_cm: 45, height_cm: 150,
      description: 'Bar cabinet with wine rack, stemware holders and a fold-down serving shelf.', care, selling_price: 58000, cost_price: 34000, vendor: 'Jodhpur Woodcraft Works', shape: 'cabinet', bg: '#ece0d1' },
    { key: 'crockery', sku: 'TL-CAB-CROCK-3D', name: 'Three Door Crockery Unit', category: 'Cabinets', material: 'Mango wood', finish: 'Honey oak', length_cm: 150, width_cm: 40, height_cm: 90,
      description: 'Sideboard with three glass doors and two drawers for cutlery.', care, selling_price: 46000, cost_price: 27000, vendor: 'Saharanpur Craft Co.', shape: 'cabinet', bg: '#f4ebdc' },
    { key: 'dining4', sku: 'TL-DIN-4S', name: 'Mango Wood 4 Seater Dining Set', category: 'Dining Room', material: 'Mango wood', finish: 'Natural', length_cm: 120, width_cm: 75, height_cm: 76,
      description: 'Compact four-seater dining set with cane-back chairs.', care, selling_price: 48000, cost_price: 29000, vendor: 'Saharanpur Craft Co.', shape: 'table', bg: '#f1e9dc' },
    { key: 'bench', sku: 'TL-DIN-BENCH-4', name: 'Dining Bench — 4 ft', category: 'Dining Room', material: 'Sheesham wood', finish: 'Honey', length_cm: 120, width_cm: 35, height_cm: 45,
      description: 'Solid bench that pairs with the 6 seater dining set.', care, selling_price: 14500, cost_price: 8200, vendor: 'Jodhpur Woodcraft Works', shape: 'table', bg: '#f8eedf' },
    { key: 'coffee', sku: 'TL-CTB-ROUND', name: 'Round Carved Coffee Table', category: 'Living Room', material: 'Sheesham wood', finish: 'Honey', length_cm: 90, width_cm: 90, height_cm: 45,
      description: 'Round coffee table with a hand-carved apron and a lower shelf.', care, selling_price: 18500, cost_price: 10500, vendor: 'Jodhpur Woodcraft Works', shape: 'table', bg: '#f3e6d6' },
    { key: 'qbed', sku: 'TL-BED-QUEEN-STR', name: 'Sheesham Bed with Storage — Queen', category: 'Bedroom', material: 'Sheesham wood', finish: 'Walnut', length_cm: 210, width_cm: 165, height_cm: 105,
      description: 'Queen bed with hydraulic storage and a panelled headboard.', care, selling_price: 72000, cost_price: 43000, vendor: 'Jodhpur Woodcraft Works', shape: 'bed', bg: '#efe4d6' },
    { key: 'buddha', sku: 'TL-IDL-BUDDHA-L', name: 'Brass Buddha Statue — Large', category: 'Temple/Statues', material: 'Brass', finish: 'Antique bronze', length_cm: 35, width_cm: 25, height_cm: 60,
      description: 'Hand-cast seated Buddha. Each casting is finished by hand, so the patina differs from piece to piece.', care: brassCare, selling_price: 24500, cost_price: 13800, vendor: 'Moradabad Metal Arts',
      tracking: 'piece', shape: 'idol', bg: '#efe6d3', short_specs: 'Brass · 60 cm tall' },
    { key: 'nandi', sku: 'TL-IDL-NANDI-S', name: 'Brass Nandi — Small', category: 'Temple/Statues', material: 'Brass', finish: 'Antique gold', length_cm: 18, width_cm: 9, height_cm: 14,
      description: 'Seated Nandi in solid brass.', care: brassCare, selling_price: 4200, cost_price: 2100, vendor: 'Moradabad Metal Arts', mfr_barcode: '8901234567906', shape: 'idol', bg: '#f9f1df', short_specs: 'Brass · 14 cm tall' },
    { key: 'mandir', sku: 'TL-TMP-MANDIR', name: 'Teak Wood Home Mandir', category: 'Temple/Statues', material: 'Teak wood', finish: 'Natural teak', length_cm: 60, width_cm: 40, height_cm: 110,
      description: 'Carved home temple with a drawer and bell hooks. Made to order in about a month.', care, selling_price: 39000, cost_price: 23000, vendor: 'In-house workshop', made_to_order: 1, lead_time_days: 30, shape: 'cabinet', bg: '#f5ecdd' },
    { key: 'jhula2', sku: 'TL-SWG-SHEE', name: 'Sheesham Indoor Jhula', category: 'Showpieces', material: 'Sheesham wood', finish: 'Honey', length_cm: 140, width_cm: 55, height_cm: 190,
      description: 'Indoor swing with a carved frame and brass-plated chains.', care, selling_price: 64000, cost_price: 38000, vendor: 'Jodhpur Woodcraft Works', shape: 'swing', bg: '#f6ecdc' },
    { key: 'trunk', sku: 'TL-SHP-TRUNK', name: 'Brass Fitted Storage Trunk', category: 'Showpieces', material: 'Mango wood', finish: 'Distressed blue', length_cm: 90, width_cm: 45, height_cm: 50,
      description: 'Wooden trunk with hammered brass corners — works as a coffee table too.', care, selling_price: 32000, cost_price: 19000, vendor: 'Saharanpur Craft Co.', shape: 'drawers', bg: '#e6ecf0' },
    { key: 'sofa2', sku: 'TL-SCB-2S', name: 'Sofa Cum Bed — 2 Seater', category: 'Sofa Cum Beds', material: 'Sheesham wood', finish: 'Walnut', length_cm: 145, width_cm: 85, height_cm: 85,
      description: 'Two-seater pull-out sofa cum bed.', care, selling_price: 41000, cost_price: 24500, vendor: 'Pune Upholstery', shape: 'sofa', bg: '#f2e7e3' },
    { key: 'teaksofa', sku: 'TL-SOF-3S-CARV', name: 'Carved Teak Sofa — 3 Seater', category: 'Sofas', material: 'Teak wood', finish: 'Natural teak', length_cm: 200, width_cm: 85, height_cm: 95,
      description: 'Heavily carved three-seater in reclaimed teak. Each frame is unique.', care, selling_price: 98000, cost_price: 59000, vendor: 'In-house workshop', tracking: 'piece', shape: 'sofa', bg: '#efe2d4' },
    { key: 'tv2', sku: 'TL-TVU-150-MNG', name: 'Mango Wood TV Unit 150', category: 'TV Units', material: 'Mango wood', finish: 'Natural', length_cm: 150, width_cm: 40, height_cm: 50,
      description: 'TV unit with two drawers and slatted doors.', care, selling_price: 29500, cost_price: 17000, vendor: 'Saharanpur Craft Co.', shape: 'tv', bg: '#f4eadb' },
    { key: 'ladder', sku: 'TL-BKS-LADDER', name: 'Ladder Book Shelf', category: 'Book Shelves', material: 'Mango wood', finish: 'Natural', length_cm: 60, width_cm: 35, height_cm: 170,
      description: 'Leaning ladder shelf with four tiers.', care, selling_price: 12500, cost_price: 7000, vendor: 'Saharanpur Craft Co.', shape: 'shelf', bg: '#f3ede2' },
    { key: 'wdesk', sku: 'TL-STD-WRITING', name: 'Antique Writing Desk', category: 'Office & Study', material: 'Teak wood', finish: 'Aged natural', length_cm: 110, width_cm: 55, height_cm: 78,
      description: 'Restored colonial writing desk with leather inlay. One of a kind.', care, selling_price: 86000, cost_price: 52000, vendor: 'Private collection', tracking: 'piece', shape: 'desk', bg: '#efe5d8' },
  ];

  function seed() {
    seeding = true; rngState = 20261110; clock = 0;
    D = emptyDb();
    try {
      at(75, 10);
      Object.assign(D.settings, { business_name: 'Teakwood Living', public_pages_enabled: '1', public_show_prices: '1', public_show_expected_date: '0', currency: 'INR', showroom_contact: '+91 98000 00101' });
      const U = {};
      for (const [u, n, r] of USERS) U[u] = ins('users', { username: u, name: n, role: r, pass_hash: hashPassword(DEMO_PASSWORD), active: 1 }).id;
      const L = { show: ins('locations', { code: 'SHR', name: 'Kothrud Showroom', type: 'showroom' }).id, wh: ins('locations', { code: 'WH1', name: 'Main Warehouse', type: 'warehouse' }).id,
        br: ins('locations', { code: 'BR2', name: 'Aundh Branch', type: 'branch' }).id };
      for (const t of DEFAULT_TEMPLATES) ins('label_templates', { cols: null, rows: null, margin_top_mm: 0, margin_left_mm: 0, gap_x_mm: 0, gap_y_mm: 0, ...t });

      const P = {};
      for (const sp of SEED_PRODUCTS) {
        const { key, parent, shape, bg, ...data } = sp;
        if (parent) data.parent_id = P[parent];
        P[key] = createProduct(data).id;
        ins('photos', { product_id: P[key], piece_id: null, url: `seed-img/${sp.sku.toLowerCase().replace(/^tl-/, 'ah-')}.svg`, storage_path: null, caption: null, is_public: 1, sort: 0 });
      }
      const s = U.store;
      // Hutch cabinet: identical SKU, every cabinet tracked as its own piece.
      at(70, 11);
      const hutch = receive({ productId: P.hutch, locationId: L.wh, userId: s, reference: 'GRN-1001', pieces: [
        { condition: 'New', finish_note: 'Honey, even grain', cost_price: 41000, selling_price: 68000, rack: 'WH-A3' },
        { condition: 'New', finish_note: 'Honey, darker grain', cost_price: 41000, selling_price: 68000, rack: 'WH-A3' },
        { condition: 'Minor scratch on left side', finish_note: 'Honey', cost_price: 41000, selling_price: 61000, rack: 'WH-A4' },
        { condition: 'Glass panel cracked', finish_note: 'Honey', cost_price: 41000, selling_price: 68000, rack: 'WH-QC', status: 'damaged' },
      ] }).created;
      const showHutch = receive({ productId: P.hutch, locationId: L.show, userId: s, reference: 'GRN-1001', pieces: [
        { condition: 'Display — light wear', finish_note: 'Honey', cost_price: 41000, selling_price: 64000, rack: 'Zone B · Wall 2', status: 'display' },
      ] }).created;
      ins('photos', { product_id: P.hutch, piece_id: hutch[2].id, url: 'seed-img/ah-cab-hutch.svg', storage_path: null, caption: 'Scratch detail', is_public: 0, sort: 1 });
      at(68, 12);
      receive({ productId: P.jhula, locationId: L.show, userId: s, reference: 'ACQ-77', pieces: [
        { condition: 'Restored antique', finish_note: 'Aged natural teak', cost_price: 120000, selling_price: 210000, rack: 'Entrance atrium', status: 'display' },
      ] });
      at(66, 15);
      const buddha = receive({ productId: P.buddha, locationId: L.show, userId: s, reference: 'GRN-1014', pieces: [
        { condition: 'New', finish_note: 'Dark bronze patina', rack: 'Zone D · Plinth 1' },
        { condition: 'New', finish_note: 'Light bronze, gold highlights', rack: 'Zone D · Plinth 2' },
        { condition: 'New', finish_note: 'Dark bronze patina', rack: 'WH-S1' },
      ] }).created;
      transfer({ pieceId: buddha[2].id, toLocationId: L.wh, rack: 'WH-S1', reference: 'TR-2207', userId: s });
      at(61, 10);
      const teak = receive({ productId: P.teaksofa, locationId: L.wh, userId: s, reference: 'WS-0412', pieces: [
        { condition: 'New', finish_note: 'Natural teak, peacock carving', rack: 'WH-D1' },
        { condition: 'Display — cushion fabric faded', finish_note: 'Natural teak, floral carving', rack: 'Zone A · Living 1', selling_price: 89000 },
      ] }).created;
      transfer({ pieceId: teak[1].id, toLocationId: L.show, rack: 'Zone A · Living 1', reference: 'TR-2210', userId: s });
      changeCondition({ pieceId: teak[1].id, toCondition: 'display_sale', note: 'Released for sale at reduced price', userId: U.manager });
      at(58, 13);
      receive({ productId: P.wdesk, locationId: L.br, userId: s, reference: 'ACQ-81', pieces: [
        { condition: 'Restored antique', finish_note: 'Aged teak, green leather inlay', rack: 'Floor 1 · Corner', status: 'display' },
      ] });

      const rcv = (key, l, qty, rack, condition = 'sellable', days = 55) => { at(days, 9 + Math.floor(rand() * 8), Math.floor(rand() * 59)); receive({ productId: P[key], locationId: l, qty, rack, condition, userId: s, reference: 'OPENING' }); };
      rcv('diningHoney', L.show, 1, 'Zone A · Dining 1', 'display');
      rcv('diningHoney', L.wh, 2, 'WH-C1');
      rcv('diningWalnut', L.br, 1, 'Floor 1');
      rcv('ganesha', L.show, 12, 'Zone D · Shelf 3');
      rcv('ganesha', L.wh, 20, 'WH-S2');
      rcv('ganesha', L.show, 1, 'Zone D · Shelf 3', 'damaged');
      rcv('chest2', L.wh, 3, 'WH-B2');
      rcv('sofa', L.wh, 1, 'WH-QC', 'damaged');
      rcv('tv', L.show, 1, 'Zone C · Living 2', 'display_sale');
      rcv('tv', L.wh, 2, 'WH-B5');
      rcv('shelf', L.show, 2, 'Zone E');
      rcv('desk', L.br, 3, 'Floor 2');
      rcv('bar', L.show, 1, 'Zone B · Wall 1', 'display', 50);
      rcv('bar', L.wh, 2, 'WH-A1', 'sellable', 50);
      rcv('crockery', L.wh, 4, 'WH-A2', 'sellable', 48);
      rcv('dining4', L.show, 1, 'Zone A · Dining 2', 'display_sale', 47);
      rcv('dining4', L.wh, 3, 'WH-C2', 'sellable', 47);
      rcv('bench', L.wh, 5, 'WH-C3', 'sellable', 45);
      rcv('coffee', L.show, 2, 'Zone C · Living 1', 'sellable', 44);
      rcv('coffee', L.br, 2, 'Floor 1', 'sellable', 44);
      rcv('qbed', L.wh, 2, 'WH-D2', 'sellable', 40);
      rcv('qbed', L.show, 1, 'Zone F · Bedroom', 'display', 40);
      rcv('nandi', L.show, 8, 'Zone D · Shelf 1', 'sellable', 38);
      rcv('nandi', L.wh, 15, 'WH-S2', 'sellable', 38);
      rcv('jhula2', L.show, 1, 'Zone A · Atrium', 'display', 36);
      rcv('sofa2', L.wh, 2, 'WH-D3', 'sellable', 34);
      rcv('tv2', L.wh, 3, 'WH-B6', 'sellable', 32);
      rcv('tv2', L.br, 1, 'Floor 2', 'sellable', 32);
      rcv('ladder', L.show, 3, 'Zone E', 'sellable', 30);
      rcv('ladder', L.wh, 6, 'WH-B7', 'sellable', 30);

      // movements over the last weeks
      at(29, 11); transfer({ productId: P.ganesha, fromLocationId: L.wh, toLocationId: L.br, qty: 4, rack: 'Floor 1 · Shelf', reference: 'TR-2231', userId: s });
      at(27, 16); transfer({ productId: P.bench, fromLocationId: L.wh, toLocationId: L.show, qty: 1, rack: 'Zone A · Dining 1', reference: 'TR-2236', userId: s });
      at(26, 12); count({ productId: P.ganesha, locationId: L.show, condition: 'sellable', countedQty: 11, note: 'Cycle count — one missing, checked CCTV', userId: s });
      at(25, 10); count({ productId: P.ladder, locationId: L.wh, condition: 'sellable', countedQty: 6, userId: s });
      at(24, 15); count({ pieceId: hutch[0].id, locationId: L.wh, note: 'Cycle count', userId: s });
      at(23, 17); changeCondition({ productId: P.crockery, locationId: L.wh, fromCondition: 'sellable', toCondition: 'damaged', qty: 1, note: 'Glass door cracked in handling', userId: s });
      at(21, 12); dispatch({ productId: P.nandi, locationId: L.show, qty: 2, reference: 'INV-5521', userId: U.sales });
      at(20, 12); dispatch({ productId: P.ladder, locationId: L.show, qty: 1, reference: 'INV-5524', userId: U.sales });
      at(19, 14); returnInspected({ productId: P.ladder, locationId: L.show, qty: 1, result: 'sellable', rack: 'Zone E', reference: 'RET-118', note: 'Customer changed mind, unused', userId: s });

      // reservations (walk-in customers)
      at(18, 13); reserve({ pieceId: hutch[1].id, customerName: 'Mehta family', userId: U.sales });
      at(16, 18); reserve({ productId: P.coffee, locationId: L.br, qty: 1, customerName: 'Ritu Agarwal', userId: U.sales2 });

      // shortlists
      const SL = (name, phone, by, days, items, opts = {}) => {
        at(days, 11 + Math.floor(rand() * 6), Math.floor(rand() * 59));
        const sl = createShortlist({ customer_name: name, customer_phone: phone }, by, opts.token);
        if (opts.share) { sl.share_enabled = 1; }
        for (const it of items) addShortlistItem(sl.id, { product_id: P[it[0]], piece_id: it[1] || null, qty: it[2] || 1, pref_finish: it[3] || null, pref_dimensions: it[4] || null });
        return sl;
      };
      const slMehta = SL('Mehta family', '9800000101', U.sales, 18, [['hutch', hutch[1].id], ['diningWalnut'], ['bench', null, 2], ['ganesha']], { token: 'mehta-selection', share: true });
      SL('Ananya Kulkarni', '9800000102', U.sales, 15, [['qbed', null, 1, 'Walnut'], ['chest2'], ['ladder']]);
      const slRahul = SL('Rahul Deshpande', '9800000103', U.sales2, 14, [['tv'], ['coffee'], ['sofa2']]);
      SL('Sneha Joshi', '9800000104', U.sales, 12, [['mandir', null, 1, 'Natural teak', '60x40x110'], ['nandi', null, 2], ['buddha', buddha[0].id]], { token: 'joshi-temple-set', share: true });
      SL('Vivek Iyer', '9800000105', U.sales2, 10, [['dining4'], ['crockery']]);
      SL('Pooja Bhatt', '9800000106', U.sales, 9, [['jhula2'], ['jhula']]);
      const slArjun = SL('Arjun Nair', '9800000107', U.sales, 7, [['bar'], ['wdesk']]);
      SL('Kiran Patil', '9800000108', U.sales2, 5, [['bed', null, 1, 'Walnut'], ['qbed']]);
      SL('Farah Shaikh', '9800000109', U.sales, 3, [['teaksofa', teak[0].id], ['coffee'], ['trunk']]);
      SL('Lakshmi Menon', '9800000110', U.sales, 1, [['desk'], ['shelf', null, 2]]);

      // quotations → orders (uses the same all-or-nothing confirmation as the app)
      const QT = (days, data, by, items) => { at(days, 12 + Math.floor(rand() * 5), Math.floor(rand() * 59)); return createQuotation({ ...data, items: items.map(([k, piece, qty, price]) => ({ product_id: P[k], piece_id: piece || null, qty: qty || 1, unit_price: price })) }, by); };
      const q1 = QT(17, { customer_name: 'Mehta family', customer_phone: '9800000101', shortlist_id: slMehta.id }, U.sales, [['diningWalnut'], ['bench', null, 2, 13500]]);
      at(17, 16); confirmQuotation(q1, U.sales);
      const q2 = QT(15, { customer_name: 'Manoj Gupta', customer_phone: '9800000111' }, U.sales2, [['ganesha', null, 3], ['nandi', null, 2]]);
      at(15, 17); confirmQuotation(q2, U.sales2);
      at(14, 11); dispatchQuotation(q2, s);
      const q3 = QT(13, { customer_name: 'Rahul Deshpande', customer_phone: '9800000103', shortlist_id: slRahul.id }, U.sales2, [['tv'], ['coffee'], ['sofa2']]);
      get('quotations', q3).status = 'sent';
      const q4 = QT(12, { customer_name: 'Siddharth Rao', customer_phone: '9800000112' }, U.sales, [['crockery'], ['dining4']]);
      at(12, 18); confirmQuotation(q4, U.sales);
      const q5 = QT(11, { customer_name: 'Harsh Vora', customer_phone: '9800000113' }, U.sales, [['qbed', null, 1, 69000]]);
      at(10, 12); cancelQuotation(q5, U.sales);
      const q6 = QT(9, { customer_name: 'Arjun Nair', customer_phone: '9800000107', shortlist_id: slArjun.id }, U.sales, [['bar'], ['wdesk']]);
      const q7 = QT(8, { customer_name: 'Deepa Kamat', customer_phone: '9800000114' }, U.sales2, [['buddha', buddha[1].id]]);
      at(8, 17); confirmQuotation(q7, U.sales2);
      const q8 = QT(6, { customer_name: 'Nikhil Shetty', customer_phone: '9800000115' }, U.sales, [['ladder', null, 2], ['shelf']]);
      at(6, 15); confirmQuotation(q8, U.sales);
      at(5, 11); dispatchQuotation(q8, s);
      QT(4, { customer_name: 'Anjali Saxena', customer_phone: '9800000116' }, U.sales, [['bed', null, 1, 140000], ['chest2']]);
      QT(3, { customer_name: 'Farah Shaikh', customer_phone: '9800000109' }, U.sales, [['teaksofa', teak[0].id], ['coffee']]);
      const q11 = QT(2, { customer_name: 'Vikas Malhotra', customer_phone: '9800000117' }, U.sales2, [['tv2'], ['nandi', null, 4]]);
      at(2, 16); confirmQuotation(q11, U.sales2);
      QT(0, { customer_name: 'Lakshmi Menon', customer_phone: '9800000110' }, U.sales, [['desk'], ['shelf', null, 2, 20000]]);
      void q6;

      // incoming purchase / production
      at(30, 10);
      ins('incoming', { product_id: P.chest, kind: 'purchase', qty: 6, expected_date: dateIn(51), status: 'ordered', note: 'PO-2231', created_by: U.manager, created_at: now() });
      ins('incoming', { product_id: P.sofa, kind: 'production', qty: 2, expected_date: dateIn(60), status: 'ordered', note: 'Workshop batch', created_by: U.manager, created_at: now() });
      at(14, 12);
      ins('incoming', { product_id: P.trunk, kind: 'purchase', qty: 4, expected_date: dateIn(26), status: 'ordered', note: 'PO-2264 · Saharanpur', created_by: U.manager, created_at: now() });
      ins('incoming', { product_id: P.bed, kind: 'production', qty: 1, expected_date: dateIn(40), status: 'ordered', note: 'For Kiran Patil — walnut', created_by: U.sales2, created_at: now() });
      at(6, 12);
      ins('incoming', { product_id: P.crockery, kind: 'purchase', qty: 3, expected_date: null, status: 'requested', note: 'Restock after damage', created_by: U.store, created_at: now() });
      at(2, 15);
      ins('incoming', { product_id: P.diningWalnut, kind: 'production', qty: 2, expected_date: dateIn(33), status: 'requested', note: 'Two customers asked this month', created_by: U.sales, created_at: now() });
      const incTv = ins('incoming', { product_id: P.tv, kind: 'purchase', qty: 2, expected_date: dateIn(4), status: 'ordered', note: 'PO-2270', created_by: U.manager, created_at: now() });
      void incTv;

      // enquiries
      const ENQ = (days, key, name, phone, msg, source, by, status = 'open', pieceId = null) => {
        at(days, 10 + Math.floor(rand() * 9), Math.floor(rand() * 59));
        ins('enquiries', { product_id: P[key], piece_id: pieceId, source, customer_name: name, customer_phone: phone, message: msg, status, created_by: source === 'staff' ? by : null, created_at: now() });
      };
      ENQ(22, 'bed', 'Kiran Patil', '9800000108', 'Wants the poster bed in walnut, budget 1.4L, needs by Diwali', 'staff', U.sales, 'closed');
      ENQ(19, 'chest', 'Rohit Kale', '9800000118', 'Waiting for the 4-drawer chest restock', 'staff', U.sales2);
      ENQ(16, 'jhula', 'Meera Pillai', '9800000119', 'Asked if the antique jhula can be delivered to Goa', 'public_qr', null, 'open', null);
      ENQ(14, 'mandir', 'Sneha Joshi', '9800000104', 'Needs mandir to fit 60 cm wall niche', 'staff', U.sales);
      ENQ(12, 'ganesha', 'Tanvi Kulkarni', '9800000120', 'Bulk order of 15 idols for corporate gifting', 'public_qr', null);
      ENQ(11, 'sofa', 'Imtiaz Khan', '9800000121', 'Sofa cum bed in grey fabric?', 'staff', U.sales2, 'closed');
      ENQ(9, 'hutch', 'Aditi Bose', '9800000122', 'Interested in the display hutch, asked for best price', 'public_qr', null, 'open', showHutch[0].id);
      ENQ(8, 'trunk', 'Sanjay Mishra', '9800000123', 'Two trunks for a hotel lobby', 'staff', U.sales);
      ENQ(6, 'diningWalnut', 'Gauri Deshmukh', '9800000124', 'Walnut dining set — when will more arrive?', 'staff', U.sales);
      ENQ(5, 'teaksofa', 'Prakash Hegde', '9800000125', 'Would like to see the peacock-carved sofa on Sunday', 'public_qr', null);
      ENQ(4, 'wdesk', 'Ishita Roy', '9800000126', 'Is the writing desk for sale?', 'public_qr', null, 'open');
      ENQ(3, 'qbed', 'Varun Chawla', '9800000127', 'Queen bed with storage, honey finish', 'staff', U.sales2);
      ENQ(1, 'buddha', 'Neelam Arora', '9800000128', 'Large Buddha for a meditation room', 'staff', U.sales);
      ENQ(0, 'coffee', 'Rahul Deshpande', '9800000103', 'Prefers the round table in walnut', 'staff', U.sales2);

      // YouTube videos (sample links; the demo never contacts YouTube)
      const vIns = (key, pieceId, title, type, primary, visibility, overrides) => ins('videos', { product_id: P[key], piece_id: pieceId, title, url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        youtube_id: 'jNQXAC9IVRw', video_type: type, is_primary: primary, visibility, overrides_parent: overrides, embed_status: 'ok', checked_at: null, created_at: now() });
      at(60, 10);
      vIns('hutch', null, 'Sample: Hutch cabinet overview', 'overview', 1, 'customer', 0);
      vIns('hutch', null, 'Sample: Assembly notes for delivery team (internal)', 'installation', 0, 'internal', 0);
      vIns('hutch', showHutch[0].id, 'Sample: Walkaround of this display cabinet', 'demonstration', 0, 'customer', 0);
      vIns('dining', null, 'Sample: Dining set overview', 'overview', 1, 'customer', 0);
      vIns('dining', null, 'Sample: Finish options explained', 'finish', 0, 'customer', 0);
      vIns('diningWalnut', null, 'Sample: Walnut finish close-up', 'finish', 0, 'customer', 1);
      vIns('ganesha', null, 'Sample: Brass care guide', 'care', 1, 'customer', 0);
      vIns('teaksofa', null, 'Sample: Carving details of the teak sofa', 'overview', 1, 'customer', 0);
      vIns('qbed', null, 'Sample: How the hydraulic storage opens', 'demonstration', 1, 'customer', 0);
    } finally {
      seeding = false; clock = 0;
    }
  }

  root.AHS = {
    request(method, path, body) {
      return new Promise((resolve, reject) => {
        try { resolve(request(method, path, body)); } catch (e) {
          const err = new Error(e.status ? e.message : 'Something went wrong');
          err.status = e.status || 500; err.data = { error: err.message, ...(e.data || {}) };
          if (!e.status && typeof console !== 'undefined') console.warn(e);
          reject(err);
        }
      });
    },
    public: publicApi,
    DEMO_PASSWORD,
    _seedProducts: SEED_PRODUCTS,
  };
})(typeof window !== 'undefined' ? window : globalThis);

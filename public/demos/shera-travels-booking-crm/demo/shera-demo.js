/* Portfolio demo bundle: in-browser Supabase stand-in (see emulator section). */
(function () {
// In-browser stand-in for @supabase/supabase-js used by the portfolio demos.
// Data lives in memory and localStorage, seeded with sample rows; nothing is sent anywhere.
const clone = (v) => JSON.parse(JSON.stringify(v));
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36));
const singular = (t) => (t.endsWith("ies") ? t.slice(0, -3) + "y" : t.endsWith("ses") ? t.slice(0, -2) : t.endsWith("s") ? t.slice(0, -1) : t);

function splitTop(s, sep = ",") {
  const out = []; let depth = 0; let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === sep && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

function parseSelect(sel) {
  const items = splitTop((sel || "*").replace(/\s+/g, " "));
  return items.map((it) => {
    const m = /^(?:([\w]+):)?([\w]+)(?:!([\w]+))?(?:!([\w]+))?\s*\((.*)\)$/s.exec(it);
    if (m) return { rel: m[2], alias: m[1] || m[2], hint: [m[3], m[4]].find((h) => h && h !== "inner" && h !== "left"), inner: [m[3], m[4]].includes("inner"), sub: m[5] };
    const c = /^(?:([\w]+):)?([\w]+)(?:::\w+)?$/.exec(it);
    if (c) return { col: c[2], alias: c[1] || c[2] };
    return { star: true };
  });
}

function like(v, pat, ci) {
  if (v == null) return false;
  const re = new RegExp("^" + String(pat).replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$", ci ? "is" : "s");
  return re.test(String(v));
}
const cmp = (a, b) => (a == null && b == null ? 0 : a == null ? -1 : b == null ? 1 : typeof a === "number" && typeof b === "number" ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);
const parseVal = (v) => (v === "null" ? null : v === "true" ? true : v === "false" ? false : v);

function getPath(row, col) {
  if (col.includes("->")) { const [base, ...rest] = col.split(/->>?/); let v = row[base]; for (const k of rest) v = v?.[k.replace(/'/g, "")]; return v; }
  return row[col];
}

function test(row, col, op, val) {
  if (col.includes(".")) return true; // filter on an embedded table: not modelled
  const v = getPath(row, col);
  switch (op) {
    case "eq": return v == null ? val == null : String(v) === String(val) || v === val;
    case "neq": return !(v == null ? val == null : String(v) === String(val));
    case "gt": return v != null && cmp(v, val) > 0;
    case "gte": return v != null && cmp(v, val) >= 0;
    case "lt": return v != null && cmp(v, val) < 0;
    case "lte": return v != null && cmp(v, val) <= 0;
    case "like": return like(v, val, false);
    case "ilike": return like(v, val, true);
    case "is": return val === null ? v == null : v === val;
    case "in": return (Array.isArray(val) ? val : String(val).replace(/^\(|\)$/g, "").split(",").map((x) => x.replace(/^"|"$/g, ""))).some((x) => String(x) === String(v));
    case "cs": case "contains": return Array.isArray(v) ? [].concat(val).every((x) => v.includes(x)) : typeof v === "object" && v ? Object.entries(val || {}).every(([k, x]) => v[k] === x) : false;
    case "ov": case "overlaps": return Array.isArray(v) && [].concat(val).some((x) => v.includes(x));
    case "fts": case "plfts": case "wfts": return like(v, "%" + val + "%", true);
    default: return true;
  }
}

function orTest(row, expr) {
  return splitTop(expr).some((part) => {
    const a = /^(and|or)\((.*)\)$/.exec(part);
    if (a) return a[1] === "and" ? splitTop(a[2]).every((p) => orTest(row, p)) : orTest(row, a[2]);
    const [col, op, ...rest] = part.split(".");
    let val = rest.join(".");
    if (op === "not") { const [op2, ...r2] = rest; return !test(row, col, op2, parseVal(r2.join("."))); }
    if (op === "in") val = val.replace(/^\(|\)$/g, "").split(",");
    return test(row, col, op, parseVal(val));
  });
}

function createMockClient(opts = {}) {
  const key = opts.storageKey || "demo_db";
  const authKey = key + "_auth";
  let db;
  const load = () => {
    if (db) return db;
    try { const raw = localStorage.getItem(key); if (raw) db = JSON.parse(raw); } catch { db = null; }
    if (!db) { db = clone(typeof opts.seed === "function" ? opts.seed() : opts.seed || {}); save(); }
    return db;
  };
  const save = () => { try { localStorage.setItem(key, JSON.stringify(db)); } catch { /* full or blocked */ } };
  const table = (t) => { load(); if (!db[t]) db[t] = []; return db[t]; };

  function embed(row, tableName, items, depth = 0) {
    const out = {};
    const hasStar = items.some((i) => i.star) || items.every((i) => i.rel);
    if (hasStar) Object.assign(out, row);
    for (const it of items) {
      if (it.col) out[it.alias] = row[it.col];
      if (!it.rel || depth > 3) continue;
      const rows = (load(), db[it.rel]) || [];
      const sub = parseSelect(it.sub);
      const camel = (x) => x.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      const fkCandidates = [it.hint, camel(singular(it.rel)) + "Id", singular(it.rel).split("_").pop() + "Id", singular(it.rel).split("_").pop() + "_id", singular(it.rel) + "_id", singular(it.rel) + "Id", it.rel + "_id", it.alias + "_id", singular(it.alias) + "_id", it.alias + "Id", singular(it.alias) + "Id"].filter(Boolean);
      let hint = it.hint;
      if (hint && /_fkey$/.test(hint)) { const col = hint.replace(/_fkey$/, "").replace(new RegExp("^" + tableName + "_"), ""); hint = col; if (col in row) fkCandidates.unshift(col); }
      const fk = fkCandidates.find((c) => c in row);
      if (fk) {
        const parent = rows.find((r) => String(r.id) === String(row[fk]));
        out[it.alias] = parent ? embed(parent, it.rel, sub, depth + 1) : null;
      } else {
        const back = [hint, camel(singular(tableName)) + "Id", singular(tableName).split("_").pop() + "Id", singular(tableName).split("_").pop() + "_id", singular(tableName) + "_id", singular(tableName) + "Id", tableName + "_id"].filter(Boolean);
        if (it.alias !== it.rel && singular(it.alias) === it.alias) { out[it.alias] = null; continue; }
        const kids = rows.filter((r) => back.some((b) => b in r && String(r[b]) === String(row.id)));
        out[it.alias] = kids.map((k) => embed(k, it.rel, sub, depth + 1));
      }
    }
    return out;
  }

  class Query {
    constructor(t) { this.t = t; this.op = "select"; this.filters = []; this.orders = []; this.sel = "*"; this.lim = null; this.off = 0; this.mode = null; this.countOpt = null; this.head = false; this.returning = false; }
    select(cols = "*", o = {}) { if (this.op === "select") { this.sel = cols; this.countOpt = o.count || null; this.head = !!o.head; } else { this.returning = true; this.sel = cols; } return this; }
    insert(v) { this.op = "insert"; this.payload = v; return this; }
    upsert(v, o = {}) { this.op = "upsert"; this.payload = v; this.conflict = o.onConflict; return this; }
    update(v) { this.op = "update"; this.payload = v; return this; }
    delete() { this.op = "delete"; return this; }
    _f(col, op, val) { this.filters.push((r) => test(r, col, op, val)); return this; }
    eq(c, v) { return this._f(c, "eq", v); } neq(c, v) { return this._f(c, "neq", v); }
    gt(c, v) { return this._f(c, "gt", v); } gte(c, v) { return this._f(c, "gte", v); }
    lt(c, v) { return this._f(c, "lt", v); } lte(c, v) { return this._f(c, "lte", v); }
    like(c, v) { return this._f(c, "like", v); } ilike(c, v) { return this._f(c, "ilike", v); }
    is(c, v) { return this._f(c, "is", v); } in(c, v) { return this._f(c, "in", v); }
    contains(c, v) { return this._f(c, "cs", v); } containedBy() { return this; } overlaps(c, v) { return this._f(c, "ov", v); }
    textSearch(c, v) { return this._f(c, "fts", String(v).replace(/'/g, "")); }
    match(o) { for (const [c, v] of Object.entries(o)) this.eq(c, v); return this; }
    not(c, op, v) { this.filters.push((r) => !test(r, c, op, op === "in" ? String(v).replace(/^\(|\)$/g, "").split(",") : v)); return this; }
    or(expr, o = {}) { if (o.foreignTable || o.referencedTable) return this; this.filters.push((r) => orTest(r, expr)); return this; }
    filter(c, op, v) { return op === "not.is" ? this.not(c, "is", parseVal(v)) : this._f(c, op, parseVal(v)); }
    order(c, o = {}) { if (o.foreignTable || o.referencedTable || c.includes(".")) return this; this.orders.push([c, o.ascending !== false, o.nullsFirst]); return this; }
    limit(n, o = {}) { if (!o.foreignTable && !o.referencedTable) this.lim = n; return this; }
    range(a, b) { this.off = a; this.lim = b - a + 1; return this; }
    single() { this.mode = "single"; return this; }
    maybeSingle() { this.mode = "maybe"; return this; }
    abortSignal() { return this; } returns() { return this; } throwOnError() { return this; } csv() { return this; } explain() { return this; }
    then(res, rej) { return Promise.resolve().then(() => this._run()).then(res, rej); }
    catch(rej) { return this.then((x) => x, rej); }
    finally(f) { return this.then((x) => { f(); return x; }, (e) => { f(); throw e; }); }
    _match(rows) { return rows.filter((r) => this.filters.every((f) => f(r))); }
    _shape(rows) {
      const items = parseSelect(this.sel);
      let out = rows.map((r) => embed(r, this.t, items));
      const inner = items.filter((i) => i.rel && i.inner);
      if (inner.length) out = out.filter((r) => inner.every((i) => (Array.isArray(r[i.alias]) ? r[i.alias].length : r[i.alias])));
      return out;
    }
    _final(data, count) {
      if (this.mode === "single") {
        if (data.length !== 1) return { data: null, error: { message: data.length ? "multiple rows" : "No rows found", code: "PGRST116", details: "", hint: "" }, status: 406, count: null };
        return { data: data[0], error: null, status: 200, count };
      }
      if (this.mode === "maybe") return { data: data[0] ?? null, error: null, status: 200, count };
      return { data, error: null, status: 200, count };
    }
    _run() {
      const rows = table(this.t);
      const now = new Date().toISOString();
      if (this.op === "select") {
        let out = this._match(rows);
        for (const [c, asc] of [...this.orders].reverse()) out = [...out].sort((a, b) => (asc ? 1 : -1) * cmp(getPath(a, c), getPath(b, c)));
        const count = this.countOpt ? out.length : null;
        if (this.head) return { data: null, error: null, count, status: 200 };
        out = out.slice(this.off, this.lim == null ? undefined : this.off + this.lim);
        return this._final(clone(this._shape(out)), count);
      }
      if (this.op === "insert" || this.op === "upsert") {
        const list = [].concat(this.payload).map((r) => ({ id: uuid(), ...(opts.camel ? { createdAt: now, updatedAt: now } : { created_at: now }), ...r }));
        const done = [];
        for (const r of list) {
          const keys = (this.conflict || "id").split(",").map((s) => s.trim());
          const ex = this.op === "upsert" ? rows.find((x) => keys.every((k) => r[k] !== undefined && String(x[k]) === String(r[k]))) : null;
          if (ex) { Object.assign(ex, r, { id: ex.id, [opts.camel ? "updatedAt" : "updated_at"]: now }); done.push(ex); } else { rows.push(r); done.push(r); }
        }
        if (opts.onWrite) opts.onWrite(this.t, this.op, done);
        save();
        return this._final(this.returning ? clone(this._shape(done)) : [], null);
      }
      if (this.op === "update") {
        const hit = this._match(rows);
        for (const r of hit) Object.assign(r, this.payload, { [opts.camel ? "updatedAt" : "updated_at"]: now });
        save();
        return this._final(this.returning ? clone(this._shape(hit)) : [], null);
      }
      if (this.op === "delete") {
        const hit = this._match(rows);
        db[this.t] = rows.filter((r) => !hit.includes(r));
        save();
        return this._final(this.returning ? clone(hit) : [], null);
      }
      return { data: null, error: null };
    }
  }

  // ── auth ──
  const listeners = new Set();
  const readSession = () => { if (opts.alwaysUser) return toSession(opts.alwaysUser); try { return JSON.parse(localStorage.getItem(authKey) || "null"); } catch { return null; } };
  const writeSession = (s) => { try { s ? localStorage.setItem(authKey, JSON.stringify(s)) : localStorage.removeItem(authKey); } catch { /* blocked */ } };
  const emit = (ev, s) => listeners.forEach((cb) => { try { cb(ev, s); } catch (e) { console.error(e); } });
  const users = () => (typeof opts.users === "function" ? opts.users(load()) : opts.users || []);
  const toSession = (u) => ({
    access_token: "demo-token", refresh_token: "demo-refresh", token_type: "bearer", expires_in: 86400, expires_at: Math.floor(Date.now() / 1000) + 86400,
    user: { id: u.id, email: u.email, phone: u.phone || "", aud: "authenticated", role: "authenticated", created_at: "2025-01-01T00:00:00Z", user_metadata: u.user_metadata || {}, app_metadata: u.app_metadata || { provider: "email" } },
  });
  const auth = {
    async getSession() { return { data: { session: readSession() }, error: null }; },
    async getUser() { const s = readSession(); return { data: { user: s?.user ?? null }, error: s ? null : { message: "Auth session missing!" } }; },
    onAuthStateChange(cb) { listeners.add(cb); setTimeout(() => cb("INITIAL_SESSION", readSession()), 0); return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } }; },
    async signInWithPassword({ email, phone, password }) {
      const id = String(email || phone || "").trim().toLowerCase();
      const u = users().find((x) => [x.email, x.phone, x.username].filter(Boolean).map((v) => String(v).toLowerCase()).includes(id) && (x.password == null || x.password === password));
      if (!u) return { data: { user: null, session: null }, error: { message: "Invalid login credentials", status: 400, name: "AuthApiError" } };
      const s = toSession(u); writeSession(s); emit("SIGNED_IN", s);
      return { data: { user: s.user, session: s }, error: null };
    },
    async signInWithOtp() { return { data: {}, error: null }; },
    async verifyOtp() { const u = users()[0]; const s = toSession(u); writeSession(s); emit("SIGNED_IN", s); return { data: { user: s.user, session: s }, error: null }; },
    async signInWithOAuth() { return { data: {}, error: { message: "Not available in the demo" } }; },
    async signUp({ email, options }) { const u = { id: uuid(), email, user_metadata: options?.data || {} }; return { data: { user: toSession(u).user, session: null }, error: null }; },
    async signOut() { writeSession(null); emit("SIGNED_OUT", null); return { error: null }; },
    async refreshSession() { const s = readSession(); return { data: { session: s, user: s?.user ?? null }, error: null }; },
    async setSession() { const s = readSession(); return { data: { session: s, user: s?.user ?? null }, error: null }; },
    async updateUser(attrs) { const s = readSession(); if (s && attrs?.data) { s.user.user_metadata = { ...s.user.user_metadata, ...attrs.data }; writeSession(s); } return { data: { user: s?.user ?? null }, error: null }; },
    async resetPasswordForEmail() { return { data: {}, error: null }; },
    async exchangeCodeForSession() { return { data: { session: readSession() }, error: null }; },
    admin: { async createUser(a) { return { data: { user: { id: uuid(), email: a?.email } }, error: null }; }, async deleteUser() { return { data: {}, error: null }; }, async updateUserById() { return { data: {}, error: null }; }, async listUsers() { return { data: { users: [] }, error: null }; } },
    mfa: { async getAuthenticatorAssuranceLevel() { return { data: { currentLevel: "aal1", nextLevel: "aal1" }, error: null }; } },
  };

  const storage = {
    from: () => ({
      async upload(path) { return { data: { path, fullPath: path }, error: null }; },
      getPublicUrl(path) { return { data: { publicUrl: opts.placeholderImage || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'/>" , path } }; },
      async createSignedUrl(path) { return { data: { signedUrl: opts.placeholderImage || "#" + path }, error: null }; },
      async createSignedUrls(paths) { return { data: paths.map((p) => ({ path: p, signedUrl: "#" + p })), error: null }; },
      async remove() { return { data: [], error: null }; },
      async list() { return { data: [], error: null }; },
      async download() { return { data: new Blob([""]), error: null }; },
    }),
  };

  const channel = () => { const ch = { on: () => ch, subscribe: (cb) => { if (typeof cb === "function") setTimeout(() => cb("SUBSCRIBED"), 0); return ch; }, unsubscribe: async () => "ok", send: async () => "ok", track: async () => "ok", presenceState: () => ({}) }; return ch; };

  const client = {
    from: (t) => new Query(t),
    schema: () => client,
    rpc: (name, args = {}) => {
      const p = Promise.resolve().then(() => {
        const h = opts.rpc?.[name];
        if (!h) return { data: null, error: null };
        try { const d = h(args, { db: load(), table, save, session: readSession() }); return { data: d ?? null, error: null }; } catch (e) { return { data: null, error: { message: String(e.message || e) } }; }
      });
      const thenable = { then: (a, b) => p.then(a, b), catch: (b) => p.catch(b), single: () => thenable, maybeSingle: () => thenable, select: () => thenable, abortSignal: () => thenable, throwOnError: () => thenable };
      return thenable;
    },
    auth, storage, channel, removeChannel: async () => "ok", removeAllChannels: async () => [], getChannels: () => [],
    functions: { async invoke(name, o) { const h = opts.functions?.[name]; return { data: h ? h(o?.body, { db: load(), table, save }) : { ok: true, success: true }, error: null }; } },
    realtime: { setAuth() {} },
    __db: () => load(), __reset: () => { db = null; localStorage.removeItem(key); return load(); },
  };
  return client;
}

// ── Portfolio demo: answers the app's Supabase REST calls and /api/send-email in the browser ──
// Data lives in this browser's localStorage, seeded with sample itineraries, leads and bookings.
// Nothing is sent to Supabase, Resend or Razorpay; the payment window is a simulated checkout.
var BASE = '/demos/shera-travels-booking-crm/';
var HOST = 'puufrlhhdjsqnbseayvh.supabase.co';
var img = function (p) { return location.origin + BASE + p; };
var day = function (o, h) { var d = new Date(); d.setDate(d.getDate() + o); d.setHours(h || 10, 0, 0, 0); return d.toISOString(); };
var date = function (o) { return day(o).slice(0, 10); };

function seed() {
  var CO = { company_name: 'Shera Travels', company_addr: 'Radio Colony, Srinagar, Lawaypora, Srinagar, Jammu and Kashmir 190017', company_email: 'sheratravels21@gmail.com', company_phone: '+91-9149406965, 9858966518', company_gst: '01KODPS7232P1ZE' };
  var plans = [
    ['pk-1', 'Kashmir Paradise Express', 'Srinagar · Gulmarg · Pahalgam', 5, 6, 'images/dal-lake.png', [
      ['Arrival in Srinagar', 'Airport pick-up, check in to a Dal Lake houseboat and an evening shikara ride.', 'Houseboat Royal Palace', ['Dal Lake', 'Shikara ride'], 'images/dal-lake.png'],
      ['Srinagar sightseeing', 'Mughal gardens Nishat and Shalimar, Shankaracharya temple and the old city.', 'Hotel Grand Mumtaz', ['Nishat Bagh', 'Shalimar Bagh'], 'Dal Lake Kashmir.jpg'],
      ['Gulmarg day trip', 'Drive to Gulmarg, Gondola phase 1 and snow activities, back to Srinagar.', 'Hotel Grand Mumtaz', ['Gondola', 'Snow point'], 'images/gulmarg.png'],
      ['Pahalgam', 'Saffron fields at Pampore, Betaab valley and Aru valley.', 'Hotel Pine Spring', ['Betaab Valley', 'Aru Valley'], 'images/pahalgam.png'],
      ['Doodhpathri excursion', 'Meadows of Doodhpathri with a riverside picnic.', 'Hotel Pine Spring', ['Doodhpathri'], 'images/yousmarg.jpg'],
      ['Departure', 'Breakfast and drop at Srinagar airport.', '', ['Airport drop'], 'images/aru-valley.jpg']]],
    ['pk-2', 'Gulmarg Adventure Blast', 'Snow, skiing and the Gondola', 2, 3, 'images/gulmarg.png', [
      ['Srinagar to Gulmarg', 'Scenic drive through Tangmarg, check in and evening walk.', 'Hotel Highlands Park', ['Tangmarg'], 'Gulmarg.jpg'],
      ['Gondola and skiing', 'Gondola phase 1 and 2, beginner ski session with an instructor.', 'Hotel Highlands Park', ['Gondola', 'Skiing'], 'images/gulmarg.png'],
      ['Return', 'Breakfast and drive back to Srinagar.', '', ['Srinagar'], 'images/dal-lake.png']]],
    ['pk-3', 'Pure Valley Honeymoon', 'Private car, flower decor, candlelight dinner', 5, 6, 'images/pahalgam.png', [
      ['Welcome to Srinagar', 'Flower-decorated houseboat with a candlelight dinner.', 'Houseboat New Golden Flower', ['Dal Lake'], 'images/dal-lake.png'],
      ['Sonmarg', 'Thajiwas glacier and pony ride.', 'Hotel Snowland', ['Thajiwas Glacier'], 'images/yousmarg.jpg'],
      ['Gulmarg', 'Gondola ride and couple photoshoot.', 'Hotel Khyber', ['Gondola'], 'images/gulmarg.png'],
      ['Pahalgam', 'Riverside stay by the Lidder.', 'Hotel Heevan', ['Lidder River'], 'Pahalgham.jpg'],
      ['Aru and Betaab valley', 'Full day in the valleys.', 'Hotel Heevan', ['Aru Valley', 'Betaab Valley'], 'Aru Valley.jpg'],
      ['Departure', 'Drop at the airport with a gift hamper.', '', ['Airport drop'], 'images/dal-lake.png']]],
    ['pk-4', 'Amarnath Yatra Special', 'Helicopter via Baltal with stays', 4, 5, 'amarnath-yatra.jpg', [
      ['Arrival in Srinagar', 'Registration check and stay.', 'Hotel Fortune Inn', ['Srinagar'], 'images/dal-lake.png'],
      ['Srinagar to Baltal', 'Drive to Baltal base camp via Sonmarg.', 'Camp Baltal', ['Sonmarg'], 'images/yousmarg.jpg'],
      ['Holy cave darshan', 'Helicopter to Panjtarni and darshan at the holy cave.', 'Camp Baltal', ['Holy Cave'], 'Amarnath Yatra.jpg'],
      ['Return to Srinagar', 'Drive back and rest.', 'Hotel Fortune Inn', ['Srinagar'], 'images/dal-lake.png'],
      ['Departure', 'Airport drop.', '', ['Airport drop'], 'images/aru-valley.jpg']]],
  ];
  var packages = [], days = [], day_photos = [], prices = [];
  plans.forEach(function (p, i) {
    packages.push(Object.assign({ id: p[0], title: p[1], sub_title: p[2], nights: p[3], days: p[4], start_location: 'Srinagar', hero_photo_url: img(p[5]), inclusions: ['Accommodation on twin sharing', 'Breakfast and dinner', 'All transfers by private cab', 'Driver allowance, tolls and parking'], exclusions: ['Airfare', 'Pony and sledge charges', 'Personal expenses'], tc_payment: '20% advance to confirm, balance 7 days before travel.', tc_cancel: '30+ days: 90% refund. 15-30 days: 50%. Under 15 days: no refund.', tc_notes: 'Hotel check-in 12:00, check-out 11:00.', owner: 'admin', created_at: day(-30 + i * 6), updated_at: day(-30 + i * 6) }, CO));
    [['Adult', 'Above 12 years', 17500 + i * 2500], ['Child', '5–12 years', 8000 + i * 1000], ['Infant', 'Below 5 years', 0]].forEach(function (x, k) { prices.push({ id: p[0] + '-pr' + k, package_id: p[0], pax_type: x[0], age_limit: x[1], price: x[2], sort_order: k }); });
    p[6].forEach(function (d, k) {
      var id = p[0] + '-d' + (k + 1);
      days.push({ id: id, package_id: p[0], day_number: k + 1, title: d[0], description: d[1], distance: k === 0 ? '15 km' : (40 + k * 25) + ' km', hotspots: d[3], themes: ['Sightseeing'], meals: d[2] ? ['Stay', 'Breakfast', 'Dinner'] : ['Breakfast'], accommodation: d[2], accom_star: 3 + (k % 2), hotel_photo_url: '', sort_order: k, created_at: day(-30 + i * 6) });
      day_photos.push({ id: id + '-ph', day_id: id, photo_url: img(d[4]), tag_name: d[3][0], tag_type: 'location', slot_index: 0, created_at: day(-30 + i * 6) });
    });
  });
  var photo_library = [['images/dal-lake.png', 'Dal Lake'], ['images/gulmarg.png', 'Gulmarg'], ['images/pahalgam.png', 'Pahalgam'], ['images/yousmarg.jpg', 'Yousmarg'], ['images/aru-valley.jpg', 'Aru Valley'], ['amarnath-yatra.jpg', 'Amarnath']].map(function (x, i) { return { id: 'lib-' + i, photo_url: img(x[0]), file_name: x[0].split('/').pop(), tag_name: x[1], tag_type: 'location', created_at: day(-40 + i) }; });
  var names = ['Aarav Mehta', 'Sara Khan', 'Rohan Das', 'Neha Gupta', 'Imran Bhat', 'Priya Nair', 'Kunal Shah', 'Fatima Sheikh', 'Vikram Rao', 'Ananya Iyer', 'Harpreet Singh', 'Megha Jain', 'Arjun Menon', 'Zoya Mir'];
  var stages = ['new_inquiry', 'contacted', 'itinerary_sent', 'negotiation', 'confirmed', 'advance_paid', 'new_inquiry', 'contacted', 'itinerary_sent', 'lost', 'fully_paid', 'new_inquiry', 'negotiation', 'documents'];
  var dests = ['Kashmir', 'Gulmarg', 'Kashmir Honeymoon', 'Pahalgam', 'Amarnath Yatra', 'Sonmarg', 'Kashmir'];
  var leads = names.map(function (n, i) { return { id: 'ld-' + (i + 1), name: n, phone: '98' + String(40000000 + i * 1371937).slice(0, 8), whatsapp: '98' + String(40000000 + i * 1371937).slice(0, 8), email: n.split(' ')[0].toLowerCase() + '@mail.example', destination: dests[i % dests.length], travel_date: date(12 + i * 4), return_date: date(17 + i * 4), adults: 2 + (i % 3), children: i % 2, infants: 0, pax: 2 + (i % 3), budget_min: 30000 + i * 5000, budget_max: 60000 + i * 8000, stage: stages[i], source: ['whatsapp', 'website', 'instagram', 'referral', 'phone'][i % 5], package_id: plans[i % 4][0], assigned_to: i % 3 ? 'Faisal' : 'admin', notes: ['Wants houseboat stay', 'Honeymoon couple, needs flower decor', 'Family with elderly parents', 'Asked for veg meals', 'Prefers Innova Crysta'][i % 5], created_at: day(-i * 2, 9 + (i % 8)), updated_at: day(-i) }; });
  var bk = [['ld-5', 'pk-4', 'confirmed', 2, 0.2], ['ld-6', 'pk-1', 'advance_paid', 3, 0.3], ['ld-11', 'pk-3', 'fully_paid', 2, 1], ['ld-14', 'pk-2', 'balance_due', 4, 0.5], ['ld-2', 'pk-1', 'completed', 5, 1]];
  var bookings = [], payments = [];
  bk.forEach(function (b, i) {
    var l = leads.find(function (x) { return x.id === b[0]; }), p = packages.find(function (x) { return x.id === b[1]; });
    var total = (prices.find(function (x) { return x.package_id === p.id; }).price) * b[3];
    var paid = Math.round(total * b[4]);
    var id = 'bk-' + (i + 1);
    bookings.push({ id: id, booking_ref: 'ST-2026-' + String(41 + i).padStart(4, '0'), lead_id: l.id, package_id: p.id, customer_name: l.name, customer_email: l.email, customer_phone: l.phone, customer_whatsapp: l.phone, destination: p.title, travel_date: i === 4 ? date(-12) : date(10 + i * 9), return_date: i === 4 ? date(-7) : date(10 + i * 9 + p.days), adults: b[3], children: 0, infants: 0, nights: p.nights, total_amount: total, advance_percent: 20, advance_amount: Math.round(total * 0.2), balance_amount: total - paid, paid_amount: paid, status: b[2], booking_token: 'tok-demo-' + (i + 1), notes: '', created_at: day(-20 + i * 3), updated_at: day(-2) });
    if (paid) payments.push({ id: 'pay-' + (i + 1), booking_id: id, amount: Math.min(paid, Math.round(total * 0.2)), type: 'advance', method: ['upi', 'razorpay', 'bank_transfer'][i % 3], razorpay_payment_id: 'pay_demo_' + (1000 + i), status: 'success', notes: 'Advance', paid_at: day(-18 + i * 3), created_at: day(-18 + i * 3) });
    if (paid > Math.round(total * 0.2)) payments.push({ id: 'pay-' + (i + 1) + 'b', booking_id: id, amount: paid - Math.round(total * 0.2), type: b[4] === 1 ? 'balance' : 'part', method: 'upi', status: 'success', notes: 'Balance', paid_at: day(-6 + i), created_at: day(-6 + i) });
  });
  var website_packages = [
    ['Kashmir Paradise Express', 4, 3, '₹12,499', 'images/dal-lake.png', 'BEST SELLER', ['Dal Lake Shikara Ride', 'Houseboat Stay', 'Srinagar Sightseeing']],
    ['Gulmarg Adventure Blast', 3, 2, '₹9,999', 'images/gulmarg.png', 'POPULAR', ['Gondola Ride', 'Skiing Session', 'Winter Jacket Rental']],
    ['Pure Valley Honeymoon', 6, 5, '₹28,999', 'images/pahalgam.png', 'RECOMMENDED', ['Candlelight Dinner', 'Flower Decor', 'Private Car', 'Pahalgam Stay']],
    ['Amarnath Yatra Special', 5, 4, '₹15,499', 'amarnath-yatra.jpg', 'SPECIAL', ['Helicopter Booking', 'Shikara Stay', 'Temple Tours']],
    ['Yousmarg Meadows Getaway', 3, 2, '₹8,499', 'images/yousmarg.jpg', 'NEW', ['Meadow Picnic', 'Pony Ride', 'Nilnag Lake']],
    ['Aru Valley Family Escape', 5, 4, '₹19,999', 'images/aru-valley.jpg', 'FAMILY', ['Riverside Camping', 'Betaab Valley', 'Private Cab']],
  ].map(function (w, i) { return { id: 'wp-' + (i + 1), title: w[0], days: w[1], nights: w[2], price: w[3], image_url: img(w[4]), status_badge: w[5], features: w[6], active: true, sort_order: i, created_at: day(-60 + i) }; });
  var crm_users = [{ id: 'u-1', username: 'admin', password: 'admin123', name: 'Shera Admin', role: 'admin', active: true, created_at: day(-200) }, { id: 'u-2', username: 'faisal', password: 'demo123', name: 'Faisal', role: 'staff', active: true, created_at: day(-120) }];
  return { packages: packages, prices: prices, days: days, day_photos: day_photos, photo_library: photo_library, leads: leads, lead_notes: [], bookings: bookings, payments: payments, website_packages: website_packages, crm_users: crm_users, audit_logs: [] };
}

var client = createMockClient({ storageKey: 'shera_demo_v1', seed: seed });

function parseFilter(q, col, v) {
  var neg = false;
  if (v.indexOf('not.') === 0) { neg = true; v = v.slice(4); }
  var dot = v.indexOf('.'); var op = v.slice(0, dot); var val = v.slice(dot + 1);
  var conv = function (x) { return x === 'null' ? null : x === 'true' ? true : x === 'false' ? false : x; };
  if (op === 'in') val = val.replace(/^\(|\)$/g, '').split(',').map(function (x) { return x.replace(/^"|"$/g, ''); });
  else if (op === 'like' || op === 'ilike') val = val.replace(/\*/g, '%');
  else if (op === 'cs' || op === 'cd' || op === 'ov') { try { val = JSON.parse(val.replace(/^\{/, '[').replace(/\}$/, ']')); } catch (e) { val = val.replace(/^\{|\}$/g, '').split(','); } }
  else val = conv(val);
  if (neg) return q.not(col, op, val);
  var m = { eq: 'eq', neq: 'neq', gt: 'gt', gte: 'gte', lt: 'lt', lte: 'lte', like: 'like', ilike: 'ilike', is: 'is', in: 'in', cs: 'contains', ov: 'overlaps', fts: 'textSearch', plfts: 'textSearch', wfts: 'textSearch' }[op];
  return m && q[m] ? q[m](col, val) : q;
}

async function rest(u, init) {
  var method = (init && init.method || 'GET').toUpperCase();
  var headers = new Headers(init && init.headers || {});
  var table = decodeURIComponent(u.pathname.replace(/^\/rest\/v1\//, ''));
  if (table.indexOf('rpc/') === 0) return new Response('null', { status: 200, headers: { 'Content-Type': 'application/json' } });
  var prefer = headers.get('Prefer') || '';
  var body = init && init.body ? JSON.parse(init.body) : null;
  var q = client.from(table);
  if (method === 'GET' || method === 'HEAD') q = q.select(u.searchParams.get('select') || '*', { count: /count=/.test(prefer) ? 'exact' : undefined, head: method === 'HEAD' });
  else if (method === 'POST') q = /merge-duplicates/.test(prefer) ? q.upsert(body, { onConflict: u.searchParams.get('on_conflict') || undefined }) : q.insert(body);
  else if (method === 'PATCH') q = q.update(body);
  else if (method === 'DELETE') q = q.delete();
  if (method !== 'GET' && method !== 'HEAD' && /return=representation/.test(prefer)) q = q.select(u.searchParams.get('select') || '*');
  u.searchParams.forEach(function (v, k) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].indexOf(k) >= 0 || k.indexOf('.') > 0) return;
    if (k === 'or') return (q = q.or(v.replace(/^\(|\)$/g, '')));
    if (k === 'and') return;
    q = parseFilter(q, k, v);
  });
  var order = u.searchParams.get('order');
  if (order) order.split(',').forEach(function (o) { var p = o.split('.'); q = q.order(p[0], { ascending: p[1] !== 'desc' }); });
  var lim = u.searchParams.get('limit'), off = u.searchParams.get('offset');
  if (lim) q = off ? q.range(Number(off), Number(off) + Number(lim) - 1) : q.limit(Number(lim));
  var single = /vnd\.pgrst\.object/.test(headers.get('Accept') || '');
  if (single) q = q.maybeSingle();
  var res = await q;
  if (single && res.data == null && method === 'GET') return new Response(JSON.stringify({ code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: 'The result contains 0 rows', hint: null }), { status: 406, headers: { 'Content-Type': 'application/json' } });
  var h = { 'Content-Type': 'application/json' };
  var n = Array.isArray(res.data) ? res.data.length : res.data ? 1 : 0;
  h['Content-Range'] = (n ? '0-' + (n - 1) : '*') + '/' + (res.count != null ? res.count : '*');
  if (method === 'HEAD') return new Response(null, { status: 200, headers: h });
  if (method !== 'GET' && !/return=representation/.test(prefer)) return new Response(null, { status: 201, headers: h });
  return new Response(JSON.stringify(res.data), { status: method === 'POST' ? 201 : 200, headers: h });
}

async function sendEmail(init) {
  var b = {}; try { b = JSON.parse(init && init.body || '{}'); } catch (e) {}
  if (b.type === 'website_booking' && b.booking) {
    var bk = Object.assign({}, b.booking, { status: 'advance_paid', advance_percent: 20, balance_amount: Math.max(0, (b.booking.total_amount || 0) - (b.booking.paid_amount || 0)), booking_token: 'tok-' + Date.now().toString(36) });
    bk.booking_ref = 'ST-WEB-' + String(Date.now()).slice(-5);
    var ins = await client.from('bookings').insert(bk).select().single();
    if (ins.data && b.payment) await client.from('payments').insert({ booking_id: ins.data.id, amount: b.payment.amount, type: 'advance', method: 'razorpay', razorpay_payment_id: b.payment.razorpay_payment_id, status: 'success', paid_at: new Date().toISOString() });
  }
  return new Response(JSON.stringify({ success: true, demo: true, message: 'Email simulated in the demo' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

var origFetch = window.fetch.bind(window);
window.fetch = function (input, init) {
  var url = typeof input === 'string' ? input : (input && input.url) || String(input);
  var u; try { u = new URL(url, location.href); } catch (e) { return origFetch(input, init); }
  if (input && typeof input === 'object' && !init) init = { method: input.method, headers: input.headers };
  if (u.host === HOST) {
    if (u.pathname.indexOf('/rest/v1/') === 0) return rest(u, init);
    if (u.pathname.indexOf('/storage/v1/object') === 0) return Promise.resolve(new Response(JSON.stringify({ Key: u.pathname, Id: 'demo' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  if (u.origin === location.origin && /\/api\/send-email\/?$/.test(u.pathname)) return sendEmail(init);
  return origFetch(input, init);
};

function demoCheckout(opts) {
  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif';
  var amt = (Number(opts.amount || 0) / 100).toLocaleString('en-IN');
  wrap.innerHTML = '<div style="background:#fff;border-radius:14px;padding:24px;width:340px;max-width:92vw;box-shadow:0 20px 50px rgba(0,0,0,.3)"><div style="font-size:12px;letter-spacing:.08em;color:#64748b;text-transform:uppercase">Demo checkout</div><div style="font-size:18px;font-weight:700;margin-top:4px;color:#0f172a">' + (opts.name || 'Payment') + '</div><div style="font-size:13px;color:#475569;margin-top:2px">' + (opts.description || '') + '</div><div style="font-size:28px;font-weight:800;margin:16px 0;color:#0f172a">₹' + amt + '</div><div style="font-size:12px;color:#64748b;margin-bottom:16px">Portfolio demo: no money moves and no payment gateway is contacted.</div><button data-pay style="width:100%;padding:12px;border:0;border-radius:10px;background:#16a34a;color:#fff;font-weight:700;cursor:pointer">Simulate successful payment</button><button data-cancel style="width:100%;padding:10px;border:0;background:none;color:#64748b;margin-top:6px;cursor:pointer">Cancel</button></div>';
  document.body.appendChild(wrap);
  wrap.querySelector('[data-cancel]').onclick = function () { wrap.remove(); if (opts.modal && opts.modal.ondismiss) opts.modal.ondismiss(); };
  wrap.querySelector('[data-pay]').onclick = function () { wrap.remove(); if (opts.handler) opts.handler({ razorpay_order_id: opts.order_id || 'order_demo', razorpay_payment_id: 'pay_demo_' + Date.now().toString(36), razorpay_signature: 'demo', razorpay_payment_link_id: 'plink_demo' }); };
}
var FakeRzp = function (opts) { this.open = function () { demoCheckout(opts); }; this.on = function () {}; };
try { Object.defineProperty(window, 'Razorpay', { get: function () { return FakeRzp; }, set: function () {}, configurable: true }); } catch (e) { window.Razorpay = FakeRzp; }
window.__sheraDemo = client;

})();

/* ==========================================================================
   SWAMITRA admin — application logic

   Content lives in Supabase, not in this file:
     site_draft      what you are editing now, autosaved as you type
     site_revision   every publish, kept so any change can be undone
     site-content    the generated data.js the live website loads
     site-images     photographs uploaded here

   The bundled assets/js/data.js is the starting point the first time the panel
   runs, and remains the website's fallback if Supabase is ever unreachable.
   ========================================================================== */
(function () {
  "use strict";

  var CFG    = window.SW_SUPABASE || {};
  var SCHEMA = window.SW_SCHEMA || {};
  var LANG   = "en";

  var sb = null;              // Supabase client
  var model = {};             // the content being edited
  var published = null;       // the last published copy, for the change summary
  var lastPublishedAt = null;
  var view = { section: null, item: null, tab: 0, q: "" };
  var mediaFiles = [];
  var pickerTarget = null;
  var dirty = false, saving = false, saveTimer = null;

  var ORDER = (SCHEMA.groups || []).reduce(function (all, g) {
    return all.concat(g.sections);
  }, []);

  /* ------------------------------------------------------------------ icons */

  var ICO = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    hero:      '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 16-5-5-4.5 4.5"/>',
    about:     '<circle cx="12" cy="8" r="3.4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    chart:     '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8.5 16v-4M13 16V8M17.5 16v-6"/>',
    sparkle:   '<path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.2l-1.8-5.6L4.5 10.8 10.2 9z"/>',
    programs:  '<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>',
    training:  '<path d="M12 3 2.5 8 12 13l9.5-5z"/><path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5"/>',
    resources: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H15l5 5v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z"/><path d="M14.5 4v5h5"/>',
    book:      '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
    news:      '<rect x="3" y="5" width="14" height="15" rx="1.5"/><path d="M17 9h3.5v9a2 2 0 0 1-2 2H17"/><path d="M6.5 9h7M6.5 12.5h7M6.5 16h4"/>',
    calendar:  '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    building:  '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2"/>',
    scale:     '<path d="M12 3v18M7 21h10"/><path d="m5 7 7-2 7 2"/><path d="m5 7-2.5 6a3.5 3.5 0 0 0 5 0z"/><path d="m19 7 2.5 6a3.5 3.5 0 0 1-5 0z"/>',
    lock:      '<rect x="4.5" y="10" width="15" height="10.5" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
    plus:      '<path d="M12 5v14M5 12h14"/>',
    search:    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    back:      '<path d="M15 5l-7 7 7 7"/>',
    up:        '<path d="m6 15 6-6 6 6"/>',
    down:      '<path d="m6 9 6 6 6-6"/>',
    trash:     '<path d="M4 7h16"/><path d="M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7"/><path d="M6.5 7 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/>',
    check:     '<path d="M20 6 9 17l-5-5"/>',
    alert:     '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.2v.1"/>',
    image:     '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 16-5-5-4.5 4.5"/>',
    history:   '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4.5V9H8"/><path d="M12 7.5V12l3 2"/>',
    box:       '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m12 12 8-4.5M12 12v9M12 12 4 7.5"/>'
  };

  function icon(name, size) {
    var s = size || 18;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + (ICO[name] || ICO.check) + "</svg>";
  }

  /* ------------------------------------------------------------------ utils */

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function p(path) { return esc(JSON.stringify(path)); }

  var toastTimer;
  function toast(msg, kind) {
    var el = $("toast");
    el.innerHTML = icon(kind === "error" ? "alert" : "check", 16) + "<span>" + esc(msg) + "</span>";
    el.className = "toast show " + (kind || "success");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = "toast"; }, kind === "error" ? 6500 : 2800);
  }

  function status(text, state) {
    var el = $("saveStatus");
    el.className = "save-status " + (state || "");
    el.querySelector("span").textContent = text;
  }

  function ago(iso) {
    if (!iso) return "never";
    var s = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " h ago";
    if (s < 604800) return Math.floor(s / 86400) + " d ago";
    return new Date(iso).toLocaleDateString();
  }

  function getAt(path) {
    return path.reduce(function (o, k) { return (o == null) ? undefined : o[k]; }, model);
  }

  function setAt(path, value) {
    var o = model;
    for (var i = 0; i < path.length - 1; i++) {
      if (o[path[i]] == null) o[path[i]] = (typeof path[i + 1] === "number") ? [] : {};
      o = o[path[i]];
    }
    o[path[path.length - 1]] = value;
  }

  function countOf(name) {
    var spec = SCHEMA.sections[name];
    if (spec.kind === "list") return (model[name] || []).length;
    if (spec.kind === "map")  return Object.keys(model[name] || {}).length;
    return null;
  }

  function titleOf(rec, spec, i) {
    var t = rec && spec.titleKey ? rec[spec.titleKey] : "";
    return String(t || "").trim() || ((spec.fallbackTitle || "Item") + " " + (i + 1));
  }

  /* A stored path may be site-relative (assets/img/x.jpg) or a full URL. */
  function imgSrc(v) {
    if (!v) return "";
    return /^(https?:)?\/\/|^data:/.test(v) ? v : "/" + String(v).replace(/^\/+/, "");
  }

  /* ------------------------------------------------------------------ tabs */

  /* Fields the schema's tabs forgot are appended to the last tab, so a newly
     added field can never become invisible. */
  function tabsFor(spec) {
    if (!spec.tabs) return null;
    var seen = {};
    var tabs = spec.tabs.map(function (t) {
      var fields = t.fields.map(function (k) {
        seen[k] = 1;
        return spec.fields.filter(function (f) { return f.k === k; })[0];
      }).filter(Boolean);
      return { label: t.label, fields: fields };
    });
    var missed = spec.fields.filter(function (f) { return !seen[f.k]; });
    if (missed.length) tabs[tabs.length - 1].fields = tabs[tabs.length - 1].fields.concat(missed);
    return tabs;
  }

  /* -------------------------------------------------------------- supabase */

  function connected() {
    return CFG.url && CFG.anonKey &&
           CFG.url.indexOf("YOUR-PROJECT-REF") === -1 &&
           CFG.anonKey.indexOf("YOUR-ANON") === -1;
  }

  function publicUrl(bucket, name) {
    return sb.storage.from(bucket).getPublicUrl(name).data.publicUrl;
  }

  /* ------------------------------------------------------------------ login */

  function showLogin(message) {
    $("loginScreen").style.display = "flex";
    $("app").classList.remove("open");
    if (message) {
      var e = $("loginErr");
      e.textContent = message;
      e.classList.add("show");
    }
  }

  async function signIn(ev) {
    ev.preventDefault();
    var btn = $("loginBtn");
    $("loginErr").classList.remove("show");
    btn.disabled = true;
    btn.textContent = "Signing in…";

    var res = await sb.auth.signInWithPassword({
      email: $("email").value.trim(),
      password: $("password").value
    });

    btn.disabled = false;
    btn.textContent = "Sign in";
    if (res.error) { showLogin(res.error.message); return; }
    await start();
  }

  async function signOut() {
    if (dirty) await saveDraft(true);
    await sb.auth.signOut();
    location.reload();
  }

  /* ------------------------------------------------------------- load/save */

  function baseline() {
    var src = window.SWAMITRA || {}, out = {};
    Object.keys(src).forEach(function (k) { out[k] = clone(src[k]); });
    return out;
  }

  async function loadContent() {
    var res = await sb.from("site_draft").select("data").eq("lang", LANG).maybeSingle();
    if (res.error) throw res.error;

    if (res.data && res.data.data) {
      model = res.data.data;
    } else {
      model = baseline();
      await saveDraft(true);
    }

    ORDER.forEach(function (name) {
      var spec = SCHEMA.sections[name];
      if (model[name] == null) model[name] = (spec.kind === "list") ? [] : {};
    });
  }

  async function loadPublished() {
    var res = await sb.from("site_revision")
      .select("data, published_at").eq("lang", LANG)
      .order("published_at", { ascending: false }).limit(1);
    if (!res.error && res.data && res.data.length) {
      published = res.data[0].data;
      lastPublishedAt = res.data[0].published_at;
    }
  }

  async function saveDraft(silent) {
    if (saving) return false;
    saving = true;
    if (!silent) status("Saving…", "busy");

    var user = (await sb.auth.getUser()).data.user;
    var res = await sb.from("site_draft").upsert({
      lang: LANG, data: model,
      updated_at: new Date().toISOString(),
      updated_by: user ? user.id : null
    }, { onConflict: "lang" });

    saving = false;
    if (res.error) {
      status("Not saved", "warn");
      toast("Could not save: " + res.error.message, "error");
      return false;
    }
    dirty = false;
    if (!silent) status("Saved", "ok");
    return true;
  }

  function touch() {
    dirty = true;
    status("Unsaved changes", "warn");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveDraft(); }, 900);
  }

  /* ------------------------------------------------------------ navigation */

  function renderNav() {
    var html = '<button class="nav-item' + (view.section === null ? " active" : "") + '" ' +
      'type="button" data-section="__home">' + icon("dashboard", 17) +
      '<span class="t">Dashboard</span></button>';

    html += (SCHEMA.groups || []).map(function (g) {
      return '<div class="nav-label">' + esc(g.label) + "</div>" +
        g.sections.map(function (name) {
          var spec = SCHEMA.sections[name];
          if (!spec) return "";
          var n = countOf(name);
          return '<button class="nav-item' + (view.section === name ? " active" : "") + '" ' +
            'type="button" data-section="' + esc(name) + '">' +
            icon(spec.icon, 17) + '<span class="t">' + esc(spec.label) + "</span>" +
            (n === null ? "" : '<span class="nav-count">' + n + "</span>") + "</button>";
        }).join("");
    }).join("");

    $("nav").innerHTML = html;
  }

  function go(section, item) {
    view.section = (section === "__home") ? null : section;
    view.item = (item === undefined) ? null : item;
    view.tab = 0;
    view.q = "";
    closeSidebar();
    renderNav();
    render();
    window.scrollTo(0, 0);
  }

  function closeSidebar() {
    $("sidebar").classList.remove("open");
    $("scrim").classList.remove("on");
  }

  /* ---------------------------------------------------------------- render */

  function render() {
    if (view.section === null) { renderDashboard(); return; }

    var spec = SCHEMA.sections[view.section];
    if (!spec) { renderDashboard(); return; }

    if (spec.kind === "object") {
      crumb("");
      heading(spec.label);
      renderRecord(spec, model[view.section], [view.section], spec.label, spec.blurb);
    }
    else if (view.item === null) renderCollection(spec);
    else                         renderItem(spec);
  }

  function crumb(html) { $("crumb").innerHTML = html || ""; }
  function heading(t) { $("pageTitle").textContent = t; }

  /* ---- dashboard ---- */
  function renderDashboard() {
    crumb("");
    heading("Dashboard");

    var changes = changedSections();
    var pending = changes.length;

    var tiles = (SCHEMA.groups || []).map(function (g) {
      return '<div class="section-title">' + esc(g.label) + "</div>" +
        '<div class="tiles">' + g.sections.map(function (name) {
          var spec = SCHEMA.sections[name];
          if (!spec) return "";
          var n = countOf(name);
          return '<button class="tile" type="button" data-section="' + esc(name) + '">' +
            '<span class="tile-ico">' + icon(spec.icon, 18) + "</span>" +
            "<span><b>" + esc(spec.label) + "</b><small>" +
              (n === null ? "Settings" : n + " item" + (n === 1 ? "" : "s")) +
            "</small></span></button>";
        }).join("") + "</div>";
    }).join("");

    /* Three states: never published, published with pending edits, in sync. */
    var head, sub, cta;
    if (!published) {
      head = "Not published yet";
      sub  = "The public site is still showing the content committed in the repository. " +
             "Publish once to hand it over to this panel.";
      cta  = "Publish for the first time";
    } else if (pending) {
      head = pending + " section" + (pending === 1 ? "" : "s") + " waiting to go live";
      sub  = "Your changes are saved, but the public site still shows what you last published — " +
             ago(lastPublishedAt) + ".";
      cta  = "Publish changes";
    } else {
      head = "Everything is published";
      sub  = "The live site matches what you see here. Last published " + ago(lastPublishedAt) + ".";
      cta  = "Publish anyway";
    }

    $("content").innerHTML =
      '<div class="hero-card">' +
        "<div><h2>" + esc(head) + "</h2><p>" + esc(sub) + "</p></div>" +
        '<div style="display:flex;gap:9px;flex:none">' +
          '<a class="btn btn--line" href="/" target="_blank" rel="noopener">Open site</a>' +
          '<button class="btn btn--gold" type="button" data-publish="1">' + esc(cta) + "</button>" +
        "</div>" +
      "</div>" +
      (pending
        ? '<div class="card"><div class="card-head"><div><h2>Not yet published</h2>' +
          "<p>Click a section to review it before publishing.</p></div></div>" +
          '<div class="rows">' + changes.map(function (c) {
            var spec = SCHEMA.sections[c.name];
            return '<div class="row"><button class="row-open" type="button" data-section="' + esc(c.name) + '">' +
              '<span class="row-num">' + icon(spec.icon, 14) + "</span>" +
              '<span class="row-text"><span class="row-title">' + esc(spec.label) + "</span>" +
              '<span class="row-sub">' + esc(c.detail) + "</span></span></button></div>";
          }).join("") + "</div></div>"
        : "") +
      tiles +
      '<div class="section-title">Publish history</div>' +
      '<div class="card"><div id="historyList"><div class="card-body">' +
        '<div class="skeleton" style="width:60%"></div></div></div></div>';

    renderHistory();
  }

  /* Which sections differ from what the public site is serving. */
  function changedSections() {
    if (!published) return [];
    return ORDER.filter(function (name) {
      return !same(model[name], published[name]);
    }).map(function (name) {
      var spec = SCHEMA.sections[name];
      var a = countOf(name);
      var b = published[name]
        ? (spec.kind === "list" ? published[name].length
          : spec.kind === "map" ? Object.keys(published[name]).length : null)
        : null;
      var detail = "edited";
      if (a !== null && b !== null && a !== b) {
        detail = (a > b ? "+" + (a - b) + " added" : (b - a) + " removed");
      }
      return { name: name, detail: detail };
    });
  }

  /* ---- one record: hero, about, org, or an item inside a collection ---- */
  function renderRecord(spec, rec, base, title, blurb, extraHTML) {
    var tabs = tabsFor(spec);
    var body;

    if (tabs) {
      var t = tabs[Math.min(view.tab, tabs.length - 1)];
      body =
        '<div class="tabs">' + tabs.map(function (x, i) {
          return '<button class="tab' + (i === view.tab ? " on" : "") + '" type="button" data-tab="' + i + '">' +
            esc(x.label) + "</button>";
        }).join("") + "</div>" +
        '<div class="card-body">' + (extraHTML && view.tab === 0 ? extraHTML : "") +
          '<div class="fields">' + fieldsHTML(t.fields, rec, base) + "</div></div>";
    } else {
      body = '<div class="card-body">' + (extraHTML || "") +
             '<div class="fields">' + fieldsHTML(spec.fields, rec, base) + "</div></div>";
    }

    $("content").innerHTML =
      '<div class="card">' +
        (blurb || spec.hint
          ? '<div class="card-head"><div><h2>' + esc(title) + "</h2>" +
            (blurb ? "<p>" + esc(blurb) + "</p>" : "") + "</div></div>"
          : "") +
        (spec.hint ? '<div style="padding:14px 20px 0"><div class="note">' + icon("alert", 16) +
                     "<span>" + esc(spec.hint) + "</span></div></div>" : "") +
        body +
      "</div>";
  }

  /* ---- the index of a list or map ---- */
  function renderCollection(spec) {
    var name = view.section;
    crumb("");
    heading(spec.label);

    var isMap = spec.kind === "map";
    var keys  = isMap ? Object.keys(model[name] || {}) : null;
    var items = isMap ? keys.map(function (k) { return model[name][k]; }) : (model[name] || []);

    var q = view.q.toLowerCase();
    var shown = items.map(function (rec, i) { return { rec: rec, i: i }; })
      .filter(function (x) {
        if (!q) return true;
        return JSON.stringify(x.rec).toLowerCase().indexOf(q) !== -1;
      });

    var rows = shown.map(function (x) {
      var rec = x.rec, i = x.i;
      var sub = spec.subtitleKey ? rec[spec.subtitleKey] : (isMap ? keys[i] : "");
      var tag = spec.tagKey ? rec[spec.tagKey] : "";
      var thumb = spec.thumbKey ? rec[spec.thumbKey] : "";
      return '<div class="row">' +
        '<button class="row-open" type="button" data-open="' + i + '">' +
          (thumb
            ? '<img class="row-thumb" src="' + esc(imgSrc(thumb)) + '" alt="" loading="lazy">'
            : '<span class="row-num">' + (i + 1) + "</span>") +
          '<span class="row-text">' +
            '<span class="row-title">' + esc(titleOf(rec, spec, i)) + "</span>" +
            (sub ? '<span class="row-sub">' + esc(String(sub).slice(0, 110)) + "</span>" : "") +
          "</span>" +
          (tag ? '<span class="pill">' + esc(tag) + "</span>" : "") +
        "</button>" +
        '<div class="row-btns">' +
          (isMap ? "" :
            '<button class="icon-btn" type="button" data-move="' + i + '" data-dir="-1" title="Move up"' +
              (i === 0 ? " disabled" : "") + ">" + icon("up", 14) + "</button>" +
            '<button class="icon-btn" type="button" data-move="' + i + '" data-dir="1" title="Move down"' +
              (i === items.length - 1 ? " disabled" : "") + ">" + icon("down", 14) + "</button>") +
          '<button class="icon-btn danger" type="button" data-del="' + i + '" title="Delete">' +
            icon("trash", 14) + "</button>" +
        "</div></div>";
    }).join("");

    var addLabel = "Add " + (spec.fallbackTitle || "item").toLowerCase();

    $("content").innerHTML =
      '<div class="card">' +
        '<div class="card-head"><div><h2>' + esc(spec.label) + "</h2>" +
          (spec.blurb ? "<p>" + esc(spec.blurb) + "</p>" : "") + "</div>" +
          '<button class="btn btn--primary btn--sm" type="button" data-add="1">' +
            icon("plus", 14) + esc(addLabel) + "</button></div>" +
        (spec.hint ? '<div style="padding:14px 20px 0"><div class="note">' + icon("alert", 16) +
                     "<span>" + esc(spec.hint) + "</span></div></div>" : "") +
        (spec.searchable && items.length > 5
          ? '<div class="toolbar"><div class="search">' + icon("search", 15) +
            '<input id="listSearch" placeholder="Search ' + esc(spec.label.toLowerCase()) + '…" ' +
            'value="' + esc(view.q) + '"></div>' +
            '<span class="count">' + shown.length + " of " + items.length + "</span></div>"
          : "") +
        (rows
          ? '<div class="rows">' + rows + "</div>"
          : '<div class="empty">' + icon("box", 30) + "<p>" +
            (q ? "Nothing matches “" + esc(view.q) + "”." : "Nothing here yet.") + "</p></div>") +
        '<div class="list-foot"><button class="add-btn" type="button" data-add="1">' +
          icon("plus", 14) + esc(addLabel) + "</button></div>" +
      "</div>";

    var s = $("listSearch");
    if (s) {
      s.addEventListener("input", function () {
        view.q = s.value;
        var pos = s.selectionStart;
        renderCollection(spec);
        var s2 = $("listSearch");
        if (s2) { s2.focus(); s2.setSelectionRange(pos, pos); }
      });
    }
  }

  /* ---- one record inside a list or map ---- */
  function renderItem(spec) {
    var name = view.section;
    var isMap = spec.kind === "map";
    var keys  = isMap ? Object.keys(model[name] || {}) : null;
    var key   = isMap ? keys[view.item] : view.item;
    var rec   = isMap ? model[name][key] : (model[name] || [])[view.item];
    if (rec == null) { go(name); return; }

    crumb('<button type="button" data-back="1">' + esc(spec.label) + "</button> &rsaquo;");
    heading(titleOf(rec, spec, view.item));

    var extra = isMap
      ? '<div class="fields" style="margin-bottom:16px"><div class="field field--full">' +
        "<label>" + esc(spec.keyLabel || "Key") + "</label>" +
        '<p class="hint">Renaming this changes the page URL.</p>' +
        '<input value="' + esc(key) + '" data-rekey="' + esc(key) + '"></div></div>'
      : "";

    renderRecord(spec, rec, [name].concat(isMap ? [key] : [view.item]),
                 titleOf(rec, spec, view.item), null, extra);

    /* actions above the card */
    $("content").insertAdjacentHTML("afterbegin",
      '<div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:14px">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-back="1">' +
          icon("back", 14) + "All " + esc(spec.label.toLowerCase()) + "</button>" +
        '<button class="btn btn--danger btn--sm" type="button" data-del="' + view.item + '">' +
          icon("trash", 14) + "Delete</button>" +
      "</div>");
  }

  /* ---------------------------------------------------------------- fields */

  function fieldsHTML(fields, rec, base) {
    return fields.map(function (f) {
      return fieldHTML(f, rec ? rec[f.k] : undefined, base.concat([f.k]));
    }).join("");
  }

  function labelHTML(f) {
    return "<label>" + esc(f.label) + "</label>" +
      (f.hint ? '<p class="hint">' + esc(f.hint) + "</p>" : "");
  }

  function fieldHTML(f, value, path) {
    var cls = "field" + (f.full ? " field--full" : "");
    var body;

    switch (f.type) {

      case "textarea":
        body = '<textarea rows="' + (f.rows || 3) + '" data-path="' + p(path) + '">' +
               esc(value) + "</textarea>";
        break;

      case "number":
        var shown = (value == null || value === "") ? "" : (f.scale ? (+value / f.scale) : value);
        body = '<input type="number" data-path="' + p(path) + '" data-num="1"' +
               (f.scale ? ' data-scale="' + f.scale + '"' : "") +
               (f.min != null ? ' min="' + f.min + '"' : "") +
               (f.max != null ? ' max="' + f.max + '"' : "") +
               (f.step != null ? ' step="' + f.step + '"' : "") +
               ' value="' + esc(shown) + '">';
        break;

      case "date":
        body = '<input type="date" data-path="' + p(path) + '" value="' + esc(value) + '">';
        break;

      case "bool":
        return '<div class="' + cls + '">' + labelHTML(f) +
          '<div class="switch-row"><label class="switch">' +
          '<input type="checkbox" data-path="' + p(path) + '" data-bool="1"' +
          (value === false ? "" : " checked") + "><span></span></label>" +
          "<em>" + (value === false ? "Off" : "On") + "</em></div></div>";

      case "select":
        var opts = (f.options || []).slice();
        if (f.free && value && opts.indexOf(value) === -1) opts.unshift(value);
        body = '<select data-path="' + p(path) + '"' + (f.free ? ' data-free="1"' : "") + ">" +
          opts.map(function (o) {
            return '<option' + (o === value ? " selected" : "") + ">" + esc(o) + "</option>";
          }).join("") +
          (f.free ? '<option value="__other">Other…</option>' : "") + "</select>";
        break;

      case "image":
        body = '<div class="image-field">' +
          (value
            ? '<img class="thumb" src="' + esc(imgSrc(value)) + '" alt="" loading="lazy">'
            : '<span class="thumb thumb--none">' + icon("image", 20) + "</span>") +
          '<span class="stack"><span class="r">' +
            '<input data-path="' + p(path) + '" value="' + esc(value) + '" placeholder="assets/img/…">' +
          "</span>" +
          '<span class="r"><button class="btn btn--ghost btn--sm" type="button" data-pick="' + p(path) + '">' +
            icon("image", 14) + "Choose image</button>" +
            (value ? '<button class="btn btn--ghost btn--sm" type="button" data-clear="' + p(path) + '">Clear</button>' : "") +
          "</span></span></div>";
        break;

      case "strings": body = stringsHTML(f, value || [], path); break;
      case "pairs":   body = pairsHTML(f, value || [], path); break;
      case "objects": body = objectsHTML(f, value || [], path); break;

      case "group":
        return '<div class="field field--full"><fieldset class="group">' +
          "<legend>" + esc(f.label) + "</legend>" +
          (f.hint ? '<p class="hint">' + esc(f.hint) + "</p>" : "") +
          '<div class="fields">' + fieldsHTML(f.fields, value || {}, path) + "</div>" +
          "</fieldset></div>";

      default:
        body = '<input data-path="' + p(path) + '" value="' + esc(value) + '">';
    }

    return '<div class="' + cls + '">' + labelHTML(f) + body + "</div>";
  }

  function moveBtns(path, i, len) {
    return '<button class="icon-btn" type="button" data-rmove="' + p(path) + '" data-i="' + i +
        '" data-dir="-1" title="Move up"' + (i === 0 ? " disabled" : "") + ">" + icon("up", 13) + "</button>" +
      '<button class="icon-btn" type="button" data-rmove="' + p(path) + '" data-i="' + i +
        '" data-dir="1" title="Move down"' + (i === len - 1 ? " disabled" : "") + ">" + icon("down", 13) + "</button>" +
      '<button class="icon-btn danger" type="button" data-rdel="' + p(path) + '" data-i="' + i +
        '" title="Remove">' + icon("trash", 13) + "</button>";
  }

  function addBtn(path, shape, label) {
    return '<button class="add-btn" type="button" data-radd="' + p(path) + '" data-shape="' + shape + '">' +
      icon("plus", 14) + esc(label) + "</button>";
  }

  function stringsHTML(f, list, path) {
    return '<div class="repeat">' +
      list.map(function (v, i) {
        return '<div class="repeat-row"><span class="grip">' + (i + 1) + "</span>" +
          '<input data-path="' + p(path.concat([i])) + '" value="' + esc(v) + '">' +
          moveBtns(path, i, list.length) + "</div>";
      }).join("") +
      addBtn(path, "strings", "Add line") + "</div>";
  }

  function pairsHTML(f, list, path) {
    return '<div class="repeat">' +
      list.map(function (pair, i) {
        var A = (pair || [])[0], B = (pair || [])[1];
        return '<div class="repeat-block"><div class="repeat-block__head">' +
            "<b>" + esc(String(A || "").trim() || ((f.aLabel || "Item") + " " + (i + 1))) + "</b>" +
            moveBtns(path, i, list.length) + "</div>" +
          '<div class="fields">' +
            '<div class="field field--full"><label>' + esc(f.aLabel || "Heading") + "</label>" +
              '<input data-path="' + p(path.concat([i, 0])) + '" value="' + esc(A) + '"></div>' +
            '<div class="field field--full"><label>' + esc(f.bLabel || "Text") + "</label>" +
              (f.bType === "textarea"
                ? '<textarea rows="3" data-path="' + p(path.concat([i, 1])) + '">' + esc(B) + "</textarea>"
                : '<input data-path="' + p(path.concat([i, 1])) + '" value="' + esc(B) + '">') +
            "</div></div></div>";
      }).join("") +
      addBtn(path, "pairs", "Add " + String(f.aLabel || "item").toLowerCase()) + "</div>";
  }

  function objectsHTML(f, list, path) {
    return '<div class="repeat">' +
      list.map(function (rec, i) {
        if (typeof rec === "string") { rec = { src: rec }; list[i] = rec; }
        var t = (rec && f.titleKey ? rec[f.titleKey] : "") || (f.fallbackTitle + " " + (i + 1));
        var thumb = f.thumbKey ? rec[f.thumbKey] : "";
        return '<div class="repeat-block"><div class="repeat-block__head">' +
            (thumb ? '<img src="' + esc(imgSrc(thumb)) + '" alt="" loading="lazy">' : "") +
            "<b>" + esc(t) + "</b>" + moveBtns(path, i, list.length) + "</div>" +
          '<div class="fields">' + fieldsHTML(f.fields, rec, path.concat([i])) + "</div></div>";
      }).join("") +
      addBtn(path, "objects", "Add " + String(f.fallbackTitle || "item").toLowerCase()) + "</div>";
  }

  /* ---------------------------------------------------------------- events */

  document.addEventListener("input", function (e) {
    var el = e.target;
    if (!el.dataset || !el.dataset.path) return;

    /* "Other…" is a prompt, not a value. Leave the model alone so cancelling
       the prompt leaves the previous choice in place. */
    if (el.dataset.free && el.value === "__other") return;

    var path = JSON.parse(el.dataset.path);
    if (el.dataset.num) {
      var raw = el.value === "" ? null : parseFloat(el.value);
      setAt(path, raw == null ? null : (el.dataset.scale ? Math.round(raw * +el.dataset.scale) : raw));
    } else {
      setAt(path, el.value);
    }
    touch();
  });

  document.addEventListener("change", function (e) {
    var el = e.target;

    if (el.dataset && el.dataset.rekey) {
      var from = el.dataset.rekey, to = el.value.trim();
      if (!to || to === from) { el.value = from; return; }
      var src = model[view.section], out = {};
      if (src[to]) { toast("A page with that slug already exists", "error"); el.value = from; return; }
      Object.keys(src).forEach(function (k) { out[k === from ? to : k] = src[k]; });
      model[view.section] = out;
      touch(); render();
      return;
    }

    if (!el.dataset || !el.dataset.path) return;

    if (el.dataset.bool) {
      setAt(JSON.parse(el.dataset.path), el.checked);
      touch();
      var em = el.closest(".switch-row").querySelector("em");
      if (em) em.textContent = el.checked ? "On" : "Off";
      return;
    }

    if (el.tagName === "SELECT" && el.dataset.free && el.value === "__other") {
      var v = prompt("Enter a value");
      if (v) { setAt(JSON.parse(el.dataset.path), v); touch(); }
      render();
    }
  });

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    var spec = SCHEMA.sections[view.section];

    if (t.dataset.section) { go(t.dataset.section); return; }
    if (t.dataset.back)    { go(view.section); return; }
    if (t.dataset.tab)     { view.tab = +t.dataset.tab; render(); return; }
    if (t.dataset.publish) { openPublish(); return; }

    if (t.dataset.open)  { go(view.section, +t.dataset.open); return; }
    if (t.dataset.move)  { moveItem(+t.dataset.move, +t.dataset.dir); return; }
    if (t.dataset.del)   { deleteItem(+t.dataset.del, spec); return; }
    if (t.dataset.add)   { addItem(spec); return; }

    if (t.dataset.radd)  { repeatAdd(JSON.parse(t.dataset.radd), t.dataset.shape); return; }
    if (t.dataset.rdel)  { repeatDel(JSON.parse(t.dataset.rdel), +t.dataset.i); return; }
    if (t.dataset.rmove) { repeatMove(JSON.parse(t.dataset.rmove), +t.dataset.i, +t.dataset.dir); return; }

    if (t.dataset.pick)  { openPicker(JSON.parse(t.dataset.pick)); return; }
    if (t.dataset.clear) { setAt(JSON.parse(t.dataset.clear), ""); touch(); render(); return; }
  });

  /* ---- collection edits ---- */

  function moveItem(i, dir) {
    var list = model[view.section], j = i + dir;
    if (j < 0 || j >= list.length) return;
    var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    touch(); renderNav(); render();
  }

  function deleteItem(i, spec) {
    var isMap = spec.kind === "map";
    var label = isMap ? Object.keys(model[view.section])[i]
                      : titleOf(model[view.section][i], spec, i);
    if (!confirm("Delete “" + label + "”?\n\nThe last published version can still be restored from the dashboard.")) return;

    if (isMap) delete model[view.section][label];
    else       model[view.section].splice(i, 1);

    touch(); renderNav();
    go(view.section);
    toast("Deleted");
  }

  function addItem(spec) {
    var fresh = clone(spec.newItem || {});
    if (spec.kind === "map") {
      var key = prompt("Page slug", "new-policy");
      if (!key) return;
      key = key.trim();
      if (model[view.section][key]) { toast("That slug is already used", "error"); return; }
      model[view.section][key] = fresh;
      touch(); renderNav();
      go(view.section, Object.keys(model[view.section]).indexOf(key));
    } else {
      model[view.section].push(fresh);
      touch(); renderNav();
      go(view.section, model[view.section].length - 1);
    }
  }

  /* ---- repeater edits ---- */

  function repeatList(path) {
    var list = getAt(path);
    if (!Array.isArray(list)) { list = []; setAt(path, list); }
    return list;
  }

  function repeatAdd(path, shape) {
    var list = repeatList(path);
    if (shape === "pairs")        list.push(["", ""]);
    else if (shape === "objects") list.push(clone(objectsSpec(path).newItem || {}));
    else                          list.push("");
    touch(); render();
  }

  function repeatDel(path, i) { repeatList(path).splice(i, 1); touch(); render(); }

  function repeatMove(path, i, dir) {
    var list = repeatList(path), j = i + dir;
    if (j < 0 || j >= list.length) return;
    var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    touch(); render();
  }

  /* Find the schema entry for an "objects" repeater so a new row starts with
     the right keys rather than as an empty object. */
  function objectsSpec(path) {
    var spec = SCHEMA.sections[view.section];
    var key = path[path.length - 1];
    var found = null;
    (function walk(fields) {
      (fields || []).forEach(function (f) {
        if (f.k === key && f.type === "objects") found = f;
        if (f.fields) walk(f.fields);
      });
    })(spec.fields);
    return found || {};
  }

  /* ----------------------------------------------------------------- media */

  async function loadMedia() {
    var res = await sb.storage.from(CFG.imageBucket).list("", {
      limit: 500, sortBy: { column: "created_at", order: "desc" }
    });
    if (res.error) { toast("Could not list images: " + res.error.message, "error"); return; }
    /* f.id is null for the placeholder row Supabase returns for a folder */
    mediaFiles = (res.data || []).filter(function (f) {
      return f.id && /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(f.name);
    });
  }

  async function openPicker(path) {
    pickerTarget = path;
    $("picker").classList.add("open");
    $("pickerGrid").innerHTML = '<p style="color:var(--s500);font-size:.85rem">Loading…</p>';
    await loadMedia();
    renderPicker();
  }

  function closePicker() { $("picker").classList.remove("open"); pickerTarget = null; }

  function renderPicker() {
    var uploaded = mediaFiles.map(function (f) {
      return { name: f.name, value: publicUrl(CFG.imageBucket, f.name), removable: true };
    });
    var shipped = (window.SW_BUNDLED_IMAGES || []).map(function (n) {
      return { name: n.split("/").pop(), value: n, removable: false };
    });
    var all = uploaded.concat(shipped);

    $("pickerGrid").innerHTML = all.length ? all.map(function (im) {
      return '<div class="mtile">' +
        '<button class="mtile-pick" type="button" data-use="' + esc(im.value) + '">' +
          '<img src="' + esc(imgSrc(im.value)) + '" alt="" loading="lazy">' +
        "</button>" +
        '<div class="mtile-foot"><span title="' + esc(im.name) + '">' + esc(im.name) + "</span>" +
          (im.removable
            ? '<button class="icon-btn danger" type="button" data-unlink="' + esc(im.name) +
              '" title="Delete" style="width:22px;height:22px">' + icon("trash", 12) + "</button>"
            : '<span class="mtile-tag">built in</span>') +
        "</div></div>";
    }).join("") : '<div class="empty" style="grid-column:1/-1">' + icon("image", 30) +
                  "<p>No images uploaded yet.</p></div>";
  }

  async function uploadImages(files) {
    var ok = 0;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (!file.type || file.type.indexOf("image/") !== 0) continue;

      /* Keep names unique so a new upload never silently replaces an image
         another page is already using. */
      var clean = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-").replace(/-+/g, "-");
      var name = Date.now().toString(36) + "-" + clean;

      var res = await sb.storage.from(CFG.imageBucket)
        .upload(name, file, { cacheControl: "31536000", contentType: file.type });
      if (res.error) { toast("Upload failed: " + res.error.message, "error"); continue; }
      ok++;
    }
    if (ok) {
      await loadMedia();
      renderPicker();
      toast(ok + " image" + (ok === 1 ? "" : "s") + " uploaded");
    }
  }

  /* --------------------------------------------------------------- publish */

  function buildDataJs() {
    var keys = Object.keys(model).filter(function (k) { return model[k] != null; });
    var body = keys.map(function (k) {
      return "  const " + k + " = " + JSON.stringify(model[k], null, 2) + ";";
    }).join("\n\n");

    return "/* ==========================================================================\n" +
           "   SWAMITRA Foundation — published content\n" +
           "   Generated by the admin panel on " + new Date().toISOString() + ".\n" +
           "   Do not edit by hand: the next publish overwrites this file.\n" +
           "   ========================================================================== */\n\n" +
           "window.SWAMITRA = (function () {\n" + body + "\n\n" +
           "  return { " + keys.join(", ") + " };\n})();\n";
  }

  function openPublish() {
    var changes = changedSections();
    $("changeSummary").innerHTML = !published
      ? '<div class="note">' + icon("alert", 16) +
        "<span>Nothing has been published yet. This first publish makes the live site read from Supabase.</span></div>"
      : changes.length
        ? "<p style=\"font-size:.85rem;color:var(--s600)\">Going live:</p><ul class=\"change-list\">" +
          changes.map(function (c) {
            return '<li><i class="dot2"></i>' + esc(SCHEMA.sections[c.name].label) +
                   "<small>" + esc(c.detail) + "</small></li>";
          }).join("") + "</ul>"
        : '<div class="note">' + icon("alert", 16) +
          "<span>Nothing has changed since the last publish.</span></div>";
    $("publishSheet").classList.add("open");
    setTimeout(function () { $("publishNote").focus(); }, 40);
  }

  function closePublish() { $("publishSheet").classList.remove("open"); }

  async function publish() {
    var btn = $("publishGo");
    btn.disabled = true;
    btn.textContent = "Publishing…";

    try {
      if (dirty) {
        clearTimeout(saveTimer);
        if (!await saveDraft(true)) throw new Error("could not save the draft first");
      }

      var up = await sb.storage.from(CFG.contentBucket).upload(
        CFG.contentFile,
        new Blob([buildDataJs()], { type: "application/javascript" }),
        { upsert: true, contentType: "application/javascript", cacheControl: "60" }
      );
      if (up.error) throw up.error;

      var user = (await sb.auth.getUser()).data.user;
      var rev = await sb.from("site_revision").insert({
        lang: LANG, data: model,
        note: $("publishNote").value.trim() || null,
        published_by: user ? user.id : null
      });
      if (rev.error) throw rev.error;

      published = clone(model);
      lastPublishedAt = new Date().toISOString();
      $("publishNote").value = "";
      closePublish();
      toast("Published — the live site is updated");
      if (view.section === null) render();
    } catch (err) {
      toast("Publish failed: " + (err.message || err), "error");
    }

    btn.disabled = false;
    btn.textContent = "Publish now";
  }

  /* --------------------------------------------------------------- history */

  async function renderHistory() {
    var el = $("historyList");
    if (!el) return;

    var res = await sb.from("site_revision")
      .select("id, note, published_at").eq("lang", LANG)
      .order("published_at", { ascending: false }).limit(20);

    if (res.error) { el.innerHTML = '<div class="card-body" style="color:var(--red)">' + esc(res.error.message) + "</div>"; return; }
    if (!res.data.length) {
      el.innerHTML = '<div class="empty">' + icon("history", 30) + "<p>Nothing published yet.</p></div>";
      return;
    }

    el.innerHTML = '<div class="rows">' + res.data.map(function (r, i) {
      return '<div class="row"><div class="row-open" style="cursor:default">' +
        '<span class="row-num">' + icon("history", 13) + "</span>" +
        '<span class="row-text"><span class="row-title">' +
          new Date(r.published_at).toLocaleString() + "</span>" +
          '<span class="row-sub">' + esc(r.note || "No note") + "</span></span>" +
        (i === 0 ? '<span class="pill">live</span>' : "") + "</div>" +
        (i === 0 ? "" :
          '<div class="row-btns" style="opacity:1"><button class="btn btn--ghost btn--sm" type="button" ' +
          'data-restore="' + r.id + '">Restore</button></div>') +
      "</div>";
    }).join("") + "</div>";
  }

  document.addEventListener("click", async function (e) {
    var b = e.target.closest("[data-restore]");
    if (!b) return;
    if (!confirm("Load this version into your draft?\n\nNothing goes live until you press Publish.")) return;

    var res = await sb.from("site_revision").select("data").eq("id", b.dataset.restore).single();
    if (res.error) { toast(res.error.message, "error"); return; }

    model = res.data.data;
    await saveDraft(true);
    renderNav();
    render();
    toast("Version loaded into your draft — press Publish to make it live");
  });

  /* ------------------------------------------------------------------ boot */

  /* Signing in is not the same as being allowed to edit: row level security
     only lets through accounts listed in admin_user. Without this check the
     panel opens looking perfectly normal and then silently fails to save
     anything, which is a far worse way to find out. */
  async function isAdmin(user) {
    if (!user) return false;
    var res = await sb.from("admin_user").select("user_id").eq("user_id", user.id).maybeSingle();
    return !res.error && !!res.data;
  }

  async function start() {
    var user = (await sb.auth.getUser()).data.user;

    if (!await isAdmin(user)) {
      await sb.auth.signOut();
      showLogin("That account is signed in but is not an admin yet. Run this in the " +
        "Supabase SQL editor, then sign in again:\n\n" +
        "insert into public.admin_user (user_id, email)\n" +
        "select id, email from auth.users where email = '" + (user ? user.email : "you@example.com") + "'\n" +
        "on conflict (user_id) do nothing;");
      return;
    }

    $("loginScreen").style.display = "none";
    $("app").classList.add("open");
    status("Loading…", "busy");

    try {
      await loadContent();
      await loadPublished();
    } catch (err) {
      showLogin(err.message + " — check that supabase/schema.sql has been run.");
      return;
    }

    var email = user.email || "";
    $("who").textContent = email;
    $("who").title = email;
    $("avatar").textContent = (email[0] || "?");

    status(dirty ? "Unsaved changes" : "Saved", dirty ? "warn" : "ok");
    renderNav();
    go("__home");
  }

  async function boot() {
    if (!connected()) {
      showLogin("Supabase is not configured yet — fill in site/admin/config.js.");
      $("loginForm").style.display = "none";
      return;
    }

    sb = window.supabase.createClient(CFG.url, CFG.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });

    $("loginForm").addEventListener("submit", signIn);
    $("signOut").addEventListener("click", signOut);
    $("publishBtn").addEventListener("click", openPublish);
    $("publishGo").addEventListener("click", publish);
    $("pickerClose").addEventListener("click", closePicker);

    $("menuBtn").addEventListener("click", function () {
      $("sidebar").classList.toggle("open");
      $("scrim").classList.toggle("on");
    });
    $("scrim").addEventListener("click", closeSidebar);

    $("publishSheet").addEventListener("click", function (e) {
      if (e.target.id === "publishSheet" || e.target.closest("[data-close]")) closePublish();
    });

    $("picker").addEventListener("click", function (e) {
      if (e.target.id === "picker") { closePicker(); return; }
      var b = e.target.closest("button");
      if (!b) return;

      if (b.dataset.use) {
        setAt(pickerTarget, b.dataset.use);
        touch(); closePicker(); render();
        return;
      }
      if (b.dataset.unlink) {
        (async function (name) {
          if (!confirm("Delete " + name + "?\n\nAny page still pointing at it will show a broken image.")) return;
          var res = await sb.storage.from(CFG.imageBucket).remove([name]);
          if (res.error) { toast(res.error.message, "error"); return; }
          await loadMedia(); renderPicker(); toast("Deleted");
        })(b.dataset.unlink);
      }
    });

    $("pickerFile").addEventListener("change", function (e) {
      uploadImages([].slice.call(e.target.files));
      e.target.value = "";
    });

    var drop = $("pickerDrop");
    drop.addEventListener("click", function () { $("pickerFile").click(); });
    drop.addEventListener("dragover", function (e) { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", function () { drop.classList.remove("over"); });
    drop.addEventListener("drop", function (e) {
      e.preventDefault(); drop.classList.remove("over");
      uploadImages([].slice.call(e.dataTransfer.files));
    });

    window.addEventListener("beforeunload", function (e) {
      if (dirty) { e.preventDefault(); e.returnValue = ""; }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closePicker(); closePublish(); closeSidebar(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); saveDraft(); }
    });

    var session = (await sb.auth.getSession()).data.session;
    if (session) await start();
    else showLogin();
  }

  boot();
})();

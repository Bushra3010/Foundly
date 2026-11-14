/* Foundly portfolio demo kit (vanilla port of DemoMode.tsx): "Live demo · sample data" pill + panel,
   Reset demo data (clears only this demo's namespaced storage + IndexedDB), and blocks real-world side effects. */
(function () {
  var SLUG = "backseat", BASE = "/demos/backseat/";
  var TITLE = "Backseat";
  var BLURB = "A passenger media player. Try the Sample playlist: play a channel, star favourites, search, open car mode and the Cast to Car tab. Channels are made-up test patterns; nothing is loaded from the internet.";
  var APPS = [
    { href: BASE, name: "Phone preview", login: "The web app inside an iPhone frame" },
    { href: BASE + "app/", name: "Web app (full screen)", login: "No login needed" },
    { href: BASE + "about/", name: "Product page", login: "Features, casting and pricing" }
  ];
  var BLOCKED = /^(https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|checkout\.razorpay\.com|rzp\.io|pay\.google\.com|buy\.stripe\.com|checkout\.stripe\.com)|tel:|upi:|mailto:|sms:|intent:)/i;
  function what(h) { return /whatsapp|wa\.me/i.test(h) ? "send a WhatsApp message" : /^tel:/.test(h) ? "start a phone call" : /^upi:/.test(h) ? "open a UPI payment app" : /^sms:/.test(h) ? "send an SMS" : /^mailto:/.test(h) ? "send an email" : "take a real payment"; }

  function reset() {
    var prefix = "demo:" + SLUG + ":";
    [window.localStorage, window.sessionStorage].forEach(function (store) {
      try {
        var keyFn = Storage.prototype.__rawKey || Storage.prototype.key, rm = Storage.prototype.__rawRemove || Storage.prototype.removeItem;
        for (var i = store.length - 1; i >= 0; i--) { var k = keyFn.call(store, i); if (k && k.indexOf(prefix) === 0) rm.call(store, k); }
      } catch (e) {}
    });
    var done = false, go = function () { if (!done) { done = true; window.location.reload(); } };
    try { var r = indexedDB.deleteDatabase("demo:" + SLUG); r.onsuccess = r.onerror = go; } catch (e) { go(); }
    setTimeout(go, 1500);
  }

  // Inside the phone-frame preview the outer page shows the pill, so the framed app does not.
  var framed = false;
  try { framed = window.top !== window && window.top.location.pathname.indexOf(BASE) === 0; } catch (e) {}

  var toastEl, toastTimer;
  function say(h) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "fdemo-toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = "Demo mode: in the real app this would " + what(h) + ". Nothing was sent.";
    toastEl.style.display = "block"; clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.style.display = "none"; }, 3800);
  }
  var origOpen = window.open.bind(window);
  window.open = function (u) { var h = String(u || ""); if (BLOCKED.test(h)) { say(h); return null; } return origOpen.apply(window, arguments); };
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    var h = a ? a.getAttribute("href") || "" : "";
    if (a && BLOCKED.test(h)) { e.preventDefault(); e.stopPropagation(); say(h); }
  }, true);
  try { navigator.serviceWorker && navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { if (r.scope.indexOf("/demos/" + SLUG) >= 0) r.unregister(); }); }).catch(function () {}); } catch (e) {}

  function mount() {
    var css = document.createElement("style");
    css.textContent = '.fdemo{position:fixed;left:12px;bottom:12px;z-index:2147483000;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:13px;line-height:1.35}' +
      '.fdemo *{box-sizing:border-box}' +
      '.fdemo-pill{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;border:0;border-radius:999px;background:#20221e;color:#fff;font-weight:600;cursor:pointer;box-shadow:0 10px 24px -12px #000a;font:inherit}' +
      '.fdemo-pill i{width:7px;height:7px;border-radius:50%;background:#a4cd48}' +
      '.fdemo-panel{margin-bottom:8px;width:280px;max-height:70vh;overflow:auto;padding:14px;border-radius:16px;background:#20221e;color:#fff;box-shadow:0 18px 40px -16px #000a}' +
      '.fdemo-panel[hidden]{display:none}' +
      '.fdemo-panel p{margin:4px 0 10px;color:#c9cbc1}' +
      '.fdemo-panel a.app{display:block;padding:8px 10px;margin-bottom:6px;border-radius:10px;background:#ffffff14;color:#fff;text-decoration:none}' +
      '.fdemo-panel a.app span{display:block;color:#c9cbc1;font-size:12px}' +
      '.fdemo-reset{width:100%;margin-top:4px;padding:9px 10px;border:0;border-radius:10px;background:#d6fc74;color:#20221e;font-weight:700;cursor:pointer;font:inherit}' +
      '.fdemo-back{display:block;margin-top:8px;text-align:center;color:#d6fc74;font-size:12px}' +
      '.fdemo-toast{display:none;position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:2147483001;max-width:min(420px,calc(100vw - 32px));padding:10px 14px;border-radius:12px;background:#20221e;color:#fff;font:13px/1.35 system-ui,sans-serif;box-shadow:0 16px 32px -16px #000c}' +
      '@media (max-width:640px){.fdemo{left:0;bottom:auto;top:42%}.fdemo-pill{border-radius:0 12px 12px 0;padding:10px 8px;writing-mode:vertical-rl;transform:rotate(180deg)}.fdemo-pill i{display:none}.fdemo-panel{position:absolute;left:8px;top:-140px}}';
    document.head.appendChild(css);
    if (framed) return;
    var root = document.createElement("div"); root.className = "fdemo";
    var panel = document.createElement("div"); panel.className = "fdemo-panel"; panel.hidden = true; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "About this demo");
    var html = '<strong style="display:block;font-size:14px"></strong><p></p>';
    panel.innerHTML = html;
    panel.querySelector("strong").textContent = TITLE + " · live demo";
    panel.querySelector("p").textContent = BLURB;
    APPS.forEach(function (a) { var el = document.createElement("a"); el.className = "app"; el.href = a.href; el.target = "_top"; el.innerHTML = "<b></b><span></span>"; el.querySelector("b").textContent = a.name; el.querySelector("span").textContent = a.login || ""; panel.appendChild(el); });
    var btn = document.createElement("button"); btn.type = "button"; btn.className = "fdemo-reset"; btn.textContent = "Reset demo data"; btn.onclick = reset; panel.appendChild(btn);
    var back = document.createElement("a"); back.className = "fdemo-back"; back.href = "/work"; back.target = "_top"; back.textContent = "← Back to Foundly portfolio"; panel.appendChild(back);
    var pill = document.createElement("button"); pill.type = "button"; pill.className = "fdemo-pill"; pill.setAttribute("aria-expanded", "false"); pill.innerHTML = "<i></i> Live demo · sample data";
    pill.onclick = function () { panel.hidden = !panel.hidden; pill.setAttribute("aria-expanded", String(!panel.hidden)); };
    root.appendChild(panel); root.appendChild(pill); document.body.appendChild(root);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();

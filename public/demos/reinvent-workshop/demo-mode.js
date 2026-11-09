/*
 * Foundly portfolio demo kit — vanilla JS port of DemoMode.tsx (same look and behaviour).
 * Configure before loading: window.FDEMO = { slug, title, blurb, apps: [{ href, name, login }], portfolioHref }.
 * - Labels the app as a demo with sample data, links its screens and shows demo logins.
 * - Blocks real-world side effects (WhatsApp, calls, SMS, email, UPI, payment pages) with a notice.
 * - "Reset demo data" clears only this demo's namespaced browser storage, then reloads.
 * Pair with the storage shim inline in <head>.
 */
(function () {
  var cfg = window.FDEMO || {};
  var slug = cfg.slug || "demo";
  var BLOCKED = /^(https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|checkout\.razorpay\.com|rzp\.io|pay\.google\.com|buy\.stripe\.com|checkout\.stripe\.com)|tel:|upi:|mailto:|sms:|intent:)/i;
  function what(href) {
    return /whatsapp|wa\.me/i.test(href) ? "send a WhatsApp message" : href.indexOf("tel:") === 0 ? "start a phone call" : href.indexOf("upi:") === 0 ? "open a UPI payment app" : href.indexOf("sms:") === 0 ? "send an SMS" : href.indexOf("mailto:") === 0 ? "send an email" : "take a real payment";
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function reset() {
    var prefix = "demo:" + slug + ":";
    [window.localStorage, window.sessionStorage].forEach(function (store) {
      try {
        var keyFn = Storage.prototype.__rawKey || Storage.prototype.key;
        var removeFn = Storage.prototype.__rawRemove || Storage.prototype.removeItem;
        for (var i = store.length - 1; i >= 0; i--) {
          var k = keyFn.call(store, i);
          if (k && k.indexOf(prefix) === 0) removeFn.call(store, k);
        }
      } catch (e) { /* storage blocked */ }
    });
    try { indexedDB.deleteDatabase("demo:" + slug); } catch (e) { /* no indexedDB */ }
    if (typeof cfg.onReset === "function") try { cfg.onReset(); } catch (e) {}
    window.location.reload();
  }

  var toastEl = null, toastTimer = 0;
  function say(href) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "fdemo-toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = "Demo mode: in the real app this would " + what(href) + ". Nothing was sent.";
    toastEl.style.display = "";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.style.display = "none"; }, 3800);
  }
  window.fdemoNotice = function (msg) { say(""); toastEl.textContent = msg; };

  var original = window.open.bind(window);
  window.open = function (url) {
    var href = String(url == null ? "" : url);
    if (BLOCKED.test(href)) { say(href); return null; }
    return original.apply(window, arguments);
  };
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    var href = a ? a.getAttribute("href") || "" : "";
    if (a && BLOCKED.test(href)) { e.preventDefault(); e.stopPropagation(); say(href); }
  }, true);
  try {
    navigator.serviceWorker && navigator.serviceWorker.getRegistrations && navigator.serviceWorker.getRegistrations().then(function (rs) {
      rs.forEach(function (r) { if (r.scope.indexOf("/demos/" + slug) !== -1) r.unregister(); });
    }).catch(function () {});
  } catch (e) {}

  var css = '.fdemo{position:fixed;left:12px;bottom:12px;z-index:2147483000;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:13px;line-height:1.35}' +
    '.fdemo *{box-sizing:border-box}' +
    '.fdemo-pill{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;border:0;border-radius:999px;background:#20221e;color:#fff;font-weight:600;cursor:pointer;box-shadow:0 10px 24px -12px #000a;font:inherit}' +
    '.fdemo-pill i{width:7px;height:7px;border-radius:50%;background:#a4cd48}' +
    '.fdemo-panel{margin-bottom:8px;width:280px;max-height:70vh;overflow:auto;padding:14px;border-radius:16px;background:#20221e;color:#fff;box-shadow:0 18px 40px -16px #000a}' +
    '.fdemo-panel p{margin:4px 0 10px;color:#c9cbc1}' +
    '.fdemo-panel a.app{display:block;padding:8px 10px;margin-bottom:6px;border-radius:10px;background:#ffffff14;color:#fff;text-decoration:none}' +
    '.fdemo-panel a.app span{display:block;color:#c9cbc1;font-size:12px}' +
    '.fdemo-reset{width:100%;margin-top:4px;padding:9px 10px;border:0;border-radius:10px;background:#d6fc74;color:#20221e;font-weight:700;cursor:pointer;font:inherit}' +
    '.fdemo-back{display:block;margin-top:8px;text-align:center;color:#d6fc74;font-size:12px}' +
    '.fdemo-toast{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:2147483001;max-width:min(420px,calc(100vw - 32px));padding:10px 14px;border-radius:12px;background:#20221e;color:#fff;font:13px/1.35 system-ui,sans-serif;box-shadow:0 16px 32px -16px #000c}' +
    '@media (max-width:640px){.fdemo{left:0;bottom:auto;top:42%}.fdemo-pill{border-radius:0 12px 12px 0;padding:10px 8px;writing-mode:vertical-rl;transform:rotate(180deg)}.fdemo-pill i{display:none}.fdemo-panel{position:absolute;left:8px;top:-140px}}';

  function mount() {
    var style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);
    var root = document.createElement("div"); root.className = "fdemo";
    var open = false;
    function render() {
      var html = "";
      if (open) {
        html += '<div class="fdemo-panel" role="dialog" aria-label="About this demo">' +
          '<strong style="display:block;font-size:14px">' + esc(cfg.title) + ' · live demo</strong><p>' + esc(cfg.blurb) + "</p>";
        (cfg.apps || []).forEach(function (a) {
          html += '<a class="app" href="' + esc(a.href) + '"><b>' + esc(a.name) + "</b>" + (a.login ? "<span>" + esc(a.login) + "</span>" : "") + "</a>";
        });
        html += '<button type="button" class="fdemo-reset">Reset demo data</button>' +
          '<a class="fdemo-back" href="' + esc(cfg.portfolioHref || "/work") + '" target="_top">← Back to Foundly portfolio</a></div>';
      }
      html += '<button type="button" class="fdemo-pill" aria-expanded="' + open + '"><i></i> Live demo · sample data</button>';
      root.innerHTML = html;
      root.querySelector(".fdemo-pill").onclick = function () { open = !open; render(); };
      var r = root.querySelector(".fdemo-reset"); if (r) r.onclick = reset;
    }
    render();
    document.body.appendChild(root);
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();

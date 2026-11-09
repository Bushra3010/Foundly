/*
 * Foundly portfolio demo kit — vanilla JS port of DemoMode.tsx (same look and behaviour).
 * - Labels the app as a demo with sample data, links its screens and shows demo logins.
 * - Blocks real-world side effects (WhatsApp, calls, SMS, email, UPI, payment pages) with a notice.
 * - "Reset demo data" clears only this demo's namespaced browser storage, then reloads.
 * Pair with the storage shim inlined in <head>, so this demo's storage never touches foundly.co.in or other demos.
 * Config: window.FDEMO = { slug, title, blurb, apps: [{ href, name, login }], portfolioHref }
 */
(function () {
  'use strict';
  var cfg = window.FDEMO || {};
  var slug = cfg.slug, title = cfg.title || '', blurb = cfg.blurb || '', apps = cfg.apps || [], portfolioHref = cfg.portfolioHref || '/work';
  var BLOCKED = /^(https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|checkout\.razorpay\.com|rzp\.io|pay\.google\.com|buy\.stripe\.com|checkout\.stripe\.com)|tel:|upi:|mailto:|sms:|intent:)/i;
  function what(href) {
    return /whatsapp|wa\.me/i.test(href) ? 'send a WhatsApp message' : href.indexOf('tel:') === 0 ? 'start a phone call' : href.indexOf('upi:') === 0 ? 'open a UPI payment app'
      : href.indexOf('sms:') === 0 ? 'send an SMS' : href.indexOf('mailto:') === 0 ? 'send an email' : 'take a real payment';
  }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function demoStorageReset() {
    var prefix = 'demo:' + slug + ':';
    [window.localStorage, window.sessionStorage].forEach(function (store) {
      try {
        var raw = Object.getPrototypeOf(store);
        var keyFn = raw.__rawKey || Storage.prototype.key;
        var removeFn = raw.__rawRemove || Storage.prototype.removeItem;
        for (var i = store.length - 1; i >= 0; i--) {
          var k = keyFn.call(store, i);
          if (k && k.indexOf(prefix) === 0) removeFn.call(store, k);
        }
      } catch (e) { /* storage blocked */ }
    });
    try { indexedDB.deleteDatabase('demo:' + slug); } catch (e) { /* no indexedDB */ }
  }

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
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.className = 'fdemo';
    var panel = document.createElement('div');
    panel.className = 'fdemo-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'About this demo');
    panel.hidden = true;
    panel.innerHTML = '<strong style="display:block;font-size:14px">' + esc(title) + ' · live demo</strong><p>' + esc(blurb) + '</p>' +
      apps.map(function (a) { return '<a class="app" href="' + esc(a.href) + '"><b>' + esc(a.name) + '</b>' + (a.login ? '<span>' + esc(a.login) + '</span>' : '') + '</a>'; }).join('') +
      '<button type="button" class="fdemo-reset">Reset demo data</button>' +
      '<a class="fdemo-back" href="' + esc(portfolioHref) + '" target="_top">← Back to Foundly portfolio</a>';
    var pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'fdemo-pill';
    pill.setAttribute('aria-expanded', 'false');
    pill.innerHTML = '<i></i> Live demo · sample data';
    root.appendChild(panel);
    root.appendChild(pill);
    document.body.appendChild(root);

    pill.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      pill.setAttribute('aria-expanded', String(!panel.hidden));
    });
    panel.querySelector('.fdemo-reset').addEventListener('click', function () {
      if (typeof cfg.onReset === 'function') cfg.onReset();
      demoStorageReset();
      window.location.reload();
    });
    // Same-page app links (hash routes) should close the panel after navigating.
    panel.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a.app');
      if (a) { panel.hidden = true; pill.setAttribute('aria-expanded', 'false'); }
    });
  }

  var toastEl = null, toastTimer = null;
  function say(href) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'fdemo-toast';
      toastEl.setAttribute('role', 'status');
    }
    toastEl.textContent = 'Demo mode: in the real app this would ' + what(href) + '. Nothing was sent.';
    if (!toastEl.parentNode) document.body.appendChild(toastEl);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl); }, 3800);
  }

  var original = window.open.bind(window);
  window.open = function (url) {
    var href = String(url == null ? '' : url);
    if (BLOCKED.test(href)) { say(href); return null; }
    return original.apply(window, arguments);
  };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    var href = a ? a.getAttribute('href') || '' : '';
    if (a && BLOCKED.test(href)) { e.preventDefault(); e.stopPropagation(); say(href); }
  }, true);
  // Demos share foundly.co.in, so they must never keep a service worker.
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
      navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { if (r.scope.indexOf('/demos/' + slug) !== -1) r.unregister(); }); }).catch(function () {});
    }
  } catch (e) { /* ignore */ }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();

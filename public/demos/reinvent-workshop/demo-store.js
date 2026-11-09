/*
 * Foundly demo: in-browser stand-in for the Netlify Functions (/api/register, /api/admin/*).
 * Registrations live in this browser's localStorage (namespaced by the demo storage shim) and fall back
 * to invented sample data. Same validation rules, duplicate-email check and CSV format as the real functions.
 */
(function () {
  var KEY = "ry_registrations";
  var SESSION = "ry_admin_session";
  // Demo-only admin password (the real one is an environment variable and is not part of this demo).
  var DEMO_PASSWORD = "launchpad-demo";

  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  var PHONE_RE = /^\+?[0-9]{10,15}$/;
  var FIELDS = { name: 100, email: 254, whatsapp: 20, profession: 100, city: 80 };

  var SEED = [
    ["Priya Nair", "Teacher", "Kochi", 0.1], ["Sneha Kulkarni", "HR manager", "Pune", 0.3], ["Farah Siddiqui", "Homemaker, returning to work", "Lucknow", 0.6],
    ["Anjali Mehta", "Chartered Accountant", "Ahmedabad", 1.2], ["Kavya Reddy", "Software engineer", "Hyderabad", 1.5], ["Meera Iyer", "School counsellor", "Chennai", 1.9],
    ["Ritu Sharma", "Bank officer", "Jaipur", 2.4], ["Nandini Ghosh", "Content writer", "Kolkata", 2.8], ["Pooja Verma", "Yoga instructor", "Lucknow", 3.1],
    ["Shalini Das", "Nurse", "Bhubaneswar", 3.6], ["Aditi Joshi", "Product manager", "Pune", 4.2], ["Harleen Kaur", "Boutique owner", "Ludhiana", 4.7],
    ["Sana Khan", "Dietitian", "Lucknow", 5.3], ["Deepa Menon", "Corporate trainer", "Bengaluru", 5.9], ["Swati Mishra", "Homemaker", "Patna", 6.4],
    ["Neha Agarwal", "Interior designer", "Delhi", 7.5], ["Lakshmi Pillai", "Retired principal", "Thiruvananthapuram", 8.8], ["Ishita Banerjee", "Psychology student", "Kolkata", 9.6],
    ["Rekha Patil", "Insurance advisor", "Nagpur", 11.2], ["Divya Saxena", "Marketing consultant", "Noida", 12.7], ["Tanvi Shah", "Architect", "Mumbai", 14.1],
    ["Fatima Shaikh", "Beautician", "Mumbai", 15.8], ["Geeta Rawat", "Government clerk", "Dehradun", 17.4], ["Anusha Rao", "Physiotherapist", "Bengaluru", 19.9],
    ["Komal Gupta", "Freelance designer", "Indore", 22.5], ["Bhavna Desai", "Pharmacist", "Surat", 25.3]
  ];

  function iso(d) { return d.toISOString().replace(/\.\d{3}Z$/, "Z"); }
  function hashId(s) { // short stable id from the email (stand-in for the server's sha256 slice)
    var h1 = 0x811c9dc5, h2 = 0x1b873593, out = "";
    for (var i = 0; i < s.length; i++) { h1 = Math.imul(h1 ^ s.charCodeAt(i), 16777619); h2 = Math.imul(h2 ^ s.charCodeAt(i), 2654435761); }
    for (var j = 0; j < 4; j++) { out += ((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)).padStart(16, "0").slice(0, 8); h1 = Math.imul(h1 ^ h2, 16777619); h2 = Math.imul(h2 + j, 2654435761); }
    return out.slice(0, 32);
  }
  function seed() {
    var now = Date.now();
    return SEED.map(function (r, i) {
      var first = r[0].split(" ")[0].toLowerCase(), last = r[0].split(" ")[1].toLowerCase();
      var email = first + "." + last + "@example.com";
      return { id: hashId(email), name: r[0], email: email, whatsapp: "+9198765" + String(43001 + i * 7).slice(-5), profession: r[1], city: r[2], created_at: iso(new Date(now - r[3] * 864e5)) };
    });
  }
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    var rows = seed(); save(rows); return rows;
  }
  function save(rows) { try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) {} }
  function delay(v) { return new Promise(function (r) { setTimeout(function () { r(v); }, 250); }); }
  function reply(status, body) { return delay({ res: { ok: status >= 200 && status < 300, status: status }, body: body }); }

  function validate(payload) {
    var data = {}, errors = {};
    Object.keys(FIELDS).forEach(function (field) {
      var value = String(payload[field] == null ? "" : payload[field]).trim();
      if (!value) errors[field] = "This field is required.";
      else if (value.length > FIELDS[field]) errors[field] = "Too long.";
      data[field] = value;
    });
    if (!errors.email && !EMAIL_RE.test(data.email)) errors.email = "Enter a valid email address.";
    if (!errors.whatsapp) {
      var phone = data.whatsapp.replace(/[\s\-()]/g, "");
      if (!PHONE_RE.test(phone)) errors.whatsapp = "Enter a valid WhatsApp number with country code.";
      data.whatsapp = phone;
    }
    return { data: data, errors: errors };
  }

  function toCsv(rows) {
    var esc = function (v) {
      var s = String(v == null ? "" : v);
      if (/^[=+\-@]/.test(s)) s = "'" + s;
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    var header = ["Name", "Email", "WhatsApp", "Profession", "City", "Payment ref", "Registered (UTC)"];
    var lines = rows.slice().reverse().map(function (r) { return [r.name, r.email, r.whatsapp, r.profession, r.city, r.payment_ref || "", r.created_at].map(esc).join(","); });
    return "﻿" + [header.join(",")].concat(lines).join("\r\n");
  }

  window.demoApi = {
    password: DEMO_PASSWORD,
    register: function (payload) {
      var v = validate(payload || {});
      if (Object.keys(v.errors).length) return reply(422, { error: "Please fix the highlighted fields.", fields: v.errors });
      var rows = load();
      var id = hashId(v.data.email.toLowerCase());
      if (rows.some(function (r) { return r.id === id; })) return reply(409, { error: "This email is already registered.", fields: { email: "This email is already registered." } });
      var rec = Object.assign({ id: id }, v.data, { payment_ref: "DEMO-" + Date.now().toString(36).toUpperCase(), created_at: iso(new Date()) });
      rows.unshift(rec); save(rows);
      return reply(201, { ok: true, payment_ref: rec.payment_ref });
    },
    validate: validate,
    login: function (pw) {
      if (String(pw) !== DEMO_PASSWORD) return new Promise(function (r) { setTimeout(function () { r({ res: { ok: false, status: 401 }, body: { error: "Incorrect password." } }); }, 500); });
      try { sessionStorage.setItem(SESSION, String(Date.now() + 8 * 3600e3)); } catch (e) {}
      return reply(200, { ok: true });
    },
    logout: function () { try { sessionStorage.removeItem(SESSION); } catch (e) {} return reply(200, { ok: true }); },
    session: function () { var exp = 0; try { exp = Number(sessionStorage.getItem(SESSION) || 0); } catch (e) {} return reply(200, { signedIn: exp > Date.now() }); },
    registrations: function () {
      var rows = load().sort(function (a, b) { return b.created_at.localeCompare(a.created_at); });
      return reply(200, { registrations: rows });
    },
    remove: function (id) { save(load().filter(function (r) { return r.id !== id; })); return reply(200, { ok: true }); },
    exportCsv: function () {
      var rows = load().sort(function (a, b) { return b.created_at.localeCompare(a.created_at); });
      var blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "registrations.csv";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }
  };
})();

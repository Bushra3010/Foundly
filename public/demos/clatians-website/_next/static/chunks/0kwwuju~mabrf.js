(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,82633,e=>{"use strict";async function t(e,a={}){let s="";try{s=localStorage.getItem("admin_token")??""}catch{}let l=new Headers(a.headers);return s&&l.set("x-admin-token",s),fetch(e,{...a,headers:l})}e.s(["adminFetch",0,t])},45765,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(82633);let l=`-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/your-project-id/sql

-- ── Courses table ─────────────────────────────────────────────
create table if not exists courses (
  slug text primary key,
  title text not null default '',
  category text not null default 'offline',
  icon text default '📚',
  color text default '#08BD80',
  bg text default '#E6FAF4',
  tagline text default '',
  overview text default '',
  duration text default '',
  batch_size text default '',
  mode text default '',
  fee text default '',
  emi text default '',
  features jsonb default '[]',
  includes jsonb default '[]',
  curriculum jsonb default '[]',
  who_for jsonb default '[]',
  testimonial jsonb default '{}',
  created_at timestamptz default now()
);

-- ── Batches table ─────────────────────────────────────────────
create table if not exists batches (
  slug text primary key,
  course_slug text default '',
  category text default 'offline',
  name text not null default '',
  exam text default '',
  batch_code text default '',
  start_date text default '',
  end_date text default '',
  duration text default '',
  schedule text default '',
  mode text default '',
  seats integer default 30,
  filled integer default 0,
  fee text default '',
  original_fee text,
  emi text default '',
  offer text,
  color text default '#08BD80',
  bg text default '#e8eeff',
  status text default 'upcoming',
  language text default 'Hinglish',
  batch_type text default '',
  chips jsonb default '[]',
  faculty jsonb default '[]',
  highlights jsonb default '[]',
  syllabus jsonb default '[]',
  description text default '',
  created_at timestamptz default now()
);`;e.s(["default",0,function(){let[e,r]=(0,a.useState)(null),[d,n]=(0,a.useState)(!0),[i,o]=(0,a.useState)(!1);async function c(){n(!0);try{let e=await (0,s.adminFetch)("/api/admin/db-status"),t=await e.json();r(t)}catch{r(null)}n(!1)}(0,a.useEffect)(()=>{c()},[]);let u=e?.supabase&&e.tables.courses&&e.tables.batches;return(0,t.jsxs)("div",{className:"max-w-3xl",children:[(0,t.jsxs)("div",{className:"mb-6",children:[(0,t.jsx)("h1",{className:"text-2xl font-black text-gray-900",children:"Database Setup"}),(0,t.jsx)("p",{className:"text-gray-500 text-sm mt-0.5",children:"Check Supabase table status and run migrations"})]}),(0,t.jsxs)("div",{className:"bg-white rounded-2xl border border-gray-100 p-6 mb-6",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between mb-4",children:[(0,t.jsx)("h2",{className:"font-black text-gray-800",children:"Table Status"}),(0,t.jsx)("button",{onClick:c,disabled:d,className:"text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50",children:d?"⟳ Checking…":"🔄 Re-check"})]}),d?(0,t.jsxs)("div",{className:"flex items-center gap-3 text-gray-400 text-sm py-4",children:[(0,t.jsx)("div",{className:"w-4 h-4 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin"}),"Checking Supabase connection…"]}):e?e.supabase?(0,t.jsx)("div",{className:"space-y-3",children:Object.entries(e.tables).map(([e,a])=>(0,t.jsxs)("div",{className:"flex items-center justify-between py-2 border-b border-gray-50 last:border-0",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("span",{className:`w-2.5 h-2.5 rounded-full flex-shrink-0 ${a?"bg-green-500":"bg-red-400"}`}),(0,t.jsx)("span",{className:"font-mono text-sm text-gray-700",children:e})]}),(0,t.jsx)("span",{className:`text-xs font-bold px-2.5 py-1 rounded-full ${a?"bg-green-50 text-green-700":"bg-red-50 text-red-600"}`,children:a?"✓ Exists":"✗ Missing"})]},e))}):(0,t.jsx)("div",{className:"bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl border border-amber-100",children:"⚠ Supabase environment variables not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify."}):(0,t.jsx)("div",{className:"bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100",children:"✗ Could not reach the API. Make sure you are logged in."}),u&&(0,t.jsx)("div",{className:"mt-4 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-200 font-semibold",children:"✅ All tables ready — courses and batches will save to Supabase!"})]}),e&&!u&&(0,t.jsxs)("div",{className:"bg-white rounded-2xl border border-gray-100 p-6",children:[(0,t.jsxs)("div",{className:"flex items-start justify-between mb-4",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h2",{className:"font-black text-gray-800",children:"Run Migration SQL"}),(0,t.jsxs)("p",{className:"text-sm text-gray-500 mt-0.5",children:["Open the"," ",(0,t.jsx)("a",{href:"https://supabase.com/dashboard/project/your-project-id/sql/new",target:"_blank",rel:"noopener noreferrer",className:"font-semibold underline",style:{color:"#08BD80"},children:"Supabase SQL Editor ↗"}),", paste this SQL and click Run."]})]}),(0,t.jsx)("button",{onClick:function(){navigator.clipboard.writeText(l).then(()=>{o(!0),setTimeout(()=>o(!1),2e3)})},className:"flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all",style:{background:i?"#16a34a":"#08BD80"},children:i?"✓ Copied!":"📋 Copy SQL"})]}),(0,t.jsx)("pre",{className:"bg-gray-900 text-green-300 text-xs rounded-xl p-4 overflow-auto max-h-96 font-mono leading-relaxed whitespace-pre",children:l}),(0,t.jsxs)("div",{className:"mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700",children:[(0,t.jsx)("strong",{children:"Steps:"}),(0,t.jsxs)("ol",{className:"list-decimal ml-4 mt-1 space-y-1",children:[(0,t.jsxs)("li",{children:["Click ",(0,t.jsx)("strong",{children:"Copy SQL"})," above"]}),(0,t.jsxs)("li",{children:["Open ",(0,t.jsx)("a",{href:"https://supabase.com/dashboard/project/your-project-id/sql/new",target:"_blank",className:"font-semibold underline",children:"Supabase SQL Editor"})]}),(0,t.jsxs)("li",{children:["Paste the SQL and click ",(0,t.jsx)("strong",{children:"Run"})]}),(0,t.jsxs)("li",{children:["Come back here and click ",(0,t.jsx)("strong",{children:"Re-check"})]})]})]})]})]})}])}]);
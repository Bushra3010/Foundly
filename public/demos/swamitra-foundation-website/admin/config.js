/* ==========================================================================
   SWAMITRA admin — Supabase connection
   Dashboard → Project Settings → API. Copy the two values below.

   The anon key is designed to be public: it identifies the project, it does
   not grant access. Everything is gated by row level security and a login,
   so nothing can be read or written without an admin account.

   NEVER put the service_role key here — that one does bypass every policy.
   ========================================================================== */
/* Foundly portfolio demo: not connected to the live database. */
window.SW_SUPABASE = {
  url: "",
  anonKey: "",

  /* Where the panel writes. These match supabase/schema.sql — leave them. */
  contentBucket: "site-content",
  imageBucket: "site-images",
  contentFile: "data.js"
};

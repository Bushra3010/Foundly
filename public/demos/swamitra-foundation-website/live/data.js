/* ==========================================================================
   Placeholder — deliberately does nothing.

   Every page loads /live/data.js right after its bundled assets/js/data.js, so
   that whatever the admin panel published replaces the deployed content.

   Until Supabase is configured, this committed file answers that request: a
   fast 200 that leaves the bundled content in place, rather than a 404 and a
   console error on a render-blocking script.

   Once the proxy in netlify.toml is switched on, its `force = true` makes
   Netlify serve the published file from Supabase Storage instead of this one.
   See ADMIN.md.
   ========================================================================== */

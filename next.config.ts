import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Embedded Postgres for local development ships WASM and must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    // "Get listed" / Social media became Connections; old links and bookmarks keep working.
    return [{ source: "/app/presence", destination: "/app/connections", permanent: true }];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // Portfolio demos are static exports in public/demos/<project>/. Files are served as they are;
      // a folder address (e.g. /demos/pushpak/admin/) falls back to that folder's index.html.
      fallback: [{ source: "/demos/:project/:path*", destination: "/demos/:project/:path*/index.html" }],
    };
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Demos are sample-data copies: keep them out of search results and only let our own pages frame them.
      { source: "/demos/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "X-Frame-Options", value: "SAMEORIGIN" }] },
      // The owner app must never be framed.
      { source: "/app/:path*", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
    ];
  },
};

export default nextConfig;

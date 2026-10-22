import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Growth Platform",
    short_name: "Growth",
    description: "Manage your business profile, website and enquiries.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f7f8fa",
    theme_color: "#1d4ed8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

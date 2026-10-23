import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Foundly",
    short_name: "Foundly",
    description: "Manage your business profile, website and enquiries.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f7f7f3",
    theme_color: "#20221e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

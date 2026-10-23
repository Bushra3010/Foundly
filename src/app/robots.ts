import type { MetadataRoute } from "next";
import { AI_CRAWLERS } from "@/lib/geo";

const PRIVATE = ["/app", "/admin", "/onboarding", "/auth", "/login", "/signup", "/forgot-password", "/reset-password", "/api"];

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      // AI assistants and AI search are explicitly welcome on every public page:
      // being read by them is how businesses get mentioned in AI answers.
      { userAgent: [...AI_CRAWLERS], allow: ["/", "/llms.txt"], disallow: PRIVATE },
      { userAgent: "*", allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

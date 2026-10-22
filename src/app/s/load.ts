import "server-only";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getDb } from "@/db";
import { pageKey, type PageKey } from "@/lib/site/content";
import { getPublishedSite } from "@/server/sites";

export const loadLiveSite = cache(async (slug: string, page?: string) => {
  const result = await getPublishedSite(await getDb(), slug);
  if (result.kind === "redirect") permanentRedirect(`/s/${result.slug}${page ? `/${page}` : ""}`);
  if (result.kind === "none") notFound();
  const key: PageKey = page ? pageKey.catch("home").parse(page) : "home";
  if (page && (key !== page || !result.content.pages.some((p) => p.key === key))) notFound();
  return { ...result, key };
});

export function siteUrl(slug: string, page?: string) {
  const root = process.env.SITES_ROOT_DOMAIN;
  const path = page && page !== "home" ? `/${page}` : "";
  return root ? `https://${slug}.${root}${path}` : `${process.env.APP_URL ?? "http://localhost:3000"}/s/${slug}${path}`;
}

export async function siteMetadata(slug: string, page?: string): Promise<Metadata> {
  const site = await loadLiveSite(slug, page);
  const p = site.content.pages.find((x) => x.key === site.key)!;
  const title = site.key === "home" ? site.content.seo.title : `${p.title} · ${site.content.facts.name}`;
  return {
    title: { absolute: title },
    description: site.content.seo.description,
    alternates: { canonical: siteUrl(site.slug, site.key) },
    openGraph: { title, description: site.content.seo.description, type: "website" },
  };
}

import type { Business } from "@/db/schema";
import type { SiteFacts } from "@/lib/site/content";

/** The only business fields ever served on public routes. */
export type PublicProfile = {
  name: string;
  category: string;
  description?: string;
  city: string;
  region?: string;
  country: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  websiteUrl?: string;
  bookingUrl?: string;
  hours: { days: string; hours: string }[];
  services: { name: string; description?: string }[];
  serviceAreas: string[];
  updatedAt: string;
};

const opt = (v: string | null | undefined) => (v && v.trim() ? v.trim() : undefined);

export function toPublicProfile(b: Business, now = new Date()): PublicProfile {
  return {
    name: b.name.trim(),
    category: b.category.trim(),
    description: opt(b.description),
    city: b.city.trim(),
    region: opt(b.region),
    country: b.country,
    address: b.showAddress ? opt(b.address) : undefined,
    phone: opt(b.phone),
    whatsapp: opt(b.whatsapp),
    email: opt(b.email),
    websiteUrl: opt(b.websiteUrl),
    bookingUrl: opt(b.bookingUrl),
    hours: b.hours,
    services: b.services,
    serviceAreas: b.serviceAreas,
    updatedAt: now.toISOString(),
  };
}

/** Digits only, with country code, for tel: and wa.me links. */
export function phoneDigits(phone: string, country: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1);
  if (country === "IN") {
    const local = digits.replace(/^0+/, "");
    return local.length === 10 ? `91${local}` : local;
  }
  return digits;
}

/**
 * schema.org LocalBusiness built only from supplied facts. No ratings, prices,
 * awards or availability are ever added.
 */
export function localBusinessJsonLd(
  p: Pick<PublicProfile, "name" | "category" | "city" | "region" | "country" | "address" | "phone" | "email" | "hours" | "serviceAreas"> & {
    description?: string;
    url?: string;
  },
) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: p.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.city,
      ...(p.region ? { addressRegion: p.region } : {}),
      addressCountry: p.country,
      ...(p.address ? { streetAddress: p.address } : {}),
    },
  };
  if (p.description) data.description = p.description;
  if (p.url) data.url = p.url;
  if (p.phone) data.telephone = p.phone;
  if (p.email) data.email = p.email;
  if (p.serviceAreas.length) data.areaServed = p.serviceAreas;
  if (p.hours.length) data.openingHours = p.hours.map((h) => `${h.days} ${h.hours}`);
  return data;
}

export function jsonLdFromFacts(f: SiteFacts, url?: string, description?: string) {
  return localBusinessJsonLd({ ...f, url, description });
}

/** Serialise JSON-LD safely for a <script> tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

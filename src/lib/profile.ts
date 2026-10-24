import type { Business } from "@/db/schema";

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
  foundedYear?: number;
  teamSize?: number;
  projectsCompleted?: number;
  credentials?: string;
  /** Absent on profiles published before this field existed. */
  listings?: string[];
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
    foundedYear: b.foundedYear ?? undefined,
    teamSize: b.teamSize ?? undefined,
    projectsCompleted: b.projectsCompleted ?? undefined,
    credentials: opt(b.credentials),
    listings: b.listings ?? [],
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

/** Serialise JSON-LD safely for a <script> tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export type MissingFact = { field: string; label: string; why: string };

/** Optional details that help customers and AI assistants, in the order worth adding them. */
export function missingOptionalFacts(b: Business): MissingFact[] {
  const missing: MissingFact[] = [];
  if (!b.description?.trim())
    missing.push({ field: "description", label: "Business description", why: "Tells customers and AI assistants what you do" });
  if (b.hours.length === 0)
    missing.push({ field: "hours", label: "Opening hours", why: "Answers “are you open now?”" });
  if (b.serviceAreas.length === 0)
    missing.push({ field: "serviceAreas", label: "Service areas", why: "Tells customers where you work" });
  if (b.services.every((s) => !s.description?.trim()))
    missing.push({ field: "services", label: "Service descriptions", why: "Explains each service in your own words" });
  if (!b.bookingUrl) missing.push({ field: "bookingUrl", label: "Booking link", why: "Lets customers book straight from your listings" });
  return missing;
}

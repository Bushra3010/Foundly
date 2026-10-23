import { entitySentence, LISTING_SITES, listToText, type ListingSiteKey } from "./geo";
import type { PublicProfile } from "./profile";

export type KitField = { label: string; value: string; limit?: number; hint?: string };
export type KitPlatform = { key: ListingSiteKey; label: string; why: string; create: string; steps: string[]; fields: KitField[] };

/** Cut at a sentence or word boundary so pasted text never ends mid-word. */
export function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > max * 0.6) return cut.slice(0, sentence + 1);
  const space = cut.lastIndexOf(" ");
  return (space > 0 ? cut.slice(0, space) : cut).replace(/[,;:\-]$/, "") + "…";
}

type KitInput = Pick<PublicProfile, "name" | "category" | "city" | "region" | "address" | "phone" | "whatsapp" | "email" | "hours" | "serviceAreas" | "services"> & {
  description?: string;
  foundedYear?: number;
  teamSize?: number;
  projectsCompleted?: number;
  credentials?: string;
  bookingUrl?: string;
  websiteUrl: string;
  profileUrl: string;
};

/**
 * Everything an owner needs to list the business on each platform, written
 * from confirmed facts and cut to each platform's limits. The same wording
 * everywhere is the point: AI assistants trust facts they see repeated.
 */
export function presenceKit(b: KitInput): KitPlatform[] {
  const services = b.services.map((s) => s.name.trim());
  const areas = b.serviceAreas.length ? b.serviceAreas : [b.city];
  const summary = entitySentence(b);
  const long = [summary, services.length ? `Services: ${listToText(services)}.` : "", b.description?.trim() ?? ""].filter(Boolean).join(" ");
  const hoursText = b.hours.map((h) => `${h.days}: ${h.hours}`).join("\n");
  const place = [b.address, b.city, b.region].filter(Boolean).join(", ");
  const contact: KitField[] = [
    ...(b.phone ? [{ label: "Phone", value: b.phone, hint: "Exactly this format everywhere" }] : []),
    ...(b.email ? [{ label: "Email", value: b.email }] : []),
    { label: "Website", value: b.websiteUrl, hint: "Your Foundly website, so every listing points to the same place" },
  ];
  const common = (max: number): KitField[] => [
    { label: "Business name", value: b.name, hint: "Same spelling everywhere, no extra keywords" },
    { label: "Category", value: b.category },
    { label: "Description", value: clip(long, max), limit: max },
    ...contact,
    ...(place ? [{ label: "Address", value: place }] : []),
    ...(b.serviceAreas.length ? [{ label: "Areas served", value: b.serviceAreas.join(", ") }] : []),
    ...(hoursText ? [{ label: "Opening hours", value: hoursText }] : []),
    ...(services.length ? [{ label: "Services", value: services.join("\n"), hint: "Add each as a separate service where the platform allows" }] : []),
  ];
  const by = (key: ListingSiteKey) => LISTING_SITES.find((l) => l.key === key)!;
  const platform = (key: ListingSiteKey, steps: string[], fields: KitField[]): KitPlatform => {
    const site = by(key);
    return { key, label: site.label, why: site.why, create: site.create, steps, fields };
  };
  return [
    platform("google", [
      "Sign in with the Google account you want to own the listing.",
      "Add the business, then paste the details below. Choose “service area business” if customers don’t visit you.",
      "Verify by phone, video or postcard when Google asks. Nobody can skip this step for you.",
      "Copy the profile link (Share → Copy link) and paste it below.",
    ], common(750)),
    platform("justdial", [
      "Create a free listing with your phone number; Justdial confirms it by call or OTP.",
      "Paste the same name, category, address and services.",
      "Paste your listing link below once it is live.",
    ], common(500)),
    platform("bing", [
      "Sign in and choose “Import from Google Business Profile” if you already did Google. It copies everything in one step.",
      "Otherwise paste the details below and verify by phone or email.",
    ], common(750)),
    platform("instagram", [
      "Create a business account with your business email.",
      "Use the bio and website link below. Post at least one photo of your work.",
    ], [
      { label: "Name", value: b.name },
      { label: "Bio", value: clip(`${b.category} in ${b.city} · ${listToText(services.slice(0, 3))}${b.foundedYear ? ` · Since ${b.foundedYear}` : ""}`, 150), limit: 150 },
      { label: "Website link", value: b.websiteUrl },
      ...(b.whatsapp ? [{ label: "WhatsApp (contact button)", value: b.whatsapp }] : []),
    ]),
    platform("facebook", [
      "Create a Page (not a personal profile) and pick the closest category.",
      "Fill About, phone, website and hours with the text below.",
    ], [
      { label: "Page name", value: b.name },
      { label: "Category", value: b.category },
      { label: "Short description", value: clip(summary, 255), limit: 255 },
      { label: "About", value: clip(long, 1000), limit: 1000 },
      ...contact,
      ...(hoursText ? [{ label: "Hours", value: hoursText }] : []),
    ]),
    platform("youtube", [
      "Create a channel in the business’s name. One 30-second phone video of your work is enough to start.",
      "Put the description and website link in the channel’s About section.",
    ], [
      { label: "Channel name", value: b.name },
      { label: "Channel description", value: clip(long, 1000), limit: 1000 },
      { label: "Link", value: b.websiteUrl },
    ]),
    platform("sulekha", ["Register as a business and paste the details below."], common(500)),
    platform("indiamart", ["Register as a seller and paste the details below; list each service as a product or service."], common(1000)),
    platform("linkedin", ["Create a company page and paste the details below."], [
      { label: "Company name", value: b.name },
      { label: "Tagline", value: clip(`${b.category} in ${b.city}`, 120), limit: 120 },
      { label: "About", value: clip(long, 2000), limit: 2000 },
      { label: "Website", value: b.websiteUrl },
      { label: "Location", value: [b.city, b.region].filter(Boolean).join(", ") },
    ]),
  ].map((p) => ({ ...p, fields: p.fields.concat({ label: "Foundly profile (optional link)", value: b.profileUrl, hint: `Mentions ${areas[0]} and your services; some platforms allow a second link` }) }));
}

/**
 * What Foundly keeps in sync on a connected Google Business Profile: the
 * description, primary phone and website. Hours and categories stay as the
 * owner set them on Google, since free-text hours can't be mapped safely.
 */
export function googleLocationUpdate(b: KitInput) {
  const google = presenceKit(b).find((k) => k.key === "google")!;
  const description = google.fields.find((f) => f.label === "Description")!.value;
  const body: Record<string, unknown> = { profile: { description }, websiteUri: b.websiteUrl };
  const mask = ["profile.description", "websiteUri"];
  if (b.phone) {
    body.phoneNumbers = { primaryPhone: b.phone };
    mask.push("phoneNumbers.primaryPhone");
  }
  return { body, updateMask: mask.join(",") };
}

/** What Foundly keeps in sync on a connected Facebook Page: about, description, phone and website. */
export function facebookPageUpdate(b: KitInput) {
  const fb = presenceKit(b).find((k) => k.key === "facebook")!;
  const field = (label: string) => fb.fields.find((f) => f.label === label)?.value ?? "";
  const body: Record<string, string> = { about: field("Short description"), description: field("About"), website: b.websiteUrl };
  if (b.phone) body.phone = b.phone;
  return body;
}

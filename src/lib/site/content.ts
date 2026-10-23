import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #1d4ed8");

export const heroBlock = z.object({
  id: z.string(),
  type: z.literal("hero"),
  heading: text(120).min(1, "Add a heading"),
  subheading: text(300),
  ctaLabel: text(40).min(1),
});

export const servicesBlock = z.object({
  id: z.string(),
  type: z.literal("services"),
  heading: text(120).min(1),
  items: z.array(z.object({ name: text(100).min(1), description: text(600) })).max(30),
});

export const aboutBlock = z.object({
  id: z.string(),
  type: z.literal("about"),
  heading: text(120).min(1),
  body: text(3000).min(1, "Add a short description or remove this section"),
});

export const faqBlock = z.object({
  id: z.string(),
  type: z.literal("faq"),
  heading: text(120).min(1),
  items: z.array(z.object({ question: text(200).min(1), answer: text(1000).min(1) })).max(20),
});

export const galleryBlock = z.object({
  id: z.string(),
  type: z.literal("gallery"),
  heading: text(120).min(1),
  images: z
    .array(
      z.object({
        // Uploaded photos (/media/<id>) or an https link the owner controls.
        url: z
          .string()
          .trim()
          .refine((u) => /^\/media\/[0-9a-f-]{36}$/.test(u) || z.url({ protocol: /^https$/ }).safeParse(u).success, "Upload a photo or use an https link"),
        alt: text(200).min(1, "Describe the photo"),
      }),
    )
    .max(24),
});

export const contactBlock = z.object({
  id: z.string(),
  type: z.literal("contact"),
  heading: text(120).min(1),
  intro: text(400),
  showForm: z.boolean(),
});

export const textBlock = z.object({
  id: z.string(),
  type: z.literal("text"),
  heading: text(120).min(1),
  body: text(8000).min(1),
});

export const block = z.discriminatedUnion("type", [
  textBlock,
  heroBlock,
  servicesBlock,
  aboutBlock,
  faqBlock,
  galleryBlock,
  contactBlock,
]);

export type Block = z.infer<typeof block>;
export type BlockType = Block["type"];

export const pageKey = z.enum(["home", "services", "about", "contact", "privacy"]);
export type PageKey = z.infer<typeof pageKey>;

/** Public facts copied into each version so a published version never changes underneath. */
export const siteFacts = z.object({
  name: text(120).min(1),
  category: text(80),
  city: text(80),
  region: text(80).optional(),
  country: z.string().length(2),
  address: text(300).optional(),
  phone: text(30).optional(),
  whatsapp: text(30).optional(),
  email: z.email().optional(),
  bookingUrl: z.url().optional(),
  websiteUrl: z.url().optional(),
  hours: z.array(z.object({ days: text(60), hours: text(60) })),
  serviceAreas: z.array(text(80)),
  foundedYear: z.number().int().optional(),
  teamSize: z.number().int().optional(),
  projectsCompleted: z.number().int().optional(),
  credentials: text(300).optional(),
  listings: z.array(z.url()).max(10).optional(),
});

export const siteContent = z.object({
  schemaVersion: z.literal(1),
  templateKey: z.enum(["service", "travel", "professional"]),
  theme: z.object({ primary: hexColor, accent: hexColor }),
  seo: z.object({ title: text(70).min(1), description: text(170).min(1) }),
  facts: siteFacts,
  pages: z
    .array(
      z.object({
        key: pageKey,
        title: text(60).min(1),
        blocks: z.array(block).max(20),
      }),
    )
    .min(1),
});

export type SiteContent = z.infer<typeof siteContent>;
export type SiteFacts = z.infer<typeof siteFacts>;

export function findBlock(content: SiteContent, blockId: string) {
  for (const page of content.pages) {
    const found = page.blocks.find((b) => b.id === blockId);
    if (found) return { page, block: found };
  }
  return null;
}

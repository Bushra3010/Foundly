import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

/** Whole number from a text input; empty means "not given". */
const optionalCount = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .transform((s) => (s === "" ? null : Number(s.replace(/[,+\s]/g, ""))))
    .nullable()
    .optional()
    .refine((n) => n == null || (Number.isInteger(n) && n >= min && n <= max), message)
    .transform((n) => n ?? null);

export const listingUrl = z
  .string()
  .trim()
  .transform((s) => (/^https?:\/\//i.test(s) ? s : `https://${s}`))
  .refine((s) => z.url({ protocol: /^https?$/ }).safeParse(s).success, "Enter a web address like instagram.com/yourbusiness");

/**
 * Links pasted into one box: one per line, or separated by spaces or commas.
 * Returns the cleaned links, and the first entry that isn't a web address.
 */
export function parseListingLinks(text: string): { urls: string[]; bad: string | null } {
  const raw = text.split(/[\s,]+/).map((l) => l.trim()).filter(Boolean);
  const urls: string[] = [];
  for (const l of raw) {
    const p = listingUrl.safeParse(l);
    if (!p.success || !/\.[a-z]{2,}/i.test(l)) return { urls, bad: l };
    if (!urls.includes(p.data)) urls.push(p.data);
  }
  return { urls, bad: null };
}

const phone = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .refine((v) => !v || /^\+?[\d\s()-]{7,20}$/.test(v), "Enter a phone number like +91 98765 43210");

const httpUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
  .refine((v) => !v || z.url({ protocol: /^https?$/ }).safeParse(v).success, "Enter a web address like example.com");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .refine((v) => !v || z.email().safeParse(v).success, "Enter an email address like name@example.com");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
});

export const basicsSchema = z.object({
  name: z.string().trim().min(2, "Enter your business name").max(120),
  category: z.string().trim().min(2, "Enter what kind of business this is").max(80),
  city: z.string().trim().min(2, "Enter your city").max(80),
  phone,
  whatsapp: phone,
  email,
});

export const websiteChoiceSchema = z.discriminatedUnion("hasWebsite", [
  z.object({ hasWebsite: z.literal("yes"), websiteUrl: httpUrl.refine((v) => !!v, "Enter your website address") }),
  z.object({ hasWebsite: z.literal("no") }),
]);

/** An owner without a website asks Foundly's team to build one. */
export const websiteRequestSchema = z
  .object({
    goal: z.string().trim().min(10, "Tell us in a sentence or two what your website should do").max(1000),
    pages: optionalText(500),
    style: optionalText(500),
    examples: optionalText(1000),
    contactMethod: z.enum(["phone", "whatsapp", "video"], "Choose how we should reach you"),
    contactValue: z.string().trim().min(3, "Tell us where to reach you").max(200),
    contactTime: optionalText(200),
  })
  .superRefine((v, c) => {
    if (v.contactMethod === "video" ? !z.email().safeParse(v.contactValue).success : !/^\+?[\d\s()-]{7,20}$/.test(v.contactValue)) {
      c.addIssue({ code: "custom", path: ["contactValue"], message: v.contactMethod === "video" ? "Enter the email we should send the meeting link to" : "Enter a phone number like +91 98765 43210" });
    }
  });

export const deliverWebsiteSchema = z.object({ url: httpUrl.refine((v) => !!v, "Enter the website address") });

export const servicesSchema = z
  .array(z.object({ name: z.string().trim().min(1).max(100), description: z.string().trim().max(600).optional() }))
  .min(1, "Add at least one service")
  .max(30);

export const offerSchema = z.object({
  services: servicesSchema,
  audience: optionalText(300),
  serviceAreas: z.array(z.string().trim().min(1).max(80)).max(30),
});

export const businessDetailsSchema = basicsSchema.extend({
  description: optionalText(3000),
  audience: optionalText(300),
  region: optionalText(80),
  address: optionalText(300),
  showAddress: z.boolean(),
  websiteUrl: httpUrl,
  bookingUrl: httpUrl,
  services: servicesSchema,
  serviceAreas: z.array(z.string().trim().min(1).max(80)).max(30),
  hours: z.array(z.object({ days: z.string().trim().min(1).max(60), hours: z.string().trim().min(1).max(60) })).max(14),
  foundedYear: optionalCount(1800, new Date().getFullYear(), "Enter the year you started, like 2019"),
  teamSize: optionalCount(1, 100000, "Enter how many people work with you"),
  projectsCompleted: optionalCount(1, 10000000, "Enter a whole number, like 350"),
  credentials: optionalText(300),
  listings: z.array(listingUrl).max(10, "Add up to 10 links"),
  expectedVersion: z.number().int(),
});

/** Splits a comma or newline separated textarea into trimmed items. */
export function splitList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type FieldErrors = Record<string, string[] | undefined>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}

import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

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
  expectedVersion: z.number().int(),
});

export const leadSchema = z.object({
  siteSlug: z.string().min(1).max(60),
  name: z.string().trim().min(1, "Enter your name").max(100),
  contact: z.string().trim().min(5, "Enter a phone number or email so they can reply").max(120),
  message: z.string().trim().min(5, "Tell them a little about what you need").max(2000),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0).optional().or(z.literal("")),
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

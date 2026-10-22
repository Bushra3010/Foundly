const RESERVED = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "blog",
  "dashboard",
  "directory",
  "docs",
  "help",
  "login",
  "logout",
  "mail",
  "onboarding",
  "preview",
  "root",
  "security",
  "settings",
  "signin",
  "signup",
  "static",
  "status",
  "support",
  "www",
]);

// Deliberately small; extend from moderation data rather than guessing.
const BLOCKED_FRAGMENTS = ["fuck", "shit", "porn", "nazi", "scam"];

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

export type SlugProblem = "too_short" | "invalid" | "reserved" | "blocked";

export function checkSlug(slug: string): SlugProblem | null {
  if (slug.length < 3) return "too_short";
  if (!/^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$/.test(slug) || slug.includes("--")) return "invalid";
  if (RESERVED.has(slug)) return "reserved";
  if (BLOCKED_FRAGMENTS.some((f) => slug.includes(f))) return "blocked";
  return null;
}

export const SLUG_PROBLEM_TEXT: Record<SlugProblem, string> = {
  too_short: "Use at least 3 characters.",
  invalid: "Use lowercase letters, numbers and single hyphens.",
  reserved: "This address is reserved. Try another.",
  blocked: "This address is not allowed. Try another.",
};

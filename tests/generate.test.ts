import { describe, expect, it } from "vitest";
import type { Business } from "@/db/schema";
import { siteContent } from "@/lib/site/content";
import { chooseTemplate, generateSite, missingOptionalFacts } from "@/lib/site/generate";
import { localBusinessJsonLd, phoneDigits, toPublicProfile } from "@/lib/profile";
import { checkSlug, slugify } from "@/lib/slug";

const base: Business = {
  id: "b",
  workspaceId: "w",
  name: "Sharma Plumbing",
  category: "Plumber",
  description: null,
  audience: null,
  city: "Pune",
  region: null,
  country: "IN",
  address: "12 Secret Lane",
  showAddress: false,
  phone: "+91 98765 43210",
  whatsapp: null,
  email: null,
  websiteUrl: null,
  bookingUrl: null,
  hours: [],
  services: [{ name: "Leak repair" }],
  serviceAreas: [],
  hasWebsite: false,
  onboardingStep: 6,
  onboardingCompletedAt: null,
  publicContactConfirmedAt: new Date(),
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("generateSite", () => {
  it("produces valid content using only supplied facts", () => {
    const content = generateSite(base);
    expect(siteContent.safeParse(content).success).toBe(true);
    const text = JSON.stringify(content);
    // No invented claims.
    for (const banned of ["years", "experience", "rated", "review", "certified", "guarantee", "award", "₹", "trusted by"]) {
      expect(text.toLowerCase()).not.toContain(banned);
    }
    // Hidden address stays out.
    expect(text).not.toContain("Secret Lane");
    // No About page without an owner-supplied description.
    expect(content.pages.map((p) => p.key)).not.toContain("about");
  });

  it("adds an About page only from the owner's description", () => {
    const content = generateSite({ ...base, description: "Family business since we opened." });
    const about = content.pages.find((p) => p.key === "about");
    expect(about?.blocks[0]).toMatchObject({ type: "about", body: "Family business since we opened." });
  });

  it("lists missing optional facts for the owner", () => {
    expect(missingOptionalFacts(base).map((m) => m.field)).toEqual(
      expect.arrayContaining(["description", "hours", "serviceAreas", "bookingUrl"]),
    );
  });

  it("chooses templates by category", () => {
    expect(chooseTemplate("Tour operator")).toBe("travel");
    expect(chooseTemplate("Dental clinic")).toBe("professional");
    expect(chooseTemplate("Plumber")).toBe("service");
  });
});

describe("public projection", () => {
  it("omits a hidden address and invents nothing in JSON-LD", () => {
    const p = toPublicProfile(base);
    expect(p.address).toBeUndefined();
    const ld = localBusinessJsonLd(p);
    expect(ld).not.toHaveProperty("aggregateRating");
    expect(ld).not.toHaveProperty("priceRange");
    expect(JSON.stringify(ld)).not.toContain("Secret Lane");
  });

  it("formats Indian numbers for links", () => {
    expect(phoneDigits("098765 43210", "IN")).toBe("919876543210");
    expect(phoneDigits("+91 98765-43210", "IN")).toBe("919876543210");
  });
});

describe("slugs", () => {
  it("normalises and rejects reserved or malformed slugs", () => {
    expect(slugify("Café & Bar, Pune!")).toBe("cafe-and-bar-pune");
    expect(checkSlug("admin")).toBe("reserved");
    expect(checkSlug("ab")).toBe("too_short");
    expect(checkSlug("bad--slug")).toBe("invalid");
    expect(checkSlug("sharma-plumbing")).toBeNull();
  });
});

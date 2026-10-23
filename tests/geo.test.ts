import { beforeAll, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { businessGraph, businessLlmsText, discoveryFaq, entitySentence, factsFromSiteContent, geoReadiness, listingLabel, pluralCategory, slugify } from "@/lib/geo";
import { getBusiness, publishProfile } from "@/server/business";
import { listPublishedProfiles } from "@/server/directory";
import { generateSiteDraft, getPublishedSite, getSite, publishSite } from "@/server/sites";
import { makeDb, onboard, signUp } from "./helpers";

const facts = {
  name: "Sharma Plumbing",
  category: "Plumber",
  city: "Pune",
  country: "IN",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  hours: [{ days: "Mon–Sat", hours: "9am–7pm" }],
  serviceAreas: ["Kothrud", "Baner"],
  services: [{ name: "Leak repair", description: "Same-day fixes for taps and pipes." }, { name: "Bathroom fitting" }],
};

describe("GEO helpers", () => {
  it("slugs and plurals for city and category pages", () => {
    expect(slugify("Interior Designer")).toBe("interior-designer");
    expect(slugify("Navi Mumbai & Thane")).toBe("navi-mumbai-and-thane");
    expect(pluralCategory("Interior designer")).toBe("Interior designers");
    expect(pluralCategory("Dental clinic")).toBe("Dental clinics");
    expect(pluralCategory("Pharmacy")).toBe("Pharmacies");
    expect(pluralCategory("Cleaning services")).toBe("Cleaning services");
  });

  it("writes one quotable sentence from confirmed facts only", () => {
    expect(entitySentence(facts)).toBe("Sharma Plumbing is a plumber in Pune, serving Kothrud and Baner.");
    expect(entitySentence({ ...facts, foundedYear: 2015, projectsCompleted: 1200, teamSize: 6, credentials: "Licensed by PMC" })).toBe(
      "Sharma Plumbing is a plumber in Pune, serving Kothrud and Baner. In business since 2015, 1,200+ projects completed and a team of 6. Licensed by PMC.",
    );
    expect(listingLabel("https://www.google.com/maps/place/Sharma+Plumbing")).toBe("Google Business Profile");
    expect(listingLabel("https://www.justdial.com/Pune/Sharma-Plumbing")).toBe("Justdial");
    expect(listingLabel("https://example.org/x")).toBe("example.org");
  });

  it("structured data lists services, areas and FAQs, and never invents ratings or prices", () => {
    const ld = businessGraph({ ...facts, url: "https://foundly.co.in/s/sharma", foundedYear: 2015, listings: ["https://www.google.com/maps/place/Sharma+Plumbing"] }, [{ question: "Q?", answer: "A." }]);
    const json = JSON.stringify(ld);
    const graph = ld["@graph"] as Record<string, unknown>[];
    expect(graph[0]["@type"]).toBe("LocalBusiness");
    expect(graph[0].knowsAbout).toEqual(["Leak repair", "Bathroom fitting"]);
    expect(graph[0].foundingDate).toBe("2015");
    expect(graph[0].sameAs).toContain("https://www.google.com/maps/place/Sharma+Plumbing");
    expect(json).toContain("Kothrud");
    expect(graph[1]["@type"]).toBe("FAQPage");
    expect(json).not.toMatch(/aggregateRating|reviewRating|priceRange|"best"/i);
  });

  it("AI-style questions are answered only with confirmed facts", () => {
    const faq = discoveryFaq(facts);
    expect(faq[0].question).toBe("Who offers leak repair in Pune?");
    expect(faq[0].answer).toContain("Sharma Plumbing offers leak repair in Pune across Kothrud, Baner.");
    expect(faq.map((q) => q.answer).join(" ")).not.toMatch(/best|top|#1|rated/i);
  });

  it("llms.txt fact sheet carries the key facts and links", () => {
    const text = businessLlmsText({ ...facts, updatedAt: "2026-10-24T00:00:00Z" }, { website: "https://x/s/sharma", profile: "https://x/b/sharma" });
    expect(text).toContain("# Sharma Plumbing");
    expect(text).toContain("- Areas served: Kothrud, Baner");
    expect(text).toContain("- Leak repair: Same-day fixes");
    expect(text).toContain("[Website](https://x/s/sharma)");
  });

  it("readiness score counts what is done and lists next steps", () => {
    const r = geoReadiness({
      description: "",
      services: facts.services,
      serviceAreas: facts.serviceAreas,
      hours: facts.hours,
      phone: facts.phone,
      sitePublished: false,
      siteCurrent: false,
      faqCount: 0,
      profilePublished: false,
      verified: false,
    });
    expect(r.total).toBe(13);
    expect(r.done).toBe(3); // areas, hours, contact
    expect(r.score).toBe(23);
    expect(r.items.find((i) => i.key === "google")?.done).toBe(false);
    expect(r.items.find((i) => i.key === "site")?.href).toBe("/app/website");
  });
});

describe("GEO on published businesses", () => {
  let db: Db;
  beforeAll(async () => {
    db = await makeDb();
  });

  it("generated sites lead with AI-style questions, and published data feeds llms.txt and city pages", async () => {
    const ctx = await signUp(db, "geo@example.com");
    await onboard(db, ctx, "Sharma Plumbing");
    await generateSiteDraft(db, ctx);
    const site = (await getSite(db, ctx))!;
    const draftFacts = factsFromSiteContent(site.draft);
    expect(draftFacts.faq[0].question).toBe("Who offers leak repair in Pune?");
    expect(draftFacts.faq.length).toBeGreaterThanOrEqual(4);
    expect(draftFacts.services.map((s) => s.name)).toContain("Leak repair");

    await publishSite(db, ctx, site.draftRevision);
    await publishProfile(db, ctx);
    const live = await getPublishedSite(db, site.slug);
    expect(live.kind).toBe("site");
    if (live.kind === "site") expect(live.profileSlug).toBeTruthy();

    const listed = await listPublishedProfiles(db);
    const mine = listed.find((r) => r.profile.name === "Sharma Plumbing")!;
    expect(mine.siteSlug).toBe(site.slug);
    const b = (await getBusiness(db, ctx))!;
    expect(`${slugify(mine.profile.city)}/${slugify(mine.profile.category)}`).toBe(`${slugify(b.city)}/${slugify(b.category)}`);
  });
});

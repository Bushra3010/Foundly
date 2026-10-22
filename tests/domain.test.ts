import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { businesses, jobs, memberships } from "@/db/schema";
import { consumeLoginToken, createLoginToken, userForSession } from "@/server/auth";
import { getBusiness, updateBusinessDetails } from "@/server/business";
import { AppError, type Ctx } from "@/server/context";
import { getPublicProfile, searchDirectory } from "@/server/directory";
import { listLeads, leadsToCsv, submitLead, updateLead } from "@/server/leads";
import {
  changeSiteSlug,
  generateSiteDraft,
  getPublishedSite,
  getSite,
  listVersions,
  publishSite,
  regenerateBlock,
  rollbackSite,
  saveDraft,
} from "@/server/sites";
import { makeDb, onboard, signUp } from "./helpers";

let db: Db;
let alice: Ctx;
let bob: Ctx;

beforeEach(async () => {
  db = await makeDb();
  alice = await signUp(db, "alice@example.com");
  bob = await signUp(db, "bob@example.com");
  await onboard(db, alice, "Sharma Plumbing");
  await onboard(db, bob, "Bob Tours");
});

async function expectCode(p: Promise<unknown>, code: AppError["code"]) {
  await expect(p).rejects.toSatisfy((e: unknown) => e instanceof AppError && e.code === code);
}

describe("auth", () => {
  it("sign-in tokens are single use", async () => {
    const token = await createLoginToken(db, "carol@example.com");
    const { sessionToken, isNew } = await consumeLoginToken(db, token);
    expect(isNew).toBe(true);
    expect((await userForSession(db, sessionToken))?.email).toBe("carol@example.com");
    await expectCode(consumeLoginToken(db, token), "invalid");
  });

  it("returning users keep their workspace", async () => {
    const token = await createLoginToken(db, "alice@example.com");
    const { isNew } = await consumeLoginToken(db, token);
    expect(isNew).toBe(false);
    expect(await db.select().from(memberships).where(eq(memberships.userId, alice.userId))).toHaveLength(1);
  });
});

describe("tenant isolation", () => {
  it("each workspace only sees its own business, site and leads", async () => {
    expect((await getBusiness(db, alice))?.name).toBe("Sharma Plumbing");
    expect((await getBusiness(db, bob))?.name).toBe("Bob Tours");

    await generateSiteDraft(db, alice);
    expect(await getSite(db, bob)).toBeNull();

    const aliceSite = (await getSite(db, alice))!;
    await publishSite(db, alice, aliceSite.draftRevision);
    await submitLead(db, { siteSlug: aliceSite.slug, name: "V", contact: "v@example.com", message: "Need a fix" }, "website");
    expect(await listLeads(db, alice)).toHaveLength(1);
    expect(await listLeads(db, bob)).toHaveLength(0);

    const [lead] = await listLeads(db, alice);
    await expectCode(updateLead(db, bob, lead.id, { status: "closed" }), "not_found");
  });

  it("bob cannot roll alice's site back to one of alice's versions", async () => {
    await generateSiteDraft(db, alice);
    const site = (await getSite(db, alice))!;
    const v = await publishSite(db, alice, site.draftRevision);
    await generateSiteDraft(db, bob);
    await expectCode(rollbackSite(db, bob, v.id), "not_found");
  });
});

describe("roles", () => {
  it("viewers cannot edit and editors cannot publish", async () => {
    const viewer: Ctx = { ...alice, role: "viewer" };
    const editor: Ctx = { ...alice, role: "editor" };
    await expectCode(generateSiteDraft(db, viewer), "forbidden");
    await generateSiteDraft(db, editor);
    const site = (await getSite(db, alice))!;
    await expectCode(publishSite(db, editor, site.draftRevision), "forbidden");
  });
});

describe("website generation", () => {
  it("is idempotent per request and retries failures without a new job", async () => {
    const failed = await generateSiteDraft(db, alice, { requestId: "r1", failForTest: true });
    expect(failed.status).toBe("failed");
    expect(await getSite(db, alice)).toBeNull();

    const retried = await generateSiteDraft(db, alice, { requestId: "r1" });
    expect(retried.id).toBe(failed.id);
    expect(retried.status).toBe("ready");
    expect(retried.attempts).toBe(2);

    const again = await generateSiteDraft(db, alice, { requestId: "r1" });
    expect(again.attempts).toBe(2);
    expect(await db.select().from(jobs)).toHaveLength(1);
  });

  it("a failed regeneration keeps the last good draft", async () => {
    await generateSiteDraft(db, alice, { requestId: "a" });
    const before = (await getSite(db, alice))!;
    await generateSiteDraft(db, alice, { requestId: "b", failForTest: true });
    const after = (await getSite(db, alice))!;
    expect(after.draft).toEqual(before.draft);
    expect(after.draftRevision).toBe(before.draftRevision);
  });

  it("refuses to generate without required facts", async () => {
    const carol = await signUp(db, "carol@example.com");
    await expectCode(generateSiteDraft(db, carol), "not_found");
  });

  it("regenerating one section keeps edits elsewhere", async () => {
    await generateSiteDraft(db, alice);
    let site = (await getSite(db, alice))!;
    const draft = structuredClone(site.draft);
    const hero = draft.pages[0].blocks.find((b) => b.type === "hero")!;
    if (hero.type === "hero") hero.heading = "Edited heading";
    site = await saveDraft(db, alice, draft, site.draftRevision);

    const faq = site.draft.pages[0].blocks.find((b) => b.type === "faq")!;
    site = await regenerateBlock(db, alice, faq.id, site.draftRevision);
    const heroAfter = site.draft.pages[0].blocks.find((b) => b.type === "hero")!;
    expect(heroAfter.type === "hero" && heroAfter.heading).toBe("Edited heading");
  });
});

describe("drafts and publishing", () => {
  it("rejects stale draft saves", async () => {
    await generateSiteDraft(db, alice);
    const site = (await getSite(db, alice))!;
    await saveDraft(db, alice, site.draft, site.draftRevision);
    await expectCode(saveDraft(db, alice, site.draft, site.draftRevision), "precondition_failed");
  });

  it("draft edits cannot change server-owned facts", async () => {
    await generateSiteDraft(db, alice);
    const site = (await getSite(db, alice))!;
    const tampered = { ...site.draft, facts: { ...site.draft.facts, phone: "+1 555 000 0000" } };
    const saved = await saveDraft(db, alice, tampered, site.draftRevision);
    expect(saved.draft.facts.phone).toBe("+91 98765 43210");
  });

  it("publishes immutable versions, keeps the live site on edits, and rolls back", async () => {
    await generateSiteDraft(db, alice);
    let site = (await getSite(db, alice))!;
    const v1 = await publishSite(db, alice, site.draftRevision);

    const draft = structuredClone(site.draft);
    const hero = draft.pages[0].blocks.find((b) => b.type === "hero")!;
    if (hero.type === "hero") hero.heading = "Version two";
    site = await saveDraft(db, alice, draft, site.draftRevision);

    let live = await getPublishedSite(db, site.slug);
    expect(live.kind === "site" && live.versionNumber).toBe(1);

    await expectCode(publishSite(db, alice, site.draftRevision - 1), "precondition_failed");
    const v2 = await publishSite(db, alice, site.draftRevision);
    live = await getPublishedSite(db, site.slug);
    expect(live.kind === "site" && live.versionNumber).toBe(2);

    await rollbackSite(db, alice, v1.id);
    live = await getPublishedSite(db, site.slug);
    expect(live.kind === "site" && live.versionNumber).toBe(1);
    expect((await listVersions(db, alice)).map((v) => v.id)).toEqual([v2.id, v1.id]);
  });

  it("requires public contact confirmation, which resets when contact details change", async () => {
    await generateSiteDraft(db, alice);
    const b = (await getBusiness(db, alice))!;
    await updateBusinessDetails(db, alice, {
      name: b.name,
      category: b.category,
      city: b.city,
      phone: "+91 90000 00000",
      whatsapp: null,
      email: null,
      description: null,
      audience: null,
      region: null,
      address: null,
      showAddress: false,
      websiteUrl: null,
      bookingUrl: null,
      services: b.services,
      serviceAreas: b.serviceAreas,
      hours: [],
      expectedVersion: b.version,
    });
    const site = (await getSite(db, alice))!;
    await expectCode(publishSite(db, alice, site.draftRevision), "precondition_failed");
  });

  it("slug changes keep the old address redirecting", async () => {
    await generateSiteDraft(db, alice);
    const site = (await getSite(db, alice))!;
    await publishSite(db, alice, site.draftRevision);
    await changeSiteSlug(db, alice, "sharma-pune");
    expect(await getPublishedSite(db, site.slug)).toEqual({ kind: "redirect", slug: "sharma-pune" });
    await expectCode(changeSiteSlug(db, bob, "admin"), "invalid");
    await generateSiteDraft(db, bob);
    await expectCode(changeSiteSlug(db, bob, site.slug), "conflict");
  });
});

describe("public profile", () => {
  it("never exposes a hidden address and only lists published profiles", async () => {
    await db.update(businesses).set({ address: "12 Secret Lane" }).where(eq(businesses.workspaceId, alice.workspaceId));
    expect(await searchDirectory(db, {})).toHaveLength(0);

    await generateSiteDraft(db, alice);
    const site = (await getSite(db, alice))!;
    await publishSite(db, alice, site.draftRevision);
    const results = await searchDirectory(db, { city: "baner" });
    expect(results).toHaveLength(1);
    const profile = await getPublicProfile(db, results[0].slug);
    expect(JSON.stringify(profile)).not.toContain("Secret Lane");
    expect(profile?.siteSlug).toBe(site.slug);
  });
});

describe("leads", () => {
  it("rejects enquiries for unpublished sites and escapes CSV formulas", async () => {
    await generateSiteDraft(db, alice);
    const site = (await getSite(db, alice))!;
    await expectCode(
      submitLead(db, { siteSlug: site.slug, name: "X", contact: "x@example.com", message: "Hello there" }, "website"),
      "not_found",
    );
    await publishSite(db, alice, site.draftRevision);
    await submitLead(db, { siteSlug: site.slug, name: "=HYPERLINK(1)", contact: "x@example.com", message: "Hello" }, "website");
    const csv = leadsToCsv(await listLeads(db, alice));
    expect(csv).toContain(`"'=HYPERLINK(1)"`);
  });
});

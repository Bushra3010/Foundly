import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { businesses, memberships } from "@/db/schema";
import { consumeLoginToken, createLoginToken, revokeSession, sessionContext, userForSession } from "@/server/auth";
import { getBusiness, publishProfile, saveWebsiteChoice, updateBusinessDetails } from "@/server/business";
import { AppError, type Ctx } from "@/server/context";
import { getPublicProfile, searchDirectory } from "@/server/directory";
import {
  cancelWebsiteRequest,
  createWebsiteRequest,
  deliverWebsiteRequest,
  latestWebsiteRequest,
  listWebsiteRequests,
  updateWebsiteRequest,
} from "@/server/website-requests";
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

  it("reads the session's user and workspace in one query, ignoring workspaces they don't belong to", async () => {
    const { sessionToken } = await consumeLoginToken(db, await createLoginToken(db, "alice@example.com"));
    const s = await sessionContext(db, sessionToken, bob.workspaceId);
    expect(s?.user.email).toBe("alice@example.com");
    expect(s?.ctx).toEqual({ userId: alice.userId, workspaceId: alice.workspaceId, role: alice.role });
    await revokeSession(db, sessionToken);
    expect(await sessionContext(db, sessionToken)).toBeNull();
  });

  it("returning users keep their workspace", async () => {
    const token = await createLoginToken(db, "alice@example.com");
    const { isNew } = await consumeLoginToken(db, token);
    expect(isNew).toBe(false);
    expect(await db.select().from(memberships).where(eq(memberships.userId, alice.userId))).toHaveLength(1);
  });
});

const brief = { goal: "Get more bookings from families in Pune", pages: null, style: null, examples: null, contactMethod: "whatsapp" as const, contactValue: "+91 98765 43210", contactTime: null };
const team = { email: "team@foundly.example", userId: "" };

describe("tenant isolation", () => {
  it("each workspace only sees its own business and website request", async () => {
    expect((await getBusiness(db, alice))?.name).toBe("Sharma Plumbing");
    expect((await getBusiness(db, bob))?.name).toBe("Bob Tours");

    await createWebsiteRequest(db, alice, brief);
    expect(await latestWebsiteRequest(db, bob)).toBeNull();
    await expectCode(cancelWebsiteRequest(db, bob), "not_found");
    expect((await latestWebsiteRequest(db, alice))?.status).toBe("new");
  });
});

describe("roles", () => {
  it("viewers cannot request a website; editors can", async () => {
    await expectCode(createWebsiteRequest(db, { ...alice, role: "viewer" }, brief), "forbidden");
    await createWebsiteRequest(db, { ...alice, role: "editor" }, brief);
  });
});

describe("websites", () => {
  beforeEach(() => {
    team.userId = alice.userId;
  });

  it("connects an owner's own website instead of taking a request", async () => {
    await saveWebsiteChoice(db, alice, true, "https://sharmaplumbing.in");
    await expectCode(createWebsiteRequest(db, alice, brief), "conflict");

    await saveWebsiteChoice(db, alice, false, null);
    expect((await getBusiness(db, alice))?.websiteUrl).toBeNull();
    await createWebsiteRequest(db, alice, brief);
  });

  it("allows one open request per business, and a new one after cancelling", async () => {
    await createWebsiteRequest(db, alice, brief);
    await expectCode(createWebsiteRequest(db, alice, brief), "conflict");
    await cancelWebsiteRequest(db, alice);
    expect((await latestWebsiteRequest(db, alice))?.status).toBe("cancelled");
    await createWebsiteRequest(db, alice, brief);
    expect(await listWebsiteRequests(db)).toHaveLength(1);
  });

  it("the team moves a request along, and delivery connects the website", async () => {
    const r = await createWebsiteRequest(db, alice, brief);
    await updateWebsiteRequest(db, team, r.id, "in_progress", "Design ready on Friday");
    expect(await latestWebsiteRequest(db, alice)).toMatchObject({ status: "in_progress", teamNote: "Design ready on Friday" });

    const before = (await getBusiness(db, alice))!.version;
    await deliverWebsiteRequest(db, team, r.id, "https://sharmaplumbing.in", "");
    const b = (await getBusiness(db, alice))!;
    expect(b).toMatchObject({ hasWebsite: true, websiteUrl: "https://sharmaplumbing.in" });
    expect(b.version).toBe(before + 1);
    expect(await latestWebsiteRequest(db, alice)).toMatchObject({ status: "delivered", deliveredUrl: "https://sharmaplumbing.in" });

    await expectCode(updateWebsiteRequest(db, team, r.id, "cancelled", ""), "conflict");
    expect(await listWebsiteRequests(db)).toHaveLength(0);
  });

  it("saving a website address in My Business connects it", async () => {
    const b = (await getBusiness(db, alice))!;
    await updateBusinessDetails(db, alice, {
      name: b.name,
      category: b.category,
      city: b.city,
      phone: b.phone,
      whatsapp: null,
      email: null,
      description: null,
      audience: null,
      region: null,
      address: null,
      showAddress: false,
      websiteUrl: "https://sharmaplumbing.in",
      bookingUrl: null,
      services: b.services,
      serviceAreas: b.serviceAreas,
      hours: [],
      foundedYear: null, teamSize: null, projectsCompleted: null, credentials: null, listings: [], expectedVersion: b.version,
    });
    expect((await getBusiness(db, alice))?.hasWebsite).toBe(true);
  });
});

describe("public profile", () => {
  it("never exposes a hidden address and only lists published profiles", async () => {
    await db.update(businesses).set({ address: "12 Secret Lane" }).where(eq(businesses.workspaceId, alice.workspaceId));
    expect(await searchDirectory(db, {})).toHaveLength(0);

    await publishProfile(db, alice);
    const results = await searchDirectory(db, { city: "baner" });
    expect(results).toHaveLength(1);
    const profile = await getPublicProfile(db, results[0].slug);
    expect(JSON.stringify(profile)).not.toContain("Secret Lane");
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateSite } from "@/lib/site/generate";
import { sniffImageType } from "@/server/assets";
import { contextForUser } from "@/server/auth";
import { getProfile } from "@/server/business";
import { startClaim, verifyClaim } from "@/server/claims";
import { AppError, type Ctx } from "@/server/context";
import { addDomain, siteSlugForHost, verifyDomain } from "@/server/domains";
import { isBlockedIp, safeFetch } from "@/server/safe-fetch";
import { generateSiteDraft, getSite, publishSite } from "@/server/sites";
import { acceptInvite, changeRole, inviteMember, listMembers, removeMember, transferOwnership } from "@/server/team";
import { makeDb, onboard, signUp } from "./helpers";

let db: Db;
let alice: Ctx;
let bob: Ctx;

const code = (c: AppError["code"]) => (e: unknown) => e instanceof AppError && e.code === c;

beforeEach(async () => {
  db = await makeDb();
  alice = await signUp(db, "alice@example.com");
  bob = await signUp(db, "bob@example.com");
  await onboard(db, alice);
  await onboard(db, bob, "Bob Tours");
});

describe("team", () => {
  it("invites are bound to the invited email and grant the chosen role", async () => {
    const token = await inviteMember(db, alice, "bob@example.com", "editor");
    await expect(acceptInvite(db, { id: alice.userId, email: "alice@example.com" }, token)).rejects.toSatisfy(code("forbidden"));
    const ws = await acceptInvite(db, { id: bob.userId, email: "bob@example.com" }, token);
    expect(ws).toBe(alice.workspaceId);
    const bobInAlice = (await contextForUser(db, bob.userId, alice.workspaceId))!;
    expect(bobInAlice).toMatchObject({ workspaceId: alice.workspaceId, role: "editor" });
    // A preferred workspace the user isn't a member of is ignored.
    const carol = await signUp(db, "carol@example.com");
    expect((await contextForUser(db, carol.userId, alice.workspaceId))!.workspaceId).toBe(carol.workspaceId);
    await expect(acceptInvite(db, { id: bob.userId, email: "bob@example.com" }, token)).rejects.toSatisfy(code("invalid"));
  });

  it("protects the last owner and transfers ownership atomically", async () => {
    await expect(removeMember(db, alice, alice.userId)).rejects.toSatisfy(code("precondition_failed"));
    await expect(changeRole(db, alice, alice.userId, "editor")).rejects.toSatisfy(code("precondition_failed"));
    const token = await inviteMember(db, alice, "bob@example.com", "viewer");
    await acceptInvite(db, { id: bob.userId, email: "bob@example.com" }, token);
    await transferOwnership(db, alice, bob.userId);
    const roles = Object.fromEntries((await listMembers(db, alice)).map((m) => [m.email, m.role]));
    expect(roles).toEqual({ "alice@example.com": "editor", "bob@example.com": "owner" });
  });

  it("only owners can invite", async () => {
    await expect(inviteMember(db, { ...alice, role: "editor" }, "x@example.com", "viewer")).rejects.toSatisfy(code("forbidden"));
  });
});

describe("ownership claims", () => {
  async function withWebsite(ctx: Ctx) {
    await db.update(businesses).set({ websiteUrl: "https://sharma.example.in" }).where(eq(businesses.workspaceId, ctx.workspaceId));
  }

  it("verifies by DNS TXT and records the method on the profile", async () => {
    await withWebsite(alice);
    const claim = await startClaim(db, alice, "dns");
    await expect(verifyClaim(db, alice, claim.id, { resolve: async () => [["wrong"]] })).rejects.toSatisfy(code("precondition_failed"));
    await verifyClaim(db, alice, claim.id, { resolve: async () => [[claim.verificationToken]] });
    expect((await getProfile(db, alice))!.verification).toBe("dns");
  });

  it("a second verified claim on the same website becomes a dispute, not a takeover", async () => {
    await withWebsite(alice);
    await withWebsite(bob);
    const a = await startClaim(db, alice, "file");
    await verifyClaim(db, alice, a.id, { fetch: async () => ({ status: 200, body: a.verificationToken }) });
    const b = await startClaim(db, bob, "file");
    await expect(verifyClaim(db, bob, b.id, { fetch: async () => ({ status: 200, body: b.verificationToken }) })).rejects.toSatisfy(code("conflict"));
    expect((await getProfile(db, alice))!.status).toBe("disputed");
    expect((await getProfile(db, bob))!.status).toBe("disputed");
  });
});

describe("custom domains", () => {
  it("requires both TXT and CNAME before serving, and hostnames are unique", async () => {
    await generateSiteDraft(db, alice);
    const site = (await getSite(db, alice))!;
    await publishSite(db, alice, site.draftRevision);
    const d = await addDomain(db, alice, "https://WWW.Sharma.example.in/");
    expect(d.hostname).toBe("www.sharma.example.in");
    await generateSiteDraft(db, bob);
    await expect(addDomain(db, bob, "www.sharma.example.in")).rejects.toSatisfy(code("conflict"));

    const half = await verifyDomain(db, alice, d.id, { txt: async () => [[d.verificationToken]], cname: async () => [] });
    expect(half.status).toBe("failed");
    expect(await siteSlugForHost(db, "www.sharma.example.in")).toBeNull();

    const ok = await verifyDomain(db, alice, d.id, { txt: async () => [[d.verificationToken]], cname: async () => ["sites.example.com."] });
    expect(ok.status).toBe("verified");
    expect(await siteSlugForHost(db, "www.sharma.example.in")).toBe(site.slug);
  });
});

describe("safe fetch", () => {
  it("blocks private, loopback, link-local and metadata addresses", async () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "::1", "fd00::1", "::ffff:127.0.0.1", "0.0.0.0"]) {
      expect(isBlockedIp(ip), ip).toBe(true);
    }
    expect(isBlockedIp("8.8.8.8")).toBe(false);
    for (const url of ["http://127.0.0.1/", "http://localhost/", "http://169.254.169.254/latest/meta-data", "file:///etc/passwd", "http://user:pw@example.com/", "http://example.com:8080/"]) {
      await expect(safeFetch(url), url).rejects.toThrow();
    }
  });
});

describe("uploads and policy pages", () => {
  it("identifies images by signature and rejects SVG", () => {
    expect(sniffImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("image/png");
    expect(sniffImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeNull();
  });

  it("generates an editable privacy page", async () => {
    const [b] = await db.select().from(businesses).where(eq(businesses.workspaceId, alice.workspaceId));
    const privacy = generateSite(b).pages.find((p) => p.key === "privacy");
    expect(privacy?.blocks[0].type).toBe("text");
  });
});

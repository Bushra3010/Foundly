import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { eq } from "drizzle-orm";
import { auditEvents, portfolioProjects } from "@/db/schema";
import { addMedia, adminListProjects, createProject, deleteProject, getMedia, getPublishedProject, listPublishedProjects, makeCover, updateProject } from "@/server/portfolio";
import { makeDb, signUp } from "./helpers";

const admin = async (db: Awaited<ReturnType<typeof makeDb>>) => {
  const ctx = await signUp(db, "founder@example.com");
  return { email: "founder@example.com", userId: ctx.userId };
};
const png = { type: "image/png", bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]) };

describe("portfolio", () => {
  it("seeds the scanned projects hidden, with neutral client labels", async () => {
    const db = await makeDb();
    const all = await adminListProjects(db);
    expect(all.length).toBe(30);
    expect(all.every((p) => !p.published && !p.showClient)).toBe(true);
    expect(await listPublishedProjects(db)).toEqual([]);
  });

  it("shows the client label until the client agrees, and the demo only when live", async () => {
    const db = await makeDb();
    const a = await admin(db);
    const [p] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.slug, "pushpak-ac-service"));
    await updateProject(db, a, p.id, { published: true, demoUrl: "https://pushpak.demo.example", demoLogins: [{ role: "Admin", login: "admin@demo", secret: "demo" }] });

    let pub = await getPublishedProject(db, "pushpak-ac-service");
    expect(pub?.client).toBe("AC service company · New Delhi");
    expect(JSON.stringify(pub)).not.toContain("Pushpak Refrigeration Centre");
    expect(pub?.demoUrl).toBeNull(); // status is still "coming soon"
    expect(pub?.demoLogins).toEqual([]);

    await updateProject(db, a, p.id, { showClient: true, demoStatus: "live" });
    pub = await getPublishedProject(db, "pushpak-ac-service");
    expect(pub?.client).toBe("Pushpak Refrigeration Centre");
    expect(pub?.demoUrl).toBe("https://pushpak.demo.example");
    expect(pub?.demoLogins).toHaveLength(1);

    const audit = await db.select().from(auditEvents).where(eq(auditEvents.target, p.id));
    expect(audit.map((e) => e.action)).toContain("admin.portfolio_updated");
  });

  it("serves screenshots of unpublished projects to admins only, and orders the cover first", async () => {
    const db = await makeDb();
    const a = await admin(db);
    const id = await createProject(db, a, { slug: "test-app", name: "Test app", clientLabel: "Test client", category: "SaaS", summary: "A test project used only in this test." });
    await addMedia(db, a, id, png, "first");
    await addMedia(db, a, id, png, "second");
    await expect(addMedia(db, a, id, { type: "image/svg+xml", bytes: Buffer.from("<svg/>") }, "")).rejects.toThrow(/PNG, JPEG or WebP/);

    await updateProject(db, a, id, { published: true });
    const pub = await getPublishedProject(db, "test-app");
    expect(pub?.media.map((m) => m.caption)).toEqual(["first", "second"]);
    await makeCover(db, a, pub!.media[1].id);
    expect((await getPublishedProject(db, "test-app"))?.media.map((m) => m.caption)).toEqual(["second", "first"]);

    await updateProject(db, a, id, { published: false });
    const mediaId = pub!.media[0].id;
    expect(await getMedia(db, mediaId, false)).toBeNull();
    expect((await getMedia(db, mediaId, true))?.contentType).toBe("image/png");

    await deleteProject(db, a, id);
    expect(await getMedia(db, mediaId, true)).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { improvementActions } from "@/db/schema";
import { approveAction, editActionDraft } from "@/server/audit/service";
import { getBusiness } from "@/server/business";
import { AppError, type Ctx } from "@/server/context";
import { decryptSecret, encryptSecret } from "@/server/crypto";
import { applyWordPressChange, connectWordPress, prepareWordPressChange, rollbackWordPressChange, sectionHtml, type WpHttp } from "@/server/wordpress";
import { makeDb, onboard, signUp } from "./helpers";

const code = (c: AppError["code"]) => (e: unknown) => e instanceof AppError && e.code === c;

function fakeWp(role = "editor") {
  const page = { id: 7, title: { raw: "Home" }, modified_gmt: "2026-10-01T10:00:00", content: { raw: "<p>Welcome</p>" } };
  const writes: unknown[] = [];
  const http: WpHttp = async (url, init) => {
    if (url.includes("/users/me")) return { status: 200, json: { id: 1, roles: [role], capabilities: { edit_pages: true } } };
    if (url.includes("/pages/7") && init.method === "GET") return { status: 200, json: page };
    if (url.includes("/pages/7") && init.method === "POST") {
      writes.push(init.body);
      page.content.raw = (init.body as { content: string }).content;
      page.modified_gmt = "2026-10-02T10:00:00";
      return { status: 200, json: page };
    }
    return { status: 404, json: null };
  };
  return { http, page, writes };
}

let db: Db;
let ctx: Ctx;
beforeEach(async () => {
  db = await makeDb();
  ctx = await signUp(db, "o@example.com");
  await onboard(db, ctx);
});

async function faqAction() {
  const b = (await getBusiness(db, ctx))!;
  const [a] = await db
    .insert(improvementActions)
    .values({ workspaceId: ctx.workspaceId, businessId: b.id, checkKey: "faq", applyKind: "manual", title: "FAQ", evidence: "none", severity: "low", priority: 1, hypothesis: "h", proposedChange: "p", draft: "Q: Do you <script>?\nA: Yes & no." })
    .returning();
  return a;
}

describe("secret encryption", () => {
  it("round-trips and detects tampering", () => {
    const c = encryptSecret("abcd efgh");
    expect(decryptSecret(c)).toBe("abcd efgh");
    const [iv, tag, enc] = c.split(".");
    expect(() => decryptSecret([iv, tag, Buffer.from("x").toString("base64") + enc].join("."))).toThrow();
  });
});

describe("WordPress connector", () => {
  it("rejects administrator accounts and http sites", async () => {
    await expect(connectWordPress(db, ctx, { siteUrl: "https://wp.example.in", username: "admin", password: "x" }, fakeWp("administrator").http)).rejects.toSatisfy(code("invalid"));
    await expect(connectWordPress(db, ctx, { siteUrl: "http://wp.example.in", username: "e", password: "x" }, fakeWp().http)).rejects.toSatisfy(code("invalid"));
  });

  it("escapes owner text, applies only the approved preview, and refuses stale pages", async () => {
    expect(sectionHtml("faq", "Q: Do you <script>?\nA: Yes & no.")).toContain("&lt;script&gt;");
    const wp = fakeWp();
    await connectWordPress(db, ctx, { siteUrl: "https://wp.example.in", username: "editor1", password: "abcd efgh" }, wp.http);
    const a = await faqAction();
    await prepareWordPressChange(db, ctx, a.id, 7, wp.http);
    await expect(applyWordPressChange(db, ctx, a.id, wp.http)).rejects.toSatisfy(code("precondition_failed"));
    await approveAction(db, ctx, a.id, a.draftRevision);
    await applyWordPressChange(db, ctx, a.id, wp.http);
    expect(wp.page.content.raw).toContain("<p>Welcome</p>");
    expect(wp.page.content.raw).toContain("growth-platform:start");
    expect(wp.page.content.raw).not.toContain("<script>");

    await rollbackWordPressChange(db, ctx, a.id, wp.http);
    expect(wp.page.content.raw).toBe("<p>Welcome</p>");
  });

  it("writes nothing if the page changed after the preview", async () => {
    const wp = fakeWp();
    await connectWordPress(db, ctx, { siteUrl: "https://wp.example.in", username: "editor1", password: "pw" }, wp.http);
    const a = await faqAction();
    await prepareWordPressChange(db, ctx, a.id, 7, wp.http);
    const edited = await editActionDraft(db, ctx, a.id, a.draft, a.draftRevision);
    await approveAction(db, ctx, a.id, edited.draftRevision);
    wp.page.modified_gmt = "2026-10-05T09:00:00"; // someone edited in WordPress
    await expect(applyWordPressChange(db, ctx, a.id, wp.http)).rejects.toSatisfy(code("precondition_failed"));
    expect(wp.writes).toHaveLength(0);
  });
});

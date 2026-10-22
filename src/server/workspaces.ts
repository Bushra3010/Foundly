import { and, count, eq, isNotNull } from "drizzle-orm";
import type { Db } from "@/db";
import { businesses, leads, memberships, sites, workspaces } from "@/db/schema";
import { audit } from "./context";

/** Every workspace the user belongs to, with a small portfolio summary. */
export async function listUserWorkspaces(db: Db, userId: string) {
  const rows = await db
    .select({ id: workspaces.id, name: workspaces.name, role: memberships.role, business: businesses.name, businessId: businesses.id })
    .from(memberships)
    .innerJoin(workspaces, eq(workspaces.id, memberships.workspaceId))
    .leftJoin(businesses, eq(businesses.workspaceId, workspaces.id))
    .where(eq(memberships.userId, userId));
  return Promise.all(
    rows.map(async (r) => {
      const [[{ n: leadCount }], [live]] = await Promise.all([
        db.select({ n: count() }).from(leads).where(and(eq(leads.workspaceId, r.id), eq(leads.status, "new"))),
        db.select({ id: sites.id }).from(sites).where(and(eq(sites.workspaceId, r.id), isNotNull(sites.publishedVersionId))),
      ]);
      return { ...r, newLeads: leadCount, siteLive: !!live };
    }),
  );
}

export async function createWorkspace(db: Db, userId: string, name: string) {
  return db.transaction(async (tx) => {
    const [ws] = await tx.insert(workspaces).values({ name: name.trim().slice(0, 80) || "New workspace" }).returning();
    await tx.insert(memberships).values({ workspaceId: ws.id, userId, role: "owner" });
    await audit(tx, { workspaceId: ws.id, userId }, "workspace.created", ws.id);
    return ws;
  });
}

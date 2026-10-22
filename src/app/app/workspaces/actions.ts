"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { requireCtx, setWorkspaceCookie } from "@/lib/auth/session";
import { contextForUser } from "@/server/auth";
import { createWorkspace } from "@/server/workspaces";

export async function switchWorkspaceAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireCtx();
  const target = String(form.get("workspaceId"));
  // Only switch to a workspace the user actually belongs to.
  const resolved = await contextForUser(await getDb(), ctx.userId, target);
  if (resolved?.workspaceId !== target) return { ok: false, message: "You don't have access to that workspace." };
  await setWorkspaceCookie(target);
  redirect("/app");
}

export async function createWorkspaceAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const ctx = await requireCtx();
    const ws = await createWorkspace(await getDb(), ctx.userId, String(form.get("name") ?? ""));
    await setWorkspaceCookie(ws.id);
  } catch (err) {
    return toActionError(err);
  }
  redirect("/onboarding");
}

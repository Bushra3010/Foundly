"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { requireCtx, setWorkspaceCookie } from "@/lib/auth/session";
import { acceptInvite } from "@/server/team";

export async function acceptInviteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let workspaceId: string;
  try {
    const ctx = await requireCtx();
    workspaceId = await acceptInvite(await getDb(), ctx.user, String(form.get("token") ?? ""));
    await setWorkspaceCookie(workspaceId);
  } catch (err) {
    return toActionError(err);
  }
  redirect("/app");
}

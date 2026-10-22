import type { Role } from "@/db/schema";
import type { DbOrTx } from "@/db";
import { auditEvents } from "@/db/schema";

/**
 * Tenant context resolved on the server from the session. Never built from
 * client-supplied workspace ids.
 */
export type Ctx = { userId: string; workspaceId: string; role: Role };

const RANK: Record<Role, number> = { viewer: 0, editor: 1, owner: 2 };

export type ErrorCode =
  | "forbidden"
  | "not_found"
  | "conflict"
  | "invalid"
  | "rate_limited"
  | "precondition_failed";

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export function can(ctx: Ctx, min: Role): boolean {
  return RANK[ctx.role] >= RANK[min];
}

export function requireRole(ctx: Ctx, min: Role): void {
  if (!can(ctx, min)) {
    throw new AppError("forbidden", `This action needs the ${min} role. Ask a workspace owner for access.`);
  }
}

export async function audit(
  db: DbOrTx,
  ctx: Pick<Ctx, "workspaceId" | "userId"> | null,
  action: string,
  target?: string,
  data?: Record<string, unknown>,
) {
  await db.insert(auditEvents).values({
    workspaceId: ctx?.workspaceId ?? null,
    actorUserId: ctx?.userId ?? null,
    action,
    target,
    data,
  });
}

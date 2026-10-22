import "server-only";
import { unstable_rethrow } from "next/navigation";
import { AppError } from "@/server/context";
import type { FieldErrors } from "./validation";

export type ActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
  /** Echoed back so a failed submit keeps what the owner typed. */
  values?: Record<string, string>;
};

export function formValues(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string" && !k.startsWith("$")) out[k] = v;
  return out;
}

/** Converts known errors into a message shown beside the form; rethrows the rest. */
export function toActionError(err: unknown, values?: Record<string, string>): ActionState {
  unstable_rethrow(err);
  if (err instanceof AppError) return { ok: false, message: err.message, values };
  console.error(err);
  return { ok: false, message: "Something went wrong on our side. Your entries are kept — please try again.", values };
}

import "server-only";
import { cookies } from "next/headers";

export const IDEAS_COOKIE = "foundly_ideas";
export const RIVALS_COOKIE = "foundly_rivals";
export const setupCookie = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/onboarding", maxAge: 30 * 60 };

export type Suggestions = { items: string[]; source: "ai" | "details" };

/** Suggestions made by AI during setup, kept briefly so a reload doesn't ask again. */
export async function readSetupSuggestions(): Promise<{ ideas: Suggestions | null; rivals: Suggestions | null }> {
  const jar = await cookies();
  const parse = (v?: string): Suggestions | null => {
    try {
      const x = v ? JSON.parse(v) : null;
      return Array.isArray(x?.items) ? { items: (x.items as unknown[]).map(String).slice(0, 12), source: x.source === "ai" ? "ai" : "details" } : null;
    } catch {
      return null;
    }
  };
  return { ideas: parse(jar.get(IDEAS_COOKIE)?.value), rivals: parse(jar.get(RIVALS_COOKIE)?.value) };
}

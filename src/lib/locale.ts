import "server-only";
import type { Locale } from "./i18n";

/** The interface is English only. */
export async function getLocale(): Promise<Locale> {
  return "en";
}

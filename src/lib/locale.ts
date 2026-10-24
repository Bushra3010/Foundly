import "server-only";
import type { Locale } from "./i18n";

/** The interface is English only for now; Hindi strings are kept but not offered. */
export async function getLocale(): Promise<Locale> {
  return "en";
}

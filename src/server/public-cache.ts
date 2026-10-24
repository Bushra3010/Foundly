import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Public pages (customer sites, profiles and the directory pages)
 * are cached at the edge and rebuilt at most every few minutes, so visitors
 * and AI crawlers never wait on the database. Call this after anything that
 * changes what those pages show, and they are rebuilt on the next visit.
 *
 * It clears every public page rather than tracking which ones changed: at
 * this size that is cheap, and it can never leave a page stale.
 */
export function refreshPublicPages() {
  try {
    revalidatePath("/s/[slug]", "layout");
    revalidatePath("/d/[host]/[[...path]]", "page");
    revalidatePath("/b/[slug]", "layout");
    revalidatePath("/directory", "layout");
  } catch {
    // Outside a request (tests, scripts) there is no cache to clear.
  }
}

/** Runs a change, then clears the public pages once it has been saved. */
export async function withPublicRefresh<T>(change: Promise<T>): Promise<T> {
  const result = await change;
  refreshPublicPages();
  return result;
}

import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { isPlatformAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Every admin page calls this before doing any work. Signed-out visitors go to
 * the admin sign-in page; signed-in non-admins get a 404 so the console isn't
 * advertised. Layouts and pages render in parallel, so the layout check alone
 * would still let a page run its queries.
 */
export const requireAdminPage = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isPlatformAdmin(user.email)) notFound();
  return user;
});

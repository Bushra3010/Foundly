import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPlatformAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  // Non-admins get a 404 so the console's existence isn't advertised.
  if (!user || !isPlatformAdmin(user.email)) notFound();
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-surface">
        <nav aria-label="Admin" className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2">
          <span className="mr-4 font-bold">Admin console</span>
          {[
            ["/admin", "Overview"],
            ["/admin/businesses", "Businesses"],
            ["/admin/claims", "Ownership claims"],
            ["/app", "Back to app"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium hover:bg-surface-2">
              {label}
            </Link>
          ))}
          <span className="ml-auto text-sm text-muted">{user.email}</span>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}

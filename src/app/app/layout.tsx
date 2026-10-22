import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BottomNav, SidebarNav } from "@/components/app-nav";
import { getDb } from "@/db";
import { isPlatformAdmin } from "@/lib/admin";
import { requireCtx } from "@/lib/auth/session";
import { getLocale } from "@/lib/locale";
import { getBusiness } from "@/server/business";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireCtx();
  const locale = await getLocale();
  const business = await getBusiness(await getDb(), ctx);
  if (!business?.onboardingCompletedAt) redirect("/onboarding");
  const extra = [
    { href: "/app/workspaces", label: "Workspaces", icon: "⧉" },
    ...(isPlatformAdmin(ctx.user.email) ? [{ href: "/admin", label: "Admin console", icon: "⛨" }] : []),
  ];

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-border bg-surface p-4 lg:block">
        <Link href="/app" className="mb-1 block px-3 py-2 text-lg font-bold">
          Growth Platform
        </Link>
        <Link href="/app/workspaces" className="mb-4 block truncate px-3 text-sm text-muted hover:underline">
          {business.name} ▾
        </Link>
        <nav aria-label="Main">
          <SidebarNav locale={locale} extra={extra} />
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
          <Link href="/app" className="font-bold">
            Growth Platform
          </Link>
          <Link href="/app/workspaces" className="max-w-[50%] truncate text-sm text-muted">
            {business.name} ▾
          </Link>
        </header>
        <main id="main" lang={locale} className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:px-6 lg:pb-12">
          {children}
        </main>
      </div>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        <BottomNav locale={locale} />
      </nav>
    </div>
  );
}

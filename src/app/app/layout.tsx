import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand, Icon } from "@/components/icon";
import { BottomNav, SidebarNav } from "@/components/app-nav";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { getLocale } from "@/lib/locale";
import { getBusiness } from "@/server/business";
import "./dashboard.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireCtx();
  const locale = await getLocale();
  const business = await getBusiness(await getDb(), ctx);
  if (!business?.onboardingCompletedAt) redirect("/onboarding");
  // The founder console lives separately at /admin with its own sign-in.
  const extra = [{ href: "/app/workspaces", label: "Workspaces", icon: "⧉" }];

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link href="/app" className="sidebar-brand">
          <Brand />
        </Link>
        <Link href="/app/workspaces" className="workspace-switch">
          <span className="workspace-avatar">
            {business.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {business.name}
            </span>
          </span>
          <Icon name="down" size={16} />
        </Link>
        <p className="nav-caption">WORKSPACE</p>
        <nav aria-label="Main">
          <SidebarNav locale={locale} extra={extra} />
        </nav>
        <div className="sidebar-footer">
          <Link href="/app/settings" className="account-link">
            <span className="account-avatar">
              {ctx.user.email.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold">Your account</span>
              <span className="block truncate text-xs text-muted">
                {ctx.user.email}
              </span>
            </span>
            <Icon name="settings" size={17} />
          </Link>
        </div>
      </aside>
      <div className="app-content">
        <header className="app-topbar">
          <Link href="/app" className="mobile-brand">
            <Brand />
          </Link>
          <div className="desktop-breadcrumb">
            <Icon name="home" size={14} />
            <Link href="/app">Home</Link>
            <span className="breadcrumb-divider">/</span>
            <span className="font-medium text-text">{business.name}</span>
          </div>
          <div className="topbar-actions">
            <Link href="/app/website" className="topbar-site">
              <Icon name="globe" size={16} />
              <span>Your website</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link
              href="/app/workspaces"
              className="topbar-avatar"
              aria-label={`Switch workspace: ${business.name}`}
            >
              {business.name.slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>
        <main id="main" lang={locale} className="app-main">
          {children}
        </main>
      </div>
      <nav aria-label="Main" className="mobile-bottom-nav">
        <BottomNav locale={locale} />
      </nav>
    </div>
  );
}

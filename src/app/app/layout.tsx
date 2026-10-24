import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand, Icon } from "@/components/icon";
import { BottomNav, SidebarNav } from "@/components/app-nav";
import { signOut } from "@/app/login/actions";
import { signOutEverywhereAction } from "./settings/actions";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { getLocale } from "@/lib/locale";
import "./dashboard.css";
import { currentBusiness } from "@/server/current";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireCtx();
  const locale = await getLocale();
  const business = await currentBusiness(await getDb(), ctx);
  if (!business?.onboardingCompletedAt) redirect("/onboarding");

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link href="/app" className="sidebar-brand">
          <Brand />
        </Link>
        <div className="workspace-switch">
          <span className="workspace-avatar">
            {business.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {business.name}
            </span>
          </span>
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav aria-label="Main">
          <SidebarNav locale={locale} />
        </nav>
      </aside>
      <div className="app-content">
        <header className="app-topbar">
          <Link href="/app" className="mobile-brand mobile-workspace" aria-label={`${business.name} home`}>
            <span className="mobile-workspace-avatar" aria-hidden="true">{business.name.slice(0, 1).toUpperCase()}</span>
            <span className="mobile-workspace-copy">
              <span className="mobile-workspace-label">Your workspace</span>
              <span className="mobile-workspace-name">{business.name}</span>
            </span>
          </Link>
          <div className="desktop-breadcrumb">
            <Icon name="home" size={14} />
            <Link href="/app">Home</Link>
            <span className="breadcrumb-divider">/</span>
            <span className="font-medium text-text">{business.name}</span>
          </div>
          <div className="topbar-actions">
            {business.hasWebsite && business.websiteUrl ? (
              // The owner's own site, in a new tab so Foundly stays open.
              <a href={business.websiteUrl} target="_blank" rel="noopener noreferrer" className="topbar-site">
                <Icon name="globe" size={16} />
                <span>Your website</span>
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <Link href="/app/website" className="topbar-site">
                <Icon name="globe" size={16} />
                <span>Connect website</span>
              </Link>
            )}
            <details className="profile-menu">
              <summary className="topbar-avatar" aria-label="Your account">
                {ctx.user.email.slice(0, 1).toUpperCase()}
              </summary>
              <div className="profile-menu-panel">
                <div className="profile-menu-head">
                  <span className="block text-xs font-semibold">Your account</span>
                  <span className="block truncate text-xs text-muted">
                    {ctx.user.email}
                  </span>
                </div>
                <form action={signOut}>
                  <button type="submit" className="profile-menu-item">
                    <Icon name="arrow" size={16} />
                    Sign out
                  </button>
                </form>
                <form action={signOutEverywhereAction}>
                  <button type="submit" className="profile-menu-item">
                    <Icon name="arrow" size={16} />
                    Sign out on all devices
                  </button>
                </form>
              </div>
            </details>
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

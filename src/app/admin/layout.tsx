import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand, Icon } from "@/components/icon";
import { isPlatformAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminSidebarNav, AdminTabs } from "./admin-nav";
import "../app/dashboard.css";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Foundly admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  // Non-admins get a 404 so the console's existence isn't advertised.
  if (!user || !isPlatformAdmin(user.email)) notFound();
  return (
    <div className="app-shell admin-shell">
      <aside className="app-sidebar">
        <Link href="/admin" className="sidebar-brand">
          <Brand />
        </Link>
        <span className="admin-badge"><Icon name="shield" size={14} /> Admin console</span>
        <p className="nav-caption">MANAGE</p>
        <nav aria-label="Admin">
          <AdminSidebarNav />
        </nav>
        <div className="sidebar-footer">
          <Link href="/app" className="account-link">
            <span className="account-avatar">{user.email.slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold">Back to the app</span>
              <span className="block truncate text-xs text-muted">{user.email}</span>
            </span>
            <Icon name="arrow" size={17} />
          </Link>
        </div>
      </aside>
      <div className="app-content">
        <header className="app-topbar">
          <Link href="/admin" className="mobile-brand">
            <Brand />
          </Link>
          <div className="desktop-breadcrumb">
            <Icon name="shield" size={14} />
            <span className="font-medium text-text">Admin console</span>
          </div>
          <div className="topbar-actions">
            <Link href="/app" className="topbar-site">
              <Icon name="home" size={16} />
              <span>Open app</span>
            </Link>
          </div>
        </header>
        <AdminTabs />
        <main id="main" className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}

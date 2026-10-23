import type { Metadata } from "next";
import Link from "next/link";
import { Brand, Icon } from "@/components/icon";
import { requireAdminPage } from "@/lib/admin-guard";
import { adminSignOut } from "@/app/login/actions";
import { AdminSidebarNav, AdminTabs } from "./admin-nav";
import "../../app/dashboard.css";
import "../admin.css";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Foundly admin" }, robots: { index: false, follow: false } };

// The founder console is its own area: its own sign-in, dark theme and navigation,
// with no links into owners' workspaces except the audited support view.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();
  return (
    <div className="app-shell admin-shell">
      <aside className="app-sidebar">
        <Link href="/admin" className="sidebar-brand">
          <Brand />
        </Link>
        <span className="admin-badge"><Icon name="shield" size={14} /> Founder console</span>
        <p className="nav-caption">MANAGE</p>
        <nav aria-label="Admin">
          <AdminSidebarNav />
        </nav>
        <div className="sidebar-footer">
          <div className="admin-account">
            <span className="account-avatar">{user.email.slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold">Signed in as admin</span>
              <span className="block truncate text-xs text-muted">{user.email}</span>
            </span>
          </div>
          <form action={adminSignOut}>
            <button type="submit" className="admin-signout"><Icon name="arrow" size={15} /> Sign out</button>
          </form>
        </div>
      </aside>
      <div className="app-content">
        <header className="app-topbar">
          <Link href="/admin" className="mobile-brand">
            <Brand />
          </Link>
          <div className="desktop-breadcrumb">
            <Icon name="shield" size={14} />
            <span className="font-medium text-text">Founder console</span>
          </div>
          <div className="topbar-actions">
            <a href="/" target="_blank" rel="noreferrer" className="topbar-site">
              <Icon name="globe" size={16} />
              <span>View public site</span>
            </a>
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

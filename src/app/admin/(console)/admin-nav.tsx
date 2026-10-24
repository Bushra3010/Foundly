"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: "home" },
  { href: "/admin/users", label: "Users", icon: "workspaces" },
  { href: "/admin/businesses", label: "Businesses", icon: "business" },
  { href: "/admin/websites", label: "Website requests", icon: "website" },
  { href: "/admin/claims", label: "Ownership claims", icon: "shield" },
];

function active(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {ITEMS.map((i) => (
        <li key={i.href}>
          <Link href={i.href} aria-current={active(pathname, i.href) ? "page" : undefined} className={`sidebar-link flex min-h-11 items-center gap-3 rounded-lg px-3 font-medium${active(pathname, i.href) ? " is-active" : ""}`}>
            <Icon name={i.icon} />
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="admin-tabs">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} aria-current={active(pathname, i.href) ? "page" : undefined}>
          <Icon name={i.icon} size={16} />
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav-items";
import { cx } from "./ui";


const MOBILE = [
  { href: "/app", label: "Home", icon: "⌂" },
  { href: "/app/website", label: "Website", icon: "◧" },
  { href: "/app/visibility", label: "Visibility", icon: "◎" },
  { href: "/app/more", label: "More", icon: "☰" },
];

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 font-medium",
                active ? "bg-brand text-brand-contrast" : "text-text hover:bg-surface-2",
              )}
            >
              <span aria-hidden="true" className="w-5 text-center">
                {item.icon}
              </span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const moreActive = !MOBILE.slice(0, 3).some((i) => isActive(pathname, i.href));
  return (
    <ul className="grid grid-cols-4">
      {MOBILE.map((item) => {
        const active = item.href === "/app/more" ? moreActive : isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold",
                active ? "text-brand" : "text-muted",
              )}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {item.icon}
              </span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

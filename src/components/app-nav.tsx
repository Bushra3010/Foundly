"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type Locale } from "@/lib/i18n";
import { MOBILE_NAV, NAV } from "./nav-items";
import { cx } from "./ui";
import { Icon } from "./icon";

function isActive(pathname: string, href: string) {
  return href === "/app"
    ? pathname === "/app"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  locale,
  extra = [],
}: {
  locale: Locale;
  extra?: { href: string; label: string; icon: string }[];
}) {
  const pathname = usePathname();
  const items = [
    ...NAV.map((i) => ({ ...i, label: t(locale, i.key) })),
    ...extra,
  ];
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "sidebar-link flex min-h-11 items-center gap-3 rounded-lg px-3 font-medium",
                active ? "is-active" : "",
              )}
            >
              <Icon name={item.href} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const moreActive = !MOBILE_NAV.slice(0, 3).some((i) =>
    isActive(pathname, i.href),
  );
  return (
    <ul className="grid grid-cols-4">
      {MOBILE_NAV.map((item) => {
        const active =
          item.href === "/app/more"
            ? moreActive
            : isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "bottom-link flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold",
                active ? "is-active text-brand" : "text-muted",
              )}
            >
              <Icon name={item.href} size={21} />
              {t(locale, item.key)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

import type { MessageKey } from "@/lib/i18n";

/** The places an owner needs. Business details, improvements and reports open from Settings. */
export const NAV: { href: string; key: MessageKey; icon: string }[] = [
  { href: "/app", key: "nav.dashboard", icon: "⌂" },
  { href: "/app/visibility", key: "nav.keywords", icon: "◎" },
  { href: "/app/compare", key: "nav.compare", icon: "⇄" },
  { href: "/app/website", key: "nav.website", icon: "◧" },
  { href: "/app/presence", key: "nav.social", icon: "◍" },
  { href: "/app/settings", key: "nav.settings", icon: "⚙" },
];

export const MOBILE_NAV: { href: string; key: MessageKey; icon: string }[] = [
  { href: "/app", key: "nav.dashboard", icon: "⌂" },
  { href: "/app/visibility", key: "nav.keywords", icon: "◎" },
  { href: "/app/website", key: "nav.websiteShort", icon: "◧" },
  { href: "/app/presence", key: "nav.socialShort", icon: "◍" },
  { href: "/app/settings", key: "nav.settings", icon: "⚙" },
];

/** Other pages, linked from Settings and the mobile More page. */
export const MORE_NAV: { href: string; key: MessageKey; icon: string }[] = [
  { href: "/app/compare", key: "nav.compare", icon: "⇄" },
  { href: "/app/business", key: "nav.business", icon: "▣" },
  { href: "/app/improve", key: "nav.improve", icon: "↗" },
  { href: "/app/reports", key: "nav.reports", icon: "▤" },
];

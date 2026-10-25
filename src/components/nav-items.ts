import type { MessageKey } from "@/lib/i18n";

export const NAV: { href: string; key: MessageKey; icon: string }[] = [
  { href: "/app", key: "nav.performance", icon: "▲" },
  { href: "/app/keywords", key: "nav.keywords", icon: "#" },
  { href: "/app/website", key: "nav.websiteShort", icon: "◧" },
  { href: "/app/connections", key: "nav.connections", icon: "◍" },
  { href: "/app/settings", key: "nav.settings", icon: "⚙" },
];

export const MOBILE_NAV: { href: string; key: MessageKey; icon: string }[] = [
  { href: "/app", key: "nav.performance", icon: "▲" },
  { href: "/app/keywords", key: "nav.keywords", icon: "#" },
  { href: "/app/website", key: "nav.websiteShort", icon: "◧" },
  { href: "/app/connections", key: "nav.connectionsShort", icon: "◍" },
  { href: "/app/more", key: "nav.more", icon: "☰" },
];

/** Everything else, one tap away from More (mobile) and Settings. */
export const SECONDARY_NAV: { href: string; key: MessageKey; icon: string }[] = [
  { href: "/app/leads", key: "nav.leads", icon: "✉" },
  { href: "/app/business", key: "nav.business", icon: "▣" },
  { href: "/app/improve", key: "nav.improve", icon: "↗" },
  { href: "/app/visibility", key: "nav.visibility", icon: "◎" },
  { href: "/app/reports", key: "nav.reports", icon: "▤" },
];

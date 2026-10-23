import type { MessageKey } from "@/lib/i18n";

export const NAV: { href: string; key: MessageKey; icon: string }[] = [
  { href: "/app", key: "nav.home", icon: "⌂" },
  { href: "/app/business", key: "nav.business", icon: "▣" },
  { href: "/app/website", key: "nav.website", icon: "◧" },
  { href: "/app/visibility", key: "nav.visibility", icon: "◎" },
  { href: "/app/improve", key: "nav.improve", icon: "↗" },
  { href: "/app/presence", key: "nav.presence", icon: "◍" },
  { href: "/app/leads", key: "nav.leads", icon: "✉" },
  { href: "/app/reports", key: "nav.reports", icon: "▤" },
  { href: "/app/settings", key: "nav.settings", icon: "⚙" },
];

export const MOBILE_NAV: { href: string; key: MessageKey; icon: string }[] = [
  { href: "/app", key: "nav.home", icon: "⌂" },
  { href: "/app/website", key: "nav.websiteShort", icon: "◧" },
  { href: "/app/leads", key: "nav.leads", icon: "✉" },
  { href: "/app/visibility", key: "nav.visibilityShort", icon: "◎" },
  { href: "/app/more", key: "nav.more", icon: "☰" },
];

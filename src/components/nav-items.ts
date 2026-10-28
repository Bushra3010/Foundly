import type { MessageKey } from "@/lib/i18n";

export type NavItem = { href: string; key: MessageKey; icon: string; section?: MessageKey };

/** The sidebar, in sections like an analytics tool: measure, then improve, then settings. */
export const NAV: NavItem[] = [
  { href: "/app", key: "nav.overview", icon: "▲", section: "nav.section.search" },
  { href: "/app/keywords", key: "nav.prompts", icon: "#", section: "nav.section.search" },
  { href: "/app/competitors", key: "nav.competitors", icon: "⇄", section: "nav.section.search" },
  { href: "/app/sources", key: "nav.citations", icon: "◉", section: "nav.section.search" },
  { href: "/app/profile", key: "nav.profile", icon: "✦", section: "nav.section.search" },
  { href: "/app/improve", key: "nav.audit", icon: "↗", section: "nav.section.optimize" },
  { href: "/app/website", key: "nav.websiteShort", icon: "◧", section: "nav.section.optimize" },
  { href: "/app/connections", key: "nav.connections", icon: "◍", section: "nav.section.optimize" },
  { href: "/app/settings", key: "nav.settings", icon: "⚙", section: "nav.section.account" },
];

export const MOBILE_NAV: NavItem[] = [
  { href: "/app", key: "nav.overview", icon: "▲" },
  { href: "/app/keywords", key: "nav.prompts", icon: "#" },
  { href: "/app/competitors", key: "nav.competitors", icon: "⇄" },
  { href: "/app/sources", key: "nav.citations", icon: "◉" },
  { href: "/app/more", key: "nav.more", icon: "☰" },
];

/** Other pages, linked from Settings and the mobile More page. */
export const MORE_NAV: NavItem[] = [
  { href: "/app/compare", key: "nav.compare", icon: "⇄" },
  { href: "/app/business", key: "nav.business", icon: "▣" },
  { href: "/app/visibility", key: "nav.visibility", icon: "◎" },
  { href: "/app/reports", key: "nav.reports", icon: "▤" },
];

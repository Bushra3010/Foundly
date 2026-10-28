export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Interface copy only. Website content language and monitored-question
 * language are chosen separately by the owner. The interface is English only.
 */
const dict = {
  "nav.home": { en: "Home" },
  "nav.dashboard": { en: "Dashboard" },
  "nav.performance": { en: "Performance" },
  "nav.overview": { en: "Overview" },
  "nav.prompts": { en: "Prompts" },
  "nav.competitors": { en: "Competitors" },
  "nav.citations": { en: "Citations" },
  "nav.profile": { en: "Brand profile" },
  "nav.audit": { en: "GEO audit & fixes" },
  "nav.section.search": { en: "AI search" },
  "nav.section.optimize": { en: "Optimize" },
  "nav.section.account": { en: "Account" },
  "nav.connections": { en: "Connections" },
  "nav.connectionsShort": { en: "Connect" },
  "nav.sources": { en: "Sources AI reads" },
  "nav.keywords": { en: "Keywords" },
  "nav.compare": { en: "Compare" },
  "nav.social": { en: "Social media" },
  "nav.socialShort": { en: "Social" },
  "nav.business": { en: "My Business" },
  "nav.website": { en: "My Website" },
  "nav.visibility": { en: "AI Visibility" },
  "nav.improve": { en: "Improve My Business" },
  "nav.presence": { en: "Get listed" },
  "nav.reports": { en: "Weekly report" },
  "nav.settings": { en: "Settings" },
  "nav.more": { en: "More" },
  "nav.websiteShort": { en: "Website" },
  "nav.visibilityShort": { en: "Visibility" },
  "home.hello": { en: "Hello" },
  "home.lead": { en: "Here's where things stand and what to do next." },
  "home.next": { en: "Next actions" },
  "home.activity": { en: "Recent activity" },
  "common.save": { en: "Save" },
  "common.language": { en: "Language" },
  "settings.languageHint": {
    en: "Changes the app's interface only. Your website and tracked questions keep their own language.",
  },
} satisfies Record<string, Record<Locale, string>>;

export type MessageKey = keyof typeof dict;

export function t(locale: Locale, key: MessageKey): string {
  return dict[key][locale] ?? dict[key].en;
}

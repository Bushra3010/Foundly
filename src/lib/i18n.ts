export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "abgp_lang";

/**
 * Interface copy only. Website content language and monitored-question
 * language are chosen separately by the owner.
 * Hindi strings are a first pass and should be reviewed by a native speaker
 * before launch.
 */
const dict = {
  "nav.home": { en: "Home", hi: "होम" },
  "nav.performance": { en: "Performance", hi: "परफॉर्मेंस" },
  "nav.keywords": { en: "Keywords", hi: "कीवर्ड" },
  "nav.connections": { en: "Connections", hi: "कनेक्शन" },
  "nav.connectionsShort": { en: "Connect", hi: "कनेक्ट" },
  "nav.business": { en: "My Business", hi: "मेरा व्यवसाय" },
  "nav.website": { en: "My Website", hi: "मेरी वेबसाइट" },
  "nav.visibility": { en: "AI Visibility", hi: "AI में दिखना" },
  "nav.improve": { en: "Improve My Business", hi: "व्यवसाय सुधारें" },
  "nav.presence": { en: "Get listed", hi: "लिस्टिंग" },
  "nav.leads": { en: "Leads", hi: "पूछताछ" },
  "nav.reports": { en: "Reports", hi: "रिपोर्ट" },
  "nav.settings": { en: "Settings", hi: "सेटिंग्स" },
  "nav.more": { en: "More", hi: "और" },
  "nav.websiteShort": { en: "Website", hi: "वेबसाइट" },
  "nav.visibilityShort": { en: "Visibility", hi: "AI" },
  "home.hello": { en: "Hello", hi: "नमस्ते" },
  "home.lead": { en: "Here's where things stand and what to do next.", hi: "आपकी स्थिति और आगे क्या करना है।" },
  "home.next": { en: "Next actions", hi: "अगले कदम" },
  "home.activity": { en: "Recent activity", hi: "हाल की गतिविधि" },
  "common.save": { en: "Save", hi: "सहेजें" },
  "common.language": { en: "Language", hi: "भाषा" },
  "settings.languageHint": {
    en: "Changes the app's interface only. Your website and tracked questions keep their own language.",
    hi: "यह केवल ऐप की भाषा बदलता है। आपकी वेबसाइट और प्रश्नों की भाषा अलग रहती है।",
  },
} satisfies Record<string, Record<Locale, string>>;

export type MessageKey = keyof typeof dict;

export function t(locale: Locale, key: MessageKey): string {
  return dict[key][locale] ?? dict[key].en;
}

export function parseLocale(value: string | undefined): Locale {
  return value === "hi" ? "hi" : "en";
}

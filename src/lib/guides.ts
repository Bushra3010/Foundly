/** Long-form guides, newest last. Shared by the guide pages, sitemap and llms.txt. */

export type GuideMeta = {
  slug: string;
  title: string;
  /** Shorter <title> for search results when the headline runs past about 50 characters. */
  seoTitle?: string;
  description: string;
  published: string;
  updated: string;
};

export const GUIDES: GuideMeta[] = [
  {
    slug: "geo-for-local-businesses",
    seoTitle: "How to get your business recommended by AI",
    title: "How to get your business recommended by ChatGPT, Gemini, Perplexity and Claude",
    description: "A practical GEO guide for local businesses: how ChatGPT, Gemini and other AI assistants choose who to recommend, and a checklist to improve your chances.",
    published: "2026-10-30",
    updated: "2026-10-30",
  },
  {
    slug: "geo-vs-seo",
    seoTitle: "GEO vs SEO: what changes when people ask AI",
    title: "GEO vs SEO: what changes when customers ask AI instead of Google",
    description: "How generative engine optimisation differs from traditional SEO, what stays the same, and how a local business should split its effort between them.",
    published: "2026-10-30",
    updated: "2026-10-30",
  },
  {
    slug: "rank-on-chatgpt",
    seoTitle: "How to get your business mentioned in ChatGPT",
    title: "How to get your business mentioned in ChatGPT answers",
    description: "How ChatGPT finds and recommends local businesses, which crawler it uses, and the steps that make your business easier for it to name and cite.",
    published: "2026-10-30",
    updated: "2026-10-30",
  },
  {
    slug: "google-ai-overviews-and-gemini",
    seoTitle: "How to appear in Google AI Overviews and Gemini",
    title: "How to appear in Google AI Overviews, AI Mode and Gemini",
    description: "What Google has said about AI Overviews and AI Mode, how Gemini differs, what Google-Extended does and does not control, and what a local business should do.",
    published: "2026-10-30",
    updated: "2026-10-30",
  },
  {
    slug: "perplexity-and-claude",
    title: "How to get cited by Perplexity and Claude",
    description: "How Perplexity and Claude search the web and choose sources to cite, which crawlers to allow, and how to become a source they quote.",
    published: "2026-10-30",
    updated: "2026-10-30",
  },
  {
    slug: "choose-seo-aeo-geo-agency",
    title: "How to choose the best SEO, AEO or GEO agency",
    description: "What a good SEO, AEO or GEO agency should show you, the questions to ask before you sign, red flags to avoid, and how to compare agencies in India and abroad.",
    published: "2026-10-30",
    updated: "2026-10-30",
  },
  {
    slug: "what-is-aeo",
    seoTitle: "What is AEO? Answer engine optimisation explained",
    title: "What is AEO? Answer engine optimisation, explained for businesses",
    description: "What answer engine optimisation (AEO) means, how it differs from SEO and GEO, where answer engines show up, and how to become the answer they give.",
    published: "2026-10-30",
    updated: "2026-10-30",
  },
];

export const guideMeta = (slug: string) => GUIDES.find((g) => g.slug === slug)!;

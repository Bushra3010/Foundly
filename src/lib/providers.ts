/**
 * Provider capability matrix for AI visibility monitoring.
 *
 * Every adapter starts disabled. A provider is enabled only after its
 * feasibility and output validation pass (PRD §09); until then the UI shows
 * "Not connected" and no observations or scores exist for it.
 */
export type CollectionMethod = "model_api" | "search_grounded_api" | "consumer_surface_provider";

export type ProviderCapability = {
  key: "chatgpt" | "perplexity" | "gemini" | "claude";
  label: string;
  enabled: boolean;
  method: CollectionMethod | null;
  locale: "none" | "text_instruction" | "native";
  note: string;
};

export const PROVIDERS: ProviderCapability[] = [
  { key: "chatgpt", label: "ChatGPT", enabled: false, method: null, locale: "none", note: "Awaiting feasibility validation" },
  { key: "perplexity", label: "Perplexity", enabled: false, method: null, locale: "none", note: "Awaiting feasibility validation" },
  { key: "gemini", label: "Gemini", enabled: false, method: null, locale: "none", note: "Awaiting feasibility validation" },
  { key: "claude", label: "Claude", enabled: false, method: null, locale: "none", note: "Awaiting feasibility validation" },
];

export const METHOD_LABEL: Record<CollectionMethod, string> = {
  model_api: "Direct model API (may differ from the consumer app)",
  search_grounded_api: "Search-grounded API (may differ from the consumer app)",
  consumer_surface_provider: "Validated consumer-app measurement provider",
};

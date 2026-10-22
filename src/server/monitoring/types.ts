import type { Citation } from "@/db/schema";

export type ProviderKey = "chatgpt" | "perplexity" | "gemini" | "claude";
export type CollectionMethod = "model_api" | "search_grounded_api" | "consumer_surface_provider";
export type LocaleSupport = "native" | "text_instruction" | "none";

export type AskInput = { question: string; location?: string | null; country: string; language: string };

export type AskResult = {
  status: "answered" | "answered_uncited" | "refusal" | "partial" | "timeout" | "unavailable" | "error";
  answer: string | null;
  citations: Citation[];
  model: string | null;
  appliedLocale: "native" | "text_instruction" | "none";
  raw: unknown;
  error?: string;
};

export interface ProviderAdapter {
  key: ProviderKey;
  label: string;
  method: CollectionMethod;
  locale: LocaleSupport;
  /** Env var names this adapter needs; used to explain setup in the UI. */
  requiredEnv: string[];
  configuredModel(): string | null;
  ask(input: AskInput, signal: AbortSignal): Promise<AskResult>;
}

export const METHOD_LABEL: Record<CollectionMethod, string> = {
  model_api: "Direct model API — may differ from what people see in the consumer app",
  search_grounded_api: "Search-grounded API — may differ from what people see in the consumer app",
  consumer_surface_provider: "Validated consumer-app measurement provider",
};

/** Classifies a finished answer by whether it cited anything. */
export function answeredStatus(answer: string, citations: Citation[]): AskResult["status"] {
  if (!answer.trim()) return "partial";
  return citations.length ? "answered" : "answered_uncited";
}

export function dedupeCitations(list: Citation[]): Citation[] {
  const seen = new Set<string>();
  return list.filter((c) => {
    if (!c.url || seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });
}

export function locationInstruction(input: AskInput): string {
  return input.location ? `\n\n(The person asking is in ${input.location}, ${input.country === "IN" ? "India" : input.country}.)` : "";
}

/** Truncates raw provider payloads before storage. */
export function trimRaw(raw: unknown, max = 60_000): unknown {
  const s = JSON.stringify(raw);
  return s.length <= max ? raw : { truncated: true, preview: s.slice(0, max) };
}

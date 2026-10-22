import { claudeAdapter } from "./claude";
import { geminiAdapter } from "./gemini";
import { openaiAdapter } from "./openai";
import { perplexityAdapter } from "./perplexity";
import { METHOD_LABEL, type ProviderAdapter, type ProviderKey } from "./types";

export const ADAPTERS: ProviderAdapter[] = [openaiAdapter, perplexityAdapter, geminiAdapter, claudeAdapter];

export type ProviderState = "not_connected" | "awaiting_validation" | "connected";

/**
 * A provider is used only when its credentials are present AND an operator
 * has marked it validated (`MONITOR_VALIDATED_PROVIDERS=claude,perplexity`)
 * after the feasibility checks in docs/providers.md.
 */
export function providerState(a: ProviderAdapter): ProviderState {
  if (!a.configuredModel()) return "not_connected";
  const validated = (process.env.MONITOR_VALIDATED_PROVIDERS ?? "").split(",").map((s) => s.trim());
  return validated.includes(a.key) ? "connected" : "awaiting_validation";
}

export function enabledAdapters(): ProviderAdapter[] {
  return ADAPTERS.filter((a) => providerState(a) === "connected");
}

export function adapterFor(key: string): ProviderAdapter | undefined {
  return ADAPTERS.find((a) => a.key === (key as ProviderKey));
}

export { METHOD_LABEL };

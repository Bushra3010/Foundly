import Anthropic from "@anthropic-ai/sdk";
import type { Citation } from "@/db/schema";
import { answeredStatus, dedupeCitations, trimRaw, type AskResult, type ProviderAdapter } from "./types";

/**
 * Claude via the Messages API with the server-side web search tool. This is
 * an API measurement, not the claude.ai consumer app.
 */
export const claudeAdapter: ProviderAdapter = {
  key: "claude",
  label: "Claude",
  method: "search_grounded_api",
  locale: "native",
  requiredEnv: ["ANTHROPIC_API_KEY"],
  configuredModel: () => (process.env.ANTHROPIC_API_KEY ? process.env.CLAUDE_MONITOR_MODEL || "claude-opus-5-5" : null),
  async ask(input, signal): Promise<AskResult> {
    const model = this.configuredModel()!;
    const client = new Anthropic({ maxRetries: 2 });
    try {
      const response = await client.beta.messages.create(
        {
          model,
          max_tokens: 16000,
          // Monitoring asks short factual questions; low effort keeps per-observation cost down.
          output_config: { effort: "low" },
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          tools: [
            {
              type: "web_search_20260209",
              name: "web_search",
              max_uses: 5,
              ...(input.location ? { user_location: { type: "approximate" as const, city: input.location, country: input.country } } : {}),
            },
          ],
          messages: [{ role: "user", content: input.question }],
        },
        { signal },
      );
      if (response.stop_reason === "refusal") {
        return { status: "refusal", answer: null, citations: [], model: response.model, appliedLocale: input.location ? "native" : "none", raw: trimRaw(response) };
      }
      const texts: string[] = [];
      const citations: Citation[] = [];
      for (const block of response.content) {
        if (block.type === "text") {
          texts.push(block.text);
          for (const c of block.citations ?? []) {
            if (c.type === "web_search_result_location") citations.push({ url: c.url, title: c.title });
          }
        }
      }
      const answer = texts.join("").trim();
      // pause_turn / max_tokens mean the answer was cut short.
      const status = response.stop_reason === "end_turn" ? answeredStatus(answer, citations) : "partial";
      return { status, answer, citations: dedupeCitations(citations), model: response.model, appliedLocale: input.location ? "native" : "none", raw: trimRaw(response) };
    } catch (err) {
      const status: AskResult["status"] =
        err instanceof Anthropic.APIConnectionTimeoutError
          ? "timeout"
          : err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError
            ? "unavailable"
            : "error";
      return { status, answer: null, citations: [], model, appliedLocale: "none", raw: null, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

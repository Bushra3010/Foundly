import { z } from "zod";
import type { Citation } from "@/db/schema";
import { fetchWithRetry, httpStatusToResult } from "./http";
import { answeredStatus, dedupeCitations, locationInstruction, trimRaw, type AskResult, type ProviderAdapter } from "./types";

const responseShape = z.object({
  model: z.string().optional(),
  choices: z.array(z.object({ finish_reason: z.string().nullable().optional(), message: z.object({ content: z.string().nullable() }) })).min(1),
  citations: z.array(z.string()).optional(),
  search_results: z.array(z.looseObject({ url: z.string(), title: z.string().nullable().optional() })).optional(),
});

/** Perplexity Sonar API. Location is passed as a text instruction only. */
export const perplexityAdapter: ProviderAdapter = {
  key: "perplexity",
  label: "Perplexity (Sonar API)",
  method: "search_grounded_api",
  locale: "text_instruction",
  requiredEnv: ["PERPLEXITY_API_KEY", "PERPLEXITY_MONITOR_MODEL"],
  configuredModel: () => (process.env.PERPLEXITY_API_KEY && process.env.PERPLEXITY_MONITOR_MODEL ? process.env.PERPLEXITY_MONITOR_MODEL : null),
  async ask(input, signal): Promise<AskResult> {
    const model = this.configuredModel()!;
    const applied = input.location ? "text_instruction" : "none";
    try {
      const res = await fetchWithRetry(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages: [{ role: "user", content: input.question + locationInstruction(input) }] }),
        },
        signal,
      );
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) return { status: httpStatusToResult(res.status), answer: null, citations: [], model, appliedLocale: "none", raw: trimRaw(json), error: `HTTP ${res.status}` };
      const parsed = responseShape.safeParse(json);
      if (!parsed.success) return { status: "error", answer: null, citations: [], model, appliedLocale: "none", raw: trimRaw(json), error: "Unexpected response shape" };
      const answer = parsed.data.choices[0].message.content?.trim() ?? "";
      const citations: Citation[] = parsed.data.search_results?.map((r) => ({ url: r.url, title: r.title })) ?? parsed.data.citations?.map((url) => ({ url })) ?? [];
      const status = parsed.data.choices[0].finish_reason === "length" ? "partial" : answeredStatus(answer, citations);
      return { status, answer, citations: dedupeCitations(citations), model: parsed.data.model ?? model, appliedLocale: applied, raw: trimRaw(json) };
    } catch (err) {
      return { status: err instanceof Error && err.name === "TimeoutError" ? "timeout" : "error", answer: null, citations: [], model, appliedLocale: "none", raw: null, error: String(err) };
    }
  },
};

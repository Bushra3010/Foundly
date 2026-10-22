import { z } from "zod";
import type { Citation } from "@/db/schema";
import { fetchWithRetry, httpStatusToResult } from "./http";
import { answeredStatus, dedupeCitations, locationInstruction, trimRaw, type AskResult, type ProviderAdapter } from "./types";

const responseShape = z.object({
  modelVersion: z.string().optional(),
  promptFeedback: z.looseObject({ blockReason: z.string().optional() }).optional(),
  candidates: z
    .array(
      z.looseObject({
        finishReason: z.string().optional(),
        content: z.looseObject({ parts: z.array(z.looseObject({ text: z.string().optional() })).optional() }).optional(),
        groundingMetadata: z
          .looseObject({ groundingChunks: z.array(z.looseObject({ web: z.looseObject({ uri: z.string(), title: z.string().optional() }).optional() })).optional() })
          .optional(),
      }),
    )
    .optional(),
});

/**
 * Gemini API with Google Search grounding. Grounding links are redirect URLs;
 * the `title` holds the source domain, which citation matching also checks.
 */
export const geminiAdapter: ProviderAdapter = {
  key: "gemini",
  label: "Gemini (Gemini API)",
  method: "search_grounded_api",
  locale: "text_instruction",
  requiredEnv: ["GEMINI_API_KEY", "GEMINI_MONITOR_MODEL"],
  configuredModel: () => (process.env.GEMINI_API_KEY && process.env.GEMINI_MONITOR_MODEL ? process.env.GEMINI_MONITOR_MODEL : null),
  async ask(input, signal): Promise<AskResult> {
    const model = this.configuredModel()!;
    const applied = input.location ? "text_instruction" : "none";
    try {
      const res = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "x-goog-api-key": process.env.GEMINI_API_KEY!, "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: input.question + locationInstruction(input) }] }], tools: [{ google_search: {} }] }),
        },
        signal,
      );
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) return { status: httpStatusToResult(res.status), answer: null, citations: [], model, appliedLocale: "none", raw: trimRaw(json), error: `HTTP ${res.status}` };
      const parsed = responseShape.safeParse(json);
      if (!parsed.success) return { status: "error", answer: null, citations: [], model, appliedLocale: "none", raw: trimRaw(json), error: "Unexpected response shape" };
      const cand = parsed.data.candidates?.[0];
      if (parsed.data.promptFeedback?.blockReason || cand?.finishReason === "SAFETY" || cand?.finishReason === "PROHIBITED_CONTENT") {
        return { status: "refusal", answer: null, citations: [], model: parsed.data.modelVersion ?? model, appliedLocale: applied, raw: trimRaw(json) };
      }
      const answer = (cand?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
      const citations: Citation[] = (cand?.groundingMetadata?.groundingChunks ?? []).flatMap((c) => (c.web ? [{ url: c.web.uri, title: c.web.title }] : []));
      const status = cand?.finishReason === "MAX_TOKENS" ? "partial" : answeredStatus(answer, citations);
      return { status, answer, citations: dedupeCitations(citations), model: parsed.data.modelVersion ?? model, appliedLocale: applied, raw: trimRaw(json) };
    } catch (err) {
      return { status: err instanceof Error && err.name === "TimeoutError" ? "timeout" : "error", answer: null, citations: [], model, appliedLocale: "none", raw: null, error: String(err) };
    }
  },
};

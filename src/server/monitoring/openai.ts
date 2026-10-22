import { z } from "zod";
import type { Citation } from "@/db/schema";
import { fetchWithRetry, httpStatusToResult } from "./http";
import { answeredStatus, dedupeCitations, trimRaw, type AskResult, type ProviderAdapter } from "./types";

const responseShape = z.object({
  model: z.string().optional(),
  status: z.string().optional(),
  output: z.array(
    z.looseObject({
      type: z.string(),
      content: z
        .array(
          z.looseObject({
            type: z.string(),
            text: z.string().optional(),
            refusal: z.string().optional(),
            annotations: z.array(z.looseObject({ type: z.string(), url: z.string().optional(), title: z.string().optional() })).optional(),
          }),
        )
        .optional(),
    }),
  ),
});

/** OpenAI Responses API with web search. Not the ChatGPT consumer app. */
export const openaiAdapter: ProviderAdapter = {
  key: "chatgpt",
  label: "ChatGPT (OpenAI API)",
  method: "search_grounded_api",
  locale: "native",
  requiredEnv: ["OPENAI_API_KEY", "OPENAI_MONITOR_MODEL"],
  configuredModel: () => (process.env.OPENAI_API_KEY && process.env.OPENAI_MONITOR_MODEL ? process.env.OPENAI_MONITOR_MODEL : null),
  async ask(input, signal): Promise<AskResult> {
    const model = this.configuredModel()!;
    const tool: Record<string, unknown> = { type: "web_search" };
    if (input.location) tool.user_location = { type: "approximate", city: input.location, country: input.country };
    try {
      const res = await fetchWithRetry(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, input: input.question, tools: [tool] }),
        },
        signal,
      );
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) return { status: httpStatusToResult(res.status), answer: null, citations: [], model, appliedLocale: "none", raw: trimRaw(json), error: `HTTP ${res.status}` };
      const parsed = responseShape.safeParse(json);
      if (!parsed.success) return { status: "error", answer: null, citations: [], model, appliedLocale: "none", raw: trimRaw(json), error: "Unexpected response shape" };
      const texts: string[] = [];
      const citations: Citation[] = [];
      let refused = false;
      for (const item of parsed.data.output) {
        for (const c of item.content ?? []) {
          if (c.type === "refusal") refused = true;
          if (c.type === "output_text" && c.text) {
            texts.push(c.text);
            for (const a of c.annotations ?? []) if (a.type === "url_citation" && a.url) citations.push({ url: a.url, title: a.title });
          }
        }
      }
      const answer = texts.join("\n").trim();
      const applied = input.location ? "native" : "none";
      if (refused && !answer) return { status: "refusal", answer: null, citations: [], model: parsed.data.model ?? model, appliedLocale: applied, raw: trimRaw(json) };
      const status = parsed.data.status === "incomplete" ? "partial" : answeredStatus(answer, citations);
      return { status, answer, citations: dedupeCitations(citations), model: parsed.data.model ?? model, appliedLocale: applied, raw: trimRaw(json) };
    } catch (err) {
      const timeout = err instanceof Error && err.name === "TimeoutError";
      return { status: timeout ? "timeout" : "error", answer: null, citations: [], model, appliedLocale: "none", raw: null, error: String(err) };
    }
  },
};

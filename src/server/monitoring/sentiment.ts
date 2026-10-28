import Anthropic from "@anthropic-ai/sdk";
import type { Tone } from "@/lib/tone";

export type SentimentClassifier = (answer: string, brands: { key: string; name: string }[]) => Promise<Record<string, Tone>>;

const MODEL = () => process.env.CLAUDE_MONITOR_MODEL || "claude-haiku-5-5";

/**
 * Asks Claude how an AI answer talks about each named brand. One short call
 * per answer, no web search. Returns nothing it can't parse, so callers fall
 * back to the wording-based estimate.
 */
export const claudeSentiment: SentimentClassifier = async (answer, brands) => {
  if (!process.env.ANTHROPIC_API_KEY || brands.length === 0) return {};
  const client = new Anthropic({ maxRetries: 1 });
  const names = brands.map((b) => b.name);
  try {
    const res = await client.messages.create(
      {
        model: MODEL(),
        max_tokens: 400,
        output_config: { effort: "low" },
        system:
          "You rate how an AI assistant's answer talks about specific businesses. For each business name given, reply positive (recommended, praised), negative (criticised, warned against, mixed reviews) or neutral (merely listed or mentioned). Reply with only a JSON object mapping each business name exactly as given to one of: positive, neutral, negative.",
        messages: [{ role: "user", content: `Businesses: ${JSON.stringify(names)}\n\nAnswer:\n${answer.slice(0, 6000)}` }],
      },
      { signal: AbortSignal.timeout(30_000) },
    );
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as Record<string, string>;
    const out: Record<string, Tone> = {};
    for (const b of brands) {
      const v = json[b.name]?.toLowerCase();
      if (v === "positive" || v === "negative" || v === "neutral") out[b.key] = v;
    }
    return out;
  } catch {
    return {};
  }
};

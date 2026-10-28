import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/** One prompt in, text out. Every AI writing feature takes one of these so tests can pass a fake. */
export type Completer = (system: string, user: string) => Promise<string>;

/** Claude, with low effort: these are short writing and analysis jobs, not research. */
export const claudeComplete: Completer = async (system, user) => {
  const client = new Anthropic({ maxRetries: 1 });
  const res = await client.messages.create(
    { model: process.env.CLAUDE_MONITOR_MODEL || "claude-haiku-5-5", max_tokens: 2000, output_config: { effort: "low" }, system, messages: [{ role: "user", content: user }] },
    { signal: AbortSignal.timeout(60_000) },
  );
  return res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
};

/** Claude when a key is set, otherwise null so callers fall back or explain. */
export function defaultCompleter(): Completer | null {
  return process.env.ANTHROPIC_API_KEY ? claudeComplete : null;
}

/** The completer to use: the one given (null means none), or Claude when a key is set. */
export function pickCompleter(given: Completer | null | undefined): Completer | null {
  return given === undefined ? defaultCompleter() : given;
}

/** The first JSON object in a model reply, tolerant of text or fences around it. */
export function jsonObject<T>(text: string): T | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

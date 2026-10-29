import { describe, expect, it } from "vitest";
import { groupFor, isAllowed, parseRobots } from "../src/lib/robots";

const allowed = (txt: string, agent: string, path = "/") => isAllowed(groupFor(parseRobots(txt), agent).rules, path);

describe("robots.txt per crawler", () => {
  it("uses a crawler's own group instead of the * group", () => {
    const txt = "User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /";
    expect(allowed(txt, "GPTBot")).toBe(false);
    expect(allowed(txt, "ClaudeBot")).toBe(true);
    expect(groupFor(parseRobots(txt), "gptbot").group).toBe("gptbot");
  });

  it("falls back to * and allows everything with no robots rules", () => {
    expect(allowed("User-agent: *\nDisallow: /", "PerplexityBot")).toBe(false);
    expect(allowed("", "PerplexityBot")).toBe(true);
    expect(allowed("User-agent: *\nDisallow:", "PerplexityBot")).toBe(true);
  });

  it("applies shared groups, longest match, Allow on ties and wildcards", () => {
    const txt = "User-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /private\nAllow: /private/ok\nDisallow: /*.pdf$";
    expect(allowed(txt, "ClaudeBot", "/private/x")).toBe(false);
    expect(allowed(txt, "ClaudeBot", "/private/ok/1")).toBe(true);
    expect(allowed(txt, "GPTBot", "/a/file.pdf")).toBe(false);
    expect(allowed(txt, "GPTBot", "/a/file.pdf?x")).toBe(true);
    expect(allowed("User-agent: x\nDisallow: /a\nAllow: /a", "x", "/a")).toBe(true);
  });
});

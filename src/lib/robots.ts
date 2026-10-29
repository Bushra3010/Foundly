/**
 * robots.txt evaluation per user agent, following RFC 9309: a crawler obeys the
 * group naming its product token (groups for the same token are merged), else
 * the "*" group. Within a group the longest matching rule wins and Allow wins a
 * tie. "*" and a trailing "$" are supported in paths.
 */

type Rule = { allow: boolean; path: string };

export function parseRobots(txt: string): Map<string, Rule[]> {
  const groups = new Map<string, Rule[]>();
  let agents: string[] = [];
  let inRules = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const i = line.indexOf(":");
    if (i < 0) continue;
    const key = line.slice(0, i).trim().toLowerCase();
    const value = line.slice(i + 1).trim();
    if (key === "user-agent") {
      // A user-agent line after rules starts a new group.
      if (inRules) agents = [];
      inRules = false;
      const ua = value.toLowerCase();
      agents.push(ua);
      if (!groups.has(ua)) groups.set(ua, []);
    } else if ((key === "allow" || key === "disallow") && agents.length) {
      inRules = true;
      // An empty Disallow allows everything, so it adds no rule.
      if (value) for (const a of agents) groups.get(a)!.push({ allow: key === "allow", path: value });
    }
  }
  return groups;
}

function matches(pattern: string, path: string): boolean {
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern).split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`).test(path);
}

/** Which group applies to this crawler: its own token, or "*" when it has none. */
export function groupFor(groups: Map<string, Rule[]>, agent: string): { group: string | null; rules: Rule[] } {
  const token = agent.toLowerCase();
  if (groups.has(token)) return { group: token, rules: groups.get(token)! };
  if (groups.has("*")) return { group: "*", rules: groups.get("*")! };
  return { group: null, rules: [] };
}

export function isAllowed(rules: Rule[], path: string): boolean {
  let best: Rule | null = null;
  for (const r of rules) {
    if (!matches(r.path, path)) continue;
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
  }
  return !best || best.allow;
}

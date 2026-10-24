/**
 * Reads one line of opening hours the way owners actually type them:
 * "Mon–Sat: 9am–7pm", "Mon-Sat 10:00-20:00", "Daily 9 to 9", "Sunday closed".
 * The days are whatever comes before the times; a colon inside a time
 * ("10:00") is never taken as the separator.
 */
export function parseHoursLine(line: string): { days: string; hours: string } {
  const text = line.trim();
  // A colon that isn't part of a time like 10:00.
  const sep = text.search(/:(?!\d)|(?<!\d):/);
  if (sep !== -1) return finish(text.slice(0, sep), text.slice(sep + 1));
  const firstDigit = text.search(/\d/);
  if (firstDigit !== -1) return finish(text.slice(0, firstDigit), text.slice(firstDigit));
  const closed = text.match(/^(.*?)[\s,–-]*closed$/i);
  if (closed) return finish(closed[1], "Closed");
  return finish(text, "Open");
}

function finish(days: string, hours: string) {
  const d = days.trim().replace(/[\s,:–-]+$/, "");
  const h = hours.trim();
  return { days: d || "Open", hours: h || "Open" };
}

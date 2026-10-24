import { describe, expect, it } from "vitest";
import { parseHoursLine } from "@/lib/hours";

describe("opening hours", () => {
  it.each([
    ["Mon–Sat: 9am–7pm", "Mon–Sat", "9am–7pm"],
    ["Mon-Sat 10:00-20:00", "Mon-Sat", "10:00-20:00"],
    ["Mon-Sat: 10:00-20:00", "Mon-Sat", "10:00-20:00"],
    ["Sunday: closed", "Sunday", "closed"],
    ["Sunday closed", "Sunday", "Closed"],
    ["Daily 9 to 9", "Daily", "9 to 9"],
    ["10am - 8pm", "Open", "10am - 8pm"],
    ["Weekends by appointment", "Weekends by appointment", "Open"],
  ])("%s", (line, days, hours) => {
    expect(parseHoursLine(line)).toEqual({ days, hours });
  });
});

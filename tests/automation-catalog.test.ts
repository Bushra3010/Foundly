import { describe, expect, it } from "vitest";
import { DEPARTMENTS, getDepartment } from "../src/lib/automation-catalog";
import { CHART_MONTHS } from "../src/lib/software-demo";

describe("AI automation departments", () => {
  it("covers the eight departments in order", () => {
    expect(DEPARTMENTS.map((d) => d.id)).toEqual(["marketing", "sales", "operations", "inspection", "finance", "support", "hr", "manufacturing"]);
  });

  it("gives every department a complete flow and demo", () => {
    for (const d of DEPARTMENTS) {
      expect(d.automations.length, d.id).toBeGreaterThanOrEqual(5);
      expect(d.demo.stages).toHaveLength(d.workflow.length);
      expect(d.demo.events).toHaveLength(d.workflow.length);
      expect(d.demo.chart.values).toHaveLength(CHART_MONTHS.length);
      expect(d.demo.backlog.every((b) => b.stage < d.demo.stages.length)).toBe(true);
    }
  });

  it("falls back to marketing for an unknown team", () => {
    expect(getDepartment("hr").id).toBe("hr");
    expect(getDepartment("nope").id).toBe("marketing");
    expect(getDepartment(undefined).id).toBe("marketing");
  });
});

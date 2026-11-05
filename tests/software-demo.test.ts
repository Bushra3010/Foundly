import { describe, expect, it } from "vitest";
import { PRODUCTS, SECTORS } from "../src/lib/software-catalog";
import { CHART_MONTHS, formatKpi, getDemo } from "../src/lib/software-demo";

describe("software product demos", () => {
  it("has a demo for every product and industry that matches its workflow", () => {
    for (const product of PRODUCTS) {
      for (const { id } of SECTORS) {
        const demo = getDemo(product.id, id);
        expect(demo, `${product.id}/${id}`).toBeDefined();
        expect(demo!.stages).toHaveLength(product.sectors[id].workflow.length);
        expect(demo!.events).toHaveLength(product.sectors[id].workflow.length);
        expect(demo!.chart.values).toHaveLength(CHART_MONTHS.length);
        expect(demo!.backlog.every((b) => b.stage >= 0 && b.stage < demo!.stages.length)).toBe(true);
      }
    }
  });

  it("formats figures the Indian way", () => {
    expect(formatKpi(4860000, "inr")).toBe("₹48,60,000");
    expect(formatKpi(94.4, "pct")).toBe("94%");
    expect(formatKpi(14, "min")).toBe("14 min");
    expect(formatKpi(1284, "num")).toBe("1,284");
  });
});

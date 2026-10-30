import { describe, expect, it } from "vitest";
import { isTrackedPath, parsePendingEvent } from "@/lib/meta-pixel";

describe("meta pixel", () => {
  it("never tracks signed-in or staff pages", () => {
    expect(isTrackedPath("/")).toBe(true);
    expect(isTrackedPath("/pricing")).toBe(true);
    expect(isTrackedPath("/onboarding")).toBe(true);
    expect(isTrackedPath("/app")).toBe(false);
    expect(isTrackedPath("/app/settings")).toBe(false);
    expect(isTrackedPath("/admin")).toBe(false);
    expect(isTrackedPath("/apps-guide")).toBe(true);
  });

  it("reads the pending event cookie and rejects anything else", () => {
    expect(parsePendingEvent("Lead.3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f")).toEqual({ name: "Lead", id: "3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f" });
    expect(parsePendingEvent(undefined)).toBeNull();
    expect(parsePendingEvent("Lead")).toBeNull();
    expect(parsePendingEvent(encodeURIComponent("<script>.abcdefgh"))).toBeNull();
    expect(parsePendingEvent("Lead.short")).toBeNull();
  });
});

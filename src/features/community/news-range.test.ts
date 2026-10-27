import { describe, expect, it } from "vitest";

import { dayOf, MAX_RANGE_DAYS, withBound } from "./news-range";

describe("dayOf", () => {
  it("accepts a calendar day and nothing else", () => {
    expect(dayOf("2026-10-14")).toBe("2026-10-14");
    for (const bad of [null, "", "ayer", "2026-13-01", "2026-02-30", "14/10/2026"]) {
      expect(dayOf(bad), String(bad)).toBeNull();
    }
  });
});

describe("withBound", () => {
  it("sets the bound and leaves the other as it was", () => {
    expect(withBound({ from: null, to: null }, "from", "2026-10-10")).toEqual({
      from: "2026-10-10",
      to: null,
    });
  });

  it("moves the last day when the first is set after it, and the other way round", () => {
    expect(withBound({ from: "2026-10-01", to: "2026-10-05" }, "from", "2026-10-09")).toEqual({
      from: "2026-10-09",
      to: "2026-10-09",
    });
    expect(withBound({ from: "2026-10-05", to: "2026-10-09" }, "to", "2026-10-02")).toEqual({
      from: "2026-10-02",
      to: "2026-10-02",
    });
  });

  it("keeps the range within the days the API takes by moving the other bound", () => {
    expect(MAX_RANGE_DAYS).toBe(31);
    expect(withBound({ from: "2026-10-01", to: "2026-10-05" }, "to", "2026-12-01")).toEqual({
      from: "2026-11-01",
      to: "2026-12-01",
    });
    expect(withBound({ from: "2026-10-10", to: "2026-10-12" }, "from", "2026-07-01")).toEqual({
      from: "2026-07-01",
      to: "2026-07-31",
    });
  });

  it("allows exactly the longest range", () => {
    expect(withBound({ from: "2026-10-01", to: null }, "to", "2026-10-31")).toEqual({
      from: "2026-10-01",
      to: "2026-10-31",
    });
  });
});

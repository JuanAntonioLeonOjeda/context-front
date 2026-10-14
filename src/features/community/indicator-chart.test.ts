import { describe, expect, it } from "vitest";

import type { Point } from "./community-api";
import { chartModel, extremes, HEIGHT, MIN_POINTS, WIDTH } from "./indicator-chart";

const quarterly = (values: number[]): Point[] =>
  values.map((value, i) => ({ year: 2020 + Math.floor(i / 4), quarter: (i % 4) + 1, value }));

describe("chartModel", () => {
  it("draws no line for fewer points than a trend needs", () => {
    expect(MIN_POINTS).toBe(4);
    expect(chartModel(quarterly([1, 2, 3]), "%")).toBeNull();
    expect(chartModel([], "%")).toBeNull();
  });

  it("starts at the left edge and ends at the right edge, evenly spaced", () => {
    const model = chartModel(quarterly([5, 6, 7, 8, 9]), "%");

    expect(model?.first.cx).toBe(10);
    expect(model?.last.cx).toBe(WIDTH - 10);
    expect(model?.line).toMatch(/^M10 \S+ L85 \S+ L160 \S+ L235 \S+ L310 \S+$/);
  });

  it("puts a higher value higher on the chart: the lowest sits at the bottom, the highest at the top", () => {
    const model = chartModel(quarterly([10, 20, 15, 12]), "%");

    // y grows downwards: the highest value (20) has the smallest y, the lowest (10) the largest.
    expect(model?.first.cy).toBeGreaterThan(model?.last.cy ?? 0);
    expect(model?.first.cy).toBe(HEIGHT - 10);
    expect(model?.line).toContain("L110 28");
  });

  it("draws a flat series in the middle instead of dividing by zero", () => {
    const model = chartModel(quarterly([7, 7, 7, 7]), "%");

    expect(model?.first.cy).toBe(model?.last.cy);
    expect(model?.line).not.toMatch(/NaN|Infinity/);
  });

  it("writes the first and the last value in the unit's Spanish form", () => {
    const model = chartModel(quarterly([14.2, 13, 12, 11.6]), "%");

    expect(model?.first).toMatchObject({ text: "14,2 %", anchor: "start" });
    expect(model?.last).toMatchObject({ text: "11,6 %", anchor: "end" });
  });

  it("keeps the % on the chart, and drops a long unit that the card already names", () => {
    expect(chartModel(quarterly([1, 2, 3, 4]), "persons")?.last.text).toBe("4");
    expect(chartModel(quarterly([1, 2, 3, 4]), "index (2025 = 100)")?.first.text).toBe("1");
    expect(chartModel(quarterly([1, 2, 3, 4]), "%")?.last.text).toBe("4 %");
  });

  it("closes the area down to the bottom edge", () => {
    expect(chartModel(quarterly([1, 2, 3, 4]), "%")?.area).toMatch(/L310 110 L10 110 Z$/);
  });
});

describe("extremes", () => {
  it("names the lowest and the highest value, whatever their order", () => {
    expect(extremes(quarterly([14.2, 9.5, 27.3, 11.6]), "%")).toEqual({
      low: "9,5 %",
      high: "27,3 %",
    });
  });
});

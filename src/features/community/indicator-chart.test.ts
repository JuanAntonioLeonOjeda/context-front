import { describe, expect, it } from "vitest";

import type { Point } from "./community-api";
import { chartModel, extremes, MIN_POINTS, PLOT, roundScale } from "./indicator-chart";

const quarterly = (values: number[], fromQuarter = 1): Point[] =>
  values.map((value, i) => {
    const n = i + fromQuarter - 1;
    return { year: 2020 + Math.floor(n / 4), quarter: (n % 4) + 1, value };
  });
const annual = (values: number[]): Point[] =>
  values.map((value, i) => ({ year: 2020 + i, quarter: null, value }));

describe("roundScale", () => {
  it("runs between round values just outside the series, in steps of 1, 2 or 5 times a power of ten", () => {
    expect(roundScale(11.4, 25.58).ticks).toEqual([10, 15, 20, 25, 30]);
    expect(roundScale(27.2, 32).ticks).toEqual([26, 28, 30, 32]);
    expect(roundScale(68.376, 110.44).ticks).toEqual([60, 80, 100, 120]);
    expect(roundScale(2176916, 2277705).ticks).toEqual([2150000, 2200000, 2250000, 2300000]);
  });

  it("always holds the whole series", () => {
    for (const [min, max] of [
      [11.4, 25.58],
      [0.13, 0.29],
      [-4.2, 3.9],
      [100, 100.5],
    ] as const) {
      const { low, high } = roundScale(min, max);
      expect(low).toBeLessThanOrEqual(min);
      expect(high).toBeGreaterThanOrEqual(max);
    }
  });

  it("does not leave float noise in the marks", () => {
    expect(roundScale(0.12, 0.38).ticks).toEqual([0.1, 0.2, 0.3, 0.4]);
  });

  it("gives a flat series a range instead of dividing by zero", () => {
    const { ticks } = roundScale(7, 7);

    expect(ticks.length).toBeGreaterThan(1);
    expect(ticks[0]).toBeLessThan(7);
    expect(ticks.at(-1)).toBeGreaterThan(7);
  });
});

describe("chartModel", () => {
  it("draws no line for fewer points than a trend needs", () => {
    expect(MIN_POINTS).toBe(4);
    expect(chartModel(quarterly([1, 2, 3]))).toBeNull();
    expect(chartModel([])).toBeNull();
  });

  it("starts at the left edge of the plot and ends at the right edge, evenly spaced", () => {
    const model = chartModel(quarterly([5, 6, 7, 8, 9]));

    expect(model?.last.cx).toBe(PLOT.right);
    expect(model?.line).toMatch(new RegExp(`^M${String(PLOT.left)} \\S+ L`));
    expect(model?.line.split(" L")).toHaveLength(5);
  });

  it("puts a higher value higher: the highest mark of the axis sits at the top of the plot, the lowest at the bottom", () => {
    const model = chartModel(quarterly([10, 20, 15, 12]));

    const [lowest, ...rest] = model?.yMarks ?? [];
    expect(lowest?.position).toBe(PLOT.bottom);
    expect(rest.at(-1)?.position).toBe(PLOT.top);
    // y grows downwards: 20 (the highest value) is nearer the top than 10.
    expect(model?.line).toMatch(new RegExp(`^M${String(PLOT.left)} \\S+ L\\S+ \\S+`));
    const ys = model?.line.match(/ (\d+(?:\.\d+)?)(?= L|$)/g)?.map((n) => Number(n)) ?? [];
    expect(Math.min(...ys)).toBe(ys[1]);
  });

  it("labels the vertical axis with the figures of the steps, short when large", () => {
    expect(chartModel(quarterly([11.4, 25.58, 20, 18]))?.yMarks.map((m) => m.label)).toEqual([
      "10",
      "15",
      "20",
      "25",
      "30",
    ]);
    const labels = chartModel(quarterly([2176916, 2200000, 2250000, 2277705]))?.yMarks.map(
      (m) => m.label,
    );
    expect(labels).toHaveLength(4);
    expect(new Set(labels).size).toBe(4); // never two marks with the same text
    expect(labels?.[0]).toMatch(/M$/);
  });

  it("marks each year on the horizontal axis where it begins", () => {
    const model = chartModel(quarterly([1, 2, 3, 4, 5, 6, 7, 8, 9]));

    expect(model?.xMarks.map((m) => m.label)).toEqual(["2020", "2021", "2022"]);
    expect(model?.xMarks[0]?.position).toBe(PLOT.left);
  });

  it("gives no mark to a first year that begins mid-year, which would sit on the next one", () => {
    const model = chartModel(quarterly([1, 2, 3, 4, 5, 6, 7, 8], 3));

    expect(model?.xMarks.map((m) => m.label)).toEqual(["2021", "2022"]);
  });

  it("keeps to five year marks at most, skipping years evenly when there are more", () => {
    expect(chartModel(annual([1, 2, 3, 4, 5]))?.xMarks).toHaveLength(5);
    expect(chartModel(annual([1, 2, 3, 4, 5, 6]))?.xMarks.map((m) => m.label)).toEqual([
      "2020",
      "2022",
      "2024",
    ]);
    const long = chartModel(annual(Array.from({ length: 12 }, (_, i) => i)));
    expect(long?.xMarks.map((m) => m.label)).toEqual(["2020", "2023", "2026", "2029"]);
  });

  it("draws a flat series without NaN", () => {
    expect(chartModel(quarterly([7, 7, 7, 7]))?.line).not.toMatch(/NaN|Infinity/);
  });

  it("closes the area down to the horizontal axis", () => {
    expect(chartModel(quarterly([1, 2, 3, 4]))?.area).toMatch(
      new RegExp(
        `L${String(PLOT.right)} ${String(PLOT.bottom)} L${String(PLOT.left)} ${String(PLOT.bottom)} Z$`,
      ),
    );
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

import { describe, expect, it } from "vitest";

import {
  axisTop,
  END_LABEL_GAP_PX,
  rightRoom,
  LABEL_GAP_PX,
  lineChart,
  MARGIN,
  spreadLabels,
  type LineSeries,
} from "./line-chart";
import type { BandView, BarView } from "./voter-profile";

function bar(groupId: string, share: number): BarView {
  return {
    groupId,
    label: groupId.toUpperCase(),
    percent: `${String(share)} %`,
    share,
    width: 0,
    colour: null,
  };
}

function band(index: number, bars: BarView[]): BandView {
  return {
    index,
    name: `Tramo ${String(index + 1)}`,
    short: `Tramo ${String(index + 1)}`,
    end: null,
    census: "20 % del censo",
    censusShort: "20 %",
    censusShare: 20,
    range: null,
    size: "",
    blank: null,
    bars,
  };
}

const SIZE = { width: 600, height: 300 };
const plotBottom = SIZE.height - MARGIN.bottom;

describe("lineChart", () => {
  it("puts the bands evenly along the axis, the first at the left edge and the last at the right", () => {
    const bands = [0, 1, 2].map((i) => band(i, [bar("pp", 30)]));

    const { columns, plot } = lineChart(bands, SIZE);

    expect(columns.map((c) => c.x)).toEqual([plot.left, (plot.left + plot.right) / 2, plot.right]);
    // Each band answers the pointer half the way to its neighbours.
    expect(columns[1]?.left).toBe((plot.left + (columns[1]?.x ?? 0)) / 2);
  });

  it("draws a share at its height: 0 on the axis, the top of the axis at the top of the plot", () => {
    const { series, plot } = lineChart([band(0, [bar("pp", 40), bar("vox", 0)])], SIZE);

    expect(series[0]?.points[0]?.y).toBe(plot.top); // 40 is the top: the highest share, already a ten
    expect(series[1]?.points[0]?.y).toBe(plotBottom);
  });

  it("raises each band's census bar on the same axis, which reaches the census when it is higher", () => {
    const big = { ...band(0, [bar("pp", 34)]), censusShare: 48.8 };

    const { columns, ticks, plot } = lineChart([big], SIZE);

    expect(ticks.at(-1)?.text).toBe("50 %"); // the census, not the 34 % of the vote, sets the top
    expect(columns[0]?.censusTop).toBeCloseTo(plotBottom - (48.8 / 50) * (plotBottom - plot.top));
  });

  it("rounds the axis up to the next ten, never below ten", () => {
    expect(axisTop(34.7)).toBe(40);
    expect(axisTop(40)).toBe(40);
    expect(axisTop(2)).toBe(10);
    expect(axisTop(0)).toBe(10);
  });

  it("marks the axis every ten points, or every twenty above fifty", () => {
    expect(lineChart([band(0, [bar("pp", 34)])], SIZE).ticks.map((t) => t.text)).toEqual([
      "0 %",
      "10 %",
      "20 %",
      "30 %",
      "40 %",
    ]);
    expect(lineChart([band(0, [bar("pp", 61)])], SIZE).ticks.map((t) => t.text)).toEqual([
      "0 %",
      "20 %",
      "40 %",
      "60 %",
    ]);
  });

  it("keeps one line per group in the API's order, through every band", () => {
    const bands = [
      band(0, [bar("psoe", 35), bar("pp", 30)]),
      band(1, [bar("psoe", 28), bar("pp", 36)]),
    ];

    const { series } = lineChart(bands, SIZE);

    expect(series.map((s) => s.groupId)).toEqual(["psoe", "pp"]);
    expect(series[0]?.points.map((p) => p.percent)).toEqual(["35 %", "28 %"]);
    expect(series[0]?.path).toMatch(/^M [\d.]+ [\d.]+ L [\d.]+ [\d.]+$/);
  });

  it("leaves out a band no municipality fell in, so the lines do not break", () => {
    const bands = [band(0, [bar("pp", 30)]), band(1, []), band(2, [bar("pp", 20)])];

    const { columns, series, plot } = lineChart(bands, SIZE);

    expect(columns.map((c) => [c.band, c.x])).toEqual([
      [0, plot.left],
      [2, plot.right],
    ]);
    expect(series[0]?.points.map((p) => p.band)).toEqual([0, 2]);
    expect(series[0]?.path).toMatch(/^M [\d.]+ [\d.]+ L [\d.]+ [\d.]+$/);
  });
});

describe("rightRoom", () => {
  it("is as wide as the longest name at the end of a line, so the chart reaches the edge", () => {
    const bands = [band(0, [bar("pp", 30), bar("sumar", 20)])];

    // "SUMAR": five characters of the names' font, after the gap from the line.
    expect(rightRoom(bands)).toBe(END_LABEL_GAP_PX + 5 * 8);
    expect(lineChart(bands, SIZE).plot.right).toBe(SIZE.width - rightRoom(bands));
  });

  it("makes room for half the widest line under the last band when that needs more", () => {
    const last = { ...band(0, [bar("pp", 30)]), census: "19,7 % del censo electoral" };

    expect(rightRoom([last])).toBe(Math.ceil((26 * 6.5) / 2));
  });

  it("is compact when the bands are too close for three lines of text each", () => {
    const bands = [0, 1, 2, 3, 4].map((i) => band(i, [bar("pp", 30)]));

    expect(lineChart(bands, { width: 360, height: 300 }).compact).toBe(true);
    expect(lineChart(bands, { width: 1000, height: 300 }).compact).toBe(false);
  });
});

describe("spreadLabels", () => {
  function at(y: number): LineSeries {
    return { groupId: String(y), label: "", colour: null, points: [], path: "", labelY: y };
  }

  it("leaves names that are far enough apart where their lines end", () => {
    const series = [at(50), at(100)];

    spreadLabels(series, 0, 200);

    expect(series.map((s) => s.labelY)).toEqual([50, 100]);
  });

  it("moves names that would overlap apart, keeping their order", () => {
    const series = [at(100), at(95), at(102)];

    spreadLabels(series, 0, 200);

    const ys = series.map((s) => s.labelY);
    expect(ys[1]).toBeLessThan(ys[0] ?? 0);
    expect(ys[0]).toBeLessThan(ys[2] ?? 0);
    const sorted = [...ys].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      expect((sorted[i] ?? 0) - (sorted[i - 1] ?? 0)).toBeGreaterThanOrEqual(LABEL_GAP_PX);
    }
  });

  it("pushes the column up when the lowest name would leave the plot", () => {
    const series = [at(198), at(199)];

    spreadLabels(series, 0, 200);

    expect(series.map((s) => s.labelY)).toEqual([200 - LABEL_GAP_PX, 200]);
  });
});

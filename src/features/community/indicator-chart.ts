/**
 * An indicator's series as the numbers a small line chart needs. Pure: the points in, the SVG
 * path and the positions of the labels out. The scale runs from the lowest to the highest
 * value of the series (not from zero), so the chart says its extremes in words next to it
 * (`range`): nothing about the shape is left for the reader to guess.
 */
import type { Point } from "./community-api";
import { formatValue, formatValueParts } from "./indicator-format";

export const WIDTH = 320;
export const HEIGHT = 120;
const PAD_X = 10;
const PAD_TOP = 28; // room for the labels above the line
const PAD_BOTTOM = 10;

/** Fewer points are not a trend: the card shows the value alone. */
export const MIN_POINTS = 4;

export interface ChartLabel {
  x: number;
  y: number;
  text: string;
  anchor: "start" | "end";
}

export interface ChartModel {
  line: string; // SVG path of the line
  area: string; // the same path closed down to the bottom, for the light fill
  first: ChartLabel & { cx: number; cy: number };
  last: ChartLabel & { cx: number; cy: number };
}

export function chartModel(points: readonly Point[], unit: string): ChartModel | null {
  const [firstPoint] = points;
  const lastPoint = points.at(-1);
  if (points.length < MIN_POINTS || firstPoint === undefined || lastPoint === undefined) {
    return null;
  }
  const values = points.map((p) => p.value);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const xs = points.map((_, i) => PAD_X + (i * (WIDTH - 2 * PAD_X)) / (points.length - 1));
  const ys = values.map((v) => yOf(v, low, high));
  const coordinates = xs.map((x, i) => `${String(round(x))} ${String(round(ys[i] ?? 0))}`);
  const line = `M${coordinates.join(" L")}`;
  const bottom = HEIGHT - PAD_BOTTOM;
  const area = `${line} L${String(round(WIDTH - PAD_X))} ${String(bottom)} L${String(PAD_X)} ${String(bottom)} Z`;
  const end = (index: number, point: Point, anchor: "start" | "end") => {
    const cx = round(xs[index] ?? 0);
    const cy = round(ys[index] ?? 0);
    return { cx, cy, x: cx, y: round(cy - 10), anchor, text: labelOf(point.value, unit) };
  };
  return {
    line,
    area,
    first: end(0, firstPoint, "start"),
    last: end(points.length - 1, lastPoint, "end"),
  };
}

/** Lowest and highest value of the series, written as the card shows them. */
export function extremes(points: readonly Point[], unit: string): { low: string; high: string } {
  const values = points.map((p) => p.value);
  return {
    low: formatValue(Math.min(...values), unit),
    high: formatValue(Math.max(...values), unit),
  };
}

function yOf(value: number, low: number, high: number): number {
  const top = PAD_TOP;
  const bottom = HEIGHT - PAD_BOTTOM;
  // A flat series has no range to scale: it is drawn in the middle, not divided by zero.
  if (high === low) return (top + bottom) / 2;
  return top + (1 - (value - low) / (high - low)) * (bottom - top);
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/** On the chart the figure alone, with "%" kept: the card above names the unit in full. */
function labelOf(value: number, unit: string): string {
  const { figure, unit: written } = formatValueParts(value, unit);
  return written === "%" ? `${figure} %` : figure;
}

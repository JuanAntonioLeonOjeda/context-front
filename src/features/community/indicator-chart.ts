/**
 * An indicator's series as the numbers a small line chart needs. Pure: the points in, the SVG
 * path, the axes and the positions of their labels out.
 *
 * The vertical axis does not start at zero: it runs between "round" values just outside the
 * series (10, 15, 20 %), each marked with a reference line, and the card writes the lowest and
 * highest value in words (`extremes`). The horizontal axis is time, one mark per year, placed
 * where the year begins; a point is a quarter (or a year, for annual series).
 */
import type { Point } from "./community-api";
import { formatValue } from "./indicator-format";

// Sized for a card of about 240 px, so the labels (12 units) are read at about 12 px.
export const WIDTH = 240;
export const HEIGHT = 150;
// The plot area inside the viewBox; the margins hold the axis labels.
export const PLOT = { left: 52, right: WIDTH - 16, top: 22, bottom: HEIGHT - 32 } as const;

/** Fewer points are not a trend: the card shows the value alone. */
export const MIN_POINTS = 4;

const MAX_YEAR_MARKS = 5; // a year label is 4 digits wide: more would touch on a small card
const Y_MARKS = 4; // about; the round step decides the real number

export interface AxisMark {
  position: number; // x for the horizontal axis, y for the vertical one
  label: string;
}

export interface ChartModel {
  line: string; // SVG path of the line
  area: string; // the same path closed down to the horizontal axis, for the light fill
  last: { cx: number; cy: number };
  yMarks: AxisMark[];
  xMarks: AxisMark[];
}

export function chartModel(points: readonly Point[]): ChartModel | null {
  if (points.length < MIN_POINTS) return null;
  const values = points.map((p) => p.value);
  const scale = roundScale(Math.min(...values), Math.max(...values));
  const xs = points.map((_, i) => PLOT.left + (i * (PLOT.right - PLOT.left)) / (points.length - 1));
  const ys = values.map((v) => yOf(v, scale));
  const coordinates = xs.map((x, i) => `${String(round(x))} ${String(round(ys[i] ?? 0))}`);
  const line = `M${coordinates.join(" L")}`;
  const lastX = xs.at(-1) ?? PLOT.right;
  return {
    line,
    area: `${line} L${String(round(lastX))} ${String(PLOT.bottom)} L${String(PLOT.left)} ${String(PLOT.bottom)} Z`,
    last: { cx: round(lastX), cy: round(ys.at(-1) ?? 0) },
    yMarks: scale.ticks.map((tick) => ({
      position: round(yOf(tick, scale)),
      label: markLabel(tick, scale.step),
    })),
    xMarks: yearMarks(points, xs),
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

interface Scale {
  low: number;
  high: number;
  step: number;
  ticks: number[];
}

/** The smallest run of round steps (1, 2 or 5 times a power of ten) that holds the series. */
export function roundScale(min: number, max: number): Scale {
  // A flat series has no range to scale: give it one around its value.
  const [low, high] = min === max ? [min - 1, max + 1] : [min, max];
  const step = roundStep((high - low) / (Y_MARKS - 1));
  const first = Math.floor(low / step + 1e-9) * step;
  const last = Math.ceil(high / step - 1e-9) * step;
  const count = Math.round((last - first) / step);
  const ticks = Array.from({ length: count + 1 }, (_, i) => cleanFloat(first + i * step, step));
  return { low: ticks[0] ?? first, high: ticks.at(-1) ?? last, step, ticks };
}

function roundStep(raw: number): number {
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  const factor = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return factor * power;
}

/** 0.1 + 0.2 must read 0.3: round to the decimals the step has. */
function cleanFloat(value: number, step: number): number {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return Number(value.toFixed(decimals));
}

function yOf(value: number, scale: Scale): number {
  return PLOT.bottom - ((value - scale.low) / (scale.high - scale.low)) * (PLOT.bottom - PLOT.top);
}

/** A mark of the vertical axis: the figure alone (the unit is the axis title), short if large. */
function markLabel(value: number, step: number): string {
  if (Math.abs(value) < 10_000) {
    const decimals = Math.max(0, -Math.floor(Math.log10(step)));
    return new Intl.NumberFormat("es", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return new Intl.NumberFormat("es", { notation: "compact", maximumFractionDigits: 2 }).format(
    value,
  );
}

/**
 * One mark per year, where the year begins: the first quarter's point (or the year's only
 * point). A first year that begins mid-year has no mark of its own: its mark would sit on top
 * of the next one. More than MAX_YEAR_MARKS years: every second, third… year, evenly.
 */
function yearMarks(points: readonly Point[], xs: readonly number[]): AxisMark[] {
  const starts = points.flatMap((p, i) =>
    p.quarter === null || p.quarter === 1
      ? [{ position: round(xs[i] ?? 0), label: String(p.year) }]
      : [],
  );
  const every = Math.ceil(starts.length / MAX_YEAR_MARKS);
  return starts.filter((_, i) => i % every === 0);
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

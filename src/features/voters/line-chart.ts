/**
 * The voter profile as one line chart: the bands along the horizontal axis, in their order (lowest
 * values first), the share of the vote up the vertical one, and a line per group through its share
 * in each band. Behind each band, a faint bar as tall as its share of the census, for context: a
 * band of half the census weighs more than one of 2 %. Pure: the bands in, the places of every
 * mark out, in pixels for the size given.
 *
 * The bands are ordered, so a line between two of them shows which way a share goes from one band
 * to the next; nothing is measured between them, and the note on how to read it says so. A band no
 * municipality fell in (a capital with half the census can leave the band before it empty) is left
 * out of the axis, so the lines do not break; its name still says which band it is ("Tramo 4"
 * after "Tramo 2"), and the table keeps its row.
 */
import type { BandView } from "./voter-profile";

export interface ChartSize {
  width: number;
  height: number;
}

export interface LinePoint {
  band: number; // the band's index
  x: number;
  y: number;
  percent: string; // "34,7 %", for the tooltip
}

export interface LineSeries {
  groupId: string;
  label: string;
  colour: string | null; // null: the neutral colour of the stylesheet
  points: LinePoint[];
  path: string; // the SVG path, broken at a band with no point
  labelY: number; // the name at the end of the line, moved apart from the others' names
}

export interface Tick {
  y: number;
  text: string; // "20 %"
}

export interface BandColumn {
  band: number;
  x: number; // where its points are
  censusTop: number; // the top of the band's census bar, on the same axis as the lines
  left: number; // the strip that answers the pointer, half the way to each neighbour
  right: number;
}

export interface LineChartModel {
  plot: { left: number; right: number; top: number; bottom: number };
  ticks: Tick[];
  columns: BandColumn[];
  series: LineSeries[];
}

// Room for the axis' figures at the left, the names at the end of the lines at the right and the
// bands' names (three short lines) under the axis.
export const MARGIN = { left: 44, right: 104, top: 12, bottom: 64 };
export const LABEL_GAP_PX = 16; // two names at the end of the lines are never closer than this

/** The top of the vertical axis: the highest share rounded up to the next ten, at least ten. */
export function axisTop(highest: number): number {
  return Math.max(10, Math.ceil(highest / 10) * 10);
}

export function lineChart(all: readonly BandView[], size: ChartSize): LineChartModel {
  const bands = all.filter((band) => band.bars.length > 0);
  const plot = {
    left: MARGIN.left,
    right: size.width - MARGIN.right,
    top: MARGIN.top,
    bottom: size.height - MARGIN.bottom,
  };
  // One axis for both: the lines' shares of the vote and the bars' shares of the census are
  // percentages, so the bars need no scale of their own; the axis reaches the highest of either.
  const top = axisTop(
    Math.max(0, ...bands.flatMap((b) => [b.censusShare, ...b.bars.map((bar) => bar.share)])),
  );
  const step = top <= 50 ? 10 : 20;
  const yOf = (share: number): number => plot.bottom - (share / top) * (plot.bottom - plot.top);
  const xs = bands.map((_, i) =>
    bands.length === 1
      ? (plot.left + plot.right) / 2
      : plot.left + (i * (plot.right - plot.left)) / (bands.length - 1),
  );
  const ticks: Tick[] = [];
  for (let value = 0; value <= top; value += step) {
    ticks.push({ y: yOf(value), text: `${String(value)} %` });
  }
  const columns: BandColumn[] = bands.map((band, i) => ({
    band: band.index,
    x: xs[i] ?? 0,
    censusTop: yOf(band.censusShare),
    left: i === 0 ? plot.left : ((xs[i - 1] ?? 0) + (xs[i] ?? 0)) / 2,
    right: i === bands.length - 1 ? plot.right : ((xs[i] ?? 0) + (xs[i + 1] ?? 0)) / 2,
  }));
  const series = seriesOf(bands, xs, yOf);
  spreadLabels(series, plot.top, plot.bottom);
  return { plot, ticks, columns, series };
}

/** One series per group, in the API's order (the order of the first band that has bars). */
function seriesOf(
  bands: readonly BandView[],
  xs: readonly number[],
  yOf: (share: number) => number,
): LineSeries[] {
  const groups = bands.find((b) => b.bars.length > 0)?.bars ?? [];
  return groups.map((group) => {
    const points: LinePoint[] = [];
    let path = "";
    let pen = "M";
    bands.forEach((band, i) => {
      const bar = band.bars.find((b) => b.groupId === group.groupId);
      if (bar === undefined) {
        pen = "M"; // a group missing in a band (the API never sends one): the line breaks
        return;
      }
      const point = { band: band.index, x: xs[i] ?? 0, y: yOf(bar.share), percent: bar.percent };
      points.push(point);
      path += `${pen} ${round(point.x)} ${round(point.y)} `;
      pen = "L";
    });
    return {
      groupId: group.groupId,
      label: group.label,
      colour: group.colour,
      points,
      path: path.trim(),
      labelY: points.at(-1)?.y ?? 0,
    };
  });
}

/**
 * Moves the names at the end of the lines apart, keeping each as near its line as it can: top to
 * bottom, a name too close to the one above goes down; if the last one leaves the plot, the whole
 * column goes up from the bottom. Each name keeps the order of the lines' ends.
 */
export function spreadLabels(series: LineSeries[], top: number, bottom: number): void {
  const ordered = [...series].sort((a, b) => a.labelY - b.labelY);
  let previous = -Infinity;
  for (const s of ordered) {
    s.labelY = Math.max(s.labelY, previous + LABEL_GAP_PX, top);
    previous = s.labelY;
  }
  let next = Infinity;
  for (const s of ordered.reverse()) {
    s.labelY = Math.min(s.labelY, next - LABEL_GAP_PX, bottom);
    next = s.labelY;
  }
}

function round(value: number): string {
  return String(Math.round(value * 10) / 10);
}

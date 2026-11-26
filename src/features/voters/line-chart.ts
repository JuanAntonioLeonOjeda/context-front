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
  // The bands are too close for three lines of text each: under a band only its name and its
  // share of the census; the dimension's two ends go once, under the two ends of the axis.
  compact: boolean;
  ticks: Tick[];
  columns: BandColumn[];
  series: LineSeries[];
}

// Room for the axis' figures at the left and the bands' names (three short lines) under the axis.
// The room at the right is measured from the names at the end of the lines (`rightRoom`), so the
// chart reaches the edge of its box on a phone as it does at the left.
export const MARGIN = { left: 44, top: 12, bottom: 64 };
export const END_LABEL_GAP_PX = 12; // from the end of a line to its name
// Text is not measured in a pure function: an average glyph width of each font size, a little
// generous so a name is never cut. 0.8rem bold for the names, 0.75rem for the bands' lines.
const NAME_CHAR_PX = 8;
// Below this room between two bands, "rentas más bajas" and "19,7 % del censo" would overlap.
export const COMPACT_BELOW_PX = 120;
const BAND_CHAR_PX = 6.5;
export const LABEL_GAP_PX = 16; // two names at the end of the lines are never closer than this

/** The top of the vertical axis: the highest share rounded up to the next ten, at least ten. */
export function axisTop(highest: number): number {
  return Math.max(10, Math.ceil(highest / 10) * 10);
}

export function lineChart(all: readonly BandView[], size: ChartSize): LineChartModel {
  const bands = all.filter((band) => band.bars.length > 0);
  const plot = {
    left: MARGIN.left,
    right: size.width - rightRoom(bands),
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
  const spacing = bands.length > 1 ? (plot.right - plot.left) / (bands.length - 1) : Infinity;
  return { plot, compact: spacing < COMPACT_BELOW_PX, ticks, columns, series };
}

/**
 * The room at the right of the plot: the longest name at the end of a line, or half the widest line
 * under the last band (its text is centred on the band), whichever needs more.
 */
export function rightRoom(bands: readonly BandView[]): number {
  const names = bands.flatMap((b) => b.bars.map((bar) => bar.label.length));
  const nameRoom = END_LABEL_GAP_PX + Math.max(0, ...names) * NAME_CHAR_PX;
  const last = bands.at(-1);
  // The widest line is the census's, also when the chart is compact (the end words then go
  // under the axis' end, right-aligned, inside the plot).
  const lines = last === undefined ? [] : [last.short, last.census];
  const bandRoom = (Math.max(0, ...lines.map((line) => line.length)) * BAND_CHAR_PX) / 2;
  return Math.ceil(Math.max(nameRoom, bandRoom));
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

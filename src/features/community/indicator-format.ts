/**
 * How an indicator's numbers and periods are written in Spanish. The figure and its unit are
 * kept apart so a card can set the figure large and the unit small, and joined for a sentence.
 */
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { Point } from "./community-api";

const number = new Intl.NumberFormat("es", { maximumFractionDigits: 3 });
const UNITS = new Map(Object.entries(es.community.indicators.units));

/** "11,6 %", "2.277.705 personas", "110,44 (base 2025 = 100)": the number as the INE gave it.
 *  A unit with no Spanish text yet is shown as the API names it, never dropped. */
export function formatValue(value: number, unit: string): string {
  const parts = formatValueParts(value, unit);
  return `${parts.figure} ${parts.unit}`;
}

export function formatValueParts(value: number, unit: string): { figure: string; unit: string } {
  return { figure: number.format(value), unit: UNITS.get(unit) ?? unit };
}

export function formatPeriod(point: Pick<Point, "year" | "quarter">): string {
  return point.quarter === null
    ? String(point.year)
    : formatMessage(es.community.indicators.quarter, {
        quarter: String(point.quarter),
        year: String(point.year),
      });
}

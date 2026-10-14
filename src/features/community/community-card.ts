/**
 * What the community card shows, as text. Pure: the API's values in, formatted rows out. The
 * wording names the measure, its period and its source, and nothing else: no "high", "low" or
 * "better than" (.claude/rules/project-policies.md, neutrality in the UI).
 */
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import type { Government, Indicator, Point, TermParty } from "./community-api";

export interface GovernmentView {
  president: string;
  since: string;
  isCaretaker: boolean;
  sourceUrl: string;
  governing: TermParty[];
  support: TermParty[];
}

export interface IndicatorRow {
  id: string;
  name: string;
  value: string | null; // null: no data, never 0
  period: string | null;
  tableLabel: string;
  tableUrl: string;
  downloaded: string | null;
}

export function governmentView(government: Government): GovernmentView {
  return {
    president: formatMessage(es.community.government.president, { name: government.presidentName }),
    since: formatMessage(es.community.government.since, {
      date: formatLongDate(government.validFrom),
    }),
    isCaretaker: government.isCaretaker,
    sourceUrl: government.sourceUrl,
    // The API orders parties alphabetically by id; the card keeps that order.
    governing: government.parties.filter((p) => p.role === "governing"),
    support: government.parties.filter((p) => p.role === "external_support"),
  };
}

export function indicatorRows(indicators: readonly Indicator[]): IndicatorRow[] {
  return indicators.map((indicator) => ({
    id: indicator.id,
    name: indicator.name,
    value: indicator.latest ? formatValue(indicator.latest.value, indicator.unit) : null,
    period: indicator.latest ? formatPeriod(indicator.latest) : null,
    tableLabel: formatMessage(es.community.indicators.sourceLink, { id: indicator.tableId }),
    tableUrl: indicator.tableUrl,
    downloaded: indicator.fetchedAt
      ? formatMessage(es.community.indicators.downloaded, {
          date: formatLongDate(indicator.fetchedAt.slice(0, 10)),
        })
      : null,
  }));
}

const number = new Intl.NumberFormat("es", { maximumFractionDigits: 3 });
const UNITS = new Map(Object.entries(es.community.indicators.units));

/** "11,6 %", "2.277.705 personas", "110,44 (base 2025 = 100)": the number as the INE gave it.
 *  A unit with no Spanish text yet is shown as the API names it, never dropped. */
export function formatValue(value: number, unit: string): string {
  return `${number.format(value)} ${UNITS.get(unit) ?? unit}`;
}

export function formatPeriod(point: Pick<Point, "year" | "quarter">): string {
  return point.quarter === null
    ? String(point.year)
    : formatMessage(es.community.indicators.quarter, {
        quarter: String(point.quarter),
        year: String(point.year),
      });
}

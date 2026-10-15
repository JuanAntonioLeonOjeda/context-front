/**
 * What the community card shows, as text. Pure: the API's values in, formatted rows out. The
 * wording names the measure, its period and its source, and nothing else: no "high", "low" or
 * "better than" (.claude/rules/project-policies.md, neutrality in the UI).
 */
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import type { Government, Indicator, TermParty } from "./community-api";
import { chartModel, extremes, type ChartModel } from "./indicator-chart";
import { formatName, formatPeriod, formatValue, formatValueParts } from "./indicator-format";

export { formatPeriod, formatValue };

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
  figure: string | null; // the number alone, to set it large
  unit: string | null;
  period: string | null;
  tableLabel: string;
  tableUrl: string;
  downloaded: string | null;
  chart: ChartModel | null; // null: too few points for a trend, the value is shown alone
  chartLabel: string | null; // the accessible name of the chart: what it shows, in words
  range: string | null; // the lowest and highest value, so the scale is written down
  data: { period: string; value: string }[]; // every point of the series, for the table
  axes: { x: string; y: string } | null; // the titles of the chart's axes
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
    ...chartParts(indicator),
    id: indicator.id,
    name: formatName(indicator.name, indicator.unit),
    value: indicator.latest ? formatValue(indicator.latest.value, indicator.unit) : null,
    ...(indicator.latest
      ? formatValueParts(indicator.latest.value, indicator.unit)
      : { figure: null, unit: null }),
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

function chartParts(
  indicator: Indicator,
): Pick<IndicatorRow, "chart" | "chartLabel" | "range" | "data" | "axes"> {
  const { series, unit } = indicator;
  const name = formatName(indicator.name, unit);
  const data = series.map((p) => ({ period: formatPeriod(p), value: formatValue(p.value, unit) }));
  const chart = chartModel(series);
  const [first] = series;
  const last = series.at(-1);
  if (chart === null || first === undefined || last === undefined) {
    return { chart: null, chartLabel: null, range: null, data, axes: null };
  }
  const from = formatPeriod(first);
  const to = formatPeriod(last);
  const { low, high } = extremes(series, unit);
  return {
    chart,
    chartLabel: formatMessage(es.community.indicators.chartLabel, {
      name,
      from,
      to,
      first: formatValue(first.value, unit),
      last: formatValue(last.value, unit),
    }),
    range: formatMessage(es.community.indicators.range, { from, to, low, high }),
    data,
    axes: {
      x:
        last.quarter === null
          ? es.community.indicators.axes.timeAnnual
          : es.community.indicators.axes.time,
      y: formatValueParts(0, unit).unit,
    },
  };
}

/**
 * What the news list shows, as text. Pure: the API's values in, formatted rows out. An item
 * names no party (ADR-0018): outlet, time, headline and link.
 */
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import type { NewsItem } from "./news-api";

export interface NewsRow {
  key: string;
  day: string; // ISO date in Spain, for grouping
  outlet: string; // "Outlet, 11:44"
  headline: string;
  url: string;
  treeStoryId: number | null;
}

// The day and the hour a reader in Spain sees.
const spainDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }); // 2026-10-14
const spainTime = new Intl.DateTimeFormat("es", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Europe/Madrid",
});

function instant(isoInstant: string): Date {
  const parsed = new Date(isoInstant);
  if (Number.isNaN(parsed.getTime())) throw new Error(`not an ISO instant: "${isoInstant}"`);
  return parsed;
}

/** "2026-10-14": the calendar day in Spain of an instant. */
export function newsDay(isoInstant: string): string {
  return spainDay.format(instant(isoInstant));
}

export function formatNewsTime(isoInstant: string): string {
  return spainTime.format(instant(isoInstant));
}

export interface NewsDay {
  day: string;
  label: string; // "14 de octubre de 2026"
  rows: NewsRow[];
}

/** The rows in the order they come (newest first), grouped by the day they were published. */
export function groupByDay(rows: readonly NewsRow[]): NewsDay[] {
  const days: NewsDay[] = [];
  for (const row of rows) {
    const last = days.at(-1);
    if (last?.day === row.day) last.rows.push(row);
    else days.push({ day: row.day, label: formatLongDate(row.day), rows: [row] });
  }
  return days;
}

export function newsRows(items: readonly NewsItem[]): NewsRow[] {
  return items.map((item) => ({
    key: item.url,
    day: newsDay(item.publishedAt),
    outlet: formatMessage(es.community.news.outletAndTime, {
      outlet: item.outletName,
      time: formatNewsTime(item.publishedAt),
    }),
    headline: item.headline,
    url: item.url,
    treeStoryId: item.treeStoryId,
  }));
}

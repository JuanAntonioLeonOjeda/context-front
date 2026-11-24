/** What the related-news panel shows, as text. Pure: the API's values in, formatted text out. */
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import type { RelatedDay } from "./related-api";

const spainTime = new Intl.DateTimeFormat("es", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Europe/Madrid",
});
const twoDecimals = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export interface RelatedItemView {
  key: string;
  outlet: string; // "El País, 22:15"
  headline: string;
  url: string;
  similarity: string; // "parecido: 0,88"
}

export interface RelatedDayView {
  day: string;
  label: string; // "5 de noviembre de 2026"
  items: RelatedItemView[];
}

export function relatedDays(days: readonly RelatedDay[]): RelatedDayView[] {
  return days.map((day) => ({
    day: day.day,
    label: formatLongDate(day.day),
    items: day.items.map((item) => ({
      key: String(item.articleId),
      outlet: formatMessage(es.community.news.outletAndTime, {
        outlet: item.outletName,
        time: spainTime.format(new Date(item.publishedAt)),
      }),
      headline: item.headline,
      url: item.url,
      similarity: formatMessage(es.stories.related.similarity, {
        value: twoDecimals.format(item.similarity),
      }),
    })),
  }));
}

/** "No hay noticias anteriores… en los 14 días previos": the window is the API's, never a constant. */
export function emptyText(windowDays: number): string {
  return formatMessage(es.stories.related.empty, { days: String(windowDays) });
}

export function methodText(maxDays: number): string {
  return formatMessage(es.stories.related.method, { maxDays: String(maxDays) });
}

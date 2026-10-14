/**
 * What the news list shows, as text. Pure: the API's values in, formatted rows out. The wording
 * says who is responsible, on what basis and with what confidence, and nothing else: no
 * adjective about a party, a government or an outlet (.claude/rules/project-policies.md).
 */
import { partiesById, type Party } from "@/design/parties";
import { stripesPatternId, type Fill } from "@/features/map";
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage, listInSpanish } from "@/i18n/format";

import type { Attribution, NewsItem } from "./news-api";

export interface BasisLink {
  label: string;
  url: string;
}

export interface AttributionRow {
  responsible: string | null; // null: nobody is named
  confidence: string; // "Confianza: Alta", "Confianza: Sin determinar: <reason>"
  basis: BasisLink[];
}

export interface NewsRow {
  key: string;
  day: string; // ISO date in Spain, for grouping
  outlet: string; // "Outlet, 11:44"
  /** The colours of the responsible parties, as on the map; the hatch when nobody is named. */
  stripe: Fill;
  headline: string;
  url: string;
  attribution: AttributionRow[];
}

// A government changes on a Spanish calendar date, so the day and the hour are the Spanish ones.
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

export function newsRows(
  items: readonly NewsItem[],
  parties: ReadonlyMap<string, Party>,
): NewsRow[] {
  return items.map((item) => ({
    key: item.url,
    day: newsDay(item.publishedAt),
    outlet: formatMessage(es.community.news.outletAndTime, {
      outlet: item.outletName,
      time: formatNewsTime(item.publishedAt),
    }),
    stripe: stripeOf(item.attribution, parties),
    headline: item.headline,
    url: item.url,
    attribution: item.attribution.map((a) => attributionRow(a, parties)),
  }));
}

/**
 * The same visual vocabulary as the map: one party, its colour; several, stripes; nobody named,
 * the grey hatch. The words next to it say the same, so the colour is never the only signal.
 */
function stripeOf(attribution: readonly Attribution[], parties: ReadonlyMap<string, Party>): Fill {
  const ids = [...new Set(attribution.flatMap((a) => (a.confidence === "high" ? a.partyIds : [])))];
  const named = partiesById(parties, ids.sort());
  const [only, ...others] = named;
  if (only === undefined) return { kind: "no-data" };
  if (others.length === 0) return { kind: "solid", colour: only.colour };
  return {
    kind: "stripes",
    patternId: stripesPatternId(named),
    colours: named.map((p) => p.colour),
  };
}

function attributionRow(a: Attribution, parties: ReadonlyMap<string, Party>): AttributionRow {
  const { news } = es.community;
  const word = news.confidenceWords[a.confidence];
  if (a.confidence === "not_determined") {
    return {
      responsible: null,
      // "Sin determinar: <why>": the reason is part of the confidence, never hidden.
      confidence: formatMessage(news.confidence, {
        confidence: a.reason === null ? word : `${word}: ${news.reasons[a.reason]}`,
      }),
      basis: [],
    };
  }
  // The API orders the parties alphabetically by id; the list keeps that order.
  const names = partiesById(parties, a.partyIds).map((p) => p.shortName);
  const government = a.level === null ? "" : news.levels[a.level];
  const responsible = formatMessage(news.responsible, {
    government: a.isCaretaker ? `${government} (${news.caretaker})` : government,
    parties: listInSpanish(names),
  });
  return {
    responsible,
    confidence: formatMessage(news.confidence, { confidence: word }),
    basis: uniqueBasis(a),
  };
}

function uniqueBasis(a: Attribution): BasisLink[] {
  const seen = new Map<string, BasisLink>();
  for (const c of a.competences) {
    seen.set(`${c.legalBasis}|${c.sourceUrl}`, { label: c.legalBasis, url: c.sourceUrl });
  }
  return [...seen.values()];
}

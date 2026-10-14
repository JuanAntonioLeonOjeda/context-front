/**
 * What the news list shows, as text. Pure: the API's values in, formatted rows out. The wording
 * says who is responsible, on what basis and with what confidence, and nothing else: no
 * adjective about a party, a government or an outlet (.claude/rules/project-policies.md).
 */
import { partiesById, type Party } from "@/design/parties";
import { es } from "@/i18n/es";
import { formatMessage, listInSpanish } from "@/i18n/format";

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
  outlet: string; // "Outlet, 14 de octubre de 2026"
  headline: string;
  url: string;
  attribution: AttributionRow[];
}

// A government changes on a Spanish calendar date, so the date shown is the Spanish one.
const spainDate = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Madrid",
});

export function formatNewsDate(isoInstant: string): string {
  const parsed = new Date(isoInstant);
  if (Number.isNaN(parsed.getTime())) throw new Error(`not an ISO instant: "${isoInstant}"`);
  return spainDate.format(parsed);
}

export function newsRows(
  items: readonly NewsItem[],
  parties: ReadonlyMap<string, Party>,
): NewsRow[] {
  return items.map((item) => ({
    key: item.url,
    outlet: formatMessage(es.community.news.outletAndDate, {
      outlet: item.outletName,
      date: formatNewsDate(item.publishedAt),
    }),
    headline: item.headline,
    url: item.url,
    attribution: item.attribution.map((a) => attributionRow(a, parties)),
  }));
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

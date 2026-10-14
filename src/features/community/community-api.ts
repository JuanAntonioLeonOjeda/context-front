/**
 * The two responses of a community page, validated at the edge with zod and mapped to the
 * feature's own types here (snake_case stays in the API layer).
 */
import { z } from "zod";

import { api } from "@/api/client";

const governmentSchema = z.object({
  territory_id: z.string(),
  date: z.iso.date(),
  term: z.object({
    president_name: z.string(),
    valid_from: z.iso.date(),
    is_caretaker: z.boolean(),
    source_url: z.url(),
    parties: z.array(
      z.object({
        party_id: z.string(),
        short_name: z.string(),
        role: z.enum(["governing", "external_support"]),
        source_url: z.url(),
      }),
    ),
  }),
});

const pointSchema = z.object({
  period_start: z.iso.date(),
  year: z.number().int(),
  quarter: z.number().int().min(1).max(4).nullable(),
  value: z.number(),
});

const indicatorsSchema = z.array(
  z.object({
    indicator_id: z.string(),
    name: z.string(),
    unit: z.string(),
    periodicity: z.string(),
    latest: pointSchema.nullable(),
    series: z.array(pointSchema),
    source: z.object({
      publisher: z.string(),
      table_id: z.string(),
      table_url: z.url(),
      series_code: z.string().nullable(),
      fetched_at: z.iso.datetime().nullable(),
    }),
  }),
);

export interface TermParty {
  partyId: string;
  shortName: string;
  role: "governing" | "external_support";
  sourceUrl: string;
}

export interface Government {
  date: string;
  presidentName: string;
  validFrom: string;
  isCaretaker: boolean;
  sourceUrl: string;
  parties: TermParty[];
}

export interface Point {
  year: number;
  quarter: number | null;
  value: number;
}

export interface Indicator {
  id: string;
  name: string;
  unit: string;
  latest: Point | null; // null: the INE publishes no value for this community
  series: Point[]; // oldest first
  tableId: string;
  tableUrl: string;
  fetchedAt: string | null; // ISO instant of the download that produced the value
}

/** `null` when the community is unknown or has no government on the date (the API's 404). */
export async function fetchGovernment(territoryId: string): Promise<Government | null> {
  const { data, response } = await api.GET("/communities/{territory_id}/governments", {
    params: { path: { territory_id: territoryId } },
  });
  if (response.status === 404) return null;
  const parsed = governmentSchema.parse(
    ok(`/communities/${territoryId}/governments`, response, data),
  );
  return {
    date: parsed.date,
    presidentName: parsed.term.president_name,
    validFrom: parsed.term.valid_from,
    isCaretaker: parsed.term.is_caretaker,
    sourceUrl: parsed.term.source_url,
    parties: parsed.term.parties.map((p) => ({
      partyId: p.party_id,
      shortName: p.short_name,
      role: p.role,
      sourceUrl: p.source_url,
    })),
  };
}

export async function fetchIndicators(territoryId: string): Promise<Indicator[]> {
  const { data, response } = await api.GET("/communities/{territory_id}/indicators", {
    params: { path: { territory_id: territoryId } },
  });
  return indicatorsSchema
    .parse(ok(`/communities/${territoryId}/indicators`, response, data))
    .map((i) => ({
      id: i.indicator_id,
      name: i.name,
      unit: i.unit,
      latest: i.latest
        ? { year: i.latest.year, quarter: i.latest.quarter, value: i.latest.value }
        : null,
      series: i.series
        .map((p) => ({ year: p.year, quarter: p.quarter, value: p.value }))
        .sort((a, b) => a.year - b.year || (a.quarter ?? 0) - (b.quarter ?? 0)),
      tableId: i.source.table_id,
      tableUrl: i.source.table_url,
      fetchedAt: i.source.fetched_at,
    }));
}

/** An answer that is not 2xx is unexpected here: it surfaces as the view's error state. */
function ok(path: string, response: Response, data: unknown): unknown {
  if (!response.ok) {
    throw new Error(`GET ${path} answered ${String(response.status)}`);
  }
  return data;
}

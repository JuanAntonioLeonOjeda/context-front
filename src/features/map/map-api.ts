/**
 * The four API responses the map needs, validated at the edge with zod and mapped to the
 * feature's own types in this one place (snake_case stays in the API layer).
 */
import { z } from "zod";

import { api } from "@/api/client";
import type { PartyInput } from "@/design/parties";

import type { CommunityGovernment } from "./community-look";
import type { CommunitiesGeometry } from "./projection";

const position = z.tuple([z.number(), z.number()]);
const geometrySchema = z.object({
  type: z.literal("FeatureCollection"),
  attribution: z.string().min(1),
  features: z.array(
    z.object({
      type: z.literal("Feature"),
      id: z.string(),
      properties: z.object({}).strict(),
      geometry: z.object({
        type: z.literal("MultiPolygon"),
        coordinates: z.array(z.array(z.array(position))),
      }),
    }),
  ),
});

const governmentMapSchema = z.object({
  date: z.iso.date(),
  communities: z.array(
    z.object({
      territory_id: z.string(),
      governing_party_ids: z.array(z.string()),
      is_caretaker: z.boolean(),
      has_data: z.boolean(),
    }),
  ),
});

const partiesSchema = z.array(
  z.object({ id: z.string(), name: z.string(), short_name: z.string(), colour_hex: z.string() }),
);

const territoriesSchema = z.array(
  z.object({ id: z.string(), ine_code: z.string().nullable(), name: z.string() }),
);

export interface GovernmentMap {
  date: string; // ISO day the map shows
  communities: CommunityGovernment[];
}

export interface Territory {
  id: string;
  name: string;
}

export async function fetchGeometry(): Promise<CommunitiesGeometry> {
  const { data, response } = await api.GET("/map/geometry");
  return geometrySchema.parse(ok("/map/geometry", response, data));
}

export async function fetchGovernmentMap(date?: string): Promise<GovernmentMap> {
  const { data, response } = await api.GET("/map/governments", {
    params: { query: date === undefined ? {} : { date } },
  });
  const parsed = governmentMapSchema.parse(ok("/map/governments", response, data));
  return {
    date: parsed.date,
    communities: parsed.communities.map((c) => ({
      territoryId: c.territory_id,
      governingPartyIds: c.governing_party_ids,
      isCaretaker: c.is_caretaker,
      hasData: c.has_data,
    })),
  };
}

export async function fetchParties(): Promise<PartyInput[]> {
  const { data, response } = await api.GET("/parties");
  return partiesSchema.parse(ok("/parties", response, data));
}

export async function fetchCommunities(): Promise<Territory[]> {
  const { data, response } = await api.GET("/territories", {
    params: { query: { level: "ccaa" } },
  });
  return territoriesSchema
    .parse(ok("/territories", response, data))
    .map((t) => ({ id: t.id, name: t.name }));
}

/** An answer that is not 2xx is unexpected here: it surfaces as the view's error state. */
function ok(path: string, response: Response, data: unknown): unknown {
  if (!response.ok) {
    throw new Error(`GET ${path} answered ${String(response.status)}`);
  }
  return data;
}

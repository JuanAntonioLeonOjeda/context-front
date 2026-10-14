/**
 * The news of a community and sector, validated at the edge with zod and mapped to the
 * feature's own types here (snake_case stays in the API layer). The API never sends the lead,
 * and neither does this schema: only headline, link and date are published.
 */
import { z } from "zod";

import { api } from "@/api/client";

export const SECTORS = ["education", "health", "housing"] as const;
export type Sector = (typeof SECTORS)[number];

const levelSchema = z.enum(["state", "ccaa", "local"]);

const attributionSchema = z.object({
  level: levelSchema.nullable(),
  territory_id: z.string().nullable(),
  confidence: z.enum(["high", "medium", "not_determined"]),
  party_ids: z.array(z.string()),
  is_caretaker: z.boolean(),
  competences: z.array(
    z.object({
      activity: z.string(),
      description: z.string(),
      function: z.enum([
        "legislation",
        "basic_legislation",
        "development_legislation",
        "execution",
      ]),
      legal_basis: z.string(),
      source_url: z.url(),
    }),
  ),
  reason: z
    .enum(["no_level_named", "no_competence", "local_not_modelled", "no_government_on_date"])
    .nullable(),
});

const newsSchema = z.object({
  territory_id: z.string(),
  sector_id: z.string(),
  since: z.iso.date(),
  items: z.array(
    z.object({
      outlet_id: z.string(),
      outlet_name: z.string(),
      headline: z.string(),
      url: z.url(),
      published_at: z.iso.datetime(),
      classified_by: z.object({ model_id: z.string(), model_version: z.string() }),
      attribution: z.array(attributionSchema),
    }),
  ),
});

export type Level = z.infer<typeof levelSchema>;
export type Confidence = "high" | "medium" | "not_determined";
export type Reason = NonNullable<z.infer<typeof attributionSchema>["reason"]>;

export interface Competence {
  activity: string;
  description: string;
  legalBasis: string;
  sourceUrl: string;
}

export interface Attribution {
  level: Level | null; // null: the article names no government
  partyIds: string[]; // alphabetical, as the API sends them; empty unless confidence is "high"
  isCaretaker: boolean;
  confidence: Confidence;
  reason: Reason | null; // set exactly when the confidence is "not_determined"
  competences: Competence[];
}

export interface NewsItem {
  outletId: string;
  outletName: string;
  headline: string;
  url: string;
  publishedAt: string; // ISO instant
  attribution: Attribution[];
}

export interface CommunityNews {
  since: string; // ISO date, first day of the window
  items: NewsItem[];
}

/** The API answers 404 for an unknown community and 422 for an unknown sector: both throw. */
export async function fetchCommunityNews(
  territoryId: string,
  sector: Sector,
): Promise<CommunityNews> {
  const { data, response } = await api.GET("/communities/{territory_id}/news", {
    params: { path: { territory_id: territoryId }, query: { sector } },
  });
  if (!response.ok) {
    throw new Error(`GET /communities/${territoryId}/news answered ${String(response.status)}`);
  }
  const parsed = newsSchema.parse(data);
  return {
    since: parsed.since,
    // The API sends them newest first, ties by outlet id; the list keeps that order.
    items: parsed.items.map((item) => ({
      outletId: item.outlet_id,
      outletName: item.outlet_name,
      headline: item.headline,
      url: item.url,
      publishedAt: item.published_at,
      attribution: item.attribution.map((a) => ({
        level: a.level,
        partyIds: a.party_ids,
        isCaretaker: a.is_caretaker,
        confidence: a.confidence,
        reason: a.reason,
        competences: a.competences.map((c) => ({
          activity: c.activity,
          description: c.description,
          legalBasis: c.legal_basis,
          sourceUrl: c.source_url,
        })),
      })),
    })),
  };
}

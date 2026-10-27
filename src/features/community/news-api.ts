/**
 * The news of a community and sector, validated at the edge with zod and mapped to the
 * feature's own types here (snake_case stays in the API layer). The API never sends the lead,
 * and neither does this schema: only headline, link and date are published. No item names a
 * party (ADR-0018).
 */
import { z } from "zod";

import { api } from "@/api/client";

import type { NewsRange } from "./news-range";

export const SECTORS = ["education", "health", "housing"] as const;
export type Sector = (typeof SECTORS)[number];

const newsSchema = z.object({
  territory_id: z.string(),
  sector_id: z.string(),
  since: z.iso.date(),
  until: z.iso.date(),
  items: z.array(
    z.object({
      outlet_id: z.string(),
      outlet_name: z.string(),
      headline: z.string(),
      url: z.url(),
      published_at: z.iso.datetime(),
      classified_by: z.object({ model_id: z.string(), model_version: z.string() }),
      tree_story_id: z.number().nullable(),
    }),
  ),
});

export interface NewsItem {
  outletId: string;
  outletName: string;
  headline: string;
  url: string;
  publishedAt: string; // ISO instant
  treeStoryId: number | null; // the story whose tree of related news this item belongs to
}

export interface CommunityNews {
  since: string; // ISO date, first day of the range
  until: string; // ISO date, last day of the range
  items: NewsItem[];
}

/** The API answers 404 for an unknown community and 422 for an unknown sector or a bad range: all throw. */
export async function fetchCommunityNews(
  territoryId: string,
  sector: Sector,
  range: NewsRange,
): Promise<CommunityNews> {
  // Without dates the API answers its default: the last three days.
  const { data, response } = await api.GET("/communities/{territory_id}/news", {
    params: {
      path: { territory_id: territoryId },
      query: {
        sector,
        ...(range.from === null ? {} : { date_from: range.from }),
        ...(range.to === null ? {} : { date_to: range.to }),
      },
    },
  });
  if (!response.ok) {
    throw new Error(`GET /communities/${territoryId}/news answered ${String(response.status)}`);
  }
  const parsed = newsSchema.parse(data);
  return {
    since: parsed.since,
    until: parsed.until,
    // The API sends them newest first, ties by outlet id; the list keeps that order.
    items: parsed.items.map((item) => ({
      outletId: item.outlet_id,
      outletName: item.outlet_name,
      headline: item.headline,
      url: item.url,
      publishedAt: item.published_at,
      treeStoryId: item.tree_story_id,
    })),
  };
}

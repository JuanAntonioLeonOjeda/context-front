/**
 * The trees of related news of a community and sector: one item per tree, its newest news there,
 * validated at the edge with zod. Headline, link and date only, no lead and no party (ADR-0018).
 */
import { z } from "zod";

import { api } from "@/api/client";

import type { NewsItem, Sector } from "./news-api";

const treesSchema = z.object({
  territory_id: z.string(),
  sector_id: z.string(),
  items: z.array(
    z.object({
      outlet_id: z.string(),
      outlet_name: z.string(),
      headline: z.string(),
      url: z.url(),
      published_at: z.iso.datetime(),
      classified_by: z.object({ model_id: z.string(), model_version: z.string() }),
      tree_story_id: z.number(),
    }),
  ),
});

/** A tree as the list shows it: its newest news, and the story to ask the whole tree for. */
export interface TreeEntry extends Omit<NewsItem, "treeStoryId"> {
  storyId: number;
}

/** The API answers 404 for an unknown community and 422 for an unknown sector: both throw. */
export async function fetchCommunityTrees(
  territoryId: string,
  sector: Sector,
): Promise<TreeEntry[]> {
  const { data, response } = await api.GET("/communities/{territory_id}/trees", {
    params: { path: { territory_id: territoryId }, query: { sector } },
  });
  if (!response.ok) {
    throw new Error(`GET /communities/${territoryId}/trees answered ${String(response.status)}`);
  }
  // The API sends them newest first, ties by outlet id; the list keeps that order.
  return treesSchema.parse(data).items.map((item) => ({
    outletId: item.outlet_id,
    outletName: item.outlet_name,
    headline: item.headline,
    url: item.url,
    publishedAt: item.published_at,
    storyId: item.tree_story_id,
  }));
}

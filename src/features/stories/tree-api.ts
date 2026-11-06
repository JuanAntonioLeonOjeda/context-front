/**
 * The tree of related stories a story belongs to, validated at the edge with zod and mapped to the
 * feature's own types here. Like the news, a node carries headline, link and date only: never a
 * lead, and no party (ADR-0018). A link says "related and later", not why.
 */
import { z } from "zod";

import { api } from "@/api/client";

const articleSchema = z.object({
  outlet_id: z.string(),
  outlet_name: z.string(),
  headline: z.string(),
  url: z.url(),
  published_at: z.iso.datetime(),
});

const treeSchema = z.object({
  root_story_id: z.number(),
  linking: z.object({
    run_id: z.number(),
    threshold: z.number(),
    window_days: z.number(),
    created_at: z.iso.datetime(),
  }),
  grouping: z.object({ threshold: z.number(), window_days: z.number() }).loose(),
  nodes: z.array(
    z.object({
      story_id: z.number(),
      parent_story_id: z.number().nullable(),
      link_similarity: z.number().nullable(),
      started_at: z.iso.datetime(),
      articles: z.array(articleSchema),
    }),
  ),
});

export interface TreeArticle {
  outletId: string;
  outletName: string;
  headline: string;
  url: string;
  publishedAt: string; // ISO instant
}

export interface TreeNodeData {
  storyId: number;
  parentStoryId: number | null; // null for the root
  linkSimilarity: number | null;
  startedAt: string; // ISO instant of the first article
  articles: TreeArticle[]; // by outlet id, as the API sends them
}

export interface StoryTree {
  rootStoryId: number;
  linkThreshold: number;
  linkWindowDays: number;
  nodes: TreeNodeData[]; // oldest first
}

export type StoryTreeResult = { found: true; tree: StoryTree } | { found: false };

/** The API answers 404 when the story has no relations: that is a result, not a failure. */
export async function fetchStoryTree(storyId: number): Promise<StoryTreeResult> {
  const { data, response } = await api.GET("/stories/{story_id}/tree", {
    params: { path: { story_id: storyId } },
  });
  if (response.status === 404) return { found: false };
  if (!response.ok) {
    throw new Error(`GET /stories/${String(storyId)}/tree answered ${String(response.status)}`);
  }
  const parsed = treeSchema.parse(data);
  return {
    found: true,
    tree: {
      rootStoryId: parsed.root_story_id,
      linkThreshold: parsed.linking.threshold,
      linkWindowDays: parsed.linking.window_days,
      nodes: parsed.nodes.map((node) => ({
        storyId: node.story_id,
        parentStoryId: node.parent_story_id,
        linkSimilarity: node.link_similarity,
        startedAt: node.started_at,
        articles: node.articles.map((article) => ({
          outletId: article.outlet_id,
          outletName: article.outlet_name,
          headline: article.headline,
          url: article.url,
          publishedAt: article.published_at,
        })),
      })),
    },
  };
}

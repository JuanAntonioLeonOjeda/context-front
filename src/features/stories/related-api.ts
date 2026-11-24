/**
 * The news related to one news item (`GET /articles/{id}/related`): a chain back in time, by day,
 * validated at the edge with zod and mapped to the feature's own types here. Headline, link,
 * outlet and date only: never a lead, and no party (ADR-0018). Every figure comes from the API.
 */
import { z } from "zod";

import { api } from "@/api/client";

const relatedSchema = z.object({
  article_id: z.number(),
  settings: z.object({
    step_threshold: z.number(),
    origin_threshold: z.number(),
    window_days: z.number(),
    max_days: z.number(),
  }),
  days: z.array(
    z.object({
      day: z.iso.date(),
      items: z.array(
        z.object({
          article_id: z.number(),
          outlet_id: z.string(),
          outlet_name: z.string(),
          headline: z.string(),
          url: z.url(),
          published_at: z.iso.datetime(),
          similarity: z.number().nullable(),
        }),
      ),
    }),
  ),
});

export interface RelatedItem {
  articleId: number;
  outletName: string;
  headline: string;
  url: string;
  publishedAt: string; // ISO instant
  similarity: number; // to the step before it
}

export interface RelatedDay {
  day: string; // ISO date in Spain
  items: RelatedItem[];
}

export interface RelatedNews {
  windowDays: number;
  maxDays: number;
  days: RelatedDay[]; // newest first, without the news item asked for
}

/** The related news of an article. The news item asked for is left out: the reader is on it. */
export async function fetchRelatedNews(articleId: number): Promise<RelatedNews> {
  const { data, response } = await api.GET("/articles/{article_id}/related", {
    params: { path: { article_id: articleId } },
  });
  if (!response.ok) {
    throw new Error(
      `GET /articles/${String(articleId)}/related answered ${String(response.status)}`,
    );
  }
  const parsed = relatedSchema.parse(data);
  const days = parsed.days
    .map((day) => ({
      day: day.day,
      items: day.items.flatMap((item) =>
        item.similarity === null || item.article_id === parsed.article_id
          ? []
          : [
              {
                articleId: item.article_id,
                outletName: item.outlet_name,
                headline: item.headline,
                url: item.url,
                publishedAt: item.published_at,
                similarity: item.similarity,
              },
            ],
      ),
    }))
    .filter((day) => day.items.length > 0);
  return { windowDays: parsed.settings.window_days, maxDays: parsed.settings.max_days, days };
}

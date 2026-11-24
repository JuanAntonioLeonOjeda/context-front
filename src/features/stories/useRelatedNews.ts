import { useQuery } from "@tanstack/react-query";

import { fetchRelatedNews, type RelatedNews } from "./related-api";

export type RelatedNewsState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "ready"; related: RelatedNews };

/** The related news of one article, asked for only when its panel is open. */
export function useRelatedNews(articleId: number): RelatedNewsState {
  const query = useQuery({
    queryKey: ["article", articleId, "related"],
    queryFn: () => fetchRelatedNews(articleId),
  });
  if (query.isError) {
    return {
      state: "error",
      retry: () => {
        void query.refetch();
      },
    };
  }
  return query.data ? { state: "ready", related: query.data } : { state: "loading" };
}

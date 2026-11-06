import { useQuery } from "@tanstack/react-query";

import { fetchCommunityNews, type CommunityNews, type Sector } from "./news-api";
import type { NewsRange } from "./news-range";

export type CommunityNewsState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "ready"; news: CommunityNews };

/** The news of one community, sector and range of days; each combination is cached on its own. */
export function useCommunityNews(
  territoryId: string,
  sector: Sector,
  range: NewsRange,
): CommunityNewsState {
  const query = useQuery({
    queryKey: ["community", territoryId, "news", sector, range.from, range.to],
    queryFn: () => fetchCommunityNews(territoryId, sector, range),
  });
  if (query.isError) {
    return {
      state: "error",
      retry: () => {
        void query.refetch();
      },
    };
  }
  if (!query.data) return { state: "loading" };
  return { state: "ready", news: query.data };
}

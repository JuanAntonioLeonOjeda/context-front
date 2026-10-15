import { useQuery } from "@tanstack/react-query";

import { fetchCommunityNews, type CommunityNews, type Sector } from "./news-api";

export type CommunityNewsState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "ready"; news: CommunityNews };

/** The latest news of one community and sector; each sector is cached on its own. */
export function useCommunityNews(territoryId: string, sector: Sector): CommunityNewsState {
  const query = useQuery({
    queryKey: ["community", territoryId, "news", sector],
    queryFn: () => fetchCommunityNews(territoryId, sector),
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

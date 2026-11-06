import { useQuery } from "@tanstack/react-query";

import type { Sector } from "./news-api";
import { fetchCommunityTrees, type TreeEntry } from "./trees-api";

export type CommunityTreesState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "ready"; trees: TreeEntry[] };

/** The trees of one community and sector; each combination is cached on its own. */
export function useCommunityTrees(territoryId: string, sector: Sector): CommunityTreesState {
  const query = useQuery({
    queryKey: ["community", territoryId, "trees", sector],
    queryFn: () => fetchCommunityTrees(territoryId, sector),
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
  return { state: "ready", trees: query.data };
}

import { useQuery } from "@tanstack/react-query";

import { fetchCommunities } from "@/features/map";

import { fetchGovernment, fetchIndicators } from "./community-api";
import {
  governmentView,
  indicatorRows,
  type GovernmentView,
  type IndicatorRow,
} from "./community-card";

export type CommunityCardState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "not-found" }
  | {
      state: "ready";
      name: string;
      government: GovernmentView;
      indicators: IndicatorRow[];
    };

/** Everything one community page needs. `not-found`: no such community (the API's 404). */
export function useCommunityCard(territoryId: string): CommunityCardState {
  const government = useQuery({
    queryKey: ["community", territoryId, "government"],
    queryFn: () => fetchGovernment(territoryId),
  });
  const indicators = useQuery({
    queryKey: ["community", territoryId, "indicators"],
    queryFn: () => fetchIndicators(territoryId),
    // An unknown community has no indicators either: wait to see if the government exists.
    enabled: government.data !== null,
  });
  const communities = useQuery({
    queryKey: ["territories", "ccaa"],
    queryFn: fetchCommunities,
    staleTime: 60 * 60 * 1000,
  });

  const queries = [government, indicators, communities];
  if (government.data === null) return { state: "not-found" };
  if (queries.some((q) => q.isError)) {
    return {
      state: "error",
      retry: () => {
        for (const q of queries) if (q.isError) void q.refetch();
      },
    };
  }
  const name = communities.data?.find((c) => c.id === territoryId)?.name;
  if (!government.data || !indicators.data || !communities.data) return { state: "loading" };
  if (name === undefined) return { state: "not-found" };
  return {
    state: "ready",
    name,
    government: governmentView(government.data),
    indicators: indicatorRows(indicators.data),
  };
}

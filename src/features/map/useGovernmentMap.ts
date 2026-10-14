import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { partyTable } from "@/design/parties";
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import { communityLook, type CommunityLook } from "./community-look";
import { fetchCommunities, fetchGeometry, fetchGovernmentMap, fetchParties } from "./map-api";
import { layoutMap, type MapLayout } from "./projection";

// Boundaries, parties and community names change rarely; governments are read fresh.
const RARELY_CHANGES_MS = 60 * 60 * 1000;

export type GovernmentMapState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | {
      state: "ready";
      caption: string;
      layout: MapLayout;
      looks: ReadonlyMap<string, CommunityLook>;
      attribution: string;
    };

/** Everything the home map needs, as one state. `date` omitted: today, as the API decides. */
export function useGovernmentMap(date?: string): GovernmentMapState {
  const geometry = useQuery({
    queryKey: ["map", "geometry"],
    queryFn: fetchGeometry,
    staleTime: RARELY_CHANGES_MS,
  });
  const parties = useQuery({
    queryKey: ["parties"],
    queryFn: fetchParties,
    staleTime: RARELY_CHANGES_MS,
  });
  const communities = useQuery({
    queryKey: ["territories", "ccaa"],
    queryFn: fetchCommunities,
    staleTime: RARELY_CHANGES_MS,
  });
  const governments = useQuery({
    queryKey: ["map", "governments", date ?? "today"],
    queryFn: () => fetchGovernmentMap(date),
  });

  // Projecting 223 KB of boundaries is the only costly step: once per geometry.
  const layout = useMemo(
    () => (geometry.data ? layoutMap(geometry.data) : undefined),
    [geometry.data],
  );

  const queries = [geometry, parties, communities, governments];
  if (queries.some((q) => q.isError)) {
    return {
      state: "error",
      retry: () => {
        for (const q of queries) if (q.isError) void q.refetch();
      },
    };
  }
  if (!layout || !geometry.data || !parties.data || !communities.data || !governments.data) {
    return { state: "loading" };
  }

  const table = partyTable(parties.data);
  const names = new Map(communities.data.map((c) => [c.id, c.name]));
  const looks = new Map(
    governments.data.communities.map((g) => [
      g.territoryId,
      communityLook(g, names.get(g.territoryId) ?? g.territoryId, table),
    ]),
  );
  return {
    state: "ready",
    caption: formatMessage(es.map.figure.caption, { date: formatLongDate(governments.data.date) }),
    layout,
    looks,
    attribution: geometry.data.attribution,
  };
}

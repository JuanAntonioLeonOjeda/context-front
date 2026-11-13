import { useQuery } from "@tanstack/react-query";

import { fetchIndicators } from "./community-api";
import { indicatorRows, type IndicatorRow } from "./community-card";
import type { Sector } from "./news-api";
import { fetchSectorIndicators } from "./sectors-api";

/**
 * The indicator shown next to a sector's news, for one community. `null` while it loads, when the
 * sector has none and when either request fails: the news never wait for it and nothing is
 * shown in its place.
 */
export function useSectorIndicator(territoryId: string, sector: Sector): IndicatorRow | null {
  const sectors = useQuery({
    queryKey: ["sectors", "indicators"],
    queryFn: fetchSectorIndicators,
    staleTime: 60 * 60 * 1000,
  });
  // The same key as the community card: the indicators are asked for once per page.
  const indicators = useQuery({
    queryKey: ["community", territoryId, "indicators"],
    queryFn: () => fetchIndicators(territoryId),
  });
  const indicatorId = sectors.data?.get(sector);
  if (indicatorId === undefined || !indicators.data) return null;
  const indicator = indicators.data.find((i) => i.id === indicatorId);
  return indicator === undefined ? null : (indicatorRows([indicator])[0] ?? null);
}

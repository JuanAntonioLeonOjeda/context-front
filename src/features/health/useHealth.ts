import { useQuery } from "@tanstack/react-query";

import { fetchHealth, type Health } from "@/features/health/health";

const REFRESH_MS = 30_000;

export type HealthState = { state: "checking" } | { state: "known"; health: Health };

/** The backend's health, refreshed every 30 s. `fetchHealth` never throws, so no error state. */
export function useHealth(): HealthState {
  const query = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: REFRESH_MS,
    retry: false,
  });
  return query.data === undefined ? { state: "checking" } : { state: "known", health: query.data };
}

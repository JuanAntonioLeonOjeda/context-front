import { useQuery } from "@tanstack/react-query";

import { fetchCommunities } from "@/features/map";

import {
  fetchCommunityOrganization,
  fetchOrganization,
  type Organization,
} from "./organization-api";
import {
  boxView,
  communityLinks,
  executiveView,
  type BoxView,
  type CommunityLink,
  type ExecutiveView,
} from "./organization-view";

export interface ChartView {
  asOf: string; // ISO date the answer is valid for
  executive: ExecutiveView;
  parliaments: BoxView[];
  judiciary: BoxView[];
  local: BoxView[];
}

function chartView(organization: Organization): ChartView {
  return {
    asOf: organization.asOf,
    executive: executiveView(organization.executive),
    parliaments: organization.parliaments.map(boxView),
    judiciary: organization.judiciary.map(boxView),
    local: organization.local.map(boxView),
  };
}

export type GeneralOrganizationState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "ready"; chart: ChartView; communities: CommunityLink[] };

/** The general chart: the State's, and the list of the communities. */
export function useGeneralOrganization(): GeneralOrganizationState {
  const query = useQuery({ queryKey: ["organization"], queryFn: fetchOrganization });
  if (query.isError) {
    return {
      state: "error",
      retry: () => {
        void query.refetch();
      },
    };
  }
  if (!query.data) return { state: "loading" };
  return {
    state: "ready",
    chart: chartView(query.data),
    communities: communityLinks(query.data.communities),
  };
}

export type CommunityOrganizationState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "not-found" }
  | { state: "ready"; name: string; chart: ChartView };

/** One community's chart. `not-found`: no such community (the API's 404). */
export function useCommunityOrganization(territoryId: string): CommunityOrganizationState {
  const organization = useQuery({
    queryKey: ["community", territoryId, "organization"],
    queryFn: () => fetchCommunityOrganization(territoryId),
  });
  // The same key as the community page: the list of communities is asked for once.
  const communities = useQuery({
    queryKey: ["territories", "ccaa"],
    queryFn: fetchCommunities,
    staleTime: 60 * 60 * 1000,
  });

  if (organization.data === null) return { state: "not-found" };
  const queries = [organization, communities];
  if (queries.some((q) => q.isError)) {
    return {
      state: "error",
      retry: () => {
        for (const q of queries) if (q.isError) void q.refetch();
      },
    };
  }
  if (!organization.data || !communities.data) return { state: "loading" };
  const name = communities.data.find((c) => c.id === territoryId)?.name;
  if (name === undefined) return { state: "not-found" };
  return { state: "ready", name, chart: chartView(organization.data) };
}

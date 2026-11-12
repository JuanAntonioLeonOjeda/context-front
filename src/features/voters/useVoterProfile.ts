import { useQuery } from "@tanstack/react-query";

import { partyTable } from "@/design/parties";
import { fetchParties } from "@/features/map";

import { bandViews, type BandView } from "./voter-profile";
import { fetchCommunityVoters, type CommunityVoters } from "./voters-api";

export type VoterProfileState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "absent" } // the API has no election loaded: the section is not shown
  | { state: "ready"; voters: CommunityVoters; bands: BandView[] | null };

/** A community's voter profile with its bars ready to draw; `bands` is null without a profile. */
export function useVoterProfile(territoryId: string): VoterProfileState {
  const voters = useQuery({
    queryKey: ["community", territoryId, "voters"],
    queryFn: () => fetchCommunityVoters(territoryId),
  });
  // The same key as the map: the party table is asked for once.
  const parties = useQuery({
    queryKey: ["parties"],
    queryFn: fetchParties,
    staleTime: 60 * 60 * 1000,
  });

  const queries = [voters, parties];
  if (queries.some((q) => q.isError)) {
    return {
      state: "error",
      retry: () => {
        for (const q of queries) if (q.isError) void q.refetch();
      },
    };
  }
  if (voters.data === null) return { state: "absent" };
  if (!voters.data || !parties.data) return { state: "loading" };
  const { profile } = voters.data;
  return {
    state: "ready",
    voters: voters.data,
    bands: profile === null ? null : bandViews(profile, partyTable(parties.data)),
  };
}

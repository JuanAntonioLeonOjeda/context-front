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

  // First of all: with no election there is no section, whatever happens to the party table.
  if (voters.data === null) return { state: "absent" };
  const queries = [voters, parties];
  const failed: VoterProfileState = {
    state: "error",
    retry: () => {
      for (const q of queries) void q.refetch();
    },
  };
  if (queries.some((q) => q.isError)) return failed;
  if (!voters.data || !parties.data) return { state: "loading" };
  const { profile } = voters.data;
  if (profile === null) return { state: "ready", voters: voters.data, bands: null };
  try {
    return {
      state: "ready",
      voters: voters.data,
      bands: bandViews(profile, partyTable(parties.data)),
    };
  } catch (error) {
    // A party the party table does not know is a data error: the section says it could not be
    // loaded instead of drawing that party as if it were "Otras". The page around it stays up.
    console.error(error);
    return failed;
  }
}

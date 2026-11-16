import { useQuery } from "@tanstack/react-query";

import { partyTable } from "@/design/parties";
import { fetchParties } from "@/features/map";

import { bandViews, type BandView } from "./voter-profile";
import { fetchCommunityVoters, type CommunityVoters, type DimensionId } from "./voters-api";

export type VoterProfileState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "absent" } // the API has no election loaded: the section is not shown
  // `pending`: the data shown is the previous dimension's while the new one is fetched.
  | { state: "ready"; voters: CommunityVoters; bands: BandView[] | null; pending: boolean };

/** A community's voter profile by one dimension with its bars ready to draw; `bands` is null
 *  without a profile. */
export function useVoterProfile(territoryId: string, by: DimensionId): VoterProfileState {
  const voters = useQuery({
    queryKey: ["community", territoryId, "voters", by],
    queryFn: () => fetchCommunityVoters(territoryId, by),
    // Switching dimension keeps the profile on screen until the next one arrives, so the buttons
    // are not destroyed under the keyboard's focus; never another community's.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === territoryId ? previous : undefined,
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
  const pending = voters.isPlaceholderData;
  if (profile === null) return { state: "ready", voters: voters.data, bands: null, pending };
  try {
    return {
      state: "ready",
      voters: voters.data,
      // By the dimension of the data, which during `pending` is not the one asked for yet.
      bands: bandViews(profile, partyTable(parties.data), voters.data.dimension),
      pending,
    };
  } catch (error) {
    // A party the party table does not know is a data error: the section says it could not be
    // loaded instead of drawing that party as if it were "Otras". The page around it stays up.
    console.error(error);
    return failed;
  }
}

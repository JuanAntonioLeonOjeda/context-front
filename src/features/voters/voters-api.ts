/**
 * How a community's municipalities voted, by income band (`GET /communities/{id}/voters`),
 * validated at the edge with zod and mapped to the feature's own types here (snake_case stays
 * in the API layer). Every figure comes computed from the backend: nothing is added up or
 * divided in the browser.
 */
import { z } from "zod";

import { api } from "@/api/client";

const groupSchema = z.object({
  id: z.string(),
  kind: z.enum(["party", "list", "others"]),
  label: z.string().nullable(),
});

const bandSchema = z.object({
  index: z.number().int(),
  municipalities: z.number().int(),
  census: z.number().int(),
  census_percent: z.number(),
  income_min_eur: z.number().nullable(),
  income_max_eur: z.number().nullable(),
  valid_votes: z.number().int(),
  blank_votes: z.number().int(),
  blank_percent: z.number(),
  shares: z.array(z.object({ group_id: z.string(), votes: z.number().int(), percent: z.number() })),
});

const votersSchema = z.object({
  territory_id: z.string(),
  election: z.object({
    id: z.string(),
    held_on: z.iso.date(),
    source_file: z.string(),
    source_url: z.url(),
  }),
  income: z
    .object({ year: z.number().int(), source_url: z.url(), fetched_at: z.iso.datetime() })
    .nullable(),
  municipalities: z.number().int(),
  profile: z
    .object({
      census: z.number().int(),
      groups: z.array(groupSchema),
      bands: z.array(bandSchema),
      municipalities_without_income: z.number().int(),
    })
    // Every share belongs to a declared group: a figure with no name is never drawn.
    .refine(
      (profile) =>
        profile.bands.every((band) =>
          band.shares.every((share) => profile.groups.some((g) => g.id === share.group_id)),
        ),
      { message: "a share of a group that is not in `groups`" },
    )
    .nullable(),
  no_profile_reason: z.enum(["no_results", "too_few_municipalities"]).nullable(),
});

/** Who a share belongs to: a party of the party table, a list by its acronym, or the rest. */
export interface VoteGroup {
  id: string; // a party id when `kind` is "party"
  kind: "party" | "list" | "others";
  label: string | null; // null for "others": its name is the web's text
}

export interface BandShare {
  groupId: string;
  percent: number; // of the band's valid votes
}

export interface IncomeBand {
  index: number; // 0 = the lowest incomes
  municipalities: number;
  censusPercent: number; // of the profile's census: a big city leaves the bands uneven
  incomeMinEur: number | null; // null: a band no municipality fell in
  incomeMaxEur: number | null;
  blankPercent: number;
  shares: BandShare[]; // in the order of the profile's groups
}

export interface VoterProfile {
  groups: VoteGroup[];
  bands: IncomeBand[];
  municipalitiesWithoutIncome: number;
}

export interface CommunityVoters {
  electionDay: string; // ISO date
  electionSourceUrl: string;
  incomeYear: number | null; // null: no income loaded for the election's year
  incomeSourceUrl: string | null;
  municipalities: number;
  profile: VoterProfile | null;
  noProfileReason: "no_results" | "too_few_municipalities" | null;
}

/** `null` when the API has no election loaded, or no such community (its 404). */
export async function fetchCommunityVoters(territoryId: string): Promise<CommunityVoters | null> {
  const { data, response } = await api.GET("/communities/{territory_id}/voters", {
    params: { path: { territory_id: territoryId } },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GET /communities/${territoryId}/voters answered ${String(response.status)}`);
  }
  const parsed = votersSchema.parse(data);
  return {
    electionDay: parsed.election.held_on,
    electionSourceUrl: parsed.election.source_url,
    incomeYear: parsed.income?.year ?? null,
    incomeSourceUrl: parsed.income?.source_url ?? null,
    municipalities: parsed.municipalities,
    profile:
      parsed.profile === null
        ? null
        : {
            groups: parsed.profile.groups,
            bands: parsed.profile.bands.map((band) => ({
              index: band.index,
              municipalities: band.municipalities,
              censusPercent: band.census_percent,
              incomeMinEur: band.income_min_eur,
              incomeMaxEur: band.income_max_eur,
              blankPercent: band.blank_percent,
              shares: band.shares.map((s) => ({ groupId: s.group_id, percent: s.percent })),
            })),
            municipalitiesWithoutIncome: parsed.profile.municipalities_without_income,
          },
    noProfileReason: parsed.no_profile_reason,
  };
}

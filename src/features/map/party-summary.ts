/**
 * The parties in government today, counted from the map's own data. Pure. Rows are ordered by
 * the name shown (alphabetical, as in a phone book), never by how many communities a party governs: the order does not rank anyone
 * (.claude/rules/project-policies.md, neutrality).
 */
import type { Party } from "@/design/parties";

import type { CommunityLook } from "./community-look";

export interface PartyRow {
  party: Party;
  communityIds: readonly string[];
}

export interface GovernmentSummary {
  rows: readonly PartyRow[];
  total: number; // communities with government data
  coalitions: number; // governments with more than one governing party
  caretakers: number;
  hasNoData: boolean;
}

export function summarise(looks: readonly CommunityLook[]): GovernmentSummary {
  const byParty = new Map<string, { party: Party; communityIds: string[] }>();
  for (const look of looks) {
    for (const party of look.parties) {
      const row = byParty.get(party.id) ?? { party, communityIds: [] };
      row.communityIds.push(look.territoryId);
      byParty.set(party.id, row);
    }
  }
  const withData = looks.filter((look) => look.parties.length > 0);
  return {
    rows: [...byParty.values()].sort((a, b) =>
      a.party.shortName.localeCompare(b.party.shortName, "es"),
    ),
    total: withData.length,
    coalitions: withData.filter((look) => look.parties.length > 1).length,
    caretakers: withData.filter((look) => look.isCaretaker).length,
    hasNoData: withData.length < looks.length,
  };
}

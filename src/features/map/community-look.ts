/**
 * How one community is drawn on the map and what its link says (ADR-0013). Pure: the map
 * component only renders what this decides.
 */
import { type Party, partiesById } from "@/design/parties";
import { es } from "@/i18n/es";
import { formatMessage, listInSpanish } from "@/i18n/format";

export interface CommunityGovernment {
  territoryId: string;
  governingPartyIds: readonly string[]; // as the API sends them: alphabetical by id
  isCaretaker: boolean;
  hasData: boolean;
}

export type Fill =
  | { kind: "solid"; colour: string }
  | { kind: "stripes"; patternId: string; colours: readonly string[] }
  | { kind: "no-data" };

export interface CommunityLook {
  territoryId: string;
  fill: Fill;
  label: string; // accessible name of the community link, also its tooltip
  parties: readonly Party[]; // for the legend
}

export function communityLook(
  government: CommunityGovernment,
  communityName: string,
  partyTable: ReadonlyMap<string, Party>,
): CommunityLook {
  const parties = government.hasData ? partiesById(partyTable, government.governingPartyIds) : [];
  return {
    territoryId: government.territoryId,
    fill: fillOf(parties),
    label: labelOf(communityName, parties, government.isCaretaker),
    parties,
  };
}

/** One id per distinct coalition, so communities with the same partners share one pattern. */
export function stripesPatternId(parties: readonly Party[]): string {
  return `stripes-${parties.map((p) => p.id).join("--")}`;
}

function fillOf(parties: readonly Party[]): Fill {
  const [only, ...others] = parties;
  if (only === undefined) return { kind: "no-data" };
  if (others.length === 0) return { kind: "solid", colour: only.colour };
  return {
    kind: "stripes",
    patternId: stripesPatternId(parties),
    colours: parties.map((p) => p.colour),
  };
}

function labelOf(community: string, parties: readonly Party[], isCaretaker: boolean): string {
  if (parties.length === 0) {
    return formatMessage(es.map.community.noData, { community });
  }
  const template =
    parties.length > 1 ? es.map.community.governedByCoalition : es.map.community.governedBy;
  const label = formatMessage(template, {
    community,
    parties: listInSpanish(parties.map((p) => p.shortName)),
  });
  return isCaretaker ? formatMessage(es.map.community.caretaker, { label }) : label;
}

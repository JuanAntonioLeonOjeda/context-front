/**
 * The voter profile as the page draws it: one card per band of the chosen dimension and, in it,
 * one bar per group. Pure: the API's numbers are only written in Spanish and turned into bar lengths; no
 * percentage is computed here. Groups keep the API's order, the same in every band.
 */
import type { Party } from "@/design/parties";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { DimensionId, VoteGroup, VoterBand, VoterProfile } from "./voters-api";

export interface BarView {
  groupId: string;
  label: string; // the party's short name, the list's acronym, or "Otras"
  percent: string; // "34,7 %"
  share: number; // 34.7, as the API sent it: where the line passes
  width: number; // 0–100: the share against the highest share of the whole profile
  colour: string | null; // the party's colour from the party table; null: neutral
}

export interface BandView {
  index: number;
  name: string; // "Tramo 1 de 5 · rentas más bajas"
  short: string; // "Tramo 1", under the chart's axis
  end: string | null; // "rentas más bajas" for the first band, "rentas más altas" for the last
  census: string; // "19,7 % del censo"
  censusShort: string; // "19,7 %", under a band where the chart is narrow
  censusShare: number; // 19.7, as the API sent it: the height of the band's bar behind the lines
  range: string | null; // "De 10.321 a 12.079 € por persona"; null: no municipality in the band
  size: string; // "21 municipios · 19,7 % del censo"
  blank: string | null; // "Voto en blanco: 0,9 %"
  bars: BarView[]; // empty for a band no municipality fell in
}

const one = new Intl.NumberFormat("es", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
// Spanish groups thousands from five digits on ("9500", "12.079"), as the rest of the site does.
const numbers = new Intl.NumberFormat("es", { maximumFractionDigits: 0 });

function percent(value: number): string {
  return formatMessage(es.voters.profile.percent, { value: one.format(value) });
}

/** One bar scale for the whole profile, so a bar of one band can be compared with another's. */
function highestShare(bands: readonly VoterBand[]): number {
  return Math.max(0, ...bands.flatMap((band) => band.shares.map((share) => share.percent)));
}

// How a value of the dimension is written: whole euros and electors, a percentage with a decimal.
const VALUE_FORMAT: Record<DimensionId, Intl.NumberFormat> = {
  income: numbers,
  size: numbers,
  education: one,
  age: one,
  born_abroad: one,
};

function bandName(index: number, total: number, dimension: DimensionId): string {
  const texts = es.voters.dimensions[dimension];
  const name = formatMessage(es.voters.band.name, {
    number: String(index + 1),
    total: String(total),
  });
  if (index === 0) return formatMessage(es.voters.band.withEnd, { name, end: texts.lowest });
  if (index === total - 1) {
    return formatMessage(es.voters.band.withEnd, { name, end: texts.highest });
  }
  return name;
}

function endOf(index: number, total: number, dimension: DimensionId): string | null {
  const texts = es.voters.dimensions[dimension];
  if (index === 0) return texts.lowest;
  if (index === total - 1) return texts.highest;
  return null;
}

function rangeText(band: VoterBand, dimension: DimensionId): string | null {
  if (band.valueMin === null || band.valueMax === null) return null;
  const texts = es.voters.dimensions[dimension];
  const format = VALUE_FORMAT[dimension];
  const min = format.format(band.valueMin);
  const max = format.format(band.valueMax);
  // A band that is one municipality (a capital with half the census) has one value, not a range;
  // so has one whose values are written the same ("33,1 a 33,1" says nothing more than "33,1").
  if (min === max) return formatMessage(texts.single, { value: min });
  return formatMessage(texts.range, { min, max });
}

function sizeText(band: VoterBand): string {
  const municipalities =
    band.municipalities === 1
      ? es.voters.band.municipality
      : formatMessage(es.voters.band.municipalities, { count: String(band.municipalities) });
  const census = formatMessage(es.voters.band.censusShare, {
    percent: percent(band.censusPercent),
  });
  return formatMessage(es.voters.band.size, { municipalities, census });
}

/** The row of the party table for a group that is a party. A party the table does not know is
 *  a data error, as everywhere else on the site: it is never drawn as if it were "Otras". */
function partyOf(group: VoteGroup, parties: ReadonlyMap<string, Party>): Party | null {
  if (group.kind !== "party") return null;
  const party = parties.get(group.id);
  if (party === undefined) throw new Error(`party ${group.id} is not in the party table`);
  return party;
}

function groupLabel(group: VoteGroup, party: Party | null): string {
  if (group.kind === "others") return es.voters.profile.others;
  // The name and the colour of a party come from the same row of the table.
  return party?.shortName ?? group.label ?? group.id;
}

function bars(
  band: VoterBand,
  groups: readonly VoteGroup[],
  parties: ReadonlyMap<string, Party>,
  highest: number,
): BarView[] {
  const byId = new Map(groups.map((group) => [group.id, group]));
  return band.shares.flatMap((share) => {
    const group = byId.get(share.groupId);
    // The API layer rejects a share of an undeclared group, so this only narrows the type.
    if (group === undefined) return [];
    const party = partyOf(group, parties);
    return [
      {
        groupId: group.id,
        label: groupLabel(group, party),
        percent: percent(share.percent),
        share: share.percent,
        width: highest === 0 ? 0 : Math.round((share.percent / highest) * 1000) / 10,
        // Only a party has a colour; a candidature outside the table and "Otras" are neutral.
        colour: party?.colour ?? null,
      },
    ];
  });
}

/** The bands of a profile, lowest values first as the API sends them. */
export function bandViews(
  profile: VoterProfile,
  parties: ReadonlyMap<string, Party>,
  dimension: DimensionId,
): BandView[] {
  const highest = highestShare(profile.bands);
  return profile.bands.map((band) => {
    const isEmpty = band.municipalities === 0;
    return {
      index: band.index,
      name: bandName(band.index, profile.bands.length, dimension),
      short: formatMessage(es.voters.band.short, { number: String(band.index + 1) }),
      end: endOf(band.index, profile.bands.length, dimension),
      census: formatMessage(es.voters.band.censusShare, { percent: percent(band.censusPercent) }),
      censusShort: percent(band.censusPercent),
      censusShare: band.censusPercent,
      range: rangeText(band, dimension),
      size: sizeText(band),
      blank: isEmpty
        ? null
        : formatMessage(es.voters.band.blank, { percent: percent(band.blankPercent) }),
      bars: isEmpty ? [] : bars(band, profile.groups, parties, highest),
    };
  });
}

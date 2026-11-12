/**
 * The voter profile as the page draws it: one row per income band and, in it, one bar per
 * group. Pure: the API's numbers are only written in Spanish and turned into bar lengths; no
 * percentage is computed here. Groups keep the API's order, the same in every band.
 */
import type { Party } from "@/design/parties";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { IncomeBand, VoteGroup, VoterProfile } from "./voters-api";

export interface BarView {
  groupId: string;
  label: string; // the party's short name, the list's acronym, or "Otras"
  percent: string; // "34,7 %"
  width: number; // 0–100: the share against the highest share of the whole profile
  colour: string | null; // the party's colour from the party table; null: neutral
}

export interface BandView {
  index: number;
  name: string; // "Tramo 1 de 5 · rentas más bajas"
  income: string | null; // "De 10.321 a 12.079 € por persona"; null: no municipality in the band
  size: string; // "21 municipios · 19,7 % del censo"
  blank: string | null; // "Voto en blanco: 0,9 %"
  bars: BarView[]; // empty for a band no municipality fell in
}

const one = new Intl.NumberFormat("es", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
// Spanish groups thousands from five digits on ("9500", "12.079"), as the rest of the site does.
const euros = new Intl.NumberFormat("es", { maximumFractionDigits: 0 });

function percent(value: number): string {
  return formatMessage(es.voters.profile.percent, { value: one.format(value) });
}

/** One bar scale for the whole profile, so a bar of one band can be compared with another's. */
function highestShare(bands: readonly IncomeBand[]): number {
  return Math.max(0, ...bands.flatMap((band) => band.shares.map((share) => share.percent)));
}

function bandName(index: number, total: number): string {
  const name = formatMessage(es.voters.band.name, {
    number: String(index + 1),
    total: String(total),
  });
  if (index === 0) return `${name} · ${es.voters.band.lowest}`;
  if (index === total - 1) return `${name} · ${es.voters.band.highest}`;
  return name;
}

function incomeText(band: IncomeBand): string | null {
  if (band.incomeMinEur === null || band.incomeMaxEur === null) return null;
  // A band that is one municipality (a capital with half the census) has one income, not a range.
  if (band.incomeMinEur === band.incomeMaxEur) {
    return formatMessage(es.voters.band.incomeSingle, { value: euros.format(band.incomeMinEur) });
  }
  return formatMessage(es.voters.band.incomeRange, {
    min: euros.format(band.incomeMinEur),
    max: euros.format(band.incomeMaxEur),
  });
}

function sizeText(band: IncomeBand): string {
  const municipalities =
    band.municipalities === 1
      ? es.voters.band.municipality
      : formatMessage(es.voters.band.municipalities, { count: String(band.municipalities) });
  const census = formatMessage(es.voters.band.censusShare, {
    percent: percent(band.censusPercent),
  });
  return `${municipalities} · ${census}`;
}

function groupLabel(group: VoteGroup, parties: ReadonlyMap<string, Party>): string {
  if (group.kind === "others") return es.voters.profile.others;
  // The API's label is the same short name; the table is asked first so the name and the colour
  // of a party always come from the same row.
  return (
    (group.kind === "party" ? parties.get(group.id)?.shortName : undefined) ??
    group.label ??
    group.id
  );
}

function bars(
  band: IncomeBand,
  groups: readonly VoteGroup[],
  parties: ReadonlyMap<string, Party>,
  highest: number,
): BarView[] {
  const byId = new Map(groups.map((group) => [group.id, group]));
  return band.shares.flatMap((share) => {
    const group = byId.get(share.groupId);
    if (group === undefined) return []; // a share of no declared group: not drawn, never guessed
    return [
      {
        groupId: group.id,
        label: groupLabel(group, parties),
        percent: percent(share.percent),
        width: highest === 0 ? 0 : Math.round((share.percent / highest) * 1000) / 10,
        // Only a party of the table has a colour; a list without a party and "Otras" are neutral.
        colour: group.kind === "party" ? (parties.get(group.id)?.colour ?? null) : null,
      },
    ];
  });
}

/** The bands of a profile, lowest incomes first as the API sends them. */
export function bandViews(profile: VoterProfile, parties: ReadonlyMap<string, Party>): BandView[] {
  const highest = highestShare(profile.bands);
  return profile.bands.map((band) => {
    const isEmpty = band.municipalities === 0;
    return {
      index: band.index,
      name: bandName(band.index, profile.bands.length),
      income: incomeText(band),
      size: sizeText(band),
      blank: isEmpty
        ? null
        : formatMessage(es.voters.band.blank, { percent: percent(band.blankPercent) }),
      bars: isEmpty ? [] : bars(band, profile.groups, parties, highest),
    };
  });
}

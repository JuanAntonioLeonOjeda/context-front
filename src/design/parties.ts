/**
 * The only place in the web app that turns parties into colours and names
 * (.claude/rules/project-policies.md, "Neutrality in the UI"). Colours are never written
 * here: they come from the API's party table (`GET /parties`), whose source is documented in
 * the backend (`data/governments/README.md`, "Party colours").
 */

export interface Party {
  id: string;
  name: string;
  shortName: string;
  colour: string; // "#rrggbb"
}

export interface PartyInput {
  id: string;
  name: string;
  short_name: string;
  colour_hex: string;
}

const HEX = /^#[0-9a-f]{6}$/;

/** The party table by id. A colour that is not `#rrggbb` is a contract error, not a default. */
export function partyTable(parties: readonly PartyInput[]): ReadonlyMap<string, Party> {
  return new Map(
    parties.map((p) => {
      if (!HEX.test(p.colour_hex)) {
        throw new Error(`party ${p.id} has an invalid colour "${p.colour_hex}"`);
      }
      return [p.id, { id: p.id, name: p.name, shortName: p.short_name, colour: p.colour_hex }];
    }),
  );
}

/** The parties of `ids`, in that order. An id missing from the table is a data error. */
export function partiesById(table: ReadonlyMap<string, Party>, ids: readonly string[]): Party[] {
  return ids.map((id) => {
    const party = table.get(id);
    if (party === undefined) {
      throw new Error(`party ${id} is not in the party table`);
    }
    return party;
  });
}

import { describe, expect, it } from "vitest";

import { partiesById, partyTable } from "@/design/parties";
import parties from "@/test/fixtures/parties.json";

describe("partyTable", () => {
  it("indexes the real party table by id with name, short name and colour", () => {
    const table = partyTable(parties);

    expect(table.size).toBe(34);
    expect(table.get("psoe")).toEqual({
      id: "psoe",
      name: "Partido Socialista Obrero Español",
      shortName: "PSOE",
      colour: "#ef1c27",
    });
  });

  it("refuses a colour that is not #rrggbb", () => {
    expect(() => partyTable([{ id: "x", name: "X", short_name: "X", colour_hex: "red" }])).toThrow(
      'party x has an invalid colour "red"',
    );
  });
});

describe("partiesById", () => {
  it("keeps the order of the ids it is given", () => {
    const table = partyTable(parties);

    expect(partiesById(table, ["pp", "coalicion-canaria"]).map((p) => p.shortName)).toEqual([
      "PP",
      "CC",
    ]);
  });

  it("treats an id missing from the table as a data error", () => {
    expect(() => partiesById(partyTable(parties), ["nobody"])).toThrow(
      "party nobody is not in the party table",
    );
  });
});

import { describe, expect, it } from "vitest";

import { partyTable } from "@/design/parties";
import parties from "@/test/fixtures/parties.json";

import { bandViews } from "./voter-profile";
import type { IncomeBand, VoterProfile } from "./voters-api";

const TABLE = partyTable(parties);
const PP = TABLE.get("pp");
const PSOE = TABLE.get("psoe");

function band(
  index: number,
  shares: [string, number][],
  extra: Partial<IncomeBand> = {},
): IncomeBand {
  return {
    index,
    municipalities: 10,
    censusPercent: 20,
    incomeMinEur: 10000,
    incomeMaxEur: 12000,
    blankPercent: 1,
    shares: shares.map(([groupId, percent]) => ({ groupId, percent })),
    ...extra,
  };
}

const PROFILE: VoterProfile = {
  groups: [
    { id: "pp", kind: "party", label: "PP" },
    { id: "psoe", kind: "party", label: "PSOE" },
    { id: "lista:U.P.N.", kind: "list", label: "U.P.N." },
    { id: "otras", kind: "others", label: null },
  ],
  bands: [
    band(
      0,
      [
        ["pp", 20],
        ["psoe", 40],
        ["lista:U.P.N.", 30],
        ["otras", 9],
      ],
      {
        municipalities: 21,
        censusPercent: 19.7,
        incomeMinEur: 9500,
        incomeMaxEur: 12079,
        blankPercent: 0.9,
      },
    ),
    band(
      1,
      [
        ["pp", 50],
        ["psoe", 25],
        ["lista:U.P.N.", 12.5],
        ["otras", 11.5],
      ],
      {
        municipalities: 1,
        censusPercent: 48.8,
        incomeMinEur: 19632,
        incomeMaxEur: 19632,
      },
    ),
    // A band no municipality fell in, with its groups at zero: nothing to draw.
    band(
      2,
      [
        ["pp", 0],
        ["psoe", 0],
        ["lista:U.P.N.", 0],
        ["otras", 0],
      ],
      {
        municipalities: 0,
        censusPercent: 0,
        incomeMinEur: null,
        incomeMaxEur: null,
        blankPercent: 0,
      },
    ),
  ],
  municipalitiesWithoutIncome: 0,
};

describe("bandViews", () => {
  const views = bandViews(PROFILE, TABLE);

  it("names each band by its place and says which end is which", () => {
    expect(views.map((v) => v.name)).toEqual([
      "Tramo 1 de 3 · rentas más bajas",
      "Tramo 2 de 3",
      "Tramo 3 de 3 · rentas más altas",
    ]);
  });

  it("writes the income as a range, or as one figure when the band is one income", () => {
    expect(views[0]?.income).toBe("De 9500 a 12.079 € por persona");
    expect(views[1]?.income).toBe("19.632 € por persona");
  });

  it("writes how many municipalities and how much of the census a band holds", () => {
    expect(views[0]?.size).toBe("21 municipios · 19,7 % del censo");
    expect(views[1]?.size).toBe("1 municipio · 48,8 % del censo");
    expect(views[0]?.blank).toBe("Voto en blanco: 0,9 %");
  });

  it("measures every bar against the highest share of the whole profile", () => {
    // The highest share is PP's 50 % in the second band: it fills the scale.
    expect(views[1]?.bars.map((b) => b.width)).toEqual([100, 50, 25, 23]);
    expect(views[0]?.bars.map((b) => b.width)).toEqual([40, 80, 60, 18]);
    expect(views[0]?.bars.map((b) => b.percent)).toEqual(["20,0 %", "40,0 %", "30,0 %", "9,0 %"]);
  });

  it("keeps the groups in the API's order in every band", () => {
    for (const view of views.slice(0, 2)) {
      expect(view.bars.map((b) => b.label)).toEqual(["PP", "PSOE", "U.P.N.", "Otras"]);
    }
  });

  it("colours a party from the party table and leaves a list and the rest neutral", () => {
    expect(views[0]?.bars.map((b) => b.colour)).toEqual([PP?.colour, PSOE?.colour, null, null]);
    expect(PP?.colour).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("leaves a party the table does not know neutral, with the API's label", () => {
    const [view] = bandViews(
      {
        ...PROFILE,
        groups: [{ id: "nuevo", kind: "party", label: "Nuevo" }],
        bands: [band(0, [["nuevo", 10]])],
      },
      TABLE,
    );
    expect(view?.bars).toEqual([
      { groupId: "nuevo", label: "Nuevo", percent: "10,0 %", width: 100, colour: null },
    ]);
  });

  it("draws nothing in a band no municipality fell in", () => {
    expect(views[2]).toMatchObject({
      income: null,
      size: "0 municipios · 0,0 % del censo",
      blank: null,
      bars: [],
    });
  });
});

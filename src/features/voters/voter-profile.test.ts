import { describe, expect, it } from "vitest";

import { partyTable } from "@/design/parties";
import parties from "@/test/fixtures/parties.json";

import { bandViews } from "./voter-profile";
import type { VoterBand, VoterProfile } from "./voters-api";

const TABLE = partyTable(parties);
const PP = TABLE.get("pp");
const PSOE = TABLE.get("psoe");

function band(
  index: number,
  shares: [string, number][],
  extra: Partial<VoterBand> = {},
): VoterBand {
  return {
    index,
    municipalities: 10,
    censusPercent: 20,
    valueMin: 10000,
    valueMax: 12000,
    blankPercent: 1,
    shares: shares.map(([groupId, percent]) => ({ groupId, percent })),
    ...extra,
  };
}

const PROFILE: VoterProfile = {
  groups: [
    { id: "pp", kind: "party", label: "PP" },
    { id: "psoe", kind: "party", label: "PSOE" },
    { id: "lista:U.P.N.", kind: "candidature", label: "U.P.N." },
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
        valueMin: 9500,
        valueMax: 12079,
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
        valueMin: 19632,
        valueMax: 19632,
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
        valueMin: null,
        valueMax: null,
        blankPercent: 0,
      },
    ),
  ],
  municipalitiesWithoutValue: 0,
};

describe("bandViews", () => {
  const views = bandViews(PROFILE, TABLE, "income");

  it("names each band by its place and says which end is which", () => {
    expect(views.map((v) => v.name)).toEqual([
      "Tramo 1 de 3 · rentas más bajas",
      "Tramo 2 de 3",
      "Tramo 3 de 3 · rentas más altas",
    ]);
  });

  it("writes the income as a range, or as one figure when the band is one income", () => {
    expect(views[0]?.range).toBe("De 9500 a 12.079 € por persona");
    expect(views[1]?.range).toBe("19.632 € por persona");
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

  it("refuses a party the party table does not know, instead of drawing it as the rest", () => {
    const unknown: VoterProfile = {
      ...PROFILE,
      groups: [{ id: "nuevo", kind: "party", label: "Nuevo" }],
      bands: [band(0, [["nuevo", 10]])],
    };
    expect(() => bandViews(unknown, TABLE, "income")).toThrow(/nuevo is not in the party table/);
  });

  it("draws nothing in a band no municipality fell in", () => {
    expect(views[2]).toMatchObject({
      range: null,
      size: "0 municipios · 0,0 % del censo",
      blank: null,
      bars: [],
    });
  });
});

describe("bandViews by the size of the municipality", () => {
  const sized: VoterProfile = {
    groups: PROFILE.groups,
    municipalitiesWithoutValue: 0,
    bands: [
      band(0, [["pp", 40]], { valueMin: 200, valueMax: 1499 }),
      band(1, [["pp", 50]], { valueMin: 1500, valueMax: 1500 }),
      band(2, [["pp", 30]], { valueMin: null, valueMax: null, municipalities: 0 }),
      band(3, [["pp", 20]], { valueMin: 40000, valueMax: 90000 }),
    ],
  };
  const views = bandViews(sized, TABLE, "size");

  it("names the ends by the size of the municipalities and writes the range in electors", () => {
    expect(views.map((v) => v.name)).toEqual([
      "Tramo 1 de 4 · municipios más pequeños",
      "Tramo 2 de 4",
      "Tramo 3 de 4",
      "Tramo 4 de 4 · municipios más grandes",
    ]);
    expect(views[0]?.range).toBe("De 200 a 1499 electores");
    expect(views[1]?.range).toBe("1500 electores");
    expect(views[3]?.range).toBe("De 40.000 a 90.000 electores");
  });
});

describe("bandViews by the education of the municipalities", () => {
  const educated: VoterProfile = {
    groups: PROFILE.groups,
    municipalitiesWithoutValue: 0,
    bands: [
      band(0, [["pp", 40]], { valueMin: 14.101, valueMax: 24.081 }),
      band(1, [["pp", 50]], { valueMin: 46.315, valueMax: 46.315 }),
      band(2, [["pp", 30]], { valueMin: 30, valueMax: 31.25 }),
    ],
  };
  const views = bandViews(educated, TABLE, "education");

  it("names the ends by the studies and writes every value as a percentage with a decimal", () => {
    expect(views[0]?.name).toBe("Tramo 1 de 3 · menos estudios superiores");
    expect(views[2]?.name).toBe("Tramo 3 de 3 · más estudios superiores");
    expect(views[0]?.range).toBe("De 14,1 % a 24,1 % con estudios superiores");
    expect(views[1]?.range).toBe("46,3 % con estudios superiores");
    // A whole number keeps its decimal, and a half rounds up as the API's 3 decimals suggest.
    expect(views[2]?.range).toBe("De 30,0 % a 31,3 % con estudios superiores");
  });

  it("writes one value, not a range, when both ends are written the same", () => {
    const close: VoterProfile = {
      groups: PROFILE.groups,
      municipalitiesWithoutValue: 0,
      bands: [band(0, [["pp", 40]], { valueMin: 33.051, valueMax: 33.054 })],
    };

    expect(bandViews(close, TABLE, "education")[0]?.range).toBe("33,1 % con estudios superiores");
  });
});

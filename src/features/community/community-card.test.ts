import { describe, expect, it } from "vitest";

import type { Government, Indicator } from "./community-api";
import { formatPeriod, formatValue, governmentView, indicatorRows } from "./community-card";

const government: Government = {
  date: "2026-10-14",
  presidentName: "Fernando Clavijo Batlle",
  validFrom: "2023-07-14",
  isCaretaker: false,
  sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-16293",
  parties: [
    {
      partyId: "ahi",
      shortName: "AHI",
      role: "external_support",
      sourceUrl: "https://x.example/a",
    },
    { partyId: "cc", shortName: "CC", role: "governing", sourceUrl: "https://x.example/b" },
    { partyId: "pp", shortName: "PP", role: "governing", sourceUrl: "https://x.example/c" },
  ],
};

describe("governmentView", () => {
  it("separates the parties that govern from those that only supported the investiture", () => {
    const view = governmentView(government);

    expect(view.governing.map((p) => p.shortName)).toEqual(["CC", "PP"]);
    expect(view.support.map((p) => p.shortName)).toEqual(["AHI"]);
  });

  it("writes the president and the start of the term in Spanish", () => {
    const view = governmentView(government);

    expect(view.president).toBe("Presidencia: Fernando Clavijo Batlle");
    expect(view.since).toBe("Desde el 14 de julio de 2023");
  });
});

describe("formatValue", () => {
  it.each([
    [11.6, "%", "11,6 %"],
    [22.41, "%", "22,41 %"],
    [2277705, "persons", "2.277.705 personas"],
    [110.44, "index (2025 = 100)", "110,44 (base 2025 = 100)"],
    [3, "unknown unit", "3 unknown unit"],
  ])("%s %s → %s", (value, unit, expected) => {
    expect(formatValue(value, unit)).toBe(expected);
  });
});

describe("formatPeriod", () => {
  it("writes a quarter in words and a year as the year", () => {
    expect(formatPeriod({ year: 2026, quarter: 2 })).toBe("2.º trimestre de 2026");
    expect(formatPeriod({ year: 2025, quarter: null })).toBe("2025");
  });
});

describe("indicatorRows", () => {
  const rate: Indicator = {
    id: "unemployment_rate",
    name: "Tasa de paro",
    unit: "%",
    latest: { year: 2026, quarter: 2, value: 11.6 },
    tableId: "14506",
    tableUrl: "https://www.ine.es/jaxiT3/Tabla.htm?t=14506",
    fetchedAt: "2026-10-13T15:48:00Z",
  };

  it("gives the value, its period and its source with the download date", () => {
    const [row] = indicatorRows([rate]);

    expect(row).toEqual({
      id: "unemployment_rate",
      name: "Tasa de paro",
      value: "11,6 %",
      period: "2.º trimestre de 2026",
      tableLabel: "Tabla 14506 del INE",
      tableUrl: "https://www.ine.es/jaxiT3/Tabla.htm?t=14506",
      downloaded: "Descargado el 13 de octubre de 2026.",
    });
  });

  it("keeps an indicator without data as no value, never as zero", () => {
    const [row] = indicatorRows([{ ...rate, latest: null, fetchedAt: null }]);

    expect(row?.value).toBeNull();
    expect(row?.period).toBeNull();
    expect(row?.downloaded).toBeNull();
  });
});

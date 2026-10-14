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
    series: [],
    tableId: "14506",
    tableUrl: "https://www.ine.es/jaxiT3/Tabla.htm?t=14506",
    fetchedAt: "2026-10-13T15:48:00Z",
  };

  it("gives the value, its period and its source with the download date", () => {
    const [row] = indicatorRows([rate]);

    expect(row).toMatchObject({
      id: "unemployment_rate",
      name: "Tasa de paro",
      value: "11,6 %",
      period: "2.º trimestre de 2026",
      tableLabel: "Tabla 14506 del INE",
      tableUrl: "https://www.ine.es/jaxiT3/Tabla.htm?t=14506",
      downloaded: "Descargado el 13 de octubre de 2026.",
    });
  });

  it("describes the chart in words, and gives the lowest and highest value and every point", () => {
    const series = [
      { year: 2025, quarter: 4, value: 12.1 },
      { year: 2026, quarter: 1, value: 13.4 },
      { year: 2026, quarter: 2, value: 11.6 },
      { year: 2026, quarter: 3, value: 11.9 },
    ];
    const [row] = indicatorRows([{ ...rate, series }]);

    expect(row?.chartLabel).toBe(
      "Evolución de Tasa de paro entre 4.º trimestre de 2025 y 3.º trimestre de 2026: de 12,1 % a 11,9 %.",
    );
    expect(row?.range).toBe(
      "Entre 4.º trimestre de 2025 y 3.º trimestre de 2026: el valor más bajo fue 11,6 % y el más alto, 13,4 %.",
    );
    expect(row?.data).toHaveLength(4);
    expect(row?.data[0]).toEqual({ period: "4.º trimestre de 2025", value: "12,1 %" });
  });

  it("draws no chart for a short series, but still lists its points", () => {
    const [row] = indicatorRows([{ ...rate, series: [{ year: 2025, quarter: null, value: 20 }] }]);

    expect(row).toMatchObject({ chart: null, chartLabel: null, range: null });
    expect(row?.data).toEqual([{ period: "2025", value: "20 %" }]);
  });

  it("keeps an indicator without data as no value, never as zero", () => {
    const [row] = indicatorRows([{ ...rate, latest: null, fetchedAt: null }]);

    expect(row?.value).toBeNull();
    expect(row?.period).toBeNull();
    expect(row?.downloaded).toBeNull();
  });
});

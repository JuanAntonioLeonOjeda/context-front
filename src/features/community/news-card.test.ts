import { describe, expect, it } from "vitest";

import { partyTable } from "@/design/parties";

import type { Attribution, NewsItem } from "./news-api";
import { formatNewsDate, newsRows } from "./news-card";

const parties = partyTable([
  { id: "coalicion-canaria", name: "Coalición Canaria", short_name: "CC", colour_hex: "#019e4c" },
  { id: "pp", name: "Partido Popular", short_name: "PP", colour_hex: "#0056a8" },
]);

const high: Attribution = {
  level: "ccaa",
  partyIds: ["coalicion-canaria", "pp"],
  isCaretaker: false,
  confidence: "high",
  reason: null,
  competences: [
    {
      activity: "a",
      description: "A",
      legalBasis: "CE art. 148.1.3ª",
      sourceUrl: "https://x.es/1",
    },
    {
      activity: "b",
      description: "B",
      legalBasis: "CE art. 148.1.3ª",
      sourceUrl: "https://x.es/1",
    },
    {
      activity: "c",
      description: "C",
      legalBasis: "Ley 12/2023 art. 18",
      sourceUrl: "https://x.es/2",
    },
  ],
};
const undetermined: Attribution = {
  level: null,
  partyIds: [],
  isCaretaker: false,
  confidence: "not_determined",
  reason: "no_level_named",
  competences: [],
};

function item(attribution: Attribution[], publishedAt = "2026-10-14T09:44:08Z"): NewsItem {
  return {
    outletId: "rtvc",
    outletName: "Radio Televisión Canaria",
    headline: "Un titular",
    url: "https://rtvc.es/1",
    publishedAt,
    attribution,
  };
}

describe("newsRows", () => {
  it("names the government, its parties in the API's order, and the confidence in words", () => {
    const [row] = newsRows([item([high])], parties);

    expect(row?.attribution[0]).toMatchObject({
      responsible: "Responsable: Gobierno autonómico, CC y PP",
      confidence: "Confianza: Alta",
    });
  });

  it("gives each legal basis once, with its source", () => {
    const [row] = newsRows([item([high])], parties);

    expect(row?.attribution[0]?.basis).toEqual([
      { label: "CE art. 148.1.3ª", url: "https://x.es/1" },
      { label: "Ley 12/2023 art. 18", url: "https://x.es/2" },
    ]);
  });

  it("says a caretaker government is a caretaker", () => {
    const [row] = newsRows([item([{ ...high, isCaretaker: true }])], parties);

    expect(row?.attribution[0]?.responsible).toBe(
      "Responsable: Gobierno autonómico (en funciones), CC y PP",
    );
  });

  it("writes 'Sin determinar' with its reason and names nobody", () => {
    const [row] = newsRows([item([undetermined])], parties);

    expect(row?.attribution[0]).toEqual({
      responsible: null,
      confidence:
        "Confianza: Sin determinar: la noticia no nombra ningún gobierno y las competencias del sector las comparten varios niveles",
      basis: [],
    });
  });

  it.each([
    ["no_competence", "un gobierno sin competencias en este sector"],
    ["local_not_modelled", "un gobierno local, que todavía no recogemos"],
    ["no_government_on_date", "no hay datos de gobierno en la fecha de la noticia"],
  ] as const)("explains the reason %s", (reason, text) => {
    const [row] = newsRows([item([{ ...undetermined, reason }])], parties);

    expect(row?.attribution[0]?.confidence).toContain(text);
  });

  it("keeps one entry per government the article names, in the API's order", () => {
    const state: Attribution = { ...high, level: "state", partyIds: ["pp"] };
    const [row] = newsRows([item([state, high])], parties);

    expect(row?.attribution.map((a) => a.responsible)).toEqual([
      "Responsable: Gobierno de España, PP",
      "Responsable: Gobierno autonómico, CC y PP",
    ]);
  });

  it("fails loudly on a party that is not in the table instead of showing a gap", () => {
    expect(() => newsRows([item([{ ...high, partyIds: ["nuevo"] }])], parties)).toThrow(/nuevo/);
  });

  it("puts the outlet and the date in one line, with no lead", () => {
    const [row] = newsRows([item([undetermined])], parties);

    expect(row?.outlet).toBe("Radio Televisión Canaria, 14 de octubre de 2026");
    expect(Object.keys(row ?? {}).sort()).toEqual([
      "attribution",
      "headline",
      "key",
      "outlet",
      "url",
    ]);
  });
});

describe("formatNewsDate", () => {
  it("shows the day in Spain, not in UTC", () => {
    // 23:30 UTC on the 13th is already the 14th in Spain (CEST, UTC+2).
    expect(formatNewsDate("2026-10-13T23:30:00Z")).toBe("14 de octubre de 2026");
  });

  it("refuses something that is not an instant", () => {
    expect(() => formatNewsDate("ayer")).toThrow(/not an ISO instant/);
  });
});

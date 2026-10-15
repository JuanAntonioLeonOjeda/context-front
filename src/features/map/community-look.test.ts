import { describe, expect, it } from "vitest";

import { partyTable } from "@/design/parties";
import { communityLook, type CommunityGovernment } from "@/features/map/community-look";
import before from "@/test/fixtures/map-governments-2010-01-01.json";
import june2023 from "@/test/fixtures/map-governments-2023-06-01.json";
import today from "@/test/fixtures/map-governments-2026-10-14.json";
import parties from "@/test/fixtures/parties.json";
import territories from "@/test/fixtures/territories.json";

// Real API responses captured from the backend (src/test/fixtures/).
const table = partyTable(parties);
const names = new Map(territories.map((t) => [t.id, t.name]));

type MapResponse = typeof today;

function lookOf(response: MapResponse, territoryId: string): ReturnType<typeof communityLook> {
  const entry = response.communities.find((c) => c.territory_id === territoryId);
  if (entry === undefined) throw new Error(`no ${territoryId} in the fixture`);
  const government: CommunityGovernment = {
    territoryId: entry.territory_id,
    governingPartyIds: entry.governing_party_ids,
    isCaretaker: entry.is_caretaker,
    hasData: entry.has_data,
  };
  return communityLook(government, names.get(territoryId) ?? "", table);
}

describe("communityLook", () => {
  it("fills a one-party government with that party's colour", () => {
    const galicia = lookOf(today, "ccaa-12");

    expect(galicia.fill).toEqual({ kind: "solid", colour: "#1d84ce" });
    expect(galicia.label).toBe("Galicia: gobierna PP");
  });

  it("names only the parties that govern, never those that only support", () => {
    // The PSC governs Cataluña with the external support of ERC and Comuns.
    const cataluna = lookOf(today, "ccaa-09");

    expect(cataluna.fill.kind).toBe("solid");
    expect(cataluna.label).toBe("Cataluña: gobierna PSC");
  });

  it("stripes a coalition with every partner's colour, in the order the API sends", () => {
    const navarra = lookOf(today, "ccaa-15");

    expect(navarra.fill).toEqual({
      kind: "stripes",
      patternId: "stripes-contigo-zurekin--geroa-bai--psoe",
      colours: ["#65bc7b", "#f75e42", "#ef1c27"],
    });
    expect(navarra.label).toBe(
      "Comunidad Foral de Navarra: gobiernan Contigo-Zurekin, GBai y PSOE",
    );
  });

  it("gives the same pattern to communities governed by the same partners", () => {
    const andalucia = lookOf(today, "ccaa-01");
    const aragon = lookOf(today, "ccaa-02");

    expect(andalucia.fill).toEqual(aragon.fill);
  });

  it("says when a government is caretaker", () => {
    // Aragón, 1 June 2023: the PSOE-CHA-Podemos-PAR government in caretaker mode.
    const aragon = lookOf(june2023, "ccaa-02");

    expect(aragon.label).toBe("Aragón: gobiernan CHA, PAR, Podemos y PSOE (en funciones)");
    expect(aragon.fill.kind).toBe("stripes");
  });

  it("marks a date without data instead of drawing a government", () => {
    const madrid = lookOf(before, "ccaa-13");

    expect(madrid.fill).toEqual({ kind: "no-data" });
    expect(madrid.label).toBe("Comunidad de Madrid: sin datos de gobierno en esta fecha");
    expect(madrid.parties).toEqual([]);
  });

  it("covers the 19 communities of the real response", () => {
    const looks = today.communities.map((c) => lookOf(today, c.territory_id));

    expect(looks).toHaveLength(19);
    expect(looks.every((l) => l.fill.kind !== "no-data")).toBe(true);
  });
});

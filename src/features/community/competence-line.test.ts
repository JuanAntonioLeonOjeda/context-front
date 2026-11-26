import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";

import { competenceLine } from "./competence-line";
import type { CompetentBody } from "./news-api";

function body(over: Partial<CompetentBody> = {}): CompetentBody {
  return {
    bodyId: "ccaa-05-sanidad",
    name: "Consejería de Sanidad",
    level: "ccaa",
    territoryId: "ccaa-05",
    sectorId: "health",
    shared: false,
    ...over,
  };
}

describe("competenceLine", () => {
  it("names each body of the sector shown with a link to its chart, in the API's order", () => {
    const line = competenceLine(
      [
        body({
          bodyId: "es-sanidad",
          name: "Ministerio de Sanidad",
          level: "state",
          territoryId: "es",
        }),
        body(),
      ],
      "health",
    );

    expect(line).toEqual({
      label: es.community.news.competence.label,
      bodies: [
        { key: "es-sanidad", name: "Ministerio de Sanidad", href: "/organigrama" },
        {
          key: "ccaa-05-sanidad",
          name: "Consejería de Sanidad",
          href: "/comunidades/ccaa-05/organigrama",
        },
      ],
    });
  });

  it("says the competence is shared when the item had no level of its own", () => {
    expect(competenceLine([body({ shared: true })], "health")?.label).toBe(
      es.community.news.competence.shared,
    );
  });

  it("leaves out the bodies of the item's other sectors", () => {
    const line = competenceLine(
      [body(), body({ bodyId: "ccaa-05-vivienda", sectorId: "housing" })],
      "health",
    );

    expect(line?.bodies.map((b) => b.key)).toEqual(["ccaa-05-sanidad"]);
  });

  it("sends a generic local body to the general chart", () => {
    const local = body({ bodyId: "local-ayuntamiento", level: "local", territoryId: null });

    expect(competenceLine([local], "health")?.bodies[0]?.href).toBe("/organigrama");
  });

  it("is nothing when no body is reached for the sector", () => {
    expect(competenceLine([], "health")).toBeNull();
    expect(competenceLine([body()], "housing")).toBeNull();
  });
});

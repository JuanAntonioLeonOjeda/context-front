import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import general from "@/test/fixtures/organization.json";
import { server } from "@/test/server";

import {
  fetchOrganization,
  type Body,
  type CommunityRef,
  type GeneralOrganization,
} from "./organization-api";
import { boxView, communityLinks, executiveView } from "./organization-view";

async function state(): Promise<GeneralOrganization> {
  server.use(http.get("*/api/organization", () => HttpResponse.json(general)));
  return fetchOrganization();
}

function bodyNamed(chart: GeneralOrganization, id: string): Body {
  const body = chart.executive.departments.find((d) => d.id === id);
  if (body === undefined) throw new Error(`no ${id} in the fixture`);
  return body;
}

describe("boxView", () => {
  it("writes the holder's title, name and date in Spanish, with the source", async () => {
    const view = boxView(bodyNamed(await state(), "es-hacienda"));

    expect(view.name).toBe("Ministerio de Hacienda");
    expect(view.holder).toMatchObject({
      name: "Arcadi España García",
      title: "Ministro de Hacienda",
      since: "Desde el 26 de marzo de 2026",
    });
    expect(view.holder?.sourceUrl).toContain("boe.es");
  });

  it("counts a body's competences and writes its sectors as a Spanish list", async () => {
    const view = boxView(bodyNamed(await state(), "es-hacienda"));

    expect(view.competencesLabel).toBe("Competencias (1)");
    expect(view.competences[0]).toMatchObject({
      legalBasis: "Real Decreto 829/2023, art. 5.1",
      sectors: "Economía e Impuestos",
    });
    expect(view.competences[0]?.sourceUrl).toContain("boe.es");
  });

  it("says that a body has no competences loaded instead of leaving a gap", () => {
    const body: Body = {
      id: "es-x",
      name: "A body",
      kind: "parliament",
      level: "state",
      holder: null,
      competences: [],
      sourceUrl: "https://example.org/source",
    };

    const view = boxView(body);

    expect(view.holder).toBeNull();
    expect(view.competencesLabel).toBe("Sin competencias cargadas.");
  });

  it("keeps the words of the BOE for a ministry whose business another minister attends", async () => {
    const view = boxView(bodyNamed(await state(), "es-transportes"));

    expect(view.holder?.name).toBe("Carlos Cuerpo Caballero");
    expect(view.holder?.title).toContain("encargado del despacho ordinario");
    expect(view.holder?.since).toBe("Desde el 4 de noviembre de 2026");
  });
});

describe("executiveView", () => {
  it("keeps the head first and the departments in the backend's order", async () => {
    const view = executiveView((await state()).executive);

    expect(view.status).toBe("complete");
    expect(view.head?.holder).toMatchObject({
      name: "Pedro Sánchez Pérez-Castejón",
      title: "Presidente del Gobierno",
      since: "Desde el 17 de noviembre de 2023",
    });
    expect(view.departments.map((d) => d.id)).toEqual(
      general.executive.departments.map((d) => d.id),
    );
  });

  it("keeps an executive that cannot be drawn as nothing", () => {
    const view = executiveView({ status: "no_data", head: null, departments: [] });

    expect(view).toEqual({ status: "no_data", head: null, departments: [] });
  });
});

describe("communityLinks", () => {
  it("links each community to its own chart and says whether its government is complete", () => {
    const communities: CommunityRef[] = [
      { territoryId: "ccaa-05", name: "Canarias", executiveStatus: "no_data" },
      { territoryId: "ccaa-13", name: "Comunidad de Madrid", executiveStatus: "complete" },
    ];

    expect(communityLinks(communities)).toEqual([
      {
        territoryId: "ccaa-05",
        name: "Canarias",
        href: "/comunidades/ccaa-05/organigrama",
        status: "Sin datos todavía",
      },
      {
        territoryId: "ccaa-13",
        name: "Comunidad de Madrid",
        href: "/comunidades/ccaa-13/organigrama",
        status: "Gobierno completo",
      },
    ]);
  });

  it("keeps the backend's order of the communities", async () => {
    const links = communityLinks((await state()).communities);

    expect(links.map((l) => l.name)).toEqual(general.communities.map((c) => c.name));
  });
});

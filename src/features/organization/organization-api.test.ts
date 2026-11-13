import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import general from "@/test/fixtures/organization.json";
import andalucia from "@/test/fixtures/community-ccaa-01-organization.json";
import madrid from "@/test/fixtures/community-ccaa-13-organization.json";
import { server } from "@/test/server";

import { fetchCommunityOrganization, fetchOrganization } from "./organization-api";

function serve(path: string, body: unknown, status = 200): void {
  server.use(http.get(`*/api${path}`, () => HttpResponse.json(body as object, { status })));
}

describe("fetchOrganization", () => {
  it("reads the State's chart as the backend answered it: head, departments, boxes", async () => {
    serve("/organization", general);

    const chart = await fetchOrganization();

    expect(chart.territoryId).toBe("es");
    expect(chart.executive.status).toBe("complete");
    expect(chart.executive.head?.holder?.name).toBe("Pedro Sánchez Pérez-Castejón");
    expect(chart.executive.departments).toHaveLength(22);
    expect(chart.parliaments.map((b) => b.name)).toEqual(["Cortes Generales"]);
    expect(chart.judiciary.map((b) => b.name)).toEqual([
      "Consejo General del Poder Judicial",
      "Tribunal Supremo",
    ]);
    expect(chart.local.map((b) => b.name)).toEqual(["Ayuntamiento", "Diputación provincial"]);
  });

  it("keeps the backend's order of the departments and never re-sorts them", async () => {
    serve("/organization", general);

    const names = (await fetchOrganization()).executive.departments.map((d) => d.name);

    expect(names).toEqual(general.executive.departments.map((d) => d.name));
  });

  it("keeps each holder's title, date and source and each competence's article and sectors", async () => {
    serve("/organization", general);

    const chart = await fetchOrganization();

    const hacienda = chart.executive.departments.find((d) => d.id === "es-hacienda");
    expect(hacienda?.holder).toMatchObject({
      name: "Arcadi España García",
      postTitle: "Ministro de Hacienda",
      since: "2026-03-26",
    });
    expect(hacienda?.holder?.sourceUrl).toContain("boe.es");
    expect(hacienda?.competences[0]).toMatchObject({
      legalBasis: "Real Decreto 829/2023, art. 5.1",
      sectors: [
        { id: "economy", name: "Economía" },
        { id: "taxes", name: "Impuestos" },
      ],
    });
  });

  it("keeps a ministry whose minister has left, with who attends its ordinary business", async () => {
    serve("/organization", general);

    const chart = await fetchOrganization();

    const transport = chart.executive.departments.find((d) => d.id === "es-transportes");
    expect(transport?.holder?.name).toBe("Carlos Cuerpo Caballero");
    expect(transport?.holder?.postTitle).toContain("despacho ordinario");
  });

  it("lists the communities by the name and whether their executive can be drawn", async () => {
    serve("/organization", general);

    const { communities } = await fetchOrganization();

    expect(communities).toHaveLength(19);
    expect(communities[0]).toEqual({
      territoryId: "ccaa-01",
      name: "Andalucía",
      executiveStatus: "no_data",
    });
  });

  it("throws on any other status", async () => {
    serve("/organization", { detail: "boom" }, 500);

    await expect(fetchOrganization()).rejects.toThrow("answered 500");
  });
});

describe("fetchCommunityOrganization", () => {
  it("reads a community whose executive cannot be drawn: no head, no departments", async () => {
    serve("/communities/ccaa-01/organization", andalucia);

    const chart = await fetchCommunityOrganization("ccaa-01");

    expect(chart?.territoryId).toBe("ccaa-01");
    expect(chart?.executive).toEqual({ status: "no_data", head: null, departments: [] });
    expect(chart?.local.map((b) => b.name)).toEqual(["Ayuntamiento", "Diputación provincial"]);
  });

  it("reads a community whose executive is complete: its head, nine departments, parliament and court", async () => {
    serve("/communities/ccaa-13/organization", madrid);

    const chart = await fetchCommunityOrganization("ccaa-13");

    expect(chart?.executive.status).toBe("complete");
    expect(chart?.executive.head?.holder?.name).toBe("Isabel Natividad Díaz Ayuso");
    expect(chart?.executive.departments).toHaveLength(9);
    expect(chart?.parliaments.map((b) => b.name)).toEqual(["Asamblea de Madrid"]);
    expect(chart?.judiciary.map((b) => b.name)).toEqual([
      "Tribunal Superior de Justicia de Madrid",
    ]);
  });

  it("is null when the API knows no such community and throws on any other failure", async () => {
    serve("/communities/ccaa-99/organization", { detail: "unknown community ccaa-99" }, 404);
    serve("/communities/ccaa-98/organization", { detail: "boom" }, 500);

    expect(await fetchCommunityOrganization("ccaa-99")).toBeNull();
    await expect(fetchCommunityOrganization("ccaa-98")).rejects.toThrow("answered 500");
  });
});

// A copy of a real answer that a test can break in one place.
interface Draft {
  executive: { head: unknown; departments: Record<string, unknown>[] };
  parliaments: Record<string, unknown>[];
}

function draft(answer: unknown): Draft {
  return structuredClone(answer) as Draft;
}

describe("the answer's shape is checked at the edge", () => {
  it("refuses a complete executive with a department that has no holder", async () => {
    const broken = draft(general);
    broken.executive.departments[3] = { ...broken.executive.departments[3], holder: null };
    serve("/organization", broken);

    await expect(fetchOrganization()).rejects.toThrow();
  });

  it("refuses an executive that cannot be drawn but carries a head", async () => {
    const broken = draft(andalucia);
    broken.executive.head = general.executive.head;
    serve("/communities/ccaa-01/organization", broken);

    await expect(fetchCommunityOrganization("ccaa-01")).rejects.toThrow();
  });

  it("refuses a kind of body it does not know", async () => {
    const broken = draft(general);
    broken.parliaments[0] = { ...broken.parliaments[0], kind: "senate" };
    serve("/organization", broken);

    await expect(fetchOrganization()).rejects.toThrow();
  });

  it("refuses a source that is not an address", async () => {
    const broken = draft(general);
    broken.parliaments[0] = { ...broken.parliaments[0], source_url: "not an address" };
    serve("/organization", broken);

    await expect(fetchOrganization()).rejects.toThrow();
  });
});

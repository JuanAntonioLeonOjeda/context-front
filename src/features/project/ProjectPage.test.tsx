import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";

const FIRST = "Cómo funciona";

describe("the project section", () => {
  it("is reached from the header and opens on its first chapter, how it works", async () => {
    renderApp("/proyecto");

    expect(await screen.findByRole("heading", { level: 1, name: FIRST })).toBeVisible();
    const nav = screen.getByRole("navigation", { name: es.app.shell.nav.label });
    expect(within(nav).getByRole("link", { name: "El proyecto" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(document.title).toBe("Cómo funciona · El proyecto · InContext");
  });

  it("keeps the old address of how it works", async () => {
    renderApp("/como-funciona");

    expect(await screen.findByRole("heading", { level: 1, name: FIRST })).toBeVisible();
  });

  it("leads an unknown chapter to the first one", async () => {
    renderApp("/proyecto/no-existe");

    expect(await screen.findByRole("heading", { level: 1, name: FIRST })).toBeVisible();
  });

  it("lists every chapter in order and marks the current one", async () => {
    renderApp("/proyecto/el-modelo");

    const chapters = await screen.findByRole("navigation", { name: es.project.page.chaptersLabel });
    const links = within(chapters).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      es.project.chapters.map((chapter) => `/proyecto/${chapter.slug}`),
    );
    expect(within(chapters).getByRole("link", { name: /Un modelo propio/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(chapters).getByText(`Capítulo 6 de ${String(es.project.chapters.length)}`),
    ).toBeVisible();
  });

  it("links to the previous and next chapters, and the last one back to the map", async () => {
    renderApp("/proyecto/el-modelo");

    const pager = await screen.findByRole("navigation", { name: es.project.page.pagerLabel });
    expect(within(pager).getByRole("link", { name: /Clasificar una noticia/ })).toHaveAttribute(
      "href",
      "/proyecto/las-reglas",
    );
    expect(within(pager).getByRole("link", { name: /Historias y árboles/ })).toHaveAttribute(
      "href",
      "/proyecto/historias",
    );
  });

  it("ends the last chapter with a link to the map", async () => {
    renderApp("/proyecto/siguientes-pasos");

    const pager = await screen.findByRole("navigation", { name: es.project.page.pagerLabel });
    expect(within(pager).getByRole("link", { name: /Ver el mapa/ })).toHaveAttribute("href", "/");
  });

  it("draws a chapter's tables with column headers", async () => {
    renderApp("/proyecto/el-modelo");

    const table = await screen.findByRole("table");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual(["Modelo", "Familia", "Reglas", "Modelo", "Resultado"]);
  });
});

describe("how it works, the first chapter", () => {
  it("never describes a responsible party for a news item", async () => {
    renderApp("/proyecto/como-funciona");

    expect(await screen.findByRole("heading", { level: 1, name: FIRST })).toBeVisible();
    expect(screen.getByRole("main")).not.toHaveTextContent(/responsable/i);
  });

  it("states what is published and what is not, and what the portal cannot do yet", async () => {
    renderApp("/proyecto/como-funciona");

    expect(await screen.findByText(/nunca se muestra/)).toBeVisible();
    const limits = screen.getByRole("region", { name: es.about.limits.title });
    expect(
      within(limits).getByText(/etiquetadas a mano que nunca se usaron para entrenar/),
    ).toBeVisible();
  });

  it("names the sources of every kind of data", async () => {
    renderApp("/proyecto/como-funciona");

    const data = await screen.findByRole("region", { name: es.about.data.title });
    for (const source of ["INE", "BOE", "CC BY 4.0", "Wikidata"]) {
      expect(within(data).getByText(new RegExp(source))).toBeVisible();
    }
  });
});

describe("the chapters' texts", () => {
  it("never attribute a news item to a responsible party", () => {
    const text = JSON.stringify(es.project.chapters);
    expect(text).not.toMatch(/partido responsable|gobierno responsable de la noticia/i);
  });
});

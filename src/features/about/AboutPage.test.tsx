import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";

describe("how it works page", () => {
  it("is reached from the header and marks its place", async () => {
    renderApp("/como-funciona");

    expect(await screen.findByRole("heading", { level: 1, name: "Cómo funciona" })).toBeVisible();
    const nav = screen.getByRole("navigation", { name: es.app.shell.nav.label });
    expect(within(nav).getByRole("link", { name: "Cómo funciona" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(document.title).toBe("Cómo funciona · InContext");
  });

  it("never describes a responsible party for a news item", async () => {
    renderApp("/como-funciona");

    expect(await screen.findByRole("heading", { level: 1, name: "Cómo funciona" })).toBeVisible();
    expect(document.body).not.toHaveTextContent(/responsable/i);
  });

  it("states what is published and what is not, and what the portal cannot do yet", async () => {
    renderApp("/como-funciona");

    expect(await screen.findByText(/nunca se muestra/)).toBeVisible();
    const limits = screen.getByRole("region", { name: es.about.limits.title });
    expect(
      within(limits).getByText(/etiquetadas a mano que nunca se usaron para entrenar/),
    ).toBeVisible();
  });

  it("names the sources of every kind of data", async () => {
    renderApp("/como-funciona");

    const data = await screen.findByRole("region", { name: es.about.data.title });
    for (const source of ["INE", "BOE", "CC BY 4.0", "Wikidata"]) {
      expect(within(data).getByText(new RegExp(source))).toBeVisible();
    }
  });
});

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";

describe("the organisation chart in the app", () => {
  it("opens the general chart at /organigrama inside the layout and marks it in the header", async () => {
    renderApp("/organigrama");

    expect(
      await screen.findByRole("heading", { level: 1, name: es.organization.page.generalTitle }),
    ).toBeVisible();
    const nav = within(screen.getByRole("banner")).getByRole("navigation", {
      name: es.app.shell.nav.label,
    });
    expect(within(nav).getByRole("link", { name: "Organigrama" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("heading", { level: 1, name: es.organization.page.generalTitle }),
    );
  });

  it("opens a community's chart at its own address and sets the document title", async () => {
    renderApp("/comunidades/ccaa-13/organigrama");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Organigrama de Comunidad de Madrid" }),
    ).toBeVisible();
    expect(document.title).toBe("Organigrama de Comunidad de Madrid · InContext");
  });

  it("goes from a community's page to its chart", async () => {
    renderApp("/comunidades/ccaa-05");

    await userEvent.click(
      await screen.findByRole("link", { name: es.organization.community.link }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: /^Organigrama de Canarias/ }),
    ).toBeVisible();
  });

  it("goes from the general chart to a community's chart", async () => {
    renderApp("/organigrama");

    await userEvent.click(await screen.findByRole("link", { name: "Canarias" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: /^Organigrama de Canarias/ }),
    ).toBeVisible();
  });
});

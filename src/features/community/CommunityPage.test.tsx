import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";
import { axeViolations } from "@/test/axe";
import { serveCommunity, type Scenario } from "@/test/community";

function renderAt(path: string, community: Scenario = "canarias"): HTMLElement {
  return renderApp(path, { community });
}

/** The `<ul>` that follows a heading of the card. */
function listAfter(heading: HTMLElement): HTMLElement {
  const next = heading.nextElementSibling;
  if (!(next instanceof HTMLElement)) throw new Error("no list after the heading");
  return next;
}

/** Short names of the parties in a list, ignoring the "Fuente" link next to each. */
function partyNames(list: HTMLElement): string[] {
  return within(list)
    .getAllByRole("listitem")
    .map((li) => li.textContent.split(" ")[0] ?? "");
}

describe("community page", () => {
  it("shows who governs, since when, and the parties with their sources", async () => {
    renderAt("/comunidades/ccaa-05");

    expect(await screen.findByRole("heading", { level: 1, name: "Canarias" })).toBeVisible();
    const government = screen.getByRole("region", { name: es.community.government.title });
    expect(within(government).getByText(/Presidencia: Fernando Clavijo Batlle/)).toBeVisible();
    expect(within(government).getByText(/Desde el 14 de julio de 2023/)).toBeVisible();
    expect(
      within(government).getByRole("link", { name: es.community.government.sourceOfTerm }),
    ).toHaveAttribute("href", expect.stringContaining("boe.es"));
    const list = listAfter(
      within(government).getByRole("heading", { name: es.community.government.governing }),
    );
    expect(partyNames(list)).toEqual(["CC", "PP"]);
    expect(within(list).getByRole("link", { name: "Fuente: CC" })).toBeVisible();
  });

  it("lists the supporters of the investiture apart from the parties that govern", async () => {
    renderAt("/comunidades/ccaa-09", "cataluna");

    const government = await screen.findByRole("region", { name: es.community.government.title });
    expect(within(government).getByText(/Presidencia: Salvador Illa Roca/)).toBeVisible();
    const support = within(government).getByRole("heading", {
      name: es.community.government.support,
    });
    const governing = within(government).getByRole("heading", {
      name: es.community.government.governing,
    });
    expect(partyNames(listAfter(support))).toEqual(["Comuns", "ERC"]);
    expect(partyNames(listAfter(governing))).toEqual(["PSC"]);
  });

  it("says when a government is caretaker", async () => {
    renderAt("/comunidades/ccaa-05", "canarias-caretaker");

    expect(await screen.findByText(es.community.government.caretaker)).toBeVisible();
    expect(screen.getByText(/Presidencia: Ángel Víctor Torres Pérez/)).toBeVisible();
  });

  it("shows the five INE indicators with value, period and source link", async () => {
    renderAt("/comunidades/ccaa-05");

    const table = await screen.findByRole("table", { name: /Indicadores de Canarias/ });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((h) => h.textContent),
    ).toEqual(["Indicador", "Valor", "Periodo", "Fuente"]);
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(5);
    const unemployment = rows.find((r) =>
      within(r).queryByRole("rowheader", { name: "Tasa de paro" }),
    );
    if (unemployment === undefined) throw new Error("no unemployment row");
    const [value, period, source] = within(unemployment).getAllByRole("cell");
    if (value === undefined || period === undefined || source === undefined) {
      throw new Error("the row lacks cells");
    }
    expect(value).toHaveTextContent("11,6 %");
    expect(period).toHaveTextContent("2.º trimestre de 2026");
    expect(within(source).getByRole("link", { name: "Tabla 14506 del INE" })).toHaveAttribute(
      "href",
      "https://www.ine.es/jaxiT3/Tabla.htm?t=14506",
    );
    expect(within(table).getByText("2.277.705 personas")).toBeVisible();
    expect(within(table).getByText("110,44 (base 2025 = 100)")).toBeVisible();
  });

  it("answers not found for a community that does not exist, without asking for its data", async () => {
    const container = renderAt("/comunidades/ccaa-99");

    expect(
      await screen.findByRole("heading", { level: 1, name: es.errors.notFound.title }),
    ).toBeVisible();
    expect(screen.getByText(es.community.page.notFound)).toBeVisible();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("shows a written error with a retry when the data cannot be loaded", async () => {
    const user = userEvent.setup();
    renderAt("/comunidades/ccaa-05", "failing");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(es.community.state.error);

    serveCommunity("canarias");
    await user.click(within(alert).getByRole("button", { name: es.community.state.retry }));

    expect(await screen.findByRole("heading", { level: 1, name: "Canarias" })).toBeVisible();
  });

  it("is reached by clicking the community on the map, and leads back to it", async () => {
    const user = userEvent.setup();
    renderAt("/");

    await user.click(await screen.findByRole("link", { name: "Canarias: gobiernan CC y PP" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Canarias" })).toBeVisible();

    await user.click(screen.getByRole("link", { name: es.community.page.back }));
    expect(await screen.findByRole("link", { name: "Galicia: gobierna PP" })).toBeVisible();
  });

  // user-event activates only HTML anchors with Enter, not the <a> inside an SVG (browsers do),
  // so the keyboard is exercised on the HTML marker of Ceuta; the SVG links are reached by Tab
  // in the map tests, and their Enter activation is part of the real-browser check.
  it("opens a community with the keyboard: Enter on its focused marker", async () => {
    const user = userEvent.setup();
    renderAt("/");

    (await screen.findByRole("link", { name: "Ceuta: gobierna PP" })).focus();
    await user.keyboard("{Enter}");

    // The community page is the only one with a way back to the map.
    expect(await screen.findByRole("link", { name: es.community.page.back })).toBeVisible();
  });

  it("moves the focus to the new page after a navigation, but not on the first page", async () => {
    const user = userEvent.setup();
    renderAt("/");
    const canarias = await screen.findByRole("link", { name: "Canarias: gobiernan CC y PP" });
    expect(screen.getByRole("main")).not.toHaveFocus();

    await user.click(canarias);
    await screen.findByRole("heading", { level: 1, name: "Canarias" });
    expect(screen.getByRole("main")).toHaveFocus();

    await user.click(screen.getByRole("link", { name: es.community.page.back }));
    await screen.findByRole("link", { name: "Galicia: gobierna PP" });
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const container = renderAt("/comunidades/ccaa-05");
    await screen.findByRole("table");

    expect(await axeViolations(container)).toEqual([]);
  });
});

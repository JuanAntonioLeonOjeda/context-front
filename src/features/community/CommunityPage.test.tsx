import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";
import { axeViolations } from "@/test/axe";
import { serveCommunity, type Scenario } from "@/test/community";
import { findMapLink } from "@/test/map";

function renderAt(path: string, community: Scenario = "canarias"): HTMLElement {
  return renderApp(path, { community });
}

/** Short names of the parties in a list, read from the name of each seal's source link. */
function partyNames(list: HTMLElement): string[] {
  return within(list)
    .getAllByRole("link")
    .map((link) => link.getAttribute("aria-label")?.replace("Fuente de ", "") ?? "");
}

describe("community page", () => {
  it("shows who governs, since when, and the parties with their sources", async () => {
    renderAt("/comunidades/ccaa-05");

    expect(await screen.findByRole("heading", { level: 1, name: "Canarias" })).toBeVisible();
    const government = screen.getByRole("region", { name: es.community.government.title });
    expect(within(government).getByText(/Presidencia: Fernando Clavijo Batlle/)).toBeVisible();
    expect(within(government).getByText(/Desde el 14 de julio de 2023/)).toBeVisible();
    expect(
      within(government).getByRole("link", { name: /Desde el 14 de julio de 2023/ }),
    ).toHaveAttribute("href", expect.stringContaining("boe.es"));
    const list = within(government).getByRole("list", { name: es.community.government.governing });
    expect(partyNames(list)).toEqual(["CC", "PP"]);
    // Each seal is a link to the party's own source.
    const source = within(government).getByRole("link", { name: "Fuente de CC" });
    expect(source).toHaveAttribute("target", "_blank");
    expect(source).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("lists the supporters of the investiture apart from the parties that govern", async () => {
    renderAt("/comunidades/ccaa-09", "cataluna");

    const government = await screen.findByRole("region", { name: es.community.government.title });
    expect(within(government).getByText(/Presidencia: Salvador Illa Roca/)).toBeVisible();
    const support = within(government).getByRole("list", { name: es.community.government.support });
    const governing = within(government).getByRole("list", {
      name: es.community.government.governing,
    });
    expect(partyNames(support)).toEqual(["Comuns", "ERC"]);
    expect(partyNames(governing)).toEqual(["PSC"]);
  });

  it("says when a government is caretaker", async () => {
    renderAt("/comunidades/ccaa-05", "canarias-caretaker");

    expect(await screen.findByText(es.community.government.caretaker)).toBeVisible();
    expect(screen.getByText(/Presidencia: Ángel Víctor Torres Pérez/)).toBeVisible();
  });

  it("shows the flag of the community beside its name", async () => {
    renderAt("/comunidades/ccaa-05");

    expect(await screen.findByRole("img", { name: "Bandera de Canarias" })).toHaveAttribute(
      "src",
      expect.stringContaining(".svg"),
    );
  });

  it("shows the five INE indicators as cards with value, period, chart and source link", async () => {
    renderAt("/comunidades/ccaa-05");

    const section = await screen.findByRole("region", { name: es.community.indicators.title });
    const cards = within(section).getAllByRole("article");
    expect(cards).toHaveLength(5);
    const unemployment = cards.find((c) =>
      within(c).queryByRole("heading", { name: "Tasa de paro" }),
    );
    if (unemployment === undefined) throw new Error("no unemployment card");
    expect(within(unemployment).getByText("11,6", { selector: "p" })).toHaveTextContent("11,6 %");
    expect(
      within(unemployment).getByText("2.º trimestre de 2026", { selector: "p" }),
    ).toBeVisible();
    expect(within(unemployment).getByRole("img")).toHaveAccessibleName(/Evolución de Tasa de paro/);
    expect(within(unemployment).getByRole("link", { name: "Tabla 14506 del INE" })).toHaveAttribute(
      "href",
      "https://www.ine.es/jaxiT3/Tabla.htm?t=14506",
    );
    expect(within(section).getByText("2.277.705", { selector: "p" })).toHaveTextContent(
      "2.277.705 personas",
    );
    expect(within(section).getByText("110,44", { selector: "p" })).toHaveTextContent(
      "110,44 puntos",
    );
  });

  it("puts the government in the header, above the data and the news, and draws no map", async () => {
    renderApp("/comunidades/ccaa-05");

    const government = await screen.findByRole("region", { name: es.community.government.title });
    const indicators = screen.getByRole("region", { name: es.community.indicators.title });
    expect(
      government.compareDocumentPosition(indicators) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(within(government).getByText(/Presidencia: Fernando Clavijo Batlle/)).toBeVisible();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
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

    await user.click(await findMapLink("Canarias: gobiernan CC y PP"));
    expect(await screen.findByRole("heading", { level: 1, name: "Canarias" })).toBeVisible();

    await user.click(screen.getByRole("link", { name: es.app.shell.nav.map }));
    expect(await findMapLink("Galicia: gobierna PP")).toBeVisible();
  });

  // user-event activates only HTML anchors with Enter, not the <a> inside an SVG (browsers do),
  // so the keyboard is exercised on an HTML link: Ceuta's marker on the map. The SVG links are
  // reached by Tab in the map tests; their Enter is a real-browser check.
  it("opens a community with the keyboard: Enter on the marker of a small territory", async () => {
    const user = userEvent.setup();
    renderAt("/");

    (await findMapLink("Ceuta: gobierna PP")).focus();
    await user.keyboard("{Enter}");

    // The map is gone: this is the community page (whatever it has to say about Ceuta).
    await waitFor(() => {
      expect(screen.queryByRole("figure")).not.toBeInTheDocument();
    });
    expect(await screen.findByRole("heading", { level: 1 })).toBeVisible();
  });

  it("moves the focus to the new page after a navigation, but not on the first page", async () => {
    const user = userEvent.setup();
    renderAt("/");
    const canarias = await findMapLink("Canarias: gobiernan CC y PP");
    expect(screen.getByRole("main")).not.toHaveFocus();

    await user.click(canarias);
    await screen.findByRole("heading", { level: 1, name: "Canarias" });
    expect(screen.getByRole("main")).toHaveFocus();

    await user.click(screen.getByRole("link", { name: es.app.shell.nav.map }));
    await findMapLink("Galicia: gobierna PP");
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const container = renderAt("/comunidades/ccaa-05");
    await screen.findByRole("heading", { name: "Tasa de paro" });

    expect(await axeViolations(container)).toEqual([]);
  });
});

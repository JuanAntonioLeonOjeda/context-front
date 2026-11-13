import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { axeViolations } from "@/test/axe";
import general from "@/test/fixtures/organization.json";
import { serveOrganization } from "@/test/organization";
import { queryWrapper } from "@/test/query";

import { GeneralOrganizationPage } from "./GeneralOrganizationPage";

function renderPage(options: { failing?: boolean } = {}): HTMLElement {
  serveOrganization(options);
  return render(
    <MemoryRouter>
      <GeneralOrganizationPage />
    </MemoryRouter>,
    { wrapper: queryWrapper() },
  ).container;
}

/** The box of a body: the element that holds the line of its heading and everything under it. */
async function boxOf(name: string): Promise<HTMLElement> {
  const heading = await screen.findByRole("heading", { level: 3, name });
  const box = heading.closest("div")?.parentElement;
  if (!box) throw new Error(`the heading of ${name} is not in a box`);
  return box;
}

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

describe("the general organisation chart", () => {
  it("says what it is and what it is not, with the day it is valid for", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { level: 1, name: es.organization.page.generalTitle }),
    ).toBeVisible();
    expect(await screen.findByText(es.organization.page.generalIntro)).toBeVisible();
    expect(
      screen.getByText(/No dice quién es responsable de lo que cuentan las noticias/),
    ).toBeVisible();
    expect(screen.getByText(/Datos a \d+ de \w+ de \d{4}\./)).toBeVisible();
  });

  it("draws the head with its holder and, nested under it, the 22 ministries in the API's order", async () => {
    renderPage();

    const section = await screen.findByRole("region", {
      name: es.organization.sections.executiveState,
    });
    const outer = within(section).getAllByRole("list")[0];
    if (!outer) throw new Error("no list");
    const head = within(outer).getAllByRole("listitem")[0];
    if (!head) throw new Error("no head");
    expect(within(head).getByText("Pedro Sánchez Pérez-Castejón")).toBeVisible();
    expect(within(head).getByText("Desde el 17 de noviembre de 2023")).toBeVisible();
    // The departments hang from the head: the list that is a direct child of its item (the
    // competences of the head are another list, inside its box).
    const nested = head.querySelector<HTMLElement>(":scope > ul");
    if (!nested) throw new Error("no nested list");
    expect(nested).toHaveAttribute("role", "list");
    const names = within(nested)
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(names).toEqual(general.executive.departments.map((d) => d.name));
    expect(names).toHaveLength(22);
  });

  it("gives each holder's title, name, date and a source that says whose it is", async () => {
    renderPage();

    const box = await boxOf("Ministerio de Hacienda");

    expect(within(box).getByText("Ministro de Hacienda:")).toBeVisible();
    expect(within(box).getByText("Arcadi España García")).toBeVisible();
    expect(within(box).getByText("Desde el 26 de marzo de 2026")).toBeVisible();
    const source = within(box).getByRole("link", { name: "Fuente: Arcadi España García" });
    expect(source).toHaveAttribute("href", expect.stringContaining("boe.es"));
    expect(source).toHaveAttribute("target", "_blank");
  });

  it("shows the words of the BOE for the ministry whose business another minister attends", async () => {
    renderPage();

    const box = await boxOf("Ministerio de Transportes y Movilidad Sostenible");

    expect(within(box).getByText(/encargado del despacho ordinario/)).toBeVisible();
    expect(within(box).getByText("Carlos Cuerpo Caballero")).toBeVisible();
  });

  it("folds the competences and opens them with their article, sectors and source", async () => {
    renderPage();
    const box = await boxOf("Ministerio de Hacienda");
    const summary = within(box).getByText("Competencias (1)");

    await userEvent.click(summary);

    expect(
      within(box).getByText(/Propone y ejecuta la política del Gobierno en hacienda pública/),
    ).toBeVisible();
    expect(within(box).getByText(/Real Decreto 829\/2023, art. 5\.1/)).toBeVisible();
    expect(within(box).getByText(/Sectores: Economía e Impuestos/)).toBeVisible();
    expect(
      within(box).getByRole("link", { name: "Fuente: Real Decreto 829/2023, art. 5.1" }),
    ).toHaveAttribute("href", expect.stringContaining("BOE-A-2023-23537"));
  });

  it("has the parliament, the courts and the local bodies as groups of bodies with no holder", async () => {
    renderPage();

    const parliament = await screen.findByRole("region", {
      name: es.organization.sections.parliament,
    });
    const judiciary = screen.getByRole("region", { name: es.organization.sections.judiciary });
    const local = screen.getByRole("region", { name: es.organization.sections.local });

    expect(
      within(parliament).getByRole("heading", { level: 3, name: "Cortes Generales" }),
    ).toBeVisible();
    expect(
      within(judiciary)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(["Consejo General del Poder Judicial", "Tribunal Supremo"]);
    expect(
      within(local)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(["Ayuntamiento", "Diputación provincial"]);
    expect(within(parliament).queryByText(/Desde el/)).toBeNull();
  });

  it("links each of the 19 communities to its own chart and says whether it has data", async () => {
    renderPage();

    const section = await screen.findByRole("region", {
      name: es.organization.sections.communities,
    });
    const items = within(section).getAllByRole("listitem");

    expect(items).toHaveLength(19);
    const first = within(items[0] ?? section);
    expect(first.getByRole("link", { name: "Andalucía" })).toHaveAttribute(
      "href",
      "/comunidades/ccaa-01/organigrama",
    );
    expect(first.getByText("Sin datos todavía")).toBeVisible();
  });

  it("attributes the data of the State's appointments to the BOE", async () => {
    renderPage();

    expect(await screen.findByText(es.organization.state.attribution)).toBeVisible();
  });

  it("shows an error and reloads on retry", async () => {
    renderPage({ failing: true });
    expect(await screen.findByRole("alert")).toHaveTextContent(es.organization.page.error);

    serveOrganization();
    await userEvent.click(screen.getByRole("button", { name: es.organization.page.retry }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
    expect(
      await screen.findByRole("region", { name: es.organization.sections.executiveState }),
    ).toBeVisible();
  });

  it.each(["light", "dark"] as const)(
    "has no accessibility violations in the %s theme",
    async (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      const container = renderPage();
      await screen.findByRole("region", { name: es.organization.sections.executiveState });

      expect(await axeViolations(container)).toEqual([]);
    },
  );
});

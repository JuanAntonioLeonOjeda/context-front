import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { axeViolations } from "@/test/axe";
import { serveOrganization } from "@/test/organization";
import { queryWrapper } from "@/test/query";

import { CommunityOrganizationPage } from "./CommunityOrganizationPage";

function renderPage(
  territoryId: string,
  options: { failing?: boolean; community?: object } = {},
): HTMLElement {
  serveOrganization(options);
  return render(
    <MemoryRouter>
      <CommunityOrganizationPage territoryId={territoryId} />
    </MemoryRouter>,
    { wrapper: queryWrapper() },
  ).container;
}

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

describe("a community whose executive cannot be drawn", () => {
  it("says there is no data yet and draws no head, no department and no empty group", async () => {
    renderPage("ccaa-01");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Organigrama de Andalucía" }),
    ).toBeVisible();
    const executive = screen.getByRole("region", {
      name: es.organization.sections.executiveCommunity,
    });
    expect(within(executive).getByText("Sin datos todavía")).toBeVisible();
    expect(within(executive).getByText(es.organization.noData.executive)).toBeVisible();
    expect(within(executive).queryByRole("list")).toBeNull();
    expect(screen.queryByRole("region", { name: es.organization.sections.parliament })).toBeNull();
    expect(screen.queryByRole("region", { name: es.organization.sections.judiciary })).toBeNull();
  });

  it("still shows the local bodies that apply to every community", async () => {
    renderPage("ccaa-01");

    const local = await screen.findByRole("region", { name: es.organization.sections.local });

    expect(
      within(local)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(["Ayuntamiento", "Diputación provincial"]);
  });

  it("links back to the community's page and to the general chart", async () => {
    renderPage("ccaa-01");

    expect(
      await screen.findByRole("link", { name: "Volver a la ficha de Andalucía" }),
    ).toHaveAttribute("href", "/comunidades/ccaa-01");
    expect(screen.getByRole("link", { name: es.organization.page.toGeneral })).toHaveAttribute(
      "href",
      "/organigrama",
    );
  });
});

describe("a community whose executive is complete", () => {
  it("draws its head and its departments under its own heading, with no BOE attribution", async () => {
    renderPage("ccaa-13");

    const executive = await screen.findByRole("region", {
      name: es.organization.sections.executiveCommunity,
    });

    expect(within(executive).getByText("Isabel Natividad Díaz Ayuso")).toBeVisible();
    expect(within(executive).getAllByRole("heading", { level: 3 })).toHaveLength(10);
    expect(screen.queryByText(es.organization.state.attribution)).toBeNull();
    expect(screen.queryByText("Sin datos todavía")).toBeNull();
  });
});

describe("a community that does not exist", () => {
  it("says so instead of drawing an empty chart", async () => {
    renderPage("ccaa-99");

    expect(
      await screen.findByRole("heading", { level: 1, name: es.errors.notFound.title }),
    ).toBeVisible();
    expect(screen.getByText(es.organization.page.notFound)).toBeVisible();
  });
});

describe("the page's own failures and accessibility", () => {
  it("shows an error and reloads on retry", async () => {
    renderPage("ccaa-13", { failing: true });
    expect(await screen.findByRole("alert")).toHaveTextContent(es.organization.page.error);

    serveOrganization();
    await userEvent.click(screen.getByRole("button", { name: es.organization.page.retry }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
    expect(
      await screen.findByRole("heading", { level: 1, name: "Organigrama de Comunidad de Madrid" }),
    ).toBeVisible();
  });

  it.each(["light", "dark"] as const)(
    "has no accessibility violations in the %s theme",
    async (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      const container = renderPage("ccaa-13");
      await screen.findByRole("region", { name: es.organization.sections.executiveCommunity });

      expect(await axeViolations(container)).toEqual([]);
    },
  );
});

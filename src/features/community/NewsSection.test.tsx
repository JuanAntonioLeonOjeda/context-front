import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";
import { axeViolations } from "@/test/axe";
import { serveCommunity } from "@/test/community";
import { server } from "@/test/server";

async function newsSection(): Promise<HTMLElement> {
  return screen.findByRole("region", { name: es.community.news.title });
}

describe("news of a community", () => {
  it("lists the headlines linking to the outlet, with outlet and date, and never a lead", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const section = await newsSection();
    await within(section).findByText(/Noticias desde el/);
    // One <li> per article, in lists by day; the lists nested in each article are not counted.
    expect(section.querySelectorAll("ol > li")).toHaveLength(11);
    const link = within(section).getByRole("link", {
      name: /El Parlamento rechaza tramitar la ley del PSOE/,
    });
    expect(link).toHaveAttribute("href", expect.stringContaining("rtvc.es"));
    expect(within(section).getAllByText(/Radio Televisión Canaria, \d\d:\d\d/)).not.toHaveLength(0);
  });

  it("groups the news by day, newest day first, each day under its own heading", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const section = await newsSection();
    await within(section).findByText(/Noticias desde el/);
    const days = within(section).getAllByRole("heading", { level: 3 });
    expect(days.length).toBeGreaterThan(1);
    expect(days[0]).toHaveTextContent("14 de octubre de 2026");
    const labels = days.map((d) => d.textContent);
    expect(new Set(labels).size).toBe(labels.length); // a day appears once
  });

  it("draws a stripe on each article that no screen reader reads: the words say the same", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const section = await newsSection();
    await within(section).findByText(/Noticias desde el/);
    expect(section.querySelectorAll("li > span[aria-hidden='true']")).toHaveLength(11);
  });

  it("says who is responsible, with the confidence, or why it cannot say", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const section = await newsSection();
    expect(await within(section).findAllByText(/Confianza: Sin determinar: /)).not.toHaveLength(0);
    expect(within(section).getAllByText(/Confianza: Alta/)).not.toHaveLength(0);
    expect(
      within(section).getAllByText("Responsable: Gobierno autonómico, CC y PP").length,
    ).toBeGreaterThan(0);
  });

  it("offers the legal basis of an attribution, with its sources", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?sector=health");

    const section = await newsSection();
    const [summary] = await within(section).findAllByText(es.community.news.basis);
    if (summary === undefined) throw new Error("no basis");
    await user.click(summary);

    const links = within(summary.closest("details") as HTMLElement).getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) expect(l).toHaveAttribute("href", expect.stringMatching(/^https:/));
  });

  it("starts with the first sector and marks the chosen one, from the URL", async () => {
    renderApp("/comunidades/ccaa-05");

    const nav = await screen.findByRole("navigation", { name: es.community.news.sectorNav });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((l) => l.textContent),
    ).toEqual(["Educación", "Sanidad", "Vivienda"]);
    expect(within(nav).getByRole("link", { name: "Educación" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("changes the sector with a link, asks the API for it and keeps the focus on the link", async () => {
    const asked: (string | null)[] = [];
    renderApp("/comunidades/ccaa-05");
    await screen.findByText(/Noticias desde el/); // the first sector is loaded
    server.use(
      http.get("*/api/communities/:territoryId/news", ({ request }) => {
        asked.push(new URL(request.url).searchParams.get("sector"));
        return HttpResponse.json({
          territory_id: "ccaa-05",
          sector_id: "housing",
          since: "2026-09-15",
          items: [],
        });
      }),
    );
    const user = userEvent.setup();

    await user.click(await screen.findByRole("link", { name: "Vivienda" }));

    expect(await screen.findByText(/No hay noticias de vivienda/)).toBeVisible();
    expect(asked).toEqual(["housing"]);
    expect(screen.getByRole("link", { name: "Vivienda" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Vivienda" })).toHaveFocus();
  });

  it("falls back to the first sector when the URL names one that does not exist", async () => {
    renderApp("/comunidades/ccaa-05?sector=transporte");

    expect(await screen.findByRole("link", { name: "Educación" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("says a sector has no news instead of leaving a blank", async () => {
    renderApp("/comunidades/ccaa-09", { community: "cataluna" });

    expect(await screen.findByText(/No hay noticias de educación en este periodo/)).toBeVisible();
    expect(screen.getByText(/Noticias desde el 15 de septiembre de 2026/)).toBeVisible();
  });

  it("explains once, above the list, why an article that names no government has no responsible", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const section = await newsSection();
    await within(section).findByText(/Noticias desde el/);
    expect(within(section).getAllByText(es.community.news.sharedCompetences)).toHaveLength(1);
    expect(section).not.toHaveTextContent(/las competencias del sector las comparten/);
  });

  it("does not repeat that explanation when every article names a government", async () => {
    renderApp("/comunidades/ccaa-09", { community: "cataluna" });

    await screen.findByText(/No hay noticias de educación/);
    expect(screen.queryByText(es.community.news.sharedCompetences)).not.toBeInTheDocument();
  });

  it("says how the news are classified", async () => {
    renderApp("/comunidades/ccaa-05");

    expect(await screen.findByText(es.community.news.method)).toBeVisible();
  });

  it("shows an error with a retry in the section when the news cannot be loaded", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05");
    server.use(
      http.get("*/api/communities/:territoryId/news", () =>
        HttpResponse.json({ detail: "boom" }, { status: 500 }),
      ),
    );
    await user.click(await screen.findByRole("link", { name: "Sanidad" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(es.community.news.error);
    // The rest of the card is still there.
    expect(screen.getByRole("heading", { level: 1, name: "Canarias" })).toBeVisible();

    serveCommunity();
    await user.click(within(alert).getByRole("button", { name: es.community.news.retry }));

    expect(await screen.findByText(/Noticias desde el/)).toBeVisible();
  });

  it("has no axe violations", async () => {
    const container = renderApp("/comunidades/ccaa-05?sector=health");

    await screen.findByText(/Noticias desde el/);
    expect(await axeViolations(container)).toEqual([]);
  });
});

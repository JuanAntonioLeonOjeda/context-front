import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";
import { renderApp } from "@/test/app";
import { axeViolations } from "@/test/axe";
import { serveCommunity } from "@/test/community";
import { newsLoaded } from "@/test/news";
import { server } from "@/test/server";

async function sectorLink(name: string): Promise<HTMLElement> {
  const nav = await screen.findByRole("navigation", { name: es.community.news.sectorNav });
  return within(nav).getByRole("link", { name });
}

async function newsSection(): Promise<HTMLElement> {
  return screen.findByRole("region", { name: es.community.news.title });
}

describe("news of a community", () => {
  it("lists the headlines linking to the outlet, with outlet and date, and never a lead", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const section = await newsSection();
    await newsLoaded();
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
    await newsLoaded();
    const days = within(section).getAllByRole("heading", { level: 3 });
    expect(days.length).toBeGreaterThan(1);
    expect(days[0]).toHaveTextContent("14 de octubre de 2026");
    const labels = days.map((d) => d.textContent);
    expect(new Set(labels).size).toBe(labels.length); // a day appears once
  });

  it("names no party next to a news item: no responsible, no confidence, no colour stripe", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const section = await newsSection();
    await newsLoaded();
    expect(section).not.toHaveTextContent(/Responsable|Confianza|Base de la atribución/);
    expect(section.querySelectorAll("li > span[aria-hidden='true']")).toHaveLength(0);
  });

  it("starts with the first sector and marks the chosen one, from the URL", async () => {
    renderApp("/comunidades/ccaa-05");

    const nav = await screen.findByRole("navigation", { name: es.community.news.sectorNav });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((l) => l.textContent),
    ).toEqual(["Educación", "Sanidad", "Vivienda", "Justicia", "Trabajo"]);
    expect(within(nav).getByRole("link", { name: "Educación" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("changes the sector with a link, asks the API for it and keeps the focus on the link", async () => {
    const asked: (string | null)[] = [];
    renderApp("/comunidades/ccaa-05");
    await newsLoaded(); // the first sector is loaded
    server.use(
      http.get("*/api/communities/:territoryId/news", ({ request }) => {
        asked.push(new URL(request.url).searchParams.get("sector"));
        return HttpResponse.json({
          territory_id: "ccaa-05",
          sector_id: "housing",
          since: "2026-09-15",
          until: "2026-10-14",
          items: [],
        });
      }),
    );
    const user = userEvent.setup();

    await user.click(await sectorLink("Vivienda"));

    expect(await screen.findByText(/No hay noticias de vivienda/)).toBeVisible();
    expect(asked).toEqual(["housing"]);
    const housing = await sectorLink("Vivienda");
    expect(housing).toHaveAttribute("aria-current", "page");
    expect(housing).toHaveFocus();
  });

  it("falls back to the first sector when the URL names one that does not exist", async () => {
    renderApp("/comunidades/ccaa-05?sector=transporte");

    expect(await sectorLink("Educación")).toHaveAttribute("aria-current", "page");
  });

  it("says a sector has no news instead of leaving a blank", async () => {
    renderApp("/comunidades/ccaa-09", { community: "cataluna" });

    expect(await screen.findByText(/No hay noticias de educación en este periodo/)).toBeVisible();
    await waitFor(() => {
      expect(screen.getByLabelText(es.community.news.range.from)).toHaveValue("2026-09-15");
    });
  });

  it("says how the news are classified in the section's window, not on the screen", async () => {
    renderApp("/comunidades/ccaa-05");
    const info = await screen.findByRole("button", {
      name: formatMessage(es.app.shell.info.open, { topic: es.community.news.title }),
    });
    expect(screen.queryByText(es.community.news.range.note)).toBeNull();

    await userEvent.click(info);

    const dialog = screen.getByRole("dialog", { name: es.community.news.title });
    expect(within(dialog).getByText(es.community.news.method)).toBeVisible();
    expect(within(dialog).getByText(es.community.news.range.note)).toBeVisible();
  });

  it("shows an error with a retry in the section when the news cannot be loaded", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05");
    server.use(
      http.get("*/api/communities/:territoryId/news", () =>
        HttpResponse.json({ detail: "boom" }, { status: 500 }),
      ),
    );
    await user.click(await sectorLink("Sanidad"));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(es.community.news.error);
    // The rest of the card is still there.
    expect(screen.getByRole("heading", { level: 1, name: "Canarias" })).toBeVisible();

    serveCommunity();
    await user.click(within(alert).getByRole("button", { name: es.community.news.retry }));

    await newsLoaded();
  });

  it("has no axe violations", async () => {
    const container = renderApp("/comunidades/ccaa-05?sector=health");

    await newsLoaded();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("actions of a news item", () => {
  it("gives each news item two actions with an icon that is hidden from assistive technology", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const section = await newsSection();
    await newsLoaded();
    const sources = within(section).getAllByRole("link", { name: /^Ver fuente de/ });
    expect(sources).toHaveLength(11);
    expect(sources[0]?.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    const tree = within(section).getByRole("link", {
      name: /^Ver árbol de noticias relacionadas con/,
    });
    expect(tree.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    expect(tree).toHaveTextContent("Ver árbol");
  });
});

describe("search of the news", () => {
  it("filters the list as the reader types, by headline, ignoring case and accents", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?sector=health");
    const section = await newsSection();
    await newsLoaded();
    expect(section.querySelectorAll("ol > li")).toHaveLength(11);

    await user.type(
      within(section).getByRole("searchbox", { name: es.community.news.search.label }),
      "PARLAMENTO rechaza",
    );

    expect(section.querySelectorAll("ol > li")).toHaveLength(1);
    expect(
      within(section).getByRole("link", { name: /El Parlamento rechaza tramitar la ley del PSOE/ }),
    ).toBeVisible();
  });

  it("also looks at the outlet, the secondary text of the card", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?sector=health");
    const section = await newsSection();
    await newsLoaded();

    await user.type(within(section).getByRole("searchbox"), "radio television canaria");

    const found = section.querySelectorAll("ol > li").length;
    expect(found).toBeGreaterThan(0);
    expect(found).toBeLessThan(11);
    for (const small of section.querySelectorAll("small")) {
      expect(small.textContent).toMatch(/Radio Televisión Canaria/);
    }
  });

  it("says nothing matches, with what was typed, and keeps the search in the URL", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?sector=health&buscar=zzzz");
    const section = await newsSection();
    await newsLoaded();

    expect(within(section).getByRole("searchbox")).toHaveValue("zzzz");
    expect(
      within(section).getByText(/Ninguna noticia de sanidad de estas fechas coincide con «zzzz»/),
    ).toBeVisible();

    await user.clear(within(section).getByRole("searchbox"));

    expect(section.querySelectorAll("ol > li")).toHaveLength(11);
  });
});

describe("range of days of the news", () => {
  it("shows in the fields the days the API resolved when none was chosen, and no way back", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");
    const section = await newsSection();

    await waitFor(() => {
      expect(within(section).getByLabelText(es.community.news.range.from)).toHaveValue(
        "2026-09-15",
      );
    });
    expect(within(section).getByLabelText(es.community.news.range.to)).toHaveValue("2026-10-14");
    expect(
      within(section).queryByRole("button", { name: es.community.news.range.reset }),
    ).toBeNull();
  });

  it("asks for the days chosen and goes back to the default with the button", async () => {
    const asked: Record<string, string | null>[] = [];
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?sector=health");
    await newsLoaded();
    server.use(
      http.get("*/api/communities/:territoryId/news", ({ request }) => {
        const url = new URL(request.url);
        asked.push({
          from: url.searchParams.get("date_from"),
          to: url.searchParams.get("date_to"),
        });
        return HttpResponse.json({
          territory_id: "ccaa-05",
          sector_id: "health",
          since: url.searchParams.get("date_from") ?? "2026-10-12",
          until: url.searchParams.get("date_to") ?? "2026-10-14",
          items: [],
        });
      }),
    );

    fireEvent.change(screen.getByLabelText(es.community.news.range.from), {
      target: { value: "2026-10-01" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText(es.community.news.range.from)).toHaveValue("2026-10-01");
    });
    expect(asked.at(-1)).toEqual({ from: "2026-10-01", to: "2026-10-14" });

    await user.click(screen.getByRole("button", { name: es.community.news.range.reset }));

    await waitFor(() => {
      expect(screen.getByLabelText(es.community.news.range.from)).toHaveValue("2026-10-12");
    });
    expect(asked.at(-1)).toEqual({ from: null, to: null });
  });

  it("moves the other day when the first one is set after the last", async () => {
    renderApp("/comunidades/ccaa-05?sector=health&desde=2026-10-01&hasta=2026-10-05");
    await newsLoaded();

    fireEvent.change(screen.getByLabelText(es.community.news.range.from), {
      target: { value: "2026-10-09" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText(es.community.news.range.to)).toHaveValue("2026-10-09");
    });
  });

  it("reads the days from the URL and keeps the sector", async () => {
    renderApp("/comunidades/ccaa-05?sector=health&desde=2026-10-05&hasta=2026-10-07");

    await newsLoaded();
    expect(screen.getByLabelText(es.community.news.range.from)).toHaveValue("2026-10-05");
    expect(screen.getByLabelText(es.community.news.range.to)).toHaveValue("2026-10-07");
    expect(await sectorLink("Sanidad")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: es.community.news.range.reset })).toBeVisible();
  });

  it("ignores a day in the URL that is not a date", async () => {
    renderApp("/comunidades/ccaa-05?sector=health&desde=ayer");

    await newsLoaded();
    expect(screen.queryByRole("button", { name: es.community.news.range.reset })).toBeNull();
  });
});

describe("related news of a news item", () => {
  async function openRelated(headline: RegExp): Promise<HTMLElement> {
    const section = await newsSection();
    await newsLoaded();
    const button = within(section).getByRole("button", {
      name: new RegExp(`^Noticias relacionadas con «${headline.source}`),
    });
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    return screen.findByRole("group", { name: /^Noticias anteriores parecidas a/ });
  }

  it("opens the earlier news most alike in text, by day, each with how alike it is", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const panel = await openRelated(/EN DIRECTO \| El Parlamento rechaza/);

    expect(
      await within(panel).findByRole("heading", { name: "14 de octubre de 2026" }),
    ).toBeVisible();
    expect(within(panel).getByRole("heading", { name: "13 de octubre de 2026" })).toBeVisible();
    // The item asked for is not repeated: only the earlier ones, with the API's similarity.
    expect(within(panel).getAllByRole("link")).toHaveLength(4);
    expect(within(panel).getByText(/Canarias7, \d\d:\d\d · parecido: 0,92/)).toBeVisible();
    await userEvent.click(
      within(panel).getByRole("button", {
        name: formatMessage(es.app.shell.info.open, { topic: es.stories.related.title }),
      }),
    );
    expect(
      within(screen.getByRole("dialog", { name: es.stories.related.title })).getByText(
        /hasta 8 días\. Parecido no significa/,
      ),
    ).toBeVisible();
    expect(within(panel).getAllByRole("link")[0]).toHaveAttribute("target", "_blank");
  });

  it("says when there is nothing alike enough, with the window the API used", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const panel = await openRelated(/Muere un hombre apuñalado/);

    expect(
      await within(panel).findByText(
        "No hay noticias anteriores lo bastante parecidas en los 14 días previos.",
      ),
    ).toBeVisible();
    expect(within(panel).queryAllByRole("link")).toHaveLength(0);
  });

  it("closes the panel with the same button, and opens one item at a time", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");
    await openRelated(/Muere un hombre apuñalado/);
    const section = await newsSection();

    await userEvent.click(
      within(section).getByRole("button", {
        name: /^Noticias relacionadas con «Condenan al Servicio Canario de Salud/,
      }),
    );

    expect(screen.getAllByRole("group", { name: /^Noticias anteriores parecidas a/ })).toHaveLength(
      1,
    );
    const button = within(section).getByRole("button", {
      name: /^Noticias relacionadas con «Condenan al Servicio Canario de Salud/,
    });
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("group", { name: /^Noticias anteriores parecidas a/ })).toBeNull();
  });

  it("says when the related news could not be loaded and lets the reader try again", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");
    server.use(
      http.get("*/api/articles/:articleId/related", () =>
        HttpResponse.json({ detail: "boom" }, { status: 500 }),
      ),
    );

    const panel = await openRelated(/Muere un hombre apuñalado/);

    expect(await within(panel).findByRole("alert")).toHaveTextContent(es.stories.related.error);
    serveCommunity();
    await userEvent.click(within(panel).getByRole("button", { name: es.stories.related.retry }));
    expect(
      await within(panel).findByText(/No hay noticias anteriores lo bastante parecidas/),
    ).toBeVisible();
  });

  it("has no axe violations with a panel open", async () => {
    const container = renderApp("/comunidades/ccaa-05?sector=health");
    const panel = await openRelated(/EN DIRECTO \| El Parlamento rechaza/);
    await within(panel).findByRole("heading", { name: "13 de octubre de 2026" });

    expect(await axeViolations(container)).toEqual([]);
  });
});

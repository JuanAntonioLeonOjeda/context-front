import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";
import { axeViolations } from "@/test/axe";
import { server } from "@/test/server";

async function treesSection(): Promise<HTMLElement> {
  return screen.findByRole("region", { name: es.community.news.title });
}

async function treesLoaded(): Promise<HTMLElement> {
  const section = await treesSection();
  await waitFor(() => {
    expect(within(section).queryByText(es.community.trees.loading)).toBeNull();
  });
  return section;
}

describe("trees of news of a community", () => {
  it("lists one card per tree with its newest news: outlet, hour and headline, by day", async () => {
    renderApp("/comunidades/ccaa-05?vista=arbol");

    const section = await treesLoaded();
    const entries = within(section).getAllByRole("article");
    expect(entries).toHaveLength(2);
    expect(entries[0]).toHaveTextContent(/ABC, \d\d:\d\d/);
    // Cards are in a row for each day, under the day's heading, like the news.
    expect(within(section).getAllByRole("heading", { level: 3 }).length).toBeGreaterThan(0);
    expect(within(section).getByRole("button", { name: /Ayuso, ante las amenazas/ })).toBeVisible();
    expect(section).not.toHaveTextContent(/Responsable|Confianza/);
  });

  it("shares the sector of the finder, from the URL, and has no dates", async () => {
    renderApp("/comunidades/ccaa-05?vista=arbol&sector=health");

    const section = await treesLoaded();
    const nav = within(section).getByRole("navigation", { name: es.community.trees.sectorNav });
    expect(within(nav).getByRole("link", { name: "Sanidad" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(section).queryByLabelText(es.community.news.range.from)).toBeNull();
  });

  it("asks the API for the sector chosen and keeps it when going to the finder", async () => {
    const asked: (string | null)[] = [];
    server.events.on("request:start", ({ request }) => {
      if (request.url.includes("/trees"))
        asked.push(new URL(request.url).searchParams.get("sector"));
    });
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?vista=arbol");
    const section = await treesLoaded();

    await user.click(within(section).getByRole("link", { name: "Vivienda" }));
    await waitFor(() => {
      expect(asked).toContain("housing");
    });
    await user.click(
      within(section).getByRole("link", { name: es.community.news.views.buscador.goTo }),
    );

    const newsNav = await within(section).findByRole("navigation", {
      name: es.community.news.sectorNav,
    });
    expect(within(newsNav).getByRole("link", { name: "Vivienda" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    server.events.removeAllListeners();
  });

  it("opens the whole tree under the entry on click and closes it on the next", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?vista=arbol");
    const section = await treesLoaded();
    const headline = within(section).getByRole("button", { name: /Ayuso, ante las amenazas/ });
    expect(headline).toHaveAttribute("aria-expanded", "false");
    expect(within(section).queryByRole("region", { name: es.stories.tree.regionLabel })).toBeNull();

    await user.click(headline);

    expect(headline).toHaveAttribute("aria-expanded", "true");
    expect(
      await within(section).findByRole("region", { name: es.stories.tree.regionLabel }),
    ).toBeVisible();

    await user.click(headline);

    expect(headline).toHaveAttribute("aria-expanded", "false");
    expect(within(section).queryByRole("region", { name: es.stories.tree.regionLabel })).toBeNull();
  });

  it("keeps one tree open at a time", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?vista=arbol");
    const section = await treesLoaded();
    const first = within(section).getByRole("button", { name: /Ayuso, ante las amenazas/ });
    const second = within(section).getByRole("button", { name: /Un grupo de 200 profesores/ });

    await user.click(first);
    await user.click(second);

    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("says a sector has no trees instead of leaving a blank", async () => {
    renderApp("/comunidades/ccaa-09?vista=arbol", { community: "cataluna" });

    const message = await screen.findByText(/No hay árboles de noticias de educación/);
    expect(message).toBeVisible();
    // Said as a status, with an icon that assistive technology skips.
    const status = message.closest("[role='status']");
    expect(status?.querySelector("svg[aria-hidden='true']")).not.toBeNull();
  });

  it("shows an error with a retry in the section when the trees cannot be loaded", async () => {
    renderApp("/comunidades/ccaa-05?vista=arbol", { failingTrees: true });

    const alert = await within(await treesSection()).findByRole("alert");
    expect(alert).toHaveTextContent(es.community.trees.error);
    expect(within(alert).getByRole("button", { name: es.community.trees.retry })).toBeVisible();
  });

  it("has no axe violations, closed or open", async () => {
    const user = userEvent.setup();
    const container = renderApp("/comunidades/ccaa-05?vista=arbol");
    const section = await treesLoaded();
    expect(await axeViolations(container)).toEqual([]);

    await user.click(within(section).getByRole("button", { name: /Ayuso, ante las amenazas/ }));
    await within(section).findByRole("region", { name: es.stories.tree.regionLabel });

    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("search of the trees", () => {
  it("filters the cards as the reader types, by headline or outlet, ignoring accents", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?vista=arbol");
    const section = await treesLoaded();
    expect(within(section).getAllByRole("article")).toHaveLength(2);
    const box = within(section).getByRole("searchbox", { name: es.community.trees.search.label });

    await user.type(box, "ayuso");

    expect(within(section).getAllByRole("article")).toHaveLength(1);
    expect(within(section).getByRole("button", { name: /Ayuso, ante las amenazas/ })).toBeVisible();

    await user.clear(box);
    await user.type(box, "el pais");

    expect(within(section).getAllByRole("article")).toHaveLength(1);
    expect(
      within(section).getByRole("button", { name: /Un grupo de 200 profesores/ }),
    ).toBeVisible();
  });

  it("says nothing matches, and the finder keeps what was typed", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?vista=arbol");
    const section = await treesLoaded();

    await user.type(within(section).getByRole("searchbox"), "zzzz");

    expect(
      within(section).getByText(/Ningún árbol de noticias de educación coincide con «zzzz»/),
    ).toBeVisible();
    await user.click(
      within(section).getByRole("link", { name: es.community.news.views.buscador.goTo }),
    );
    expect(await within(section).findByRole("searchbox")).toHaveValue("zzzz");
  });
});

describe("the two parts of the news", () => {
  it("offers the finder and the trees before one is chosen, each saying what it does", async () => {
    renderApp("/comunidades/ccaa-05");

    const section = await treesSection();
    const chooser = within(section).getByRole("navigation", {
      name: es.community.news.views.label,
    });
    const links = within(chooser).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      es.community.news.views.buscador.title + es.community.news.views.buscador.description,
      es.community.news.views.arbol.title + es.community.news.views.arbol.description,
    ]);
    // Nothing is fetched or filtered until a part is chosen.
    expect(within(section).queryByRole("searchbox")).toBeNull();
  });

  it("shows the part chosen with the way to the other at the top", async () => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05");
    const section = await treesSection();

    await user.click(
      within(section).getByRole("link", {
        name: new RegExp(`^${es.community.news.views.arbol.title}`),
      }),
    );

    expect(await within(section).findByText(es.community.news.views.arbol.title)).toBeVisible();
    expect(
      within(section).getByRole("link", { name: es.community.news.views.buscador.goTo }),
    ).toBeVisible();
    expect(
      within(section).queryByRole("navigation", { name: es.community.news.views.label }),
    ).toBeNull();
  });
});

describe("sections that close", () => {
  it.each([
    ["the INE data", es.community.indicators.title],
    ["the news", es.community.news.title],
  ])("%s closes and opens again from its heading", async (_name, title) => {
    const user = userEvent.setup();
    renderApp("/comunidades/ccaa-05?vista=arbol");
    // The button is found again each time: closing moves the heading out of the carousel.
    const toggle = (): HTMLElement => screen.getByRole("button", { name: title });
    await screen.findByRole("button", { name: title });
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    const textOpen = screen.getByRole("region", { name: title }).textContent;

    await user.click(toggle());

    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("region", { name: title }).textContent).toBe(title);
    expect(textOpen).not.toBe(title); // open, it holds more than its title

    await user.click(toggle());

    expect(toggle()).toHaveAttribute("aria-expanded", "true");
  });
});

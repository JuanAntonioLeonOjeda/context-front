import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";
import { axeViolations } from "@/test/axe";

describe("tree of related news", () => {
  it("shows every story of the tree as a card, nested under the one it continues", async () => {
    renderApp("/arbol/37");

    const region = await screen.findByRole("region", { name: es.stories.tree.regionLabel });
    expect(within(region).getAllByRole("article")).toHaveLength(6);
    // The root has the other cards as descendants; the leaves have none.
    const root = region.querySelector("ul > li");
    expect(root?.querySelectorAll("li > ul > li")).not.toHaveLength(0);
  });

  it("shows only the headline of the first article of each story until it is opened", async () => {
    renderApp("/arbol/37");

    const region = await screen.findByRole("region", { name: es.stories.tree.regionLabel });
    for (const card of within(region).getAllByRole("article")) {
      expect(within(card).getAllByRole("link")).toHaveLength(1);
    }
    expect(within(region).queryAllByRole("heading")).toHaveLength(0);
  });

  it("unfolds the headlines of the other outlets on click and folds them on a second click", async () => {
    const user = userEvent.setup();
    renderApp("/arbol/37");
    const region = await screen.findByRole("region", { name: es.stories.tree.regionLabel });
    const [card] = within(region).getAllByRole("article");
    if (!card) throw new Error("no card rendered");
    const toggle = within(card).getByRole("button", { name: /^Desplegar \(\d medios? más\)$/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    const folded = within(card).getByRole("button", { name: es.stories.tree.fold });
    expect(folded).toHaveAttribute("aria-expanded", "true");
    expect(within(card).getAllByRole("link").length).toBeGreaterThan(1);
    for (const link of within(card).getAllByRole("link")) {
      expect(link).toHaveAttribute("href", expect.stringMatching(/^https?:\/\//));
    }

    await user.click(folded);

    expect(within(card).getByRole("button", { name: /^Desplegar/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(within(card).getAllByRole("link")).toHaveLength(1);
  });

  it("does not unfold on hover: only the button does", async () => {
    const user = userEvent.setup();
    renderApp("/arbol/37");
    const region = await screen.findByRole("region", { name: es.stories.tree.regionLabel });
    const [card] = within(region).getAllByRole("article");
    if (!card) throw new Error("no card rendered");

    await user.hover(card);

    expect(within(card).getAllByRole("link")).toHaveLength(1);
  });

  it("opens with the keyboard too", async () => {
    const user = userEvent.setup();
    renderApp("/arbol/37");
    const region = await screen.findByRole("region", { name: es.stories.tree.regionLabel });
    const [card] = within(region).getAllByRole("article");
    if (!card) throw new Error("no card rendered");
    within(card)
      .getByRole("button", { name: /^Desplegar/ })
      .focus();

    await user.keyboard("{Enter}");

    expect(within(card).getAllByRole("link").length).toBeGreaterThan(1);
  });

  it("links each headline to its outlet and says when each story began", async () => {
    renderApp("/arbol/37");

    const region = await screen.findByRole("region", { name: es.stories.tree.regionLabel });
    for (const link of within(region).getAllByRole("link")) {
      expect(link).toHaveAttribute("href", expect.stringMatching(/^https?:\/\//));
    }
    expect(within(region).getAllByText(/^Desde el \d+ de \w+ de 2026, \d\d:\d\d$/)).toHaveLength(6);
  });

  it("says how the relations were made and that they can be wrong, without a cause", async () => {
    renderApp("/arbol/37");

    expect(await screen.findByText(es.stories.tree.reading)).toBeVisible();
    expect(
      screen.getByText(/umbral provisional \(similitud mínima 0,75 y hasta 14 días/),
    ).toBeVisible();
    expect(screen.getByText(/solo dice «parecida y posterior», no su causa/)).toBeVisible();
  });

  it("names no party and shows no lead", async () => {
    renderApp("/arbol/37");

    const region = await screen.findByRole("region", { name: es.stories.tree.regionLabel });
    expect(region).not.toHaveTextContent(/Responsable|Confianza|Base de la atribución/);
  });

  it("says a story with no relations has no tree instead of leaving a blank", async () => {
    renderApp("/arbol/9999");

    expect(await screen.findByText(es.stories.tree.notFound)).toBeVisible();
  });

  it("shows an error with a retry when the tree cannot be loaded", async () => {
    renderApp("/arbol/37", { failingTree: true });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(es.stories.tree.error);
    expect(within(alert).getByRole("button", { name: es.stories.tree.retry })).toBeVisible();
  });

  it("answers a segment that is not a number as a page that does not exist", async () => {
    renderApp("/arbol/uno");

    expect(await screen.findByRole("heading", { name: es.errors.notFound.title })).toBeVisible();
  });

  it("is reached from a news item's 'ver árbol' and has no axe violations", async () => {
    const user = userEvent.setup();
    const container = renderApp("/comunidades/ccaa-05?sector=health");
    const button = await screen.findByRole("link", {
      name: /Ver árbol de noticias relacionadas/,
    });

    await user.click(button);

    await screen.findByRole("region", { name: es.stories.tree.regionLabel });
    expect(await axeViolations(container)).toEqual([]);
  });
});

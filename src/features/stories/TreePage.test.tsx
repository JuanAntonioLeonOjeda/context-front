import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";
import { renderApp } from "@/test/app";
import { axeViolations } from "@/test/axe";

describe("tree of related news", () => {
  it("is titled the tree of news, not the related news of an item (another feature)", async () => {
    renderApp("/arbol/37");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Árbol de noticias" }),
    ).toBeVisible();
    expect(document.title).toMatch(/^Árbol de noticias · /);
  });

  /** The node buttons of the graph, in the order a reader goes through them. */
  async function nodes(): Promise<HTMLElement[]> {
    const region = await screen.findByRole("region", { name: es.stories.tree.regionLabel });
    return within(region).getAllByRole("button");
  }

  function first(buttons: HTMLElement[], index = 0): HTMLElement {
    const button = buttons[index];
    if (!button) throw new Error("no node rendered");
    return button;
  }

  it("shows every story of the tree as a node, oldest first", async () => {
    renderApp("/arbol/37");

    const buttons = await nodes();
    expect(buttons).toHaveLength(6);
    expect(buttons.map((b) => b.getAttribute("aria-expanded"))).toEqual(Array(6).fill("false"));
    // The root (story 4, 12 October) first; the fixture's nodes come oldest first too.
    expect(first(buttons)).toHaveTextContent(/^12 oct/);
  });

  it("shows the headline of the first article under each node, and no link until one is opened", async () => {
    renderApp("/arbol/37");

    const region = await screen.findByRole("region", { name: es.stories.tree.regionLabel });
    expect(within(region).queryAllByRole("link")).toHaveLength(0);
    expect(first(await nodes())).toHaveTextContent(/3 noticias$/);
  });

  it("opens all the news of a story on click and closes them on a second click", async () => {
    const user = userEvent.setup();
    renderApp("/arbol/37");
    const node = first(await nodes());

    await user.click(node);

    expect(node).toHaveAttribute("aria-expanded", "true");
    const list = screen.getByRole("list", { name: /^Noticias de la historia «/ });
    // The news appear as the graph places them, a frame after the click.
    expect(await within(list).findAllByRole("link")).toHaveLength(3);
    for (const link of within(list).getAllByRole("link")) {
      expect(link).toHaveAttribute("href", expect.stringMatching(/^https?:\/\//));
    }

    await user.click(node);

    expect(node).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("list", { name: /^Noticias de la historia «/ })).toBeNull();
  });

  it("keeps one story open at a time, and Escape closes it", async () => {
    const user = userEvent.setup();
    renderApp("/arbol/37");
    const buttons = await nodes();

    await user.click(first(buttons, 0));
    await user.click(first(buttons, 1));

    expect(first(buttons, 0)).toHaveAttribute("aria-expanded", "false");
    expect(first(buttons, 1)).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("list", { name: /^Noticias de la historia «/ })).toHaveLength(1);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("list", { name: /^Noticias de la historia «/ })).toBeNull();
  });

  it("does not open on hover: only a click or a key does", async () => {
    const user = userEvent.setup();
    renderApp("/arbol/37");
    const node = first(await nodes());

    await user.hover(node);
    expect(node).toHaveAttribute("aria-expanded", "false");

    node.focus();
    await user.keyboard("{Enter}");
    expect(node).toHaveAttribute("aria-expanded", "true");
  });

  it("says in each node which story it continues and how alike, as its line does", async () => {
    renderApp("/arbol/37");
    const buttons = await nodes();

    expect(first(buttons)).not.toHaveTextContent(/Continúa/);
    for (const button of buttons.slice(1)) {
      expect(button).toHaveTextContent(
        /Continúa la historia «.+»\. Relación con la anterior: 0,\d+\.$/,
      );
    }
  });

  it("says how the relations were made and that they can be wrong, without a cause", async () => {
    renderApp("/arbol/37");
    const info = await screen.findByRole("button", {
      name: formatMessage(es.app.shell.info.open, { topic: es.stories.tree.title }),
    });
    expect(screen.queryByText(es.stories.tree.reading)).toBeNull();

    await userEvent.click(info);

    const dialog = screen.getByRole("dialog", { name: es.stories.tree.title });
    expect(within(dialog).getByText(es.stories.tree.reading)).toBeVisible();
    expect(
      within(dialog).getByText(/umbral provisional \(similitud mínima 0,75 y hasta 14 días/),
    ).toBeVisible();
    expect(within(dialog).getByText(/solo dice «parecida y posterior», no su causa/)).toBeVisible();
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

describe("route of a tree", () => {
  it.each(["1e3", "0x10", "037", "-5", "0", "abc", "9999999999999999999"])(
    "names no story for the segment %s",
    async (segment) => {
      renderApp(`/arbol/${segment}`);

      expect(
        await screen.findByRole("heading", { level: 1, name: es.errors.notFound.title }),
      ).toBeVisible();
    },
  );
});

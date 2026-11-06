import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";
import { axeViolations } from "@/test/axe";

import { THEME_KEY } from "./theme";

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("header", () => {
  it("has the brand, the two places of the site, and marks the current one", async () => {
    renderApp("/");

    const header = await screen.findByRole("banner");
    expect(within(header).getByRole("link", { name: /InContext/ })).toHaveAttribute("href", "/");
    const nav = within(header).getByRole("navigation", { name: es.app.shell.nav.label });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((l) => l.textContent),
    ).toEqual(["Mapa", "Cómo funciona"]);
    expect(within(nav).getByRole("link", { name: "Mapa" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Cómo funciona" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});

describe("theme button", () => {
  it("says the current choice and what the next press does", async () => {
    renderApp("/");

    const button = await screen.findByRole("button", { name: /Tema de color/ });
    expect(button).toHaveAccessibleName("Tema de color: claro. Pulsa para cambiar a oscuro.");
  });

  it("switches between light and dark, applying and remembering each", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const button = await screen.findByRole("button", { name: /Tema de color/ });

    await user.click(button);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(button).toHaveAccessibleName(/oscuro\. Pulsa para cambiar a claro/);
    await user.click(button);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("light");
  });

  it("starts from the stored choice", async () => {
    window.localStorage.setItem(THEME_KEY, "dark");
    renderApp("/");

    expect(await screen.findByRole("button", { name: /Tema de color: oscuro/ })).toBeVisible();
  });
});

describe("footer", () => {
  it("lists the sources, how it is done and the project, each under its own heading", async () => {
    const container = renderApp("/");

    const footer = await screen.findByRole("contentinfo");
    for (const title of [
      es.app.footer.sources.title,
      es.app.footer.method.title,
      es.app.footer.project.title,
    ]) {
      expect(within(footer).getByRole("heading", { level: 2, name: title })).toBeVisible();
    }
    expect(within(footer).getByText(/IGN, licencia CC BY 4.0/)).toBeVisible();
    expect(within(footer).getByText(/lo asigna un modelo propio/)).toBeVisible();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("links the two repositories and the explanation page", async () => {
    renderApp("/");

    const footer = await screen.findByRole("contentinfo");
    expect(within(footer).getByRole("link", { name: "Código del backend" })).toHaveAttribute(
      "href",
      "https://github.com/JuanAntonioLeonOjeda/context-back",
    );
    expect(within(footer).getByRole("link", { name: "Código de la web" })).toHaveAttribute(
      "href",
      "https://github.com/JuanAntonioLeonOjeda/context-front",
    );
    expect(within(footer).getByRole("link", { name: es.app.footer.method.link })).toHaveAttribute(
      "href",
      "/como-funciona",
    );
  });

  it("still shows whether the data is available", async () => {
    renderApp("/");

    expect(await within(await screen.findByRole("contentinfo")).findByRole("status")).toBeVisible();
  });
});

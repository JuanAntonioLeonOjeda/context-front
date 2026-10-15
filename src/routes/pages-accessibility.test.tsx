import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp, type AppScenario } from "@/test/app";
import { axeViolations } from "@/test/axe";

// Every page and state of the app, fully loaded, audited with axe in each theme.
//
// axe runs in jsdom, which computes no colours: the contrast rule is off there and the colour
// pairs are checked on the tokens (src/design/tokens.test.ts). What this checks in each theme
// is the structure: landmarks, names, roles, labels and the table markup. The rendered look,
// zoom and screen-reader behaviour need a real browser.
interface PageCase {
  name: string;
  path: string;
  scenario?: AppScenario;
  /** Resolves when the page has finished loading, so axe never audits a half-drawn screen. */
  loaded: () => Promise<unknown>;
}

const PAGES: PageCase[] = [
  {
    name: "the map of today",
    path: "/",
    loaded: () => screen.findByRole("navigation", { name: es.map.list.title }),
  },
  {
    name: "the map when its data cannot be loaded",
    path: "/",
    scenario: { failingMapData: ["/map/geometry"] },
    loaded: () => screen.findByText(es.map.state.error),
  },
  {
    name: "the map while the backend is unreachable",
    path: "/",
    scenario: { backend: "unreachable" },
    loaded: () => screen.findByText(es.health.status.down),
  },
  {
    name: "a community card",
    path: "/comunidades/ccaa-05",
    loaded: async () => {
      await screen.findByRole("heading", { name: "Tasa de paro" });
      return screen.findByText(/Noticias desde el/);
    },
  },
  {
    name: "a community card whose sector has no news",
    path: "/comunidades/ccaa-09",
    scenario: { community: "cataluna" },
    loaded: () => screen.findByText(/No hay noticias de educación/),
  },
  {
    name: "a community with a caretaker government",
    path: "/comunidades/ccaa-05",
    scenario: { community: "canarias-caretaker" },
    loaded: () => screen.findByText(es.community.government.caretaker),
  },
  {
    name: "a community whose data cannot be loaded",
    path: "/comunidades/ccaa-05",
    scenario: { community: "failing" },
    loaded: () => screen.findByText(es.community.state.error),
  },
  {
    name: "a community that does not exist",
    path: "/comunidades/ccaa-99",
    loaded: () => screen.findByText(es.community.page.notFound),
  },
  {
    name: "the how-it-works page",
    path: "/como-funciona",
    loaded: () => screen.findByRole("heading", { level: 1, name: es.about.page.title }),
  },
  {
    name: "an address that does not exist",
    path: "/no-existe",
    loaded: () => screen.findByText(es.errors.notFound.message),
  },
];

describe.each(["light", "dark"] as const)(
  "accessibility of every page in the %s theme",
  (theme) => {
    afterEach(() => {
      document.documentElement.removeAttribute("data-theme");
    });

    it.each(PAGES)("$name has no axe violations", async ({ path, scenario, loaded }) => {
      document.documentElement.setAttribute("data-theme", theme);
      const container = renderApp(path, scenario);
      await loaded();

      expect(document.documentElement).toHaveAttribute("data-theme", theme);
      expect(await axeViolations(container)).toEqual([]);
    });
  },
);

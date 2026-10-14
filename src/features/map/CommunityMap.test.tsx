import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";

import { partyTable } from "@/design/parties";
import { es } from "@/i18n/es";
import { axeViolations } from "@/test/axe";
import before from "@/test/fixtures/map-governments-2010-01-01.json";
import today from "@/test/fixtures/map-governments-2026-10-14.json";
import geometryResponse from "@/test/fixtures/map-geometry.json";
import parties from "@/test/fixtures/parties.json";
import territories from "@/test/fixtures/territories.json";

import { CommunityMap } from "./CommunityMap";
import { communityLook, type CommunityLook } from "./community-look";
import { layoutMap, type CommunitiesGeometry } from "./projection";

// Real API responses captured from the backend (src/test/fixtures/).
const geometry = geometryResponse as CommunitiesGeometry;
const layout = layoutMap(geometry);
const table = partyTable(parties);
const names = new Map(territories.map((t) => [t.id, t.name]));

function looksOf(response: typeof today): Map<string, CommunityLook> {
  return new Map(
    response.communities.map((c) => [
      c.territory_id,
      communityLook(
        {
          territoryId: c.territory_id,
          governingPartyIds: c.governing_party_ids,
          isCaretaker: c.is_caretaker,
          hasData: c.has_data,
        },
        names.get(c.territory_id) ?? "",
        table,
      ),
    ]),
  );
}

function renderMap(response = today): HTMLElement {
  const looks = looksOf(response);
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <CommunityMap
          caption="Gobiernos autonómicos"
          layout={layout}
          looks={looks}
          attribution={geometry.attribution}
          hrefOf={(id) => `/comunidades/${id}`}
        />
      ),
    },
  ]);
  return render(<RouterProvider router={router} />).container;
}

describe("CommunityMap", () => {
  it("links every community to its page, named with who governs", () => {
    renderMap();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(19);
    expect(screen.getByRole("link", { name: "Galicia: gobierna PP" })).toHaveAttribute(
      "href",
      "/comunidades/ccaa-12",
    );
    expect(screen.getByRole("link", { name: "Canarias: gobiernan CC y PP" })).toBeInTheDocument();
  });

  it("gives the very small territories an HTML marker instead of an SVG shape", () => {
    renderMap();

    const ceuta = screen.getByRole("link", { name: "Ceuta: gobierna PP" });
    const melilla = screen.getByRole("link", { name: "Melilla: gobierna PP" });
    expect(ceuta.closest("svg")).toBeNull();
    expect(melilla.closest("svg")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Galicia: gobierna PP" }).closest("svg"),
    ).not.toBeNull();
  });

  it("draws a coalition with one stripe pattern shared by every community with the same partners", () => {
    const { length } = renderMap().querySelectorAll("pattern");
    const andalucia = screen.getByRole("link", { name: "Andalucía: gobiernan PP y Vox" });
    const aragon = screen.getByRole("link", { name: "Aragón: gobiernan PP y Vox" });
    const fillOf = (link: HTMLElement): string | null | undefined =>
      link.querySelector("path")?.getAttribute("fill");

    expect(fillOf(andalucia)).toBe("url(#stripes-pp--vox)");
    expect(fillOf(aragon)).toBe(fillOf(andalucia));
    // Patterns today: PP+Vox, CxA+PSOE, CC+PP, PNV+PSOE, Contigo+GBai+PSOE, and the no-data hatch.
    expect(length).toBe(6);
  });

  it("uses only colours from the party table", () => {
    const container = renderMap();
    const used = [...container.querySelectorAll("[fill]")]
      .map((e) => e.getAttribute("fill") ?? "")
      .filter((fill) => fill.startsWith("#"));
    const partyColours = new Set(parties.map((p) => p.colour_hex));

    expect(used.length).toBeGreaterThan(0);
    expect(used.filter((c) => !partyColours.has(c))).toEqual([]);
  });

  it("lists every governing party once in the legend, and explains the stripes", () => {
    renderMap();

    const legend = screen.getByRole("region", { name: es.map.legend.title });
    const items = within(legend)
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    // Ordered by party id: coalicion-canaria, contigo-zurekin, convocatoria-por-asturias,
    // geroa-bai, pnv, pp, psc, psoe, vox. Sumar governs only at State level: not on the map.
    expect(items).toEqual([
      "CC",
      "Contigo-Zurekin",
      "CxA",
      "GBai",
      "EAJ-PNV",
      "PP",
      "PSC",
      "PSOE",
      "Vox",
    ]);
    expect(within(legend).getByText(es.map.legend.coalition)).toBeVisible();
  });

  it("shows a date without data as such, in the map and in the legend", () => {
    renderMap(before);

    expect(
      screen.getByRole("link", { name: "Galicia: sin datos de gobierno en esta fecha" }),
    ).toBeInTheDocument();
    const legend = screen.getByRole("region", { name: es.map.legend.title });
    expect(
      within(legend)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual([es.map.legend.noData]);
    expect(within(legend).queryByText(es.map.legend.coalition)).not.toBeInTheDocument();
  });

  it("draws the Canary Islands inset and credits the IGN", () => {
    const container = renderMap();

    expect(container.querySelector("rect[aria-hidden='true']")).not.toBeNull();
    expect(screen.getByText(/CC-BY 4\.0 ign\.es/)).toBeVisible();
  });

  it("can be used with the keyboard: every community is a tab stop", async () => {
    const user = userEvent.setup();
    renderMap();

    const visited: string[] = [];
    for (let i = 0; i < 19; i++) {
      await user.tab();
      visited.push(document.activeElement?.getAttribute("aria-label") ?? "");
    }

    expect(new Set(visited).size).toBe(19);
  });

  it("has no axe violations", async () => {
    const container = renderMap();

    expect(await axeViolations(container)).toEqual([]);
  });
});

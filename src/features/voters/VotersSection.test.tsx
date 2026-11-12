import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { axeViolations } from "@/test/axe";
import { serveCommunity } from "@/test/community";
import parties from "@/test/fixtures/parties.json";
import { queryWrapper } from "@/test/query";

import { VotersSection } from "./VotersSection";

const TITLE = es.voters.section.title;
const FIRST_BAND = "Tramo 1 de 5 · rentas más bajas";

function renderSection(
  territoryId: string,
  options: { failingVoters?: boolean } = {},
): HTMLElement {
  serveCommunity("canarias", options);
  return render(<VotersSection territoryId={territoryId} />, { wrapper: queryWrapper() }).container;
}

async function firstBand(): Promise<HTMLElement> {
  return screen.findByRole("article", { name: FIRST_BAND });
}

function colourOf(id: string): string {
  const party = parties.find((p) => p.id === id);
  if (party === undefined) throw new Error(`no party ${id} in the fixture`);
  return party.colour_hex;
}

/** The bar drawn in the row of `label`, inside one band. */
function barOf(band: HTMLElement, label: string): HTMLElement {
  const row = within(band).getByText(label).closest("li");
  const bar = row?.querySelector<HTMLElement>("[aria-hidden='true'] > span");
  if (!bar) throw new Error(`no bar for ${label}`);
  return bar;
}

describe("voter profile of a community", () => {
  it("draws one row per income band, lowest incomes first, with its income and its census", async () => {
    renderSection("ccaa-05");

    const band = await firstBand();
    expect(screen.getAllByRole("article").map((a) => a.getAttribute("aria-labelledby"))).toEqual([
      "voters-band-0",
      "voters-band-1",
      "voters-band-2",
      "voters-band-3",
      "voters-band-4",
    ]);
    expect(band).toHaveTextContent("De 10.321 a 12.079 € por persona");
    expect(band).toHaveTextContent("21 municipios · 19,7 % del censo");
    expect(band).toHaveTextContent("Voto en blanco: 0,9 %");
  });

  it("writes each group's name and figure next to its bar, in the API's order", async () => {
    renderSection("ccaa-05");

    const list = within(await firstBand()).getByRole("list", { name: `Voto en el ${FIRST_BAND}` });
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual([
      "CC12,5 %",
      "NC3,5 %",
      "PP32,7 %",
      "PSOE34,7 %",
      "Sumar9,1 %",
      "Vox5,1 %",
      "Otras1,6 %",
    ]);
  });

  it("sizes each bar against the highest share of the profile and colours it from the party table", async () => {
    renderSection("ccaa-05");

    const band = await firstBand();
    // The highest share of Canarias is 36,0 % (PP, fifth band): 34,7 / 36 = 96,4 %.
    expect(barOf(band, "PSOE").style.inlineSize).toBe("96.4%");
    expect(barOf(band, "PSOE")).toHaveStyle({ background: colourOf("psoe") });
    expect(barOf(band, "PP")).toHaveStyle({ background: colourOf("pp") });
    // "Otras" is no party: no colour of its own, the neutral one of the stylesheet.
    expect(barOf(band, "Otras").style.background).toBe("");
  });

  it("draws a list without a party in the neutral colour, with its acronym", async () => {
    renderSection("ccaa-15");

    const band = await firstBand();
    expect(barOf(band, "U.P.N.").style.background).toBe("");
    expect(barOf(band, "PSOE")).toHaveStyle({ background: colourOf("psoe") });
  });

  it("gives the same numbers in a table, a row per band and a column per group", async () => {
    renderSection("ccaa-05");
    await firstBand();

    await userEvent.click(screen.getByText(es.voters.table.open));
    const table = screen.getByRole("table", { name: es.voters.table.caption });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((th) => th.textContent),
    ).toEqual(["Tramo", "Municipios y censo", "CC", "NC", "PP", "PSOE", "Sumar", "Vox", "Otras"]);
    const row = within(table).getByRole("row", { name: new RegExp(`^${FIRST_BAND}`) });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((td) => td.textContent),
    ).toEqual([
      "21 municipios · 19,7 % del censo",
      "12,5 %",
      "3,5 %",
      "32,7 %",
      "34,7 %",
      "9,1 %",
      "5,1 %",
      "1,6 %",
    ]);
    expect(within(table).getAllByRole("row")).toHaveLength(6);
  });

  it("says what a band is, which years are used and that it describes areas, with both sources", async () => {
    renderSection("ccaa-05");
    await firstBand();

    const section = screen.getByRole("region", { name: TITLE });
    expect(section).toHaveTextContent("elecciones generales del 23 de julio de 2023");
    const method = within(section).getByRole("complementary", { name: es.voters.method.title });
    expect(method).toHaveTextContent("renta neta media por persona de 2023");
    expect(method).toHaveTextContent("describe zonas, no personas");
    expect(method).toHaveTextContent("al menos el 3 %");
    expect(within(section).getByRole("link", { name: /Ministerio del Interior/ })).toHaveAttribute(
      "href",
      expect.stringContaining("infoelectoral.interior.gob.es"),
    );
    expect(within(section).getByRole("link", { name: /INE/ })).toHaveAttribute(
      "href",
      expect.stringContaining("www.ine.es"),
    );
  });

  it("says why a community of one municipality has no profile, and draws no band", async () => {
    renderSection("ccaa-18");

    expect(await screen.findByText(es.voters.reasons.too_few_municipalities)).toBeVisible();
    expect(screen.queryByRole("article")).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText(es.voters.method.title)).toBeNull();
  });

  it("shows nothing at all when the API has no election for the community", async () => {
    const container = renderSection("ccaa-99");

    // While it loads the section is there with its title; the API's 404 takes it away.
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("says so, with a way to retry, when the profile cannot be loaded", async () => {
    renderSection("ccaa-05", { failingVoters: true });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(es.voters.section.error);
    expect(within(alert).getByRole("button", { name: es.voters.section.retry })).toBeVisible();
  });

  describe.each(["light", "dark"] as const)("in the %s theme", (theme) => {
    afterEach(() => {
      document.documentElement.removeAttribute("data-theme");
    });

    it.each(["ccaa-05", "ccaa-18"])("has no axe violations (%s)", async (territoryId) => {
      document.documentElement.setAttribute("data-theme", theme);
      const container = renderSection(territoryId);
      await screen.findByText(/elecciones generales del/);

      expect(await axeViolations(container)).toEqual([]);
    });
  });
});

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { axeViolations } from "@/test/axe";
import { serveCommunity } from "@/test/community";
import canarias from "@/test/fixtures/community-ccaa-05-voters.json";
import parties from "@/test/fixtures/parties.json";
import { queryWrapper } from "@/test/query";
import { server } from "@/test/server";

import { VotersSection } from "./VotersSection";

const TITLE = es.voters.section.title;
const FIRST_BAND = "Tramo 1 de 5 · rentas más bajas";

function renderSection(
  territoryId: string,
  options: { failingVoters?: boolean; failingParties?: boolean } = {},
): HTMLElement {
  serveCommunity("canarias", options);
  return render(<VotersSection territoryId={territoryId} />, { wrapper: queryWrapper() }).container;
}

/** The card of the lowest band: the list item that holds its heading. */
async function firstBand(): Promise<HTMLElement> {
  const heading = await screen.findByRole("heading", { level: 3, name: FIRST_BAND });
  const card = heading.closest("li");
  if (!card) throw new Error("the band's heading is not in a list item");
  return card;
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
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      FIRST_BAND,
      "Tramo 2 de 5",
      "Tramo 3 de 5",
      "Tramo 4 de 5",
      "Tramo 5 de 5 · rentas más altas",
      es.voters.method.title,
    ]);
    expect(band).toHaveTextContent("De 10.321 a 12.079 € por persona");
    expect(band).toHaveTextContent("21 municipios · 19,7 % del censo");
    expect(band).toHaveTextContent("Voto en blanco: 0,9 %");
  });

  it("writes each group's name and figure next to its bar, in the API's order", async () => {
    renderSection("ccaa-05");

    const list = within(await firstBand()).getByRole("list", { name: `Voto en el ${FIRST_BAND}` });
    // Written out: Safari drops the semantics, and the name, of a list styled without markers.
    expect(list).toHaveAttribute("role", "list");
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

  it("draws a candidature that is not in the party table in the neutral colour, with its acronym", async () => {
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
    // The box that scrolls sideways takes the focus, so the keyboard can scroll it.
    expect(screen.getByRole("region", { name: es.voters.table.scroll })).toHaveAttribute(
      "tabindex",
      "0",
    );
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
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
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

  it("says so when the profile cannot be loaded, and loads it on retry", async () => {
    renderSection("ccaa-05", { failingVoters: true });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(es.voters.section.error);

    serveCommunity(); // the API answers again
    await userEvent.click(within(alert).getByRole("button", { name: es.voters.section.retry }));
    expect(await firstBand()).toHaveTextContent("21 municipios");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("says it could not be loaded when the party table fails, never bars without their party", async () => {
    renderSection("ccaa-05", { failingParties: true });

    expect(await screen.findByRole("alert")).toHaveTextContent(es.voters.section.error);
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
  });

  it("shows nothing, not an error, when there is no election even if the party table fails", async () => {
    const container = renderSection("ccaa-99", { failingParties: true });

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
    // It stays empty once the party table has failed too.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("keeps the note on how to read it, without the income year, when the API sends no income", async () => {
    serveCommunity();
    server.use(
      http.get("*/api/communities/:territoryId/voters", () =>
        HttpResponse.json({ ...canarias, income: null }),
      ),
    );
    render(<VotersSection territoryId="ccaa-05" />, { wrapper: queryWrapper() });

    const method = await screen.findByRole("complementary", { name: es.voters.method.title });
    expect(method).toHaveTextContent("describe zonas, no personas");
    expect(method).toHaveTextContent("al menos el 3 %");
    expect(method).not.toHaveTextContent("renta neta media por persona de");
  });

  it("takes the threshold and the income's page from the API, not from the web's text", async () => {
    serveCommunity();
    server.use(
      http.get("*/api/communities/:territoryId/voters", () =>
        HttpResponse.json({
          ...canarias,
          shown_from_percent: 5,
          income: { ...canarias.income, source_url: "https://example.org/renta" },
        }),
      ),
    );
    render(<VotersSection territoryId="ccaa-05" />, { wrapper: queryWrapper() });

    const method = await screen.findByRole("complementary", { name: es.voters.method.title });
    expect(method).toHaveTextContent("al menos el 5 %");
    expect(method).not.toHaveTextContent("{percent}");
    expect(screen.getByRole("link", { name: /INE/ })).toHaveAttribute(
      "href",
      "https://example.org/renta",
    );
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

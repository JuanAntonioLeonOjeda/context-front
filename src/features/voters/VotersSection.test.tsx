import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";
import { axeViolations } from "@/test/axe";
import { serveCommunity } from "@/test/community";
import canarias from "@/test/fixtures/community-ccaa-05-voters.json";
import parties from "@/test/fixtures/parties.json";
import { queryWrapper } from "@/test/query";
import { server } from "@/test/server";

import { VotersSection } from "./VotersSection";

const TITLE = es.voters.section.title;
const FIRST_BAND = "Tramo 1 de 5 · rentas más bajas";
const INFO = formatMessage(es.app.shell.info.open, { topic: TITLE });

/** The section's "i" window, opened: where the notes on how to read the profile are. */
async function openExplanation(): Promise<HTMLElement> {
  await userEvent.click(screen.getByRole("button", { name: INFO }));
  return screen.getByRole("dialog", { name: TITLE });
}

function renderSection(
  territoryId: string,
  options: { failingVoters?: boolean; failingParties?: boolean } = {},
): HTMLElement {
  serveCommunity("canarias", options);
  return render(<VotersSection territoryId={territoryId} />, { wrapper: queryWrapper() }).container;
}

const LEGEND = es.voters.section.chart.legend;

/** The row of the lowest band in the table under the chart, once the chart is drawn. The table is
 *  in a closed disclosure until the reader opens it, hence `hidden`. */
async function firstBand(): Promise<HTMLElement> {
  await screen.findByRole("list", { name: LEGEND });
  const header = await screen.findByRole("rowheader", { name: FIRST_BAND, hidden: true });
  const row = header.closest("tr");
  if (!row) throw new Error("the band's name is not in a table row");
  return row;
}

/** The names of the bands, in the table's order (the chart's, left to right). */
function bandNames(): (string | null)[] {
  return screen.getAllByRole("rowheader", { hidden: true }).map((h) => h.textContent);
}

/** The colour a group's line is drawn with: its legend entry carries it. */
function lineColour(label: string): string {
  const entry = within(screen.getByRole("list", { name: LEGEND }))
    .getByText(label)
    .closest("li");
  if (!entry) throw new Error(`no legend entry for ${label}`);
  return entry.style.color;
}

/** "#1d84ce" as the browser writes a colour back: "rgb(29, 132, 206)". */
function hexToRgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
}

function colourOf(id: string): string {
  const party = parties.find((p) => p.id === id);
  if (party === undefined) throw new Error(`no party ${id} in the fixture`);
  return party.colour_hex;
}

/** The chart: it takes the focus, and the arrow keys move through the bands. */
function chart(): HTMLElement {
  return screen.getByRole("group", { name: es.voters.section.chart.label });
}

describe("voter profile of a community", () => {
  it("draws one line per group through the five income bands, lowest incomes first", async () => {
    renderSection("ccaa-05");

    const band = await firstBand();
    expect(bandNames()).toEqual([
      FIRST_BAND,
      "Tramo 2 de 5",
      "Tramo 3 de 5",
      "Tramo 4 de 5",
      "Tramo 5 de 5 · rentas más altas",
    ]);
    expect(band).toHaveTextContent("De 10.321 a 12.079 € por persona");
    expect(band).toHaveTextContent("21 municipios · 19,7 % del censo");
  });

  it("names every group in the legend, in the API's order, so the colour is never the only cue", async () => {
    renderSection("ccaa-05");
    await firstBand();

    const legend = screen.getByRole("list", { name: LEGEND });
    // Written out: Safari drops the semantics, and the name, of a list styled without markers.
    expect(legend).toHaveAttribute("role", "list");
    expect(
      within(legend)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual([
      es.voters.section.chart.census,
      "CC",
      "NC-bc",
      "PP",
      "PSOE",
      "Sumar",
      "Vox",
      "Otras",
    ]);
  });

  it("shows every group's share in a band, highest first, as the arrow keys go through them", async () => {
    const user = userEvent.setup();
    renderSection("ccaa-05");
    await firstBand();

    chart().focus();

    const first = await screen.findByText(FIRST_BAND, { selector: "p" });
    const box = first.parentElement;
    if (!box) throw new Error("no tooltip");
    expect(box).toHaveTextContent("21 municipios · 19,7 % del censo");
    expect(box).toHaveTextContent("Voto en blanco: 0,9 %");
    expect(
      within(box)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual([
      "PSOE34,7 %",
      "PP32,7 %",
      "CC12,5 %",
      "Sumar9,1 %",
      "Vox5,1 %",
      "NC-bc3,5 %",
      "Otras1,6 %",
    ]);

    await user.keyboard("{ArrowRight}");

    expect(screen.getByText("Tramo 2 de 5", { selector: "p" })).toBeVisible();
    expect(screen.queryByText(FIRST_BAND, { selector: "p" })).toBeNull();
  });

  it("closes and opens again like the other sections, with the state on the button", async () => {
    renderSection("ccaa-05");
    await firstBand();
    expect(screen.getByRole("button", { name: TITLE })).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(screen.getByRole("button", { name: TITLE }));

    expect(screen.getByRole("button", { name: TITLE })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("list", { name: LEGEND })).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: TITLE })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: TITLE }));

    expect(screen.getByRole("button", { name: TITLE })).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByRole("rowheader", { name: FIRST_BAND, hidden: true }),
    ).toBeInTheDocument();
  });

  it("offers the dimensions as buttons and starts with the income", async () => {
    renderSection("ccaa-05");
    await firstBand();

    const group = screen.getByRole("group", { name: es.voters.section.tabs });
    const income = within(group).getByRole("button", { name: es.voters.dimensions.income.tab });
    const size = within(group).getByRole("button", { name: es.voters.dimensions.size.tab });

    expect(income).toHaveAttribute("aria-pressed", "true");
    expect(size).toHaveAttribute("aria-pressed", "false");
  });

  it("switches to the size of the municipality: four bands, in electors, with no INE source", async () => {
    renderSection("ccaa-05");
    await firstBand();

    await userEvent.click(screen.getByRole("button", { name: es.voters.dimensions.size.tab }));

    expect(
      await screen.findByRole("rowheader", {
        name: "Tramo 1 de 4 · municipios más pequeños",
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(bandNames()).toEqual([
      "Tramo 1 de 4 · municipios más pequeños",
      "Tramo 2 de 4",
      "Tramo 3 de 4",
      "Tramo 4 de 4 · municipios más grandes",
    ]);
    expect(screen.getByRole("button", { name: es.voters.dimensions.size.tab })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // The bands' values are in electors: the table's column of values says so.
    expect(screen.getAllByText(/electores$/, { selector: "td" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /INE/ })).toBeNull();
    expect(screen.queryByText(/Atlas de distribución de renta/)).toBeNull();
    expect(await openExplanation()).toHaveTextContent("de 1500 a 7999");
  });

  it("goes back to the income and keeps the bands the API sent for it", async () => {
    renderSection("ccaa-05");
    await firstBand();
    await userEvent.click(screen.getByRole("button", { name: es.voters.dimensions.size.tab }));
    await screen.findByRole("rowheader", { name: /municipios más pequeños/, hidden: true });

    await userEvent.click(screen.getByRole("button", { name: es.voters.dimensions.income.tab }));

    expect(
      await screen.findByRole("rowheader", { name: FIRST_BAND, hidden: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /INE/ })).toBeVisible();
  });

  it("says that a community of one municipality has no size profile either", async () => {
    renderSection("ccaa-18");
    await screen.findByText(es.voters.dimensions.income.tooFew);

    await userEvent.click(screen.getByRole("button", { name: es.voters.dimensions.size.tab }));

    expect(await screen.findByText(es.voters.dimensions.size.tooFew)).toBeVisible();
    expect(screen.queryByRole("list", { name: LEGEND })).toBeNull();
  });

  it("switches to the education: five bands in percent, with the census of the INE as source", async () => {
    renderSection("ccaa-05");
    await firstBand();

    await userEvent.click(screen.getByRole("button", { name: es.voters.dimensions.education.tab }));

    expect(
      await screen.findByRole("rowheader", {
        name: "Tramo 1 de 5 · menos estudios superiores",
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("De 14,1 % a 24,1 % con estudios superiores")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Censo anual de población/ })).toHaveAttribute(
      "href",
      expect.stringContaining("cid=1254736176992"),
    );
    expect(screen.queryByText(/Atlas de distribución de renta/)).toBeNull();
    expect(
      within(await openExplanation()).getByText(/Censo anual de población del INE/),
    ).toBeVisible();
  });

  it("switches to the age: five bands, the share of 70 or more, with the census of the INE as source", async () => {
    renderSection("ccaa-05");
    await firstBand();

    await userEvent.click(screen.getByRole("button", { name: es.voters.dimensions.age.tab }));

    expect(
      await screen.findByRole("rowheader", { name: "Tramo 1 de 5 · menores", hidden: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "Tramo 5 de 5 · mayores", hidden: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("De 7,3 % a 11,1 % con 70 años o más")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edad por municipio/ })).toHaveAttribute(
      "href",
      expect.stringContaining("cid=1254736176992"),
    );
    expect(screen.queryByText(/Atlas de distribución de renta/)).toBeNull();
  });

  it("switches to the place of birth: the share of foreigners, said to be the place of birth", async () => {
    renderSection("ccaa-05");
    await firstBand();

    await userEvent.click(
      screen.getByRole("button", { name: es.voters.dimensions.born_abroad.tab }),
    );

    expect(
      await screen.findByRole("rowheader", {
        name: "Tramo 1 de 5 · menos extranjeros",
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("De 2,7 % a 12,0 % de extranjeros")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /lugar de nacimiento por municipio/ })).toHaveAttribute(
      "href",
      expect.stringContaining("cid=1254736176992"),
    );
    expect(
      within(await openExplanation()).getByText(/Es el lugar de nacimiento, no la nacionalidad/),
    ).toBeVisible();
  });

  it.each(["age", "born_abroad"] as const)(
    "does not say that municipalities are left out when none is (%s, Canarias)",
    async (dimension) => {
      renderSection("ccaa-05");
      await firstBand();

      await userEvent.click(
        screen.getByRole("button", { name: es.voters.dimensions[dimension].tab }),
      );
      await screen.findByRole("rowheader", { name: /^Tramo 1 de 5/, hidden: true });

      expect(screen.queryByText(/que quedan fuera de los tramos/)).toBeNull();
    },
  );

  it.each(["age", "born_abroad"] as const)(
    "counts the %s of the municipalities under 500 inhabitants apart, and says why",
    async (dimension) => {
      renderSection("ccaa-15");
      await firstBand();

      await userEvent.click(
        screen.getByRole("button", { name: es.voters.dimensions[dimension].tab }),
      );

      const note = await screen.findByText(/que quedan fuera de los tramos: 152/);
      expect(note).toHaveTextContent("Solo hay dato en los de 500 habitantes o más.");
    },
  );

  it.each(["age", "born_abroad"] as const)(
    "says that a community of one municipality has no %s profile",
    async (dimension) => {
      renderSection("ccaa-18");
      await screen.findByText(es.voters.dimensions.income.tooFew);

      await userEvent.click(
        screen.getByRole("button", { name: es.voters.dimensions[dimension].tab }),
      );

      expect(await screen.findByText(es.voters.dimensions[dimension].tooFew)).toBeVisible();
      expect(screen.queryByRole("list", { name: LEGEND })).toBeNull();
    },
  );

  it("says that a community of one municipality has no education profile either", async () => {
    renderSection("ccaa-18");
    await screen.findByText(es.voters.dimensions.income.tooFew);

    await userEvent.click(screen.getByRole("button", { name: es.voters.dimensions.education.tab }));

    expect(await screen.findByText(es.voters.dimensions.education.tooFew)).toBeVisible();
    expect(screen.queryByRole("list", { name: LEGEND })).toBeNull();
  });

  it("keeps the button pressed on the screen while the next dimension is fetched", async () => {
    renderSection("ccaa-05");
    await firstBand();
    server.use(
      http.get("*/api/communities/:territoryId/voters", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(canarias);
      }),
    );
    const size = screen.getByRole("button", { name: es.voters.dimensions.size.tab });

    await userEvent.click(size);

    // The same button, still in the page and still the pressed one: the profile did not unmount.
    expect(size).toBeInTheDocument();
    expect(size).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("region", { name: TITLE })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent(es.voters.section.loading);
  });

  it("is titled the voter profile and says what it is in its window, not on the screen", async () => {
    renderSection("ccaa-05");
    await firstBand();

    expect(screen.getByRole("button", { name: "Perfil de votante" })).toBeVisible();
    expect(screen.queryByText(/^Cómo votaron los municipios de la comunidad/)).toBeNull();
    expect(
      within(await openExplanation()).getByText(/^Cómo votaron los municipios de la comunidad/),
    ).toBeVisible();
  });

  it("closes the window with its Close button", async () => {
    renderSection("ccaa-05");
    await firstBand();
    const dialog = await openExplanation();

    await userEvent.click(within(dialog).getByRole("button", { name: es.app.shell.info.close }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("offers the five parameters, the last one named by the place of birth and not by an origin", async () => {
    renderSection("ccaa-05");
    await firstBand();

    const group = screen.getByRole("group", { name: es.voters.section.tabs });

    expect(
      within(group)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Renta", "Tamaño", "Estudios", "Edad", "Nacimiento"]);
  });

  it("says that the bands hold people of any age and place of birth, on every tab", async () => {
    renderSection("ccaa-05");
    await firstBand();

    await userEvent.click(screen.getByRole("button", { name: es.voters.dimensions.age.tab }));
    await screen.findByRole("rowheader", { name: "Tramo 1 de 5 · menores", hidden: true });

    expect(await openExplanation()).toHaveTextContent(
      "personas de cualquier edad y lugar de nacimiento",
    );
  });

  it("says that the profile describes areas even when there is nothing to draw", async () => {
    renderSection("ccaa-18");

    expect(await screen.findByText(es.voters.dimensions.income.tooFew)).toBeVisible();
    expect(within(await openExplanation()).getByText(/describe zonas, no personas/)).toBeVisible();
  });

  it("colours each party's line from the party table, and the rest in the neutral colour", async () => {
    renderSection("ccaa-05");
    await firstBand();

    expect(lineColour("PSOE")).toBe(hexToRgb(colourOf("psoe")));
    expect(lineColour("PP")).toBe(hexToRgb(colourOf("pp")));
    // "Otras" is no party: no colour of its own, the neutral one of the stylesheet.
    expect(lineColour("Otras")).toBe("");
  });

  it("draws a candidature that is not in the party table in the neutral colour, with its acronym", async () => {
    renderSection("ccaa-15");
    await firstBand();

    expect(lineColour("U.P.N.")).toBe("");
    expect(lineColour("PSOE")).toBe(hexToRgb(colourOf("psoe")));
  });

  it("gives the same numbers in a table, a row per band and a column per group", async () => {
    renderSection("ccaa-05");
    await firstBand();

    await userEvent.click(screen.getByText(es.voters.table.open));
    const table = screen.getByRole("table", { name: es.voters.dimensions.income.tableCaption });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((th) => th.textContent),
    ).toEqual([
      "Tramo",
      "Valores",
      "Municipios y censo",
      "CC",
      "NC-bc",
      "PP",
      "PSOE",
      "Sumar",
      "Vox",
      "Otras",
    ]);
    const row = within(table).getByRole("row", { name: new RegExp(`^${FIRST_BAND}`) });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((td) => td.textContent),
    ).toEqual([
      "De 10.321 a 12.079 € por persona",
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
    const method = await openExplanation();
    expect(method).toHaveTextContent("elecciones generales del 23 de julio de 2023");
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

    expect(await screen.findByText(es.voters.dimensions.income.tooFew)).toBeVisible();
    expect(screen.queryByRole("list", { name: LEGEND })).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    // No bands, so nothing on how they are made or what the percentages are.
    expect(await openExplanation()).not.toHaveTextContent("al menos el");
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
    expect(screen.queryByRole("list", { name: LEGEND })).toBeNull();
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
        HttpResponse.json({
          ...canarias,
          dimension: { ...canarias.dimension, source_url: null, year: null, fetched_at: null },
        }),
      ),
    );
    render(<VotersSection territoryId="ccaa-05" />, { wrapper: queryWrapper() });
    await firstBand();

    const method = await openExplanation();
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
          dimension: { ...canarias.dimension, source_url: "https://example.org/renta" },
        }),
      ),
    );
    render(<VotersSection territoryId="ccaa-05" />, { wrapper: queryWrapper() });
    await firstBand();

    const method = await openExplanation();
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
      await screen.findByRole("link", { name: /Ministerio del Interior/ });

      expect(await axeViolations(container)).toEqual([]);
    });

    it("has no axe violations with the window open", async () => {
      document.documentElement.setAttribute("data-theme", theme);
      const container = renderSection("ccaa-05");
      await firstBand();
      await openExplanation();

      expect(await axeViolations(container)).toEqual([]);
    });

    it.each(["age", "born_abroad"] as const)("has no axe violations on the %s tab", async (id) => {
      document.documentElement.setAttribute("data-theme", theme);
      const container = renderSection("ccaa-15");
      await firstBand();
      await userEvent.click(screen.getByRole("button", { name: es.voters.dimensions[id].tab }));
      await screen.findByText(/que quedan fuera de los tramos/);

      expect(await axeViolations(container)).toEqual([]);
    });
  });
});

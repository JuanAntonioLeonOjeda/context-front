import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { axeViolations } from "@/test/axe";

import type { Indicator } from "./community-api";
import { indicatorRows } from "./community-card";
import { IndicatorsSection } from "./IndicatorsSection";

const withData: Indicator = {
  id: "unemployment_rate",
  name: "Tasa de paro",
  unit: "%",
  latest: { year: 2026, quarter: 2, value: 11.6 },
  series: [],
  tableId: "14506",
  tableUrl: "https://www.ine.es/jaxiT3/Tabla.htm?t=14506",
  fetchedAt: "2026-10-13T15:48:00Z",
};
const withoutData: Indicator = {
  ...withData,
  id: "population",
  name: "Población",
  latest: null,
  fetchedAt: null,
};

const series = [
  { year: 2025, quarter: 3, value: 12.4 },
  { year: 2025, quarter: 4, value: 12.1 },
  { year: 2026, quarter: 1, value: 13.4 },
  { year: 2026, quarter: 2, value: 11.6 },
];

function card(name: string): HTMLElement {
  const article = screen.getByRole("heading", { name }).closest("article");
  if (article === null) throw new Error(`no card for ${name}`);
  return article;
}

describe("IndicatorsSection", () => {
  it("shows an indicator without data as such, never as zero, and still names its source", async () => {
    const { container } = render(
      <IndicatorsSection community="Canarias" rows={indicatorRows([withData, withoutData])} />,
    );

    const empty = card("Población");
    expect(within(empty).getByText(es.community.indicators.noValue)).toBeVisible();
    expect(empty).not.toHaveTextContent(/\b0\b/);
    expect(within(empty).queryByRole("img")).not.toBeInTheDocument();
    expect(within(empty).getByRole("link", { name: "Tabla 14506 del INE" })).toBeVisible();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("draws the series as a chart with a written name, its extremes and a table of every point", async () => {
    const { container } = render(
      <IndicatorsSection community="Canarias" rows={indicatorRows([{ ...withData, series }])} />,
    );

    const filled = card("Tasa de paro");
    expect(within(filled).getByText("11,6", { selector: "p" })).toHaveTextContent("11,6 %");
    const chart = within(filled).getByRole("img");
    expect(chart).toHaveAccessibleName(/Evolución de Tasa de paro entre 3\.º trimestre de 2025/);
    expect(
      within(filled).getByText(/el valor más bajo fue 11,6 % y el más alto, 13,4 %/),
    ).toBeVisible();
    await userEvent.click(
      within(filled).getByRole("button", { name: es.community.indicators.viewData }),
    );
    const table = within(screen.getByRole("dialog")).getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(1 + series.length);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("keeps the table out of the card: a button opens it in a modal window that closes again", async () => {
    render(
      <IndicatorsSection community="Canarias" rows={indicatorRows([{ ...withData, series }])} />,
    );
    const filled = card("Tasa de paro");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(
      within(filled).getByRole("button", { name: es.community.indicators.viewData }),
    );
    const dialog = screen.getByRole("dialog", { name: "Datos: Canarias: Tasa de paro" });
    expect(dialog).toHaveAttribute("open");

    await userEvent.click(
      within(dialog).getByRole("button", { name: es.community.indicators.close }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the link to the source in a new tab", () => {
    render(
      <IndicatorsSection community="Canarias" rows={indicatorRows([{ ...withData, series }])} />,
    );

    const link = within(card("Tasa de paro")).getByRole("link", { name: "Tabla 14506 del INE" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});

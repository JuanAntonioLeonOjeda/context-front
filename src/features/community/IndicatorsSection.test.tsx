import { render, screen, within } from "@testing-library/react";
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

describe("IndicatorsSection empty state", () => {
  it("shows an indicator without data as such, never as zero, and still names its source", async () => {
    const { container } = render(
      <IndicatorsSection community="Canarias" rows={indicatorRows([withData, withoutData])} />,
    );

    const row = screen.getByRole("rowheader", { name: "Población" }).closest("tr");
    if (row === null) throw new Error("no row");
    const [value, period, source] = within(row).getAllByRole("cell");
    expect(value).toHaveTextContent(es.community.indicators.noValue);
    expect(value).not.toHaveTextContent("0");
    expect(period).toHaveTextContent("—");
    expect(source).toHaveTextContent("Tabla 14506 del INE");
    expect(await axeViolations(container)).toEqual([]);
  });
});

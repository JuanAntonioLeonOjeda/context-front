import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";
import { axeViolations } from "@/test/axe";
import { newsLoaded } from "@/test/news";

const EDUCATION = "Dato oficial de educación";

async function newsSection(): Promise<HTMLElement> {
  return screen.findByRole("region", { name: es.community.news.title });
}

describe("the sector's indicator next to the news", () => {
  it("shows the latest value, its period and the INE table of the sector's indicator", async () => {
    renderApp("/comunidades/ccaa-05?sector=education");

    const section = await newsSection();
    const figure = await within(section).findByRole("complementary", { name: EDUCATION });
    expect(figure).toHaveTextContent("Población de 16 y más años con educación superior");
    expect(figure).toHaveTextContent("32 % · 2.º trimestre de 2026");
    expect(within(figure).getByRole("link", { name: /Tabla 65289 del INE/ })).toHaveAttribute(
      "href",
      "https://www.ine.es/jaxiT3/Tabla.htm?t=65289",
    );
  });

  it("shows the indicator of the chosen sector, not another one", async () => {
    renderApp("/comunidades/ccaa-05?sector=work");

    const section = await newsSection();
    const figure = await within(section).findByRole("complementary", {
      name: "Dato oficial de trabajo",
    });
    expect(figure).toHaveTextContent("Tasa de paro");
    expect(figure).not.toHaveTextContent("educación superior");
  });

  it("shows nothing for a sector without an indicator", async () => {
    renderApp("/comunidades/ccaa-05?sector=health");

    const section = await newsSection();
    await newsLoaded();
    // The indicators of the page are loaded, so a figure would be there by now.
    await screen.findByRole("region", { name: es.community.indicators.title });
    expect(within(section).queryByRole("complementary")).toBeNull();
  });

  it("shows nothing, and still the news, when the sectors cannot be read", async () => {
    renderApp("/comunidades/ccaa-05?sector=education", { failingSectors: true });

    const section = await newsSection();
    await newsLoaded();
    expect(section.querySelectorAll("ol > li").length).toBeGreaterThan(0);
    // The page's indicators are drawn, so only the missing sectors keep the figure away.
    await screen.findByRole("region", { name: es.community.indicators.title });
    expect(within(section).queryByRole("complementary")).toBeNull();
    expect(within(section).queryByRole("alert")).toBeNull();
  });

  it("has no accessibility violations", async () => {
    const container = renderApp("/comunidades/ccaa-05?sector=education");

    const section = await newsSection();
    await within(section).findByRole("complementary", { name: EDUCATION });
    expect(await axeViolations(container)).toEqual([]);
  });
});

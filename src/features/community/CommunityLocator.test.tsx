import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderApp } from "@/test/app";
import { mapLink } from "@/test/map";

function isFaded(link: HTMLElement): boolean {
  return (link.getAttribute("class") ?? "").includes("dimmed");
}

describe("community on the map", () => {
  it("draws the map with this community in full and the others faded", async () => {
    renderApp("/comunidades/ccaa-09", { community: "cataluna" });

    await screen.findByRole("figure", { name: "Dónde está Cataluña" });
    const catalonia = mapLink("Cataluña: gobierna PSC");
    const galicia = mapLink("Galicia: gobierna PP");
    expect(isFaded(catalonia)).toBe(false);
    expect(isFaded(galicia)).toBe(true);
    expect(screen.getByRole("figure", { name: "Dónde está Cataluña" })).toBeVisible();
  });

  it("keeps the other communities as links, so the map leads to the next one", async () => {
    renderApp("/comunidades/ccaa-05");

    await screen.findByRole("figure", { name: "Dónde está Canarias" });

    expect(mapLink("Galicia: gobierna PP")).toHaveAttribute("href", "/comunidades/ccaa-12");
    expect(mapLink("Cataluña: gobierna PSC")).toHaveAttribute("href", "/comunidades/ccaa-09");
  });

  it("puts the government in the header, beside the map, and only the data and news below", async () => {
    renderApp("/comunidades/ccaa-05");

    const government = await screen.findByRole("region", { name: "Gobierno" });
    const figure = await screen.findByRole("figure");
    expect(government.parentElement?.parentElement).toContainElement(figure);
    expect(within(government).getByText(/Presidencia: Fernando Clavijo Batlle/)).toBeVisible();
  });

  it("does not show an error over the community when only the map cannot load", async () => {
    const container = renderApp("/comunidades/ccaa-05", { failingMapData: ["/map/geometry"] });

    expect(await screen.findByRole("heading", { level: 1, name: "Canarias" })).toBeVisible();
    // The empty card of the same shape is there while the map loads, and gone once it failed.
    await waitFor(() => {
      expect(container.querySelector("[class*='locatorPlaceholder']")).toBeNull();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Gobierno" })).toBeVisible();
  });

  it("draws a ring round the community, so a small one is not lost among the faded rest", async () => {
    const container = renderApp("/comunidades/ccaa-05");

    await screen.findByRole("figure", { name: "Dónde está Canarias" });

    expect(container.querySelectorAll("[class*='ring']")).toHaveLength(1);
  });
});

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";
import { findMapLink } from "@/test/map";

async function panel(): Promise<HTMLElement> {
  return screen.findByRole("region", { name: es.map.panel.title });
}

function isFaded(link: HTMLElement): boolean {
  return (link.getAttribute("class") ?? "").includes("dimmed");
}

describe("party panel on the home page", () => {
  it("has one row per governing party in the order of their ids, with its count in words", async () => {
    renderApp("/");

    const rows = within(await panel()).getAllByRole("button");
    const names = rows.map((r) => r.getAttribute("aria-label"));
    expect(names[0]).toMatch(/^Coalición Canaria: gobierna en 1 comunidad$/);
    // Ordered by the name shown, so the list reads alphabetically to a person.
    const shown = rows.map((r) => r.textContent.replace(/\d+$/, ""));
    expect(shown).toEqual([...shown].sort((a, b) => a.localeCompare(b, "es")));
    expect(names.at(-1)).toMatch(/^Vox: gobierna en 4 comunidades$/);
    expect(names).toContain("Partido Popular: gobierna en 14 comunidades");
    const labels = rows.map((r) => r.textContent);
    expect(labels).toHaveLength(9);
  });

  it("does not order the parties by how many communities they govern", async () => {
    renderApp("/");

    const counts = within(await panel())
      .getAllByRole("button")
      .map((r) => Number(r.getAttribute("aria-label")?.match(/en (\d+) comunidad/)?.[1]));
    const byCountDescending = [...counts].sort((a, b) => b - a);
    expect(counts).not.toEqual(byCountDescending);
    expect(counts).not.toEqual([...byCountDescending].reverse());
  });

  it("says how many governments are coalitions, over the communities with data", async () => {
    renderApp("/");

    expect(
      await within(await panel()).findByText("8 de 19 gobiernos son de coalición."),
    ).toBeVisible();
  });

  it("highlights the communities of a party and fades the others, and a second press clears it", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const galicia = await findMapLink("Galicia: gobierna PP");
    const catalonia = await findMapLink("Cataluña: gobierna PSC");
    const pp = within(await panel()).getByRole("button", { name: /^Partido Popular/ });

    expect(isFaded(galicia)).toBe(false);
    expect(isFaded(catalonia)).toBe(false);

    await user.click(pp);
    expect(pp).toHaveAttribute("aria-pressed", "true");
    expect(isFaded(galicia)).toBe(false);
    expect(isFaded(catalonia)).toBe(true);

    await user.click(pp);
    await user.unhover(pp); // while the pointer is over the row it still previews the party
    expect(pp).toHaveAttribute("aria-pressed", "false");
    expect(isFaded(catalonia)).toBe(false);
  });

  it("previews a party while the pointer is over its row, and goes back when it leaves", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const catalonia = await findMapLink("Cataluña: gobierna PSC");
    const pp = within(await panel()).getByRole("button", { name: /^Partido Popular/ });

    await user.hover(pp);
    expect(isFaded(catalonia)).toBe(true);
    await user.unhover(pp);
    expect(isFaded(catalonia)).toBe(false);
  });

  it("works from the keyboard: a row is a button that Enter presses", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const pp = within(await panel()).getByRole("button", { name: /^Partido Popular/ });

    pp.focus();
    await user.keyboard("{Enter}");

    expect(pp).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps every community reachable while one is highlighted: faded, never removed", async () => {
    const user = userEvent.setup();
    renderApp("/");
    await user.click(within(await panel()).getByRole("button", { name: /^Vox/ }));

    expect(await findMapLink("Cataluña: gobierna PSC")).toBeVisible();
    const list = screen.getByRole("navigation", { name: es.map.list.title });
    expect(within(list).getAllByRole("link")).toHaveLength(19);
  });

  it("rings a party that governs one community only, and not one that governs several", async () => {
    const user = userEvent.setup();
    const container = renderApp("/");
    await findMapLink("Cataluña: gobierna PSC");

    await user.click(within(await panel()).getByRole("button", { name: /^Coalición Canaria/ }));
    expect(container.querySelectorAll("[class*='ring']")).toHaveLength(1);

    await user.click(within(await panel()).getByRole("button", { name: /^Partido Popular/ }));
    expect(container.querySelectorAll("[class*='ring']")).toHaveLength(0);
  });
});

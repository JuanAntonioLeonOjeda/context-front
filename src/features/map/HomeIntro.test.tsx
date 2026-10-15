import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";
import { renderApp } from "@/test/app";

describe("home hero", () => {
  it("opens with the headline and the lead, before any data arrives", () => {
    renderApp("/");

    expect(screen.getByRole("heading", { level: 1, name: es.map.hero.title })).toBeVisible();
    expect(screen.getByText(es.map.hero.lead)).toBeVisible();
  });

  it("gives three figures taken from the map's own data", async () => {
    renderApp("/");

    const facts = await screen.findByLabelText(es.map.hero.facts.label);
    expect(within(facts).getByText("comunidades").nextSibling).toHaveTextContent("19");
    expect(within(facts).getByText("partidos en algún gobierno").nextSibling).toHaveTextContent(
      "9",
    );
    expect(within(facts).getByText("gobiernos de coalición").nextSibling).toHaveTextContent("8");
  });

  it("lists the communities alphabetically in the selector", async () => {
    renderApp("/");

    const select = await screen.findByRole("combobox", { name: es.map.hero.select.label });
    const names = within(select)
      .getAllByRole("option")
      .slice(1)
      .map((o) => o.textContent);
    expect(names).toHaveLength(19);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "es")));
  });

  it("goes to the community chosen, and only when the button is pressed", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const select = await screen.findByRole("combobox", { name: es.map.hero.select.label });

    await user.selectOptions(select, "Canarias");
    expect(screen.getByRole("heading", { level: 1, name: es.map.hero.title })).toBeVisible();
    await user.click(screen.getByRole("button", { name: es.map.hero.select.submit }));

    expect(await screen.findByRole("heading", { level: 1, name: "Canarias" })).toBeVisible();
  });

  it("stays on the home page when the button is pressed with no community chosen", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await user.click(await screen.findByRole("button", { name: es.map.hero.select.submit }));

    expect(screen.getByRole("heading", { level: 1, name: es.map.hero.title })).toBeVisible();
    expect(screen.queryByText(es.errors.notFound.title)).not.toBeInTheDocument();
  });
});

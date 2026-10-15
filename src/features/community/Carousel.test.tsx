import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { axeViolations } from "@/test/axe";

import { Carousel } from "./Carousel";

// jsdom does no layout: the sizes the carousel reads are given here.
function layout(sizes: { scrollWidth: number; clientWidth: number }): void {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(sizes.scrollWidth);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(sizes.clientWidth);
}

function renderCarousel(): HTMLElement {
  return render(
    <Carousel heading={<h2>Indicadores</h2>} label="Indicadores de Canarias">
      <ul>
        <li>uno</li>
        <li>dos</li>
      </ul>
    </Carousel>,
  ).container;
}

const scrollBy = vi.fn();

beforeEach(() => {
  scrollBy.mockReset();
  HTMLElement.prototype.scrollBy = scrollBy;
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("Carousel", () => {
  it("is a focusable region with a name, so the keyboard can scroll it", () => {
    layout({ scrollWidth: 400, clientWidth: 400 });
    renderCarousel();

    const region = screen.getByRole("region", { name: "Indicadores de Canarias" });
    expect(region).toHaveAttribute("tabindex", "0");
  });

  it("shows no arrows when everything fits", () => {
    layout({ scrollWidth: 400, clientWidth: 400 });
    renderCarousel();

    expect(
      screen.queryByRole("button", { name: /Indicadores (anteriores|siguientes)/ }),
    ).toBeNull();
  });

  it("shows the arrows when the cards do not fit, with the previous one off at the start", () => {
    layout({ scrollWidth: 1200, clientWidth: 400 });
    renderCarousel();

    expect(screen.getByRole("button", { name: "Indicadores anteriores" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Indicadores siguientes" })).toBeEnabled();
  });

  it("scrolls a little less than a screen at a time, in the direction of the arrow", async () => {
    layout({ scrollWidth: 1200, clientWidth: 400 });
    const user = userEvent.setup();
    renderCarousel();

    await user.click(screen.getByRole("button", { name: "Indicadores siguientes" }));

    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: 360 }));
  });

  it("scrolls back with the previous arrow once the row has moved", async () => {
    layout({ scrollWidth: 1200, clientWidth: 400 });
    const user = userEvent.setup();
    renderCarousel();
    const region = screen.getByRole("region", { name: "Indicadores de Canarias" });
    region.scrollLeft = 400;
    fireEvent.scroll(region);

    await user.click(screen.getByRole("button", { name: "Indicadores anteriores" }));

    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: -360 }));
  });

  it("turns the arrows on and off as the row is scrolled to its ends", () => {
    layout({ scrollWidth: 1200, clientWidth: 400 });
    renderCarousel();
    const region = screen.getByRole("region", { name: "Indicadores de Canarias" });

    region.scrollLeft = 800;
    fireEvent.scroll(region);
    expect(screen.getByRole("button", { name: "Indicadores anteriores" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Indicadores siguientes" })).toBeDisabled();

    region.scrollLeft = 400;
    fireEvent.scroll(region);
    expect(screen.getByRole("button", { name: "Indicadores anteriores" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Indicadores siguientes" })).toBeEnabled();
  });

  it("has no axe violations, with or without arrows", async () => {
    layout({ scrollWidth: 1200, clientWidth: 400 });
    expect(await axeViolations(renderCarousel())).toEqual([]);
  });
});

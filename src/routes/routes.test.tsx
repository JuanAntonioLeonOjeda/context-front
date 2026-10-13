import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it, vi } from "vitest";

import { es } from "@/i18n/es";
import { axeViolations } from "@/test/axe";

import { ErrorMessage } from "./ErrorMessage";
import { buildRoutes, routes } from "./routes";

function renderAt(path: string, tree: RouteObject[] = routes): HTMLElement {
  const router = createMemoryRouter(tree, { initialEntries: [path] });
  return render(<RouterProvider router={router} />).container;
}

function Boom(): never {
  throw new Error("internal detail that must not reach the reader");
}

/** React logs a caught render error to the console; the tests assert the UI instead. */
function silenceRenderErrors(): void {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
}

describe("home route", () => {
  it("shows the app name as the page heading inside a main landmark", async () => {
    const container = renderAt("/");

    expect(await screen.findByRole("heading", { level: 1, name: es.app.shell.name })).toBeVisible();
    expect(within(screen.getByRole("main")).getByText(es.app.shell.description)).toBeVisible();
    expect(screen.getByRole("banner")).toBeVisible();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("sets the document title", async () => {
    renderAt("/");

    await screen.findByRole("heading", { level: 1 });

    expect(document.title).toBe(es.app.shell.name);
  });
});

describe("keyboard", () => {
  it("makes the skip link the first stop and moves focus to main when used", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await screen.findByRole("heading", { level: 1 });

    await user.tab();
    const skip = screen.getByRole("link", { name: es.app.shell.skipToContent });
    expect(skip).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("main")).toHaveFocus();
  });
});

describe("unknown address", () => {
  it("shows the not found page inside the layout, with a way home", async () => {
    const container = renderAt("/no-existe");

    expect(
      await screen.findByRole("heading", { level: 1, name: es.errors.notFound.title }),
    ).toBeVisible();
    expect(screen.getByRole("banner")).toBeVisible();
    expect(screen.getByRole("link", { name: es.errors.notFound.home })).toHaveAttribute(
      "href",
      "/",
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("a page that fails", () => {
  it("keeps the layout, shows a message and a retry, and never the error itself", async () => {
    silenceRenderErrors();
    const container = renderAt("/", buildRoutes([{ index: true, Component: Boom }]));

    expect(
      await screen.findByRole("heading", { level: 1, name: es.errors.boundary.title }),
    ).toBeVisible();
    expect(screen.getByRole("banner")).toBeVisible();
    expect(screen.getByRole("button", { name: es.errors.boundary.retry })).toBeVisible();
    expect(screen.queryByText(/internal detail/)).not.toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("a layout that fails", () => {
  it("falls back to the root boundary, which needs nothing from the layout", async () => {
    silenceRenderErrors();
    const container = renderAt("/", [{ path: "/", Component: Boom, ErrorBoundary: ErrorMessage }]);

    expect(
      await screen.findByRole("heading", { level: 1, name: es.errors.boundary.title }),
    ).toBeVisible();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { es } from "@/i18n/es";
import { axeViolations } from "@/test/axe";
import { serveHealth, type BackendState } from "@/test/health";
import { findMapLink, serveMapData, type MapEndpoint } from "@/test/map";
import { queryWrapper } from "@/test/query";

import { ErrorMessage } from "./ErrorMessage";
import { buildRoutes, routes } from "./routes";

function renderAt(
  path: string,
  tree: RouteObject[] = routes,
  backend: BackendState = "up",
  failingMapData: MapEndpoint[] = [],
): HTMLElement {
  serveHealth(backend);
  serveMapData(failingMapData);
  const router = createMemoryRouter(tree, { initialEntries: [path] });
  return render(<RouterProvider router={router} />, { wrapper: queryWrapper() }).container;
}

function Boom(): never {
  throw new Error("internal detail that must not reach the reader");
}

/** React logs a caught render error to the console; the tests assert the UI instead. */
function silenceRenderErrors(): void {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
}

describe("home route", () => {
  it("shows the headline inside a main landmark, between a banner and a footer", async () => {
    const container = renderAt("/");

    expect(await screen.findByRole("heading", { level: 1, name: es.map.hero.title })).toBeVisible();
    expect(within(screen.getByRole("main")).getByText(es.map.hero.lead)).toBeVisible();
    expect(screen.getByRole("banner")).toBeVisible();
    expect(screen.getByRole("contentinfo")).toBeVisible();
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

describe("backend status in the shell", () => {
  it("shows that the data is available when the backend answers", async () => {
    renderAt("/");

    expect(await screen.findByText(es.health.status.up)).toBeVisible();
    expect(within(screen.getByRole("contentinfo")).getByRole("status")).toHaveTextContent(
      es.health.status.up,
    );
  });

  it("starts by saying it is checking", () => {
    renderAt("/");

    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("status")).toHaveTextContent(es.health.status.checking);
  });

  it.each<BackendState>(["database-down", "unreachable"])(
    "shows the written error state, not a crash, when the backend is %s",
    async (backend) => {
      const container = renderAt("/", routes, backend);

      expect(await screen.findByText(es.health.status.down)).toBeVisible();
      expect(screen.getByRole("heading", { level: 1, name: es.map.hero.title })).toBeVisible();
      expect(await axeViolations(container)).toEqual([]);
    },
  );
});

// axe runs in jsdom, which computes no colours: the contrast rule is off there and the colour
// pairs are checked on the tokens (src/design/tokens.test.ts). What this checks in each theme
// is the structure the theme leaves in place: landmarks, names, roles.
describe.each(["light", "dark"] as const)("accessibility in the %s theme", (theme) => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it.each<BackendState>(["up", "unreachable"])(
    "has no axe violations with the backend %s",
    async (backend) => {
      document.documentElement.setAttribute("data-theme", theme);
      const container = renderAt("/", routes, backend);
      await screen.findByText(backend === "up" ? es.health.status.up : es.health.status.down);

      expect(document.documentElement).toHaveAttribute("data-theme", theme);
      expect(await axeViolations(container)).toEqual([]);
    },
  );
});

describe("the map on the home page", () => {
  it("shows a loading state, then the map of today with a link per community", async () => {
    renderAt("/");

    expect(screen.getByText(es.map.state.loading)).toBeVisible();
    expect(
      await screen.findByRole("group", { name: "Gobiernos autonómicos a 14 de octubre de 2026" }),
    ).toBeInTheDocument();
    expect(await findMapLink("Galicia: gobierna PP")).toHaveAttribute(
      "href",
      "/comunidades/ccaa-12",
    );
  });

  it("shows a written error with a retry when the data cannot be loaded", async () => {
    const user = userEvent.setup();
    const container = renderAt("/", routes, "up", ["/map/geometry"]);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(es.map.state.error);
    expect(screen.getByRole("heading", { level: 1, name: es.map.hero.title })).toBeVisible();
    expect(await axeViolations(container)).toEqual([]);

    serveMapData();
    await user.click(within(alert).getByRole("button", { name: es.map.state.retry }));

    expect(await findMapLink("Galicia: gobierna PP")).toBeInTheDocument();
  });
});

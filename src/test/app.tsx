import { render } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { routes } from "@/routes/routes";
import { serveCommunity, type Scenario } from "@/test/community";
import { serveHealth, type BackendState } from "@/test/health";
import { serveMapData, type MapEndpoint } from "@/test/map";
import { queryWrapper } from "@/test/query";

export interface AppScenario {
  backend?: BackendState;
  community?: Scenario;
  failingMapData?: MapEndpoint[];
  failingTree?: boolean;
}

/** The whole app at `path`, answered by responses captured from the real backend. */
export function renderApp(path: string, scenario: AppScenario = {}): HTMLElement {
  serveHealth(scenario.backend ?? "up");
  serveMapData(scenario.failingMapData ?? []);
  serveCommunity(scenario.community ?? "canarias", { failingTree: scenario.failingTree ?? false });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />, { wrapper: queryWrapper() }).container;
}

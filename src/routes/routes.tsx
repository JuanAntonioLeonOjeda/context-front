import type { RouteObject } from "react-router";

import { CommunityRoute } from "./CommunityRoute";
import { ErrorMessage } from "./ErrorMessage";
import { HomeRoute } from "./HomeRoute";
import { NotFoundRoute } from "./NotFoundRoute";
import { RootLayout } from "./RootLayout";

/**
 * The route tree, with two error levels:
 * - the root boundary catches a failure of the layout itself, so it uses nothing from it;
 * - the inner boundary catches a failure of a page and keeps the layout around the message.
 * Each feature adds its routes as `children` in `buildRoutes`; nothing else changes.
 */
export function buildRoutes(children: RouteObject[]): RouteObject[] {
  return [
    {
      path: "/",
      Component: RootLayout,
      ErrorBoundary: ErrorMessage,
      children: [
        {
          ErrorBoundary: ErrorMessage,
          children: [...children, { path: "*", Component: NotFoundRoute }],
        },
      ],
    },
  ];
}

export const routes = buildRoutes([
  { index: true, Component: HomeRoute },
  { path: "comunidades/:territoryId", Component: CommunityRoute },
]);

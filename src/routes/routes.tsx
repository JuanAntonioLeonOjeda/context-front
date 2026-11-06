import { Navigate, type RouteObject } from "react-router";

import { FIRST_CHAPTER_PATH } from "@/features/project";

import { CommunityRoute } from "./CommunityRoute";
import { ErrorMessage } from "./ErrorMessage";
import { HomeRoute } from "./HomeRoute";
import { NotFoundRoute } from "./NotFoundRoute";
import { ProjectRoute } from "./ProjectRoute";
import { TreeRoute } from "./TreeRoute";
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
  { path: "arbol/:storyId", Component: TreeRoute },
  { path: "proyecto", element: <Navigate to={FIRST_CHAPTER_PATH} replace /> },
  { path: "proyecto/:slug", Component: ProjectRoute },
  // The old address of "Cómo funciona", now the first chapter of "El proyecto".
  { path: "como-funciona", element: <Navigate to={FIRST_CHAPTER_PATH} replace /> },
]);

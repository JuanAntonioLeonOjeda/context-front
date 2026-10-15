import { screen } from "@testing-library/react";
import { http, HttpResponse, type JsonBodyType } from "msw";

import { es } from "@/i18n/es";

import governments from "@/test/fixtures/map-governments-2026-10-14.json";
import geometry from "@/test/fixtures/map-geometry.json";
import parties from "@/test/fixtures/parties.json";
import territories from "@/test/fixtures/territories.json";
import { server } from "@/test/server";

export type MapEndpoint = "/map/geometry" | "/map/governments" | "/parties" | "/territories";

const RESPONSES: Record<MapEndpoint, JsonBodyType> = {
  "/map/geometry": geometry,
  "/map/governments": governments,
  "/parties": parties,
  "/territories": territories,
};

/** Serves the four map responses captured from the real backend; `failing` answers 500. */
export function serveMapData(failing: MapEndpoint[] = []): void {
  server.use(
    ...Object.entries(RESPONSES).map(([path, body]) =>
      http.get(`*/api${path}`, () =>
        failing.includes(path as MapEndpoint)
          ? HttpResponse.json({ detail: "boom" }, { status: 500 })
          : HttpResponse.json(body),
      ),
    ),
  );
}

/** The link of a community on the map itself (SVG shape or marker), not the one in the list. */
export function mapLink(name: string): HTMLElement {
  const onMap = screen
    .getAllByRole("link", { name })
    .filter((link) => link.closest("nav") === null);
  const [link] = onMap;
  if (link === undefined || onMap.length > 1) {
    throw new Error(`expected one map link named "${name}", found ${String(onMap.length)}`);
  }
  return link;
}

/** Waits for the map to be drawn, then returns the map link of a community. */
export async function findMapLink(name: string): Promise<HTMLElement> {
  await screen.findByRole("navigation", { name: es.map.list.title });
  return mapLink(name);
}

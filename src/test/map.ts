import { http, HttpResponse, type JsonBodyType } from "msw";

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

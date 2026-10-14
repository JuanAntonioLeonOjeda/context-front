import { http, HttpResponse } from "msw";

import healthDown from "@/test/fixtures/health-down.json";
import healthUp from "@/test/fixtures/health-up.json";
import { server } from "@/test/server";

export type BackendState = "up" | "database-down" | "unreachable";

/** Makes `/health` answer like the real backend did when captured (fixtures), or fail. */
export function serveHealth(state: BackendState): void {
  server.use(
    http.get("*/api/health", () => {
      switch (state) {
        case "up":
          return HttpResponse.json(healthUp);
        case "database-down":
          return HttpResponse.json(healthDown, { status: 503 });
        case "unreachable":
          return HttpResponse.error();
      }
    }),
  );
}

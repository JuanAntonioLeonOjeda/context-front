import { http, HttpResponse } from "msw";

import madrid from "@/test/fixtures/community-ccaa-13-organization.json";
import general from "@/test/fixtures/organization.json";
import territories from "@/test/fixtures/territories.json";
import { server } from "@/test/server";

/**
 * A community whose executive can be drawn, built from the State's real answer (the backend has
 * no complete community yet): the same bodies under another territory, without the list of
 * communities that only the general chart carries.
 */
export function completeCommunityChart(territoryId: string): object {
  const chart = Object.fromEntries(
    Object.entries(general).filter(([key]) => key !== "communities"),
  );
  return { ...chart, territory_id: territoryId };
}

const communityIds = new Set(territories.filter((t) => t.id.startsWith("ccaa-")).map((t) => t.id));

/**
 * Serves the organisation endpoints with answers captured from the real backend: the State's
 * complete chart and, for every community, one whose executive cannot be drawn. A territory that
 * is not a community answers the API's real 404.
 */
export function serveOrganization(options: { failing?: boolean; community?: object } = {}): void {
  const failure = (): Response => HttpResponse.json({ detail: "boom" }, { status: 500 });
  server.use(
    http.get("*/api/territories", () => HttpResponse.json(territories)),
    http.get("*/api/organization", () =>
      options.failing ? failure() : HttpResponse.json(general),
    ),
    http.get("*/api/communities/:territoryId/organization", ({ params }) => {
      if (options.failing) return failure();
      const id = String(params.territoryId);
      // As the real backend: every community answers, with no data until its batch is loaded.
      if (communityIds.has(id)) {
        return HttpResponse.json({ ...(options.community ?? madrid), territory_id: id });
      }
      return HttpResponse.json({ detail: `unknown community ${id}` }, { status: 404 });
    }),
  );
}

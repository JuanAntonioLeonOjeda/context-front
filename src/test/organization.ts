import { http, HttpResponse } from "msw";

import andalucia from "@/test/fixtures/community-ccaa-01-organization.json";
import canarias from "@/test/fixtures/community-ccaa-05-organization.json";
import cataluna from "@/test/fixtures/community-ccaa-09-organization.json";
import madrid from "@/test/fixtures/community-ccaa-13-organization.json";
import general from "@/test/fixtures/organization.json";
import territories from "@/test/fixtures/territories.json";
import { server } from "@/test/server";

const complete: Record<string, object> = {
  [canarias.territory_id]: canarias,
  [cataluna.territory_id]: cataluna,
  [madrid.territory_id]: madrid,
};

const communityIds = new Set(territories.filter((t) => t.id.startsWith("ccaa-")).map((t) => t.id));

/**
 * Serves the organisation endpoints with answers captured from the real backend: the State's
 * complete chart, the complete ones of Canarias, Cataluña and Madrid and, for every other
 * community, one whose executive cannot be drawn (Andalucía's). A territory that is not a community answers the API's real 404.
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
        const answer = options.community ?? complete[id] ?? andalucia;
        return HttpResponse.json({ ...answer, territory_id: id });
      }
      return HttpResponse.json({ detail: `unknown community ${id}` }, { status: 404 });
    }),
  );
}

import { http, HttpResponse } from "msw";

import caretaker from "@/test/fixtures/community-ccaa-05-governments-2023-06-01.json";
import canarias from "@/test/fixtures/community-ccaa-05-governments.json";
import cataluna from "@/test/fixtures/community-ccaa-09-governments.json";
import canariasIndicators from "@/test/fixtures/community-ccaa-05-indicators.json";
import canariasNews from "@/test/fixtures/community-ccaa-05-news-health.json";
import catalunaNews from "@/test/fixtures/community-ccaa-09-news-health.json";
import unknown from "@/test/fixtures/community-unknown-governments.json";
import territories from "@/test/fixtures/territories.json";
import { server } from "@/test/server";

export type Scenario = "canarias" | "cataluna" | "canarias-caretaker" | "failing";

const GOVERNMENT = { canarias, cataluna, "canarias-caretaker": caretaker } as const;

/**
 * Serves the community endpoints with responses captured from the real backend. Any id
 * other than ccaa-05 (or ccaa-09 for "cataluna") answers the API's real 404.
 */
export function serveCommunity(scenario: Scenario = "canarias"): void {
  const id = scenario === "cataluna" ? "ccaa-09" : "ccaa-05";
  server.use(
    http.get("*/api/territories", () => HttpResponse.json(territories)),
    http.get("*/api/communities/:territoryId/governments", ({ params }) => {
      if (scenario === "failing") return HttpResponse.json({ detail: "boom" }, { status: 500 });
      if (params.territoryId !== id) return HttpResponse.json(unknown, { status: 404 });
      return HttpResponse.json(GOVERNMENT[scenario]);
    }),
    http.get("*/api/communities/:territoryId/indicators", () =>
      HttpResponse.json(canariasIndicators),
    ),
    http.get("*/api/communities/:territoryId/news", ({ params }) =>
      HttpResponse.json(params.territoryId === "ccaa-09" ? catalunaNews : canariasNews),
    ),
  );
}

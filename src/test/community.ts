import { http, HttpResponse } from "msw";

import caretaker from "@/test/fixtures/community-ccaa-05-governments-2023-06-01.json";
import canarias from "@/test/fixtures/community-ccaa-05-governments.json";
import cataluna from "@/test/fixtures/community-ccaa-09-governments.json";
import canariasIndicators from "@/test/fixtures/community-ccaa-05-indicators.json";
import canariasNews from "@/test/fixtures/community-ccaa-05-news-health.json";
import canariasVoters from "@/test/fixtures/community-ccaa-05-voters.json";
import navarraVoters from "@/test/fixtures/community-ccaa-15-voters.json";
import ceutaVoters from "@/test/fixtures/community-ccaa-18-voters.json";
import trees from "@/test/fixtures/community-trees-education.json";
import catalunaNews from "@/test/fixtures/community-ccaa-09-news-health.json";
import parties from "@/test/fixtures/parties.json";
import sectors from "@/test/fixtures/sectors.json";
import tree37 from "@/test/fixtures/story-37-tree.json";
import unknown from "@/test/fixtures/community-unknown-governments.json";
import territories from "@/test/fixtures/territories.json";
import { server } from "@/test/server";

export type Scenario = "canarias" | "cataluna" | "canarias-caretaker" | "failing";

// Canarias has a profile; Navarra, a list without a party (UPN); Ceuta, one municipality: none.
const VOTERS = new Map<string, object>([
  ["ccaa-05", canariasVoters],
  ["ccaa-15", navarraVoters],
  ["ccaa-18", ceutaVoters],
]);

const GOVERNMENT = { canarias, cataluna, "canarias-caretaker": caretaker } as const;

/**
 * Serves the community endpoints with responses captured from the real backend. Any id
 * other than ccaa-05 (or ccaa-09 for "cataluna") answers the API's real 404.
 */
export function serveCommunity(
  scenario: Scenario = "canarias",
  options: {
    failingTree?: boolean;
    failingTrees?: boolean;
    failingSectors?: boolean;
    failingVoters?: boolean;
  } = {},
): void {
  const id = scenario === "cataluna" ? "ccaa-09" : "ccaa-05";
  server.use(
    http.get("*/api/territories", () => HttpResponse.json(territories)),
    http.get("*/api/parties", () => HttpResponse.json(parties)),
    // The pairs of `data/governments/sectors.csv` in the backend (active sectors only).
    http.get("*/api/sectors", () =>
      options.failingSectors
        ? HttpResponse.json({ detail: "boom" }, { status: 500 })
        : HttpResponse.json(sectors),
    ),
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
    http.get("*/api/communities/:territoryId/voters", ({ params }) => {
      if (options.failingVoters) return HttpResponse.json({ detail: "boom" }, { status: 500 });
      const id = String(params.territoryId);
      return VOTERS.has(id)
        ? HttpResponse.json(VOTERS.get(id))
        : HttpResponse.json({ detail: `unknown community ${id}` }, { status: 404 });
    }),
    // Real answer of Madrid in education, served for any community in any sector but Cataluña,
    // which has none.
    http.get("*/api/communities/:territoryId/trees", ({ params }) => {
      if (options.failingTrees) return HttpResponse.json({ detail: "boom" }, { status: 500 });
      return HttpResponse.json(params.territoryId === "ccaa-09" ? { ...trees, items: [] } : trees);
    }),
    http.get("*/api/stories/:storyId/tree", ({ params }) => {
      if (options.failingTree) return HttpResponse.json({ detail: "boom" }, { status: 500 });
      // Story 37 has the real tree; the stories of the trees list (384, 213) are given the same one.
      return ["37", "384", "213"].includes(String(params.storyId))
        ? HttpResponse.json(tree37)
        : HttpResponse.json(
            { detail: `story ${String(params.storyId)} has no relations` },
            { status: 404 },
          );
    }),
  );
}

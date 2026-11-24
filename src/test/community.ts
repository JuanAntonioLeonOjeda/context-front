import { http, HttpResponse } from "msw";

import caretaker from "@/test/fixtures/community-ccaa-05-governments-2023-06-01.json";
import canarias from "@/test/fixtures/community-ccaa-05-governments.json";
import cataluna from "@/test/fixtures/community-ccaa-09-governments.json";
import canariasIndicators from "@/test/fixtures/community-ccaa-05-indicators.json";
import canariasNews from "@/test/fixtures/community-ccaa-05-news-health.json";
import canariasVoters from "@/test/fixtures/community-ccaa-05-voters.json";
import navarraVoters from "@/test/fixtures/community-ccaa-15-voters.json";
import ceutaVoters from "@/test/fixtures/community-ccaa-18-voters.json";
import navarraVotersByEducation from "@/test/fixtures/community-ccaa-15-voters-education.json";
import navarraVotersBySize from "@/test/fixtures/community-ccaa-15-voters-size.json";
import ceutaVotersByEducation from "@/test/fixtures/community-ccaa-18-voters-education.json";
import canariasVotersByAge from "@/test/fixtures/community-ccaa-05-voters-age.json";
import canariasVotersByBornAbroad from "@/test/fixtures/community-ccaa-05-voters-born_abroad.json";
import canariasVotersByEducation from "@/test/fixtures/community-ccaa-05-voters-education.json";
import ceutaVotersByAge from "@/test/fixtures/community-ccaa-18-voters-age.json";
import ceutaVotersByBornAbroad from "@/test/fixtures/community-ccaa-18-voters-born_abroad.json";
import navarraVotersByAge from "@/test/fixtures/community-ccaa-15-voters-age.json";
import navarraVotersByBornAbroad from "@/test/fixtures/community-ccaa-15-voters-born_abroad.json";
import ceutaVotersBySize from "@/test/fixtures/community-ccaa-18-voters-size.json";
import canariasVotersBySize from "@/test/fixtures/community-ccaa-05-voters-size.json";
import trees from "@/test/fixtures/community-trees-education.json";
import catalunaNews from "@/test/fixtures/community-ccaa-09-news-health.json";
import parties from "@/test/fixtures/parties.json";
import relatedByArticle from "@/test/fixtures/articles-related.json";
import unknownArticle from "@/test/fixtures/article-unknown-related.json";
import sectors from "@/test/fixtures/sectors.json";
import tree37 from "@/test/fixtures/story-37-tree.json";
import unknown from "@/test/fixtures/community-unknown-governments.json";
import territories from "@/test/fixtures/territories.json";
import { server } from "@/test/server";

export type Scenario = "canarias" | "cataluna" | "canarias-caretaker" | "failing";

// Canarias has a profile; Navarra, a candidature that is not in the party table (UPN); Ceuta, one municipality: none.
const VOTERS = new Map<string, object>([
  ["ccaa-05", canariasVoters],
  ["ccaa-15", navarraVoters],
  ["ccaa-18", ceutaVoters],
]);
// The same communities by the size of the municipality (`?by=size`).
const VOTERS_BY_SIZE = new Map<string, object>([
  ["ccaa-05", canariasVotersBySize],
  ["ccaa-15", navarraVotersBySize],
  ["ccaa-18", ceutaVotersBySize],
]);
// ... and by the education of their people (`?by=education`).
const VOTERS_BY_EDUCATION = new Map<string, object>([
  ["ccaa-05", canariasVotersByEducation],
  ["ccaa-15", navarraVotersByEducation],
  ["ccaa-18", ceutaVotersByEducation],
]);
// ... and by their age and by their place of birth (`?by=age`, `?by=born_abroad`). Only the
// municipalities of 500 people or more have a value: Navarra has 152 without one.
const VOTERS_BY_AGE = new Map<string, object>([
  ["ccaa-05", canariasVotersByAge],
  ["ccaa-15", navarraVotersByAge],
  ["ccaa-18", ceutaVotersByAge],
]);
const VOTERS_BY_BORN_ABROAD = new Map<string, object>([
  ["ccaa-05", canariasVotersByBornAbroad],
  ["ccaa-15", navarraVotersByBornAbroad],
  ["ccaa-18", ceutaVotersByBornAbroad],
]);
const VOTERS_BY = new Map<string, Map<string, object>>([
  ["income", VOTERS],
  ["size", VOTERS_BY_SIZE],
  ["education", VOTERS_BY_EDUCATION],
  ["age", VOTERS_BY_AGE],
  ["born_abroad", VOTERS_BY_BORN_ABROAD],
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
    failingParties?: boolean;
  } = {},
): void {
  const id = scenario === "cataluna" ? "ccaa-09" : "ccaa-05";
  server.use(
    http.get("*/api/territories", () => HttpResponse.json(territories)),
    http.get("*/api/parties", () =>
      options.failingParties
        ? HttpResponse.json({ detail: "boom" }, { status: 500 })
        : HttpResponse.json(parties),
    ),
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
    // The related news of the articles of the news fixtures, captured from the API (404 otherwise).
    http.get("*/api/articles/:articleId/related", ({ params }) => {
      const found = (relatedByArticle as Record<string, object>)[String(params.articleId)];
      return found ? HttpResponse.json(found) : HttpResponse.json(unknownArticle, { status: 404 });
    }),
    http.get("*/api/communities/:territoryId/voters", ({ params, request }) => {
      if (options.failingVoters) return HttpResponse.json({ detail: "boom" }, { status: 500 });
      const id = String(params.territoryId);
      // The real API defaults to income, but the app always says which one: a request without a
      // known `by` is a bug of the app, and is answered as the real API answers it (422).
      const voters = VOTERS_BY.get(new URL(request.url).searchParams.get("by") ?? "");
      if (voters === undefined) return HttpResponse.json({ detail: "bad `by`" }, { status: 422 });
      return voters.has(id)
        ? HttpResponse.json(voters.get(id))
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

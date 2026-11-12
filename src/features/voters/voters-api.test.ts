import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { serveCommunity } from "@/test/community";
import canarias from "@/test/fixtures/community-ccaa-05-voters.json";
import { server } from "@/test/server";

import { fetchCommunityVoters } from "./voters-api";

describe("fetchCommunityVoters", () => {
  it("maps the election, the income year and the five bands of a community", async () => {
    serveCommunity();

    const voters = await fetchCommunityVoters("ccaa-05");

    expect(voters).toMatchObject({
      electionDay: "2023-07-23",
      incomeYear: 2023,
      shownFromPercent: 3,
      noProfileReason: null,
    });
    expect(voters?.electionSourceUrl).toContain("infoelectoral.interior.gob.es");
    expect(voters?.incomeSourceUrl).toContain("www.ine.es/dyngs/INEbase");
    expect(voters?.profile?.bands.map((b) => b.index)).toEqual([0, 1, 2, 3, 4]);
    // The lowest band of Canarias, as the API answered it: 21 municipalities, 19.7 % of the census.
    expect(voters?.profile?.bands[0]).toMatchObject({
      municipalities: 21,
      censusPercent: 19.7,
      incomeMinEur: 10321,
      incomeMaxEur: 12079,
      blankPercent: 0.9,
    });
  });

  it("keeps the groups and each band's shares in the API's order", async () => {
    serveCommunity();

    const profile = (await fetchCommunityVoters("ccaa-05"))?.profile;

    expect(profile?.groups.map((g) => g.label)).toEqual([
      "CC",
      "NC",
      "PP",
      "PSOE",
      "Sumar",
      "Vox",
      null, // "others": its name is the web's text
    ]);
    expect(profile?.bands[0]?.shares).toEqual([
      { groupId: "coalicion-canaria", percent: 12.5 },
      { groupId: "nueva-canarias", percent: 3.5 },
      { groupId: "pp", percent: 32.7 },
      { groupId: "psoe", percent: 34.7 },
      { groupId: "sumar", percent: 9.1 },
      { groupId: "vox", percent: 5.1 },
      { groupId: "otras", percent: 1.6 },
    ]);
  });

  it("tells a candidature that is not in the party table from a party", async () => {
    serveCommunity();

    const groups = (await fetchCommunityVoters("ccaa-15"))?.profile?.groups;

    expect(groups?.find((g) => g.kind === "candidature")).toEqual({
      id: "lista:U.P.N.",
      kind: "candidature",
      label: "U.P.N.",
    });
  });

  it("has no profile, and the reason, for a community of one municipality", async () => {
    serveCommunity();

    const voters = await fetchCommunityVoters("ccaa-18");

    expect(voters?.profile).toBeNull();
    expect(voters?.noProfileReason).toBe("too_few_municipalities");
  });

  it("is null when the API knows no such community or has no election loaded", async () => {
    serveCommunity();

    expect(await fetchCommunityVoters("ccaa-99")).toBeNull();
  });

  it("throws on any other failure", async () => {
    serveCommunity("canarias", { failingVoters: true });

    await expect(fetchCommunityVoters("ccaa-05")).rejects.toThrow(/answered 500/);
  });

  it("rejects a share of a group the profile does not declare", async () => {
    serveCommunity();
    const [first, ...rest] = canarias.profile.bands;
    if (first === undefined) throw new Error("the fixture has no bands");
    const stray = { ...first, shares: [{ group_id: "fantasma", votes: 1, percent: 0.1 }] };
    server.use(
      http.get("*/api/communities/:territoryId/voters", () =>
        HttpResponse.json({
          ...canarias,
          profile: { ...canarias.profile, bands: [stray, ...rest] },
        }),
      ),
    );

    await expect(fetchCommunityVoters("ccaa-05")).rejects.toThrow(/not in `groups`/);
  });

  it("rejects a response that breaks the contract", async () => {
    serveCommunity();
    server.use(
      http.get("*/api/communities/:territoryId/voters", () =>
        HttpResponse.json({ ...canarias, no_profile_reason: "because" }),
      ),
    );

    await expect(fetchCommunityVoters("ccaa-05")).rejects.toThrow();
  });
});

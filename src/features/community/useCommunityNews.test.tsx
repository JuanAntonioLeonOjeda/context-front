import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { serveCommunity } from "@/test/community";
import { queryWrapper } from "@/test/query";
import { server } from "@/test/server";

import type { Sector } from "./news-api";
import { useCommunityNews } from "./useCommunityNews";

describe("useCommunityNews", () => {
  it("loads the news of a community and sector, newest first as the API sends them", async () => {
    serveCommunity();

    const { result } = renderHook(() => useCommunityNews("ccaa-05", "health"), {
      wrapper: queryWrapper(),
    });

    expect(result.current.state).toBe("loading");
    await waitFor(() => {
      expect(result.current.state).toBe("ready");
    });
    if (result.current.state !== "ready") throw new Error("not ready");
    const { since, items } = result.current.news;
    expect(since).toBe("2026-09-15");
    expect(items).toHaveLength(11);
    const times = items.map((i) => i.publishedAt);
    expect(times).toEqual([...times].sort().reverse());
  });

  it("maps the attribution: parties and basis when high, the reason when not determined", async () => {
    serveCommunity();
    const { result } = renderHook(() => useCommunityNews("ccaa-05", "health"), {
      wrapper: queryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state).toBe("ready");
    });
    if (result.current.state !== "ready") throw new Error("not ready");
    const entries = result.current.news.items.flatMap((i) => i.attribution);
    const high = entries.find((a) => a.confidence === "high");
    const undetermined = entries.find((a) => a.confidence === "not_determined");
    expect(high).toMatchObject({ level: "ccaa", partyIds: ["coalicion-canaria", "pp"] });
    expect(high?.competences[0]?.legalBasis).toBeTruthy();
    expect(high?.reason).toBeNull();
    expect(undetermined).toMatchObject({ reason: "no_level_named", partyIds: [] });
  });

  it("never carries a lead: the mapped items hold only headline, link, date and attribution", async () => {
    serveCommunity();
    const { result } = renderHook(() => useCommunityNews("ccaa-05", "health"), {
      wrapper: queryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state).toBe("ready");
    });
    if (result.current.state !== "ready") throw new Error("not ready");
    expect(Object.keys(result.current.news.items[0] ?? {}).sort()).toEqual([
      "attribution",
      "headline",
      "outletId",
      "outletName",
      "publishedAt",
      "url",
    ]);
  });

  it("is ready with no items for a sector without news", async () => {
    serveCommunity("cataluna");

    const { result } = renderHook(() => useCommunityNews("ccaa-09", "health"), {
      wrapper: queryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state).toBe("ready");
    });
    if (result.current.state !== "ready") throw new Error("not ready");
    expect(result.current.news.items).toEqual([]);
  });

  it("asks for the sector it was given and caches each sector apart", async () => {
    const asked: (string | null)[] = [];
    server.use(
      http.get("*/api/communities/:territoryId/news", ({ request }) => {
        const sector = new URL(request.url).searchParams.get("sector");
        asked.push(sector);
        return HttpResponse.json({
          territory_id: "ccaa-05",
          sector_id: sector,
          since: "2026-09-15",
          items: [],
        });
      }),
    );
    interface Props {
      sector: Sector;
    }

    const { result, rerender } = renderHook(
      ({ sector }: Props) => useCommunityNews("ccaa-05", sector),
      { wrapper: queryWrapper(), initialProps: { sector: "housing" } },
    );
    await waitFor(() => {
      expect(result.current.state).toBe("ready");
    });
    rerender({ sector: "health" });
    await waitFor(() => {
      expect(asked).toEqual(["housing", "health"]);
    });
    rerender({ sector: "housing" });

    // Back to a sector already loaded: answered from the cache, no third request.
    expect(result.current.state).toBe("ready");
    expect(asked).toEqual(["housing", "health"]);
  });

  it("is an error when the API fails, and recovers on retry", async () => {
    server.use(
      http.get("*/api/communities/:territoryId/news", () =>
        HttpResponse.json({ detail: "boom" }, { status: 500 }),
      ),
    );
    const { result } = renderHook(() => useCommunityNews("ccaa-05", "health"), {
      wrapper: queryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state).toBe("error");
    });
    serveCommunity();
    if (result.current.state === "error") result.current.retry();

    await waitFor(() => {
      expect(result.current.state).toBe("ready");
    });
  });

  it("is an error when the response does not match the contract", async () => {
    server.use(
      http.get("*/api/communities/:territoryId/news", () =>
        HttpResponse.json({ territory_id: "ccaa-05", items: [{ headline: 3 }] }),
      ),
    );

    const { result } = renderHook(() => useCommunityNews("ccaa-05", "health"), {
      wrapper: queryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state).toBe("error");
    });
  });
});

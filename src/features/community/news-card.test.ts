import { describe, expect, it } from "vitest";

import type { NewsItem } from "./news-api";
import { formatNewsTime, groupByDay, newsDay, newsRows } from "./news-card";

function item(publishedAt = "2026-10-14T09:44:08Z"): NewsItem {
  return {
    outletId: "rtvc",
    outletName: "Radio Televisión Canaria",
    headline: "Un titular",
    url: "https://rtvc.es/1",
    publishedAt,
    treeStoryId: null,
  };
}

describe("newsRows", () => {
  it("gives outlet and time in Spain, headline and link, and nothing about a party", () => {
    const [row] = newsRows([item()]);

    expect(row).toEqual({
      key: "https://rtvc.es/1",
      day: "2026-10-14",
      outlet: "Radio Televisión Canaria, 11:44",
      headline: "Un titular",
      url: "https://rtvc.es/1",
      treeStoryId: null,
    });
  });
});

describe("the day and the hour in Spain", () => {
  it("is the Spanish calendar day, not the UTC one", () => {
    // 23:30 UTC on the 13th is already the 14th in Spain (CEST, UTC+2).
    expect(newsDay("2026-10-13T23:30:00Z")).toBe("2026-10-14");
    expect(formatNewsTime("2026-10-13T23:30:00Z")).toBe("01:30");
  });

  it("follows winter time too (UTC+1)", () => {
    expect(formatNewsTime("2026-12-01T08:05:00Z")).toBe("09:05");
  });

  it("refuses something that is not an instant", () => {
    expect(() => newsDay("ayer")).toThrow(/not an ISO instant/);
  });
});

describe("groupByDay", () => {
  const at = (publishedAt: string): ReturnType<typeof newsRows>[number] =>
    newsRows([item(publishedAt)])[0] as never;

  it("groups consecutive rows of the same day and keeps the order it was given", () => {
    const rows = [
      at("2026-10-14T09:00:00Z"),
      at("2026-10-14T07:00:00Z"),
      at("2026-10-13T20:00:00Z"),
    ];

    const days = groupByDay(rows);

    expect(days.map((d) => [d.day, d.rows.length])).toEqual([
      ["2026-10-14", 2],
      ["2026-10-13", 1],
    ]);
    expect(days[0]?.label).toBe("14 de octubre de 2026");
  });

  it("puts an article published just after midnight in Spain on the new day", () => {
    const [day] = groupByDay([at("2026-10-13T22:30:00Z")]);

    expect(day?.day).toBe("2026-10-14");
  });
});

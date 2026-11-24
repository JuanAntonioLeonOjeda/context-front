import { describe, expect, it } from "vitest";

import { emptyText, methodText, relatedDays } from "./related-news";

describe("relatedDays", () => {
  it("writes the outlet and time in Spain, and the similarity with two decimals", () => {
    const [day] = relatedDays([
      {
        day: "2026-11-05",
        items: [
          {
            articleId: 7,
            outletName: "La Razón",
            headline: "Quién es Cristian Corvillo",
            url: "https://www.larazon.es/7",
            publishedAt: "2026-11-05T12:00:00Z",
            similarity: 0.8,
          },
        ],
      },
    ]);

    expect(day?.label).toBe("5 de noviembre de 2026");
    expect(day?.items[0]).toEqual({
      key: "7",
      outlet: "La Razón, 13:00",
      headline: "Quién es Cristian Corvillo",
      url: "https://www.larazon.es/7",
      similarity: "parecido: 0,80",
    });
  });
});

describe("the texts that carry the API's numbers", () => {
  it("names the window and the days the API used", () => {
    expect(emptyText(10)).toBe(
      "No hay noticias anteriores lo bastante parecidas en los 10 días previos.",
    );
    expect(methodText(6)).toContain("y así hasta 6 días.");
  });
});

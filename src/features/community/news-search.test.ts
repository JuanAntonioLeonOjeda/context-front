import { describe, expect, it } from "vitest";

import { matchesQuery } from "./news-search";

describe("matchesQuery", () => {
  it("matches everything when nothing is typed", () => {
    expect(matchesQuery("", "A headline")).toBe(true);
    expect(matchesQuery("   ", "A headline")).toBe(true);
  });

  it("ignores case and accents in both the query and the texts", () => {
    expect(matchesQuery("educacion", "Huelga de Educación")).toBe(true);
    expect(matchesQuery("EDUCACIÓN", "huelga de educacion")).toBe(true);
  });

  it("needs every word, in any order and in any of the texts", () => {
    expect(matchesQuery("huelga abc", "Huelga de profesores", "ABC, 11:44")).toBe(true);
    expect(matchesQuery("abc huelga", "Huelga de profesores", "ABC, 11:44")).toBe(true);
    expect(matchesQuery("huelga sanidad", "Huelga de profesores", "ABC, 11:44")).toBe(false);
  });

  it("finds a part of a word", () => {
    expect(matchesQuery("profes", "Huelga de profesores")).toBe(true);
  });
});

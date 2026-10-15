import { describe, expect, it } from "vitest";

import { searchWith } from "./search-params";

describe("searchWith", () => {
  it("sets a parameter and keeps the others", () => {
    expect(searchWith(new URLSearchParams("a=1&sector=health"), { sector: "housing" })).toBe(
      "?a=1&sector=housing",
    );
  });

  it("adds a parameter that was not there", () => {
    expect(searchWith(new URLSearchParams(), { sector: "education" })).toBe("?sector=education");
  });

  it("does not change the params it is given", () => {
    const params = new URLSearchParams("sector=health");

    searchWith(params, { sector: "housing" });

    expect(params.get("sector")).toBe("health");
  });
});

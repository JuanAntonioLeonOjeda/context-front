import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { THEME_KEY } from "./theme";

describe("the theme key", () => {
  it("is the same in index.html, which applies it before the first paint, and in theme.ts", () => {
    expect(readFileSync("index.html", "utf8")).toContain(`localStorage.getItem("${THEME_KEY}")`);
  });
});

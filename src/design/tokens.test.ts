import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { contrastRatio } from "@/design/contrast";

// Read from disk (tests run from the repo root): Vitest does not return the text of a
// stylesheet import, and jsdom replaces the URL class that `import.meta.url` needs.
const tokensCss = readFileSync("src/design/tokens.css", "utf8");

type Theme = Record<string, string>;

/** Custom properties declared in the first `{ ... }` block that follows `selector`. */
function tokensOf(selector: string): Theme {
  const start = tokensCss.indexOf(selector);
  if (start < 0) throw new Error(`selector not found in tokens.css: ${selector}`);
  const body = tokensCss.slice(tokensCss.indexOf("{", start) + 1, tokensCss.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1] ?? "", (m[2] ?? "").trim()]),
  );
}

const light = tokensOf(":root {");
const dark = tokensOf(':root[data-theme="dark"]');
const darkBySystem = tokensOf(':root:not([data-theme="light"])');

const COLOUR_NAMES = Object.keys(light).filter((name) => name.startsWith("--color-"));

function pair(theme: Theme, foreground: string, background: string): number {
  return contrastRatio(theme[foreground] ?? "", theme[background] ?? "");
}

describe("design tokens", () => {
  it("define the same colour tokens in light and dark", () => {
    expect(
      Object.keys(dark)
        .filter((n) => n.startsWith("--color-"))
        .sort(),
    ).toEqual([...COLOUR_NAMES].sort());
  });

  it("keep the system-dark block identical to the explicit dark block", () => {
    expect(darkBySystem).toEqual(dark);
  });

  describe.each([
    ["light", light],
    ["dark", dark],
  ] as const)("%s theme contrast (WCAG 2.2 AA)", (_name, theme) => {
    it.each([
      ["text", "--color-text", "--color-bg", 4.5],
      ["text on a surface", "--color-text", "--color-surface", 4.5],
      ["muted text", "--color-text-muted", "--color-bg", 4.5],
      ["muted text on a surface", "--color-text-muted", "--color-surface", 4.5],
      ["links", "--color-accent", "--color-bg", 4.5],
      ["links on a surface", "--color-accent", "--color-surface", 4.5],
      ["text on the accent colour", "--color-on-accent", "--color-accent", 4.5],
      ["error text", "--color-danger", "--color-danger-surface", 4.5],
      ["focus ring", "--color-focus", "--color-bg", 3],
      ["focus ring on a surface", "--color-focus", "--color-surface", 3],
      ["control borders", "--color-border-strong", "--color-bg", 3],
      ["control borders on a surface", "--color-border-strong", "--color-surface", 3],
    ])("%s", (_label, foreground, background, minimum) => {
      expect(pair(theme, foreground, background)).toBeGreaterThanOrEqual(minimum);
    });
  });
});

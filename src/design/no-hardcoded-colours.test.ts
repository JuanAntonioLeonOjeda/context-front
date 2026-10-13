import { describe, expect, it } from "vitest";

// "No inline colours or sizes: tokens from src/design/" (code-style.md). Colours are
// declared in src/design/ (tokens.css, and parties.ts for parties) and nowhere else.
const sources = import.meta.glob<string>(
  ["/src/**/*.{ts,tsx,css}", "!/src/design/**", "!/src/**/*.test.*"],
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

const COLOUR = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;

describe("colours", () => {
  it("are declared only in src/design/", () => {
    const offenders = Object.entries(sources)
      .filter(([, content]) => COLOUR.test(content))
      .map(([path]) => path);

    expect(Object.keys(sources).length).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});

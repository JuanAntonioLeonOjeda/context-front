import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// "No inline colours or sizes: tokens from src/design/" (code-style.md). Colours are
// declared in src/design/ (tokens.css, and parties.ts for parties) and nowhere else.
// Read from disk, not with import.meta.glob: Vite returns no text for CSS Modules.
function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "design" ? [] : sourceFiles(path);
    return /\.(ts|tsx|css)$/.test(entry.name) && !entry.name.includes(".test.") ? [path] : [];
  });
}

const COLOUR = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;

describe("colours", () => {
  it("are declared only in src/design/", () => {
    const files = sourceFiles("src");
    const offenders = files.filter((path) => COLOUR.test(readFileSync(path, "utf8")));

    expect(files.length).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });

  it("scans stylesheets of components too", () => {
    expect(sourceFiles("src").some((path) => path.endsWith(".module.css"))).toBe(true);
  });
});

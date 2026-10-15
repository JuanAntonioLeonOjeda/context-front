import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

// Read from disk, as tokens.test.ts does: Vitest does not return the text of a stylesheet.
const baseCss = readFileSync("src/design/base.css", "utf8");

/** The `scroll-padding-top` values declared on `html`, in rem, in the order they appear. */
function scrollPaddings(): number[] {
  return [...baseCss.matchAll(/scroll-padding-top:\s*([\d.]+)rem/g)].map((m) => Number(m[1]));
}

describe("base styles", () => {
  it("leave room at the top for the sticky header, so it never covers the focus (WCAG 2.4.11)", () => {
    const [phone, wide] = scrollPaddings();

    // The header is two rows of 2.75rem plus padding on a phone, and one row from 40rem.
    expect(phone).toBeGreaterThanOrEqual(6.5);
    expect(wide).toBeGreaterThanOrEqual(4);
  });
});

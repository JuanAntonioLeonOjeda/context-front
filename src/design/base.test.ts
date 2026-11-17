import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

// Read from disk, as tokens.test.ts does: Vitest does not return the text of a stylesheet.
const baseCss = readFileSync("src/design/base.css", "utf8");
const headingCss = readFileSync("src/features/shell/SectionHeading.module.css", "utf8");
const grayCss = [
  "src/features/community/CommunityCard.module.css",
  "src/features/voters/VotersSection.module.css",
].map((path) => readFileSync(path, "utf8"));

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

  it("gives every section title the same gray, and the four sections the same gray texts", () => {
    expect(headingCss).toMatch(/\.sectionToggle \{[^}]*color: var\(--color-text-gray\)/);
    for (const css of grayCss) {
      expect(css).toMatch(/--color-text-muted: var\(--color-text-gray\)/);
    }
  });
});

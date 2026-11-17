import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

// Read from disk, as tokens.test.ts does: Vitest does not return the text of a stylesheet.
const baseCss = readFileSync("src/design/base.css", "utf8");
const headingCss = readFileSync("src/features/shell/SectionHeading.module.css", "utf8");
const cardCss = readFileSync("src/features/community/CommunityCard.module.css", "utf8");
const votersCss = readFileSync("src/features/voters/VotersSection.module.css", "utf8");
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

  it("draws the tabs of the voter profile and the news sectors as capsules, the current one filled", () => {
    for (const [css, tab, current] of [
      [votersCss, /\.dimensions button \{/, /\.dimensions button\[aria-pressed="true"\] \{/],
      [cardCss, /\.sectors a \{/, /\.sectors a\[aria-current="page"\] \{/],
    ] as const) {
      expect(css).toMatch(tab);
      expect(css).toMatch(current);
      expect(css).toContain("border-radius: 999px");
      const filled = css.slice(css.search(current));
      expect(filled).toMatch(
        /^[^}]*background: var\(--color-accent\)[^}]*color: var\(--color-on-accent\)/,
      );
    }
  });

  it("lets the figure above a bar wrap on a phone, with its two lines reserved, so seven columns do not touch", () => {
    const phone = votersCss.slice(votersCss.indexOf("@media (max-width: 26rem)"));

    expect(phone).toMatch(/\.barValue \{[^}]*white-space: normal[^}]*min-block-size: 2\.2em/);
  });
});

import axe from "axe-core";

/**
 * Accessibility violations of a rendered container (WCAG 2.2 A and AA rules).
 *
 * `axe-core` is called directly; `vitest-axe` is unmaintained since 2022. jsdom does not
 * compute colours, so contrast is checked on the design tokens, not here.
 */
export async function axeViolations(container: Element): Promise<axe.Result[]> {
  const results = await axe.run(container, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    rules: { "color-contrast": { enabled: false } },
  });
  return results.violations;
}

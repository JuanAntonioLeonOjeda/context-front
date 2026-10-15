import { describe, expect, it } from "vitest";

import { contrastRatio } from "@/design/contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for the same colour", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });

  it("does not depend on which colour is the foreground", () => {
    expect(contrastRatio("#0b5cad", "#ffffff")).toBe(contrastRatio("#ffffff", "#0b5cad"));
  });

  it("matches a known value: #767676 on white is about 4.54, the AA limit for text", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });

  it("rejects anything that is not #rrggbb", () => {
    expect(() => contrastRatio("red", "#ffffff")).toThrow("#rrggbb");
  });
});

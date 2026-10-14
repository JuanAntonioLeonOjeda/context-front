import { describe, expect, it } from "vitest";

import { formatMessage, listInSpanish } from "@/i18n/format";

describe("formatMessage", () => {
  it("fills every placeholder", () => {
    expect(
      formatMessage("{community}: gobierna {parties}", { community: "Galicia", parties: "PP" }),
    ).toBe("Galicia: gobierna PP");
  });

  it("refuses a placeholder without a value", () => {
    expect(() =>
      formatMessage("{community}: gobierna {parties}", { community: "Galicia" }),
    ).toThrow("missing value for {parties}");
  });
});

describe("listInSpanish", () => {
  it("joins one, two and three items as Spanish does, keeping the order", () => {
    expect(listInSpanish(["PP"])).toBe("PP");
    expect(listInSpanish(["CC", "PP"])).toBe("CC y PP");
    expect(listInSpanish(["Contigo-Zurekin", "Geroa Bai", "PSOE"])).toBe(
      "Contigo-Zurekin, Geroa Bai y PSOE",
    );
  });
});

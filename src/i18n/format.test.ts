import { describe, expect, it } from "vitest";

import { formatLongDate, formatMessage, listInSpanish } from "@/i18n/format";

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

describe("formatLongDate", () => {
  it("writes a calendar day in Spanish, whatever the local time zone", () => {
    expect(formatLongDate("2026-10-14")).toBe("14 de octubre de 2026");
    expect(formatLongDate("2026-01-01")).toBe("1 de enero de 2026");
  });

  it("refuses something that is not a date", () => {
    expect(() => formatLongDate("hoy")).toThrow("not an ISO date");
  });
});

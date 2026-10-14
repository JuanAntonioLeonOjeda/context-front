import { describe, expect, it } from "vitest";

import { es } from "@/i18n/es";

function leaves(node: unknown, path: string[] = []): [string, unknown][] {
  if (typeof node === "object" && node !== null) {
    return Object.entries(node).flatMap(([key, value]) => leaves(value, [...path, key]));
  }
  return [[path.join("."), node]];
}

describe("es", () => {
  it("has only non-empty strings, under keys of the form feature.screen.element", () => {
    const all = leaves(es);

    expect(all.length).toBeGreaterThan(0);
    for (const [key, value] of all) {
      expect(typeof value, key).toBe("string");
      expect((value as string).trim(), key).not.toBe("");
      expect(key.split("."), key).toHaveLength(3);
    }
  });
});

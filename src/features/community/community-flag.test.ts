import { describe, expect, it } from "vitest";

import { flagUrl } from "./community-flag";

describe("flagUrl", () => {
  it("has a flag for each of the 19 territories", () => {
    for (let n = 1; n <= 19; n++) {
      expect(flagUrl(`ccaa-${String(n).padStart(2, "0")}`)).not.toBeNull();
    }
  });

  it("has none for a territory that does not exist", () => {
    expect(flagUrl("ccaa-99")).toBeNull();
  });
});

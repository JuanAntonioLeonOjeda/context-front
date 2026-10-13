import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { fetchHealth } from "@/features/health/health";
import healthDown from "@/test/fixtures/health-down.json";
import healthUp from "@/test/fixtures/health-up.json";
import { server } from "@/test/server";

// The fixtures are real responses captured from the backend (database up, then stopped).
describe("fetchHealth", () => {
  it("is up when the backend answers 200 with the database up", async () => {
    server.use(http.get("*/api/health", () => HttpResponse.json(healthUp)));

    expect(await fetchHealth()).toEqual({ status: "up" });
  });

  it("is database-down on the documented 503 with the database down", async () => {
    server.use(http.get("*/api/health", () => HttpResponse.json(healthDown, { status: 503 })));

    expect(await fetchHealth()).toEqual({ status: "database-down" });
  });

  it("is unreachable when the request fails", async () => {
    server.use(http.get("*/api/health", () => HttpResponse.error()));

    expect(await fetchHealth()).toEqual({ status: "unreachable" });
  });

  it("is unreachable when the answer is not the contract, never up", async () => {
    server.use(http.get("*/api/health", () => HttpResponse.json({ database: "maybe" })));
    expect(await fetchHealth()).toEqual({ status: "unreachable" });

    server.use(
      http.get("*/api/health", () => new HttpResponse("<html>Bad gateway</html>", { status: 502 })),
    );
    expect(await fetchHealth()).toEqual({ status: "unreachable" });
  });
});

import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { useHealth } from "@/features/health";
import healthDown from "@/test/fixtures/health-down.json";
import healthUp from "@/test/fixtures/health-up.json";
import { queryWrapper } from "@/test/query";
import { server } from "@/test/server";

describe("useHealth", () => {
  it("starts checking and then reports what the backend said", async () => {
    server.use(http.get("*/api/health", () => HttpResponse.json(healthUp)));

    const { result } = renderHook(() => useHealth(), { wrapper: queryWrapper() });

    expect(result.current).toEqual({ state: "checking" });
    await waitFor(() => {
      expect(result.current).toEqual({ state: "known", health: { status: "up" } });
    });
  });

  it("reports a database that is down as a known state, not as an error", async () => {
    server.use(http.get("*/api/health", () => HttpResponse.json(healthDown, { status: 503 })));

    const { result } = renderHook(() => useHealth(), { wrapper: queryWrapper() });

    await waitFor(() => {
      expect(result.current).toEqual({ state: "known", health: { status: "database-down" } });
    });
  });
});

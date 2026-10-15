import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { useGovernmentMap } from "@/features/map";
import { serveMapData } from "@/test/map";
import { queryWrapper } from "@/test/query";
import { server } from "@/test/server";

describe("useGovernmentMap", () => {
  it("loads the four responses into one ready state", async () => {
    serveMapData();

    const { result } = renderHook(() => useGovernmentMap(), { wrapper: queryWrapper() });

    expect(result.current.state).toBe("loading");
    await waitFor(() => {
      expect(result.current.state).toBe("ready");
    });
    if (result.current.state !== "ready") throw new Error("not ready");
    expect(result.current.caption).toBe("Gobiernos autonómicos a 14 de octubre de 2026");
    expect(result.current.looks.size).toBe(19);
    expect(result.current.layout.communities).toHaveLength(19);
    expect(result.current.attribution).toContain("ign.es");
  });

  it("is an error when any of the responses fails, and recovers on retry", async () => {
    serveMapData(["/parties"]);
    const { result } = renderHook(() => useGovernmentMap(), { wrapper: queryWrapper() });

    await waitFor(() => {
      expect(result.current.state).toBe("error");
    });
    serveMapData();
    if (result.current.state === "error") result.current.retry();

    await waitFor(() => {
      expect(result.current.state).toBe("ready");
    });
  });

  it("is an error when a response does not match the contract", async () => {
    serveMapData();
    server.use(http.get("*/api/map/governments", () => HttpResponse.json({ date: "hoy" })));

    const { result } = renderHook(() => useGovernmentMap(), { wrapper: queryWrapper() });

    await waitFor(() => {
      expect(result.current.state).toBe("error");
    });
  });
});

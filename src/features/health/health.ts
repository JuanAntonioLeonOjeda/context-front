import { z } from "zod";

import { api } from "@/api/client";

/** What the app knows about its backend. A failure to answer is a state, not an exception. */
export type Health = { status: "up" } | { status: "database-down" } | { status: "unreachable" };

// The body is checked at the edge: the backend answers 200 or 503 with `{"database": ...}`.
const body = z.object({ database: z.enum(["up", "down"]) });

export async function fetchHealth(): Promise<Health> {
  let result;
  try {
    result = await api.GET("/health");
  } catch {
    // Network failure, CORS or a proxy that cannot reach the backend.
    return { status: "unreachable" };
  }
  // 200 arrives as `data`, the documented 503 as `error`; both carry the same body.
  const parsed = body.safeParse(result.data ?? result.error);
  if (!parsed.success) {
    // A reply that is not the contract (a gateway page, an old backend) is not "up".
    return { status: "unreachable" };
  }
  return parsed.data.database === "up" ? { status: "up" } : { status: "database-down" };
}

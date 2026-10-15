import createClient from "openapi-fetch";

import { apiBaseUrl } from "@/api/config";
import type { paths } from "@/api/schema";

/**
 * The only way the app reaches the backend (.claude/rules/architecture.md). Typed from the
 * OpenAPI contract by `pnpm api:generate`; imported by hooks, never by components.
 */
export const api = createClient<paths>({
  baseUrl: apiBaseUrl,
  // `fetch` is read on every call, not captured when the client is created: tests patch
  // `globalThis.fetch` (MSW) after this module has been imported, and a captured copy would
  // bypass the patch and reach the real network.
  fetch: (request) => globalThis.fetch(request),
});

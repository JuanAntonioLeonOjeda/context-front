import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@/test/server";

// jsdom does not scroll and reports window.scrollTo as not implemented; ScrollRestoration calls
// it on every navigation. A stand-in that tests can spy on.
window.scrollTo = () => undefined;

// Every request must be answered by a handler: an unknown one fails the test.
beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => {
  server.close();
});

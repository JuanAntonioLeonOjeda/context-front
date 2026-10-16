import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@/test/server";

// jsdom does not scroll and reports window.scrollTo as not implemented; ScrollRestoration calls
// it on every navigation. A stand-in that tests can spy on.
window.scrollTo = () => undefined;

// jsdom has no modal <dialog>: the stand-ins only open and close it, and fire "close" as browsers do.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function close() {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};

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

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

// jsdom has no popovers: the stand-ins open and close one, fire "beforetoggle" and "toggle" with
// their `newState` as browsers do, and let a `popovertarget` button work them.
function setPopover(element: HTMLElement, open: boolean): void {
  if (element.hasAttribute("data-popover-open") === open) return;
  const newState = open ? "open" : "closed";
  element.dispatchEvent(Object.assign(new Event("beforetoggle"), { newState }));
  element.toggleAttribute("data-popover-open", open);
  element.dispatchEvent(Object.assign(new Event("toggle"), { newState }));
}
HTMLElement.prototype.showPopover = function showPopover() {
  setPopover(this, true);
};
HTMLElement.prototype.hidePopover = function hidePopover() {
  setPopover(this, false);
};
HTMLElement.prototype.togglePopover = function togglePopover() {
  const open = !this.hasAttribute("data-popover-open");
  setPopover(this, open);
  return open;
};
// jsdom hides every popover (its `:popover-open` never matches): an open one is shown again.
const popoverStyle = document.createElement("style");
popoverStyle.textContent = "[popover][data-popover-open] { display: block !important; }";
document.head.append(popoverStyle);
document.addEventListener("click", (event) => {
  const invoker = (event.target as Element | null)?.closest("[popovertarget]");
  const target = document.getElementById(invoker?.getAttribute("popovertarget") ?? "");
  if (invoker === null || invoker === undefined || target === null) return;
  const action = invoker.getAttribute("popovertargetaction") ?? "toggle";
  if (action === "toggle") target.togglePopover();
  else setPopover(target, action === "show");
});

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

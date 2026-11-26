import { useEffect, useId, useRef, useState } from "react";

import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import styles from "./InfoButton.module.css";

const GUTTER_PX = 16; // the page's side gutter at phone width
const GAP_PX = 8; // between the button and the box
const WIDTH_PX = 384; // 24rem, the box's width where it fits

/**
 * The explanations of a view (how to read it, how it is made), behind an "i" button: a box opens
 * next to the button, over the page, without darkening or blocking it. It is a native popover:
 * the button opens and closes it (`popovertarget`, which also gives the button its expanded
 * state), Escape or a click outside closes it, and after the button the Tab key goes into it. It
 * is placed by coordinates, so it closes when the page scrolls instead of drifting away from its
 * button. The sources are not put here: they stay visible next to their data.
 */
export function InfoButton(props: { topic: string; children: React.ReactNode }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();
  const boxId = `info-${id}`;
  const titleId = `info-title-${id}`;

  useEffect(() => {
    const element = box.current;
    if (element === null) return;
    const beforeToggle = (event: Event): void => {
      if (isOpening(event) && button.current !== null) place(element, button.current);
    };
    const toggle = (event: Event): void => {
      setOpen(isOpening(event));
    };
    element.addEventListener("beforetoggle", beforeToggle);
    element.addEventListener("toggle", toggle);
    return () => {
      element.removeEventListener("beforetoggle", beforeToggle);
      element.removeEventListener("toggle", toggle);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (): void => {
      box.current?.hidePopover();
    };
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        className={styles.infoButton}
        aria-label={formatMessage(es.app.shell.info.open, { topic: props.topic })}
        popoverTarget={boxId}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 11v6M12 7.5v.01" />
        </svg>
      </button>
      <div
        ref={box}
        id={boxId}
        popover="auto"
        role="dialog"
        aria-labelledby={titleId}
        className={styles.box}
      >
        {open && (
          <>
            <div className={styles.header}>
              <h2 id={titleId}>{props.topic}</h2>
              <button
                type="button"
                className={styles.close}
                aria-label={es.app.shell.info.close}
                popoverTarget={boxId}
                popoverTargetAction="hide"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className={styles.body}>{props.children}</div>
          </>
        )}
      </div>
    </>
  );
}

function isOpening(event: Event): boolean {
  return "newState" in event && event.newState === "open";
}

/** Next to the button: below it, or above when the button is low on the screen; never past the
 *  sides of the window, and no taller than the room left, scrolling inside if it must. */
function place(element: HTMLElement, anchor: HTMLElement): void {
  const rect = anchor.getBoundingClientRect();
  const width = Math.min(WIDTH_PX, window.innerWidth - 2 * GUTTER_PX);
  const left = Math.min(Math.max(rect.left, GUTTER_PX), window.innerWidth - width - GUTTER_PX);
  const below = rect.bottom < window.innerHeight * 0.6;
  Object.assign(element.style, {
    left: `${String(left)}px`,
    width: `${String(width)}px`,
    top: below ? `${String(rect.bottom + GAP_PX)}px` : "auto",
    bottom: below ? "auto" : `${String(window.innerHeight - rect.top + GAP_PX)}px`,
    maxHeight: `${String(
      (below ? window.innerHeight - rect.bottom : rect.top) - GAP_PX - GUTTER_PX,
    )}px`,
  });
}

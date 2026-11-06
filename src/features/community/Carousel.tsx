import { useCallback, useEffect, useRef, useState } from "react";

import { es } from "@/i18n/es";

import styles from "./Carousel.module.css";

interface Edges {
  overflow: boolean; // more content than fits: only then are the arrows shown
  atStart: boolean;
  atEnd: boolean;
}

const FITS: Edges = { overflow: false, atStart: true, atEnd: true };

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

/**
 * A row that scrolls sideways when its cards do not fit. The row itself is a focusable region
 * (the keyboard scrolls it with the arrow keys) and snaps card by card; the buttons appear only
 * when there is something to scroll to, and a disabled one says that an end was reached. The next
 * card is left peeking, so a reader sees that there is more without being told.
 */
export function Carousel(props: {
  heading: React.ReactNode;
  label: string;
  /** What the arrows say; the indicators' by default. */
  buttonLabels?: { previous: string; next: string };
  children: React.ReactNode;
}): React.JSX.Element {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edges>(FITS);
  const carousel = props.buttonLabels ?? es.community.indicators.carousel;

  const measure = useCallback(() => {
    const el = track.current;
    if (el === null) return;
    setEdges({
      overflow: el.scrollWidth > el.clientWidth + 1,
      atStart: el.scrollLeft <= 1,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (el === null || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [measure]);

  function move(direction: 1 | -1): void {
    const el = track.current;
    if (el === null) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.9,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.head}>
        {props.heading}
        {edges.overflow && (
          <div className={styles.buttons}>
            <button
              type="button"
              aria-label={carousel.previous}
              disabled={edges.atStart}
              onClick={() => {
                move(-1);
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="m15 5-7 7 7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label={carousel.next}
              disabled={edges.atEnd}
              onClick={() => {
                move(1);
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="m9 5 7 7-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div
        ref={track}
        className={styles.track}
        role="region"
        aria-label={props.label}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a region that scrolls must take focus, or the keyboard cannot scroll it (WCAG 2.1.1; axe: scrollable-region-focusable)
        tabIndex={0}
        onScroll={measure}
      >
        {props.children}
      </div>
    </div>
  );
}

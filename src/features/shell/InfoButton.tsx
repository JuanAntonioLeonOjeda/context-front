import { useEffect, useId, useRef, useState } from "react";

import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import styles from "./InfoButton.module.css";

/**
 * The explanations of a view (how to read it, how it is made), behind an "i" button that opens
 * them in a modal window, so the screen keeps the data and the controls. The button's name says
 * what it opens; the dialog is native: it traps the focus, Escape closes it and the focus goes
 * back to the button. The sources are not put here: they stay visible next to their data.
 */
export function InfoButton(props: { topic: string; children: React.ReactNode }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const title = formatMessage(es.app.shell.info.open, { topic: props.topic });

  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.infoButton}
        aria-label={title}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen(true);
        }}
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
      {open && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- the keyboard way to close is native Escape and the Close button
        <dialog
          ref={dialog}
          className={styles.dialog}
          aria-labelledby={titleId}
          onClose={() => {
            setOpen(false);
          }}
          // Escape closes it by itself (keyboard); the click on the backdrop is the pointer's extra.
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
        >
          <div className={styles.header}>
            <h2 id={titleId}>{props.topic}</h2>
            <button type="button" onClick={() => dialog.current?.close()}>
              {es.app.shell.info.close}
            </button>
          </div>
          <div className={styles.body}>{props.children}</div>
        </dialog>
      )}
    </>
  );
}

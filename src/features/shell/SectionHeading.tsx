import { InfoButton } from "./InfoButton";

import styles from "./SectionHeading.module.css";

/**
 * The title of a section that can be closed and opened again: the heading holds the button, so
 * the section is still found by its heading and the state is on the control (`aria-expanded`),
 * not in an icon alone. With `info`, an "i" button beside the title opens the section's
 * explanations in a modal; it sits outside the heading, so the heading's name stays the title.
 */
export function SectionHeading(props: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  info?: React.ReactNode;
}): React.JSX.Element {
  const heading = (
    <h2 id={props.id} className={styles.sectionHeading}>
      <button
        type="button"
        className={styles.sectionToggle}
        aria-expanded={props.open}
        onClick={props.onToggle}
      >
        {props.title}
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
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </h2>
  );
  if (props.info === undefined) return heading;
  return (
    <div className={styles.headingRow}>
      {heading}
      <InfoButton topic={props.title}>{props.info}</InfoButton>
    </div>
  );
}

import { ChevronIcon } from "./icons";

import styles from "./CommunityCard.module.css";

/**
 * The title of a section that can be closed and opened again: the heading holds the button, so
 * the section is still found by its heading and the state is on the control (`aria-expanded`),
 * not in an icon alone.
 */
export function SectionHeading(props: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  return (
    <h2 id={props.id} className={styles.sectionHeading}>
      <button
        type="button"
        className={styles.sectionToggle}
        aria-expanded={props.open}
        onClick={props.onToggle}
      >
        {props.title}
        <ChevronIcon />
      </button>
    </h2>
  );
}

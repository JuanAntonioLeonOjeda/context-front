import styles from "./ProjectPage.module.css";

/** A titled part of a chapter: a landmark named by its heading. */
export function Section(props: {
  id: string;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section aria-labelledby={props.id} className={styles.section}>
      <h2 id={props.id}>{props.title}</h2>
      {props.children}
    </section>
  );
}

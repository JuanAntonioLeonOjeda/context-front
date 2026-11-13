import { es } from "@/i18n/es";

import { OrganizationBox } from "./OrganizationBox";
import type { BoxView, ExecutiveView } from "./organization-view";

import styles from "./Organization.module.css";

/**
 * The executive: the head and, nested under it, the departments in the backend's order. Complete
 * or nothing: an executive that cannot be drawn is said so, never half drawn.
 */
export function ExecutiveSection(props: {
  id: string;
  title: string;
  executive: ExecutiveView;
}): React.JSX.Element {
  const { executive } = props;
  return (
    <section aria-labelledby={props.id} className={styles.section}>
      <h2 id={props.id}>{props.title}</h2>
      {executive.head === null ? (
        <div>
          <p>
            <strong>{es.organization.noData.title}</strong>
          </p>
          <p className={styles.note}>{es.organization.noData.executive}</p>
        </div>
      ) : (
        // eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics of a list styled without markers (WCAG 1.3.1)
        <ul role="list" className={styles.tree}>
          <li>
            <OrganizationBox box={executive.head} />
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- same as above */}
            <ul role="list">
              {executive.departments.map((department) => (
                <li key={department.id}>
                  <OrganizationBox box={department} />
                </li>
              ))}
            </ul>
          </li>
        </ul>
      )}
    </section>
  );
}

/** A group of bodies with no holder (parliaments, courts, local bodies); nothing if there are none. */
export function BoxesSection(props: {
  id: string;
  title: string;
  boxes: readonly BoxView[];
}): React.JSX.Element | null {
  if (props.boxes.length === 0) return null;
  return (
    <section aria-labelledby={props.id} className={styles.section}>
      <h2 id={props.id}>{props.title}</h2>
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics of a list styled without markers (WCAG 1.3.1) */}
      <ul role="list" className={styles.tree}>
        {props.boxes.map((box) => (
          <li key={box.id}>
            <OrganizationBox box={box} />
          </li>
        ))}
      </ul>
    </section>
  );
}

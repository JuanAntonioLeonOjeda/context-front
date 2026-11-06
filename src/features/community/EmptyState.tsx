import { EmptyIcon } from "./icons";

import styles from "./CommunityCard.module.css";

/** What a list says when it has nothing to show: centred, with an icon, and read out as a status. */
export function EmptyState({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className={styles.emptyState} role="status">
      <EmptyIcon />
      <p>{children}</p>
    </div>
  );
}

import { es } from "@/i18n/es";

import { useHealth } from "./useHealth";

import styles from "./HealthStatus.module.css";

/**
 * Whether the data behind the app is available. A live region, so a change is announced
 * without moving focus. A database that is down and a backend that does not answer look the
 * same to the reader: either way the data cannot be shown.
 */
export function HealthStatus(): React.JSX.Element {
  const health = useHealth();

  if (health.state === "checking") {
    return (
      <p role="status" className={styles.status}>
        {es.health.status.checking}
      </p>
    );
  }
  if (health.health.status === "up") {
    return (
      <p role="status" className={styles.status}>
        {es.health.status.up}
      </p>
    );
  }
  return (
    <p role="status" className={styles.down}>
      {es.health.status.down}
    </p>
  );
}

import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { IndicatorRow } from "./community-card";

import styles from "./CommunityCard.module.css";

/** The INE data of the community: one row per indicator, with its period and its source. */
export function IndicatorsSection(props: {
  community: string;
  rows: readonly IndicatorRow[];
}): React.JSX.Element {
  const { columns } = es.community.indicators;
  return (
    <section aria-labelledby="indicators-title" className={styles.section}>
      <h2 id="indicators-title">{es.community.indicators.title}</h2>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <caption className={styles.visuallyHidden}>
            {formatMessage(es.community.indicators.caption, { community: props.community })}
          </caption>
          <thead>
            <tr>
              <th scope="col">{columns.indicator}</th>
              <th scope="col">{columns.value}</th>
              <th scope="col">{columns.period}</th>
              <th scope="col">{columns.source}</th>
            </tr>
          </thead>
          <tbody>
            {props.rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.name}</th>
                <td>{row.value ?? es.community.indicators.noValue}</td>
                <td>{row.period ?? "—"}</td>
                <td>
                  <a href={row.tableUrl}>{row.tableLabel}</a>
                  {row.downloaded && <small className={styles.downloaded}> {row.downloaded}</small>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

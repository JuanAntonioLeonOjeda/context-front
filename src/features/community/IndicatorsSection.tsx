import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { IndicatorRow } from "./community-card";
import { HEIGHT, WIDTH } from "./indicator-chart";

import styles from "./CommunityCard.module.css";

/**
 * The INE data of the community, one card per indicator: the latest value, its period, the
 * series as a line, and the source. Every chart has its numbers in a table underneath, and its
 * lowest and highest value written down: a drawing is never the only way to the data.
 */
export function IndicatorsSection(props: {
  community: string;
  rows: readonly IndicatorRow[];
}): React.JSX.Element {
  return (
    <section aria-labelledby="indicators-title" className={styles.section}>
      <h2 id="indicators-title">{es.community.indicators.title}</h2>
      <ul className={styles.indicatorGrid}>
        {props.rows.map((row) => (
          <li key={row.id}>
            <IndicatorCard row={row} community={props.community} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function IndicatorCard({
  row,
  community,
}: {
  row: IndicatorRow;
  community: string;
}): React.JSX.Element {
  const { indicators } = es.community;
  return (
    <article className={styles.indicator}>
      <h3 className={styles.indicatorName}>{row.name}</h3>
      <p className={styles.indicatorValue}>
        {row.figure === null ? (
          indicators.noValue
        ) : (
          <>
            {row.figure} <span className={styles.indicatorUnit}>{row.unit}</span>
          </>
        )}
      </p>
      <p className={styles.indicatorPeriod}>{row.period ?? indicators.noPeriod}</p>
      {row.chart !== null && (
        <svg
          className={styles.chart}
          viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
          role="img"
          aria-label={row.chartLabel ?? undefined}
        >
          <path d={row.chart.area} className={styles.chartArea} />
          <path d={row.chart.line} className={styles.chartLine} />
          {[row.chart.first, row.chart.last].map((end) => (
            <g key={end.anchor}>
              <circle cx={end.cx} cy={end.cy} r="3.5" className={styles.chartDot} />
              <text x={end.x} y={end.y} textAnchor={end.anchor} className={styles.chartLabel}>
                {end.text}
              </text>
            </g>
          ))}
        </svg>
      )}
      {row.range !== null && <p className={styles.indicatorRange}>{row.range}</p>}
      {row.data.length > 0 && (
        <details className={styles.indicatorData}>
          <summary>{indicators.viewData}</summary>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <caption className={styles.visuallyHidden}>
                {formatMessage(indicators.caption, { community: `${community}: ${row.name}` })}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{indicators.columns.period}</th>
                  <th scope="col">{indicators.columns.value}</th>
                </tr>
              </thead>
              <tbody>
                {row.data.map((point) => (
                  <tr key={point.period}>
                    <th scope="row">{point.period}</th>
                    <td>{point.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      <p className={styles.indicatorSource}>
        <a href={row.tableUrl}>{row.tableLabel}</a>
        {row.downloaded && <small className={styles.downloaded}> {row.downloaded}</small>}
      </p>
    </article>
  );
}

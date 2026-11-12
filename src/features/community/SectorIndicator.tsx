import { ExternalLink } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { IndicatorRow } from "./community-card";

import styles from "./CommunityCard.module.css";

/** The official figure of the sector next to its news: latest value, period and source. */
export function SectorIndicator(props: { sector: string; row: IndicatorRow }): React.JSX.Element {
  const { row } = props;
  const texts = es.community.news.indicator;
  return (
    <aside
      aria-label={formatMessage(texts.label, { sector: props.sector.toLowerCase() })}
      className={styles.sectorIndicator}
    >
      <p className={styles.sectorIndicatorName}>{row.name}</p>
      <p className={styles.sectorIndicatorValue}>
        {row.value === null ? (
          es.community.indicators.noValue
        ) : (
          <>
            <strong>{row.value}</strong>
            {row.period !== null && ` · ${row.period}`}
          </>
        )}
      </p>
      <p className={styles.indicatorSource}>
        {texts.source} <ExternalLink href={row.tableUrl}>{row.tableLabel}</ExternalLink>
      </p>
    </aside>
  );
}

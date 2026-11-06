import { partyLogoUrl } from "@/design/party-logos";
import { es } from "@/i18n/es";
import { formatCount, formatMessage } from "@/i18n/format";

import { cssBackground } from "./fill-style";
import type { GovernmentSummary } from "./party-summary";

import styles from "./GovernmentOverview.module.css";

interface PartyPanelProps {
  summary: GovernmentSummary;
  pressedId: string | null;
  onPress: (partyId: string | null) => void;
  onPreview: (partyId: string | null) => void;
  hasStripes: boolean;
}

/**
 * Who governs today, drawn as one row per party: its logo (its name when there is none) and one square per
 * community where it governs. It is also the key of the map. A row is a button that
 * highlights those communities on the map; the count is written, never only drawn.
 */
export function PartyPanel(props: PartyPanelProps): React.JSX.Element {
  const { summary, pressedId, onPress, onPreview, hasStripes } = props;
  const { panel } = es.map;
  return (
    <section className={styles.panel} aria-labelledby="party-panel-title">
      <h2 id="party-panel-title" className={styles.panelTitle}>
        {panel.title}
      </h2>
      <p className={styles.hint}>{panel.hint}</p>
      <ul className={styles.rows}>
        {summary.rows.map(({ party, communityIds }) => {
          const colour = cssBackground({ kind: "solid", colour: party.colour });
          const logo = partyLogoUrl(party.id);
          const count = formatCount(panel.communities, communityIds.length);
          return (
            <li key={party.id}>
              <button
                type="button"
                className={styles.row}
                aria-pressed={pressedId === party.id}
                aria-label={formatMessage(panel.row, { party: party.name, communities: count })}
                onClick={() => {
                  onPress(pressedId === party.id ? null : party.id);
                }}
                onPointerEnter={() => {
                  onPreview(party.id);
                }}
                onPointerLeave={() => {
                  onPreview(null);
                }}
              >
                <span className={styles.partyName} data-tip={party.name} aria-hidden="true">
                  {logo === null ? (
                    party.shortName
                  ) : (
                    <img className={styles.logo} src={logo} alt="" />
                  )}
                </span>
                <span className={styles.units} aria-hidden="true">
                  {communityIds.map((id) => (
                    <span key={id} className={styles.unit} style={{ background: colour }} />
                  ))}
                </span>
                <span className={styles.count} aria-hidden="true">
                  {communityIds.length}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className={styles.facts}>
        {formatMessage(panel.coalitions, {
          coalitions: String(summary.coalitions),
          total: String(summary.total),
        })}
        {summary.caretakers > 0 &&
          ` ${formatMessage(panel.caretakers, { caretakers: String(summary.caretakers) })}`}
      </p>
      {hasStripes && <p className={styles.note}>{es.map.legend.coalition}</p>}
      {summary.hasNoData && <p className={styles.note}>{es.map.legend.noData}</p>}
    </section>
  );
}

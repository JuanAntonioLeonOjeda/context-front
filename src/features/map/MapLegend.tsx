import type { Party } from "@/design/parties";
import { es } from "@/i18n/es";

import type { CommunityLook } from "./community-look";
import { cssBackground } from "./fill-style";

import styles from "./CommunityMap.module.css";

/** Every party drawn on the map, once, in the order of their ids (as the API orders them). */
export function MapLegend({ looks }: { looks: readonly CommunityLook[] }): React.JSX.Element {
  const parties = new Map<string, Party>();
  for (const look of looks) for (const party of look.parties) parties.set(party.id, party);
  const shown = [...parties.values()].sort((a, b) => a.id.localeCompare(b.id));
  const hasCoalition = looks.some((l) => l.fill.kind === "stripes");
  const hasNoData = looks.some((l) => l.fill.kind === "no-data");

  return (
    <section className={styles.legend} aria-labelledby="map-legend-title">
      <h2 id="map-legend-title" className={styles.legendTitle}>
        {es.map.legend.title}
      </h2>
      <ul className={styles.legendList}>
        {shown.map((party) => (
          <li key={party.id}>
            <span
              className={styles.swatch}
              style={{ background: cssBackground({ kind: "solid", colour: party.colour }) }}
              aria-hidden="true"
            />
            <abbr title={party.name}>{party.shortName}</abbr>
          </li>
        ))}
        {hasNoData && (
          <li>
            <span
              className={styles.swatch}
              style={{ background: cssBackground({ kind: "no-data" }) }}
              aria-hidden="true"
            />
            {es.map.legend.noData}
          </li>
        )}
      </ul>
      {hasCoalition && <p className={styles.legendNote}>{es.map.legend.coalition}</p>}
    </section>
  );
}

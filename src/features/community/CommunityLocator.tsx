import { CommunityMap, useGovernmentMap } from "@/features/map";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import styles from "./CommunityLayout.module.css";

function communityHref(territoryId: string): string {
  return `/comunidades/${territoryId}`;
}

/**
 * Where the community is: the map of the home page with this community in full colour and the
 * rest faded. The others stay links, so the map is also a way to the next community. It is an
 * extra: while it loads there is an empty card of the same shape (nothing jumps), and if it
 * fails the page simply has no map, never an error over the data that did load.
 */
export function CommunityLocator(props: {
  territoryId: string;
  name: string;
}): React.JSX.Element | null {
  const map = useGovernmentMap();
  if (map.state === "error") return null;
  return (
    <div className={styles.locator}>
      {map.state === "loading" ? (
        <div className={styles.locatorPlaceholder} aria-hidden="true" />
      ) : (
        <CommunityMap
          caption={formatMessage(es.community.locator.caption, { community: props.name })}
          layout={map.layout}
          looks={map.looks}
          attribution={map.attribution}
          hrefOf={communityHref}
          highlight={new Set([props.territoryId])}
          showLegend={false}
          showList={false}
        />
      )}
    </div>
  );
}

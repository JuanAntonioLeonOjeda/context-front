import { useState } from "react";

import { CommunityList } from "./CommunityList";
import { CommunityMap, type CommunityMapProps } from "./CommunityMap";
import { HomeIntro } from "./HomeIntro";
import { summarise } from "./party-summary";
import { PartyPanel } from "./PartyPanel";

import styles from "./GovernmentOverview.module.css";

/**
 * The map with the party panel beside it (below it on a phone). Choosing a party in the panel,
 * or pointing at it, highlights its communities on the map: a communication between the two
 * that the page owns, so the map stays a map and the panel a summary.
 */
export function GovernmentOverview(
  props: CommunityMapProps & { onChoose: (territoryId: string) => void },
): React.JSX.Element {
  const looks = [...props.looks.values()];
  const summary = summarise(looks);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const shownId = previewId ?? pressedId;
  const highlight =
    shownId === null
      ? null
      : new Set(summary.rows.find((r) => r.party.id === shownId)?.communityIds ?? []);

  return (
    <div className={styles.overview}>
      <div className={styles.introArea}>
        <HomeIntro looks={looks} summary={summary} onChoose={props.onChoose} />
      </div>
      <div className={styles.mapArea}>
        <CommunityMap {...props} highlight={highlight} showLegend={false} showList={false} />
      </div>
      <div className={styles.panelArea}>
        <PartyPanel
          summary={summary}
          pressedId={pressedId}
          onPress={setPressedId}
          onPreview={setPreviewId}
          hasStripes={looks.some((l) => l.fill.kind === "stripes")}
        />
      </div>
      <div className={styles.listArea}>
        <CommunityList looks={looks} hrefOf={props.hrefOf} />
      </div>
    </div>
  );
}

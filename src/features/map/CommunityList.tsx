import { Link } from "react-router";

import { es } from "@/i18n/es";

import type { CommunityLook } from "./community-look";

import styles from "./CommunityMap.module.css";

/**
 * The communities as a list of links, under the map. It is the equivalent control that keeps
 * every community reachable with a 44 px target on a phone, where the smallest communities of
 * the map measure about 20 px (WCAG 2.5.8), and it writes down who governs, not only paints it.
 */
export function CommunityList(props: {
  looks: readonly CommunityLook[];
  hrefOf: (territoryId: string) => string;
}): React.JSX.Element {
  return (
    <nav aria-labelledby="community-list-title" className={styles.list}>
      <h2 id="community-list-title" className={styles.legendTitle}>
        {es.map.list.title}
      </h2>
      <ul className={styles.listItems}>
        {props.looks.map((look) => (
          <li key={look.territoryId}>
            <Link to={props.hrefOf(look.territoryId)}>{look.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

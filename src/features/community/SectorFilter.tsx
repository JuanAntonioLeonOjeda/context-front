import { Link } from "react-router";

import { es } from "@/i18n/es";

import { SECTORS, type Sector } from "./news-api";
import { searchWith } from "./search-params";

import styles from "./CommunityCard.module.css";

/** The sectors as capsules, the current one marked; the finder and the trees share it. */
export function SectorFilter(props: {
  params: URLSearchParams;
  sector: Sector;
  label: string;
  onPick?: () => void;
}): React.JSX.Element {
  return (
    <nav aria-label={props.label}>
      <ul className={styles.sectors}>
        {SECTORS.map((s) => (
          <li key={s}>
            <Link
              to={{ search: searchWith(props.params, { sector: s }) }}
              preventScrollReset
              aria-current={s === props.sector ? "page" : undefined}
              onClick={props.onPick}
            >
              {es.community.news.sectors[s]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

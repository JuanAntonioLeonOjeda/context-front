import { Link, useSearchParams } from "react-router";

import { es } from "@/i18n/es";

import { searchWith, VIEWS, viewOf } from "./community-view";

import styles from "./CommunityLayout.module.css";

/**
 * "Datos" and "Noticias" for a screen too narrow to show both. They are links, not ARIA tabs:
 * each view has its own address, so the back button, a shared link and a reload all land on
 * the view that was chosen, and the sector chosen in the news stays chosen.
 */
export function ViewTabs(): React.JSX.Element {
  const [params] = useSearchParams();
  const current = viewOf(params.get("view"));
  return (
    <nav aria-label={es.community.views.nav} className={styles.tabs}>
      {VIEWS.map((view) => (
        <Link
          key={view}
          to={{ search: searchWith(params, { view }) }}
          preventScrollReset
          aria-current={view === current ? "page" : undefined}
        >
          {es.community.views[view]}
        </Link>
      ))}
    </nav>
  );
}

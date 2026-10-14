import { Link, useSearchParams } from "react-router";

import { es } from "@/i18n/es";

import { CommunityLocator } from "./CommunityLocator";
import { viewOf } from "./community-view";
import { GovernmentSection } from "./GovernmentSection";
import { IndicatorsSection } from "./IndicatorsSection";
import { NewsSection } from "./NewsSection";
import { useCommunityCard } from "./useCommunityCard";
import { ViewTabs } from "./ViewTabs";

import styles from "./CommunityLayout.module.css";

/** The page of one community: who governs it and the INE data, each with its source. */
export function CommunityPage({ territoryId }: { territoryId: string }): React.JSX.Element {
  const card = useCommunityCard(territoryId);
  const [params] = useSearchParams();
  const view = viewOf(params.get("view"));

  return (
    <>
      <p>
        <Link to="/">{es.community.page.back}</Link>
      </p>
      {card.state === "loading" && <p role="status">{es.community.state.loading}</p>}
      {card.state === "error" && (
        <div role="alert">
          <p>{es.community.state.error}</p>
          <button type="button" onClick={card.retry}>
            {es.community.state.retry}
          </button>
        </div>
      )}
      {card.state === "not-found" && (
        <>
          <title>{`${es.errors.notFound.title} · ${es.app.shell.name}`}</title>
          <h1>{es.errors.notFound.title}</h1>
          <p>{es.community.page.notFound}</p>
        </>
      )}
      {card.state === "ready" && (
        <>
          <title>{`${card.name} · ${es.app.shell.name}`}</title>
          <div className={styles.hero}>
            <div className={styles.heroText}>
              <h1 className={styles.title}>{card.name}</h1>
              <GovernmentSection government={card.government} />
            </div>
            <CommunityLocator territoryId={territoryId} name={card.name} />
          </div>
          <ViewTabs />
          <div className={styles.columns}>
            <div className={styles.pane} data-active={view === "data"}>
              <IndicatorsSection community={card.name} rows={card.indicators} />
            </div>
            <div className={styles.pane} data-active={view === "news"}>
              <NewsSection territoryId={territoryId} />
            </div>
          </div>
        </>
      )}
    </>
  );
}

import { Link } from "react-router";

import { VotersSection } from "@/features/voters";
import { es } from "@/i18n/es";

import { CommunityFlag } from "./CommunityFlag";
import { GovernmentSection } from "./GovernmentSection";
import { IndicatorsSection } from "./IndicatorsSection";
import { NewsSection } from "./NewsSection";
import { TreesSection } from "./TreesSection";
import { useCommunityCard } from "./useCommunityCard";

import styles from "./CommunityLayout.module.css";

/** The page of one community: who governs it, the INE data, how its municipalities voted by
 *  income, and its news, each with its source. */
export function CommunityPage({ territoryId }: { territoryId: string }): React.JSX.Element {
  const card = useCommunityCard(territoryId);

  return (
    <>
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
          <div className={styles.header}>
            <div className={styles.identity}>
              <CommunityFlag territoryId={territoryId} name={card.name} />
              <h1 className={styles.title}>{card.name}</h1>
            </div>
            <GovernmentSection government={card.government} />
          </div>
          <p className={styles.actions}>
            <Link className={styles.chip} to={`/comunidades/${territoryId}/organigrama`}>
              {es.organization.community.link}
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M12 4v5m0 0H6m6 0h6M6 9v4m12-4v4M4 15h4v4H4zm12 0h4v4h-4zM10 3h4v3h-4z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </p>
          <IndicatorsSection community={card.name} rows={card.indicators} />
          <VotersSection territoryId={territoryId} />
          <TreesSection territoryId={territoryId} />
          <NewsSection territoryId={territoryId} />
        </>
      )}
    </>
  );
}

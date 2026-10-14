import { Link } from "react-router";

import { es } from "@/i18n/es";

import { GovernmentSection } from "./GovernmentSection";
import { IndicatorsSection } from "./IndicatorsSection";
import { NewsSection } from "./NewsSection";
import { useCommunityCard } from "./useCommunityCard";

/** The page of one community: who governs it and the INE data, each with its source. */
export function CommunityPage({ territoryId }: { territoryId: string }): React.JSX.Element {
  const card = useCommunityCard(territoryId);

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
          <h1>{card.name}</h1>
          <GovernmentSection government={card.government} />
          <IndicatorsSection community={card.name} rows={card.indicators} />
          <NewsSection territoryId={territoryId} />
        </>
      )}
    </>
  );
}

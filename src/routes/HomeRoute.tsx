import { useNavigate } from "react-router";

import { GovernmentOverview, HomeIntro, useGovernmentMap } from "@/features/map";
import { es } from "@/i18n/es";

/** The home page: the headline, a way into a community, and the map of who governs each one. */
export function HomeRoute(): React.JSX.Element {
  const map = useGovernmentMap();
  const navigate = useNavigate();

  return (
    <>
      <title>{es.app.shell.name}</title>
      {map.state === "ready" ? (
        <GovernmentOverview
          caption={map.caption}
          layout={map.layout}
          looks={map.looks}
          attribution={map.attribution}
          hrefOf={communityHref}
          onChoose={(territoryId) => {
            void navigate(communityHref(territoryId));
          }}
        />
      ) : (
        <>
          <HomeIntro />
          {map.state === "loading" && <p role="status">{es.map.state.loading}</p>}
          {map.state === "error" && (
            <div role="alert">
              <p>{es.map.state.error}</p>
              <button type="button" onClick={map.retry}>
                {es.map.state.retry}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function communityHref(territoryId: string): string {
  return `/comunidades/${territoryId}`;
}

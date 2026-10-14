import { GovernmentOverview, useGovernmentMap } from "@/features/map";
import { es } from "@/i18n/es";

/** The home page: the map of who governs each community today. */
export function HomeRoute(): React.JSX.Element {
  const map = useGovernmentMap();

  return (
    <>
      <title>{es.app.shell.name}</title>
      <h1>{es.app.shell.name}</h1>
      <p>{es.app.shell.description}</p>
      {map.state === "loading" && <p role="status">{es.map.state.loading}</p>}
      {map.state === "error" && (
        <div role="alert">
          <p>{es.map.state.error}</p>
          <button type="button" onClick={map.retry}>
            {es.map.state.retry}
          </button>
        </div>
      )}
      {map.state === "ready" && (
        <GovernmentOverview
          caption={map.caption}
          layout={map.layout}
          looks={map.looks}
          attribution={map.attribution}
          hrefOf={communityHref}
        />
      )}
    </>
  );
}

function communityHref(territoryId: string): string {
  return `/comunidades/${territoryId}`;
}

import { useParams } from "react-router";

import { CommunityOrganizationPage } from "@/features/organization";

import { NotFoundRoute } from "./NotFoundRoute";

export function CommunityOrganizationRoute(): React.JSX.Element {
  const { territoryId } = useParams();
  // The route pattern guarantees the segment; the guard is for the types.
  return territoryId === undefined ? (
    <NotFoundRoute />
  ) : (
    <CommunityOrganizationPage territoryId={territoryId} />
  );
}

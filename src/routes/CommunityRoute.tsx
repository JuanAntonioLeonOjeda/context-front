import { useParams } from "react-router";

import { CommunityPage } from "@/features/community";

import { NotFoundRoute } from "./NotFoundRoute";

export function CommunityRoute(): React.JSX.Element {
  const { territoryId } = useParams();
  // The route pattern guarantees the segment; the guard is for the types.
  return territoryId === undefined ? (
    <NotFoundRoute />
  ) : (
    <CommunityPage territoryId={territoryId} />
  );
}

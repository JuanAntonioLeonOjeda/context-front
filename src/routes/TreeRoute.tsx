import { useParams } from "react-router";

import { TreePage } from "@/features/stories";

import { NotFoundRoute } from "./NotFoundRoute";

export function TreeRoute(): React.JSX.Element {
  const { storyId } = useParams();
  const id = Number(storyId);
  // A segment that is not a whole number names no story.
  return Number.isInteger(id) && id > 0 ? <TreePage storyId={id} /> : <NotFoundRoute />;
}

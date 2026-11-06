import { useParams } from "react-router";

import { TreePage } from "@/features/stories";

import { NotFoundRoute } from "./NotFoundRoute";

export function TreeRoute(): React.JSX.Element {
  const { storyId } = useParams();
  const id = storyIdOf(storyId);
  return id === null ? <NotFoundRoute /> : <TreePage storyId={id} />;
}

/** The story of a segment made only of digits, without a leading zero; "1e3", "0x10" or " 5" name none. */
function storyIdOf(segment: string | undefined): number | null {
  if (segment === undefined || !/^[1-9]\d*$/.test(segment)) return null;
  const id = Number(segment);
  return Number.isSafeInteger(id) ? id : null;
}

import { useQuery } from "@tanstack/react-query";

import { fetchStoryTree, type StoryTree } from "./tree-api";

export type StoryTreeState =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "not-found" }
  | { state: "ready"; tree: StoryTree };

/** The tree of related stories of one story. */
export function useStoryTree(storyId: number): StoryTreeState {
  const query = useQuery({
    queryKey: ["story", storyId, "tree"],
    queryFn: () => fetchStoryTree(storyId),
  });
  if (query.isError) {
    return {
      state: "error",
      retry: () => {
        void query.refetch();
      },
    };
  }
  if (!query.data) return { state: "loading" };
  return query.data.found ? { state: "ready", tree: query.data.tree } : { state: "not-found" };
}

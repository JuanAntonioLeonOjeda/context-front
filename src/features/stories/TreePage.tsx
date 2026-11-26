import { useLocation, useNavigate } from "react-router";

import { InfoButton } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import { TreeGraph } from "./TreeGraph";
import { useStoryTree } from "./useStoryTree";

import styles from "./TreePage.module.css";

/** The page of the tree of related stories of one story. */
export function TreePage({ storyId }: { storyId: number }): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  // Back to where the user came from; with no history in this tab (a shared link), to the home.
  const back = (): void => {
    if (location.key === "default") void navigate("/");
    else void navigate(-1);
  };

  return (
    <>
      <title>{`${es.stories.tree.title} · ${es.app.shell.name}`}</title>
      <button type="button" className={styles.back} onClick={back}>
        {es.stories.tree.back}
      </button>
      <h1>{es.stories.tree.title}</h1>
      <StoryTreeView storyId={storyId} />
    </>
  );
}

/** The tree of related stories of one story, in time order from left to right, with its states. */
export function StoryTreeView({ storyId }: { storyId: number }): React.JSX.Element {
  const tree = useStoryTree(storyId);
  return (
    <>
      {tree.state === "loading" && <p role="status">{es.stories.tree.loading}</p>}
      {tree.state === "error" && (
        <div role="alert">
          <p>{es.stories.tree.error}</p>
          <button type="button" onClick={tree.retry}>
            {es.stories.tree.retry}
          </button>
        </div>
      )}
      {tree.state === "not-found" && <p>{es.stories.tree.notFound}</p>}
      {tree.state === "ready" && (
        <>
          {/* How to read the tree, in a window: the tree keeps the screen. */}
          <div className={styles.info}>
            <InfoButton topic={es.stories.tree.title}>
              <p>{es.stories.tree.reading}</p>
              <p>{es.stories.tree.moreHint}</p>
              <p>
                {formatMessage(es.stories.tree.method, {
                  threshold: tree.tree.linkThreshold.toLocaleString("es"),
                  days: String(tree.tree.linkWindowDays),
                })}
              </p>
            </InfoButton>
          </div>
          <div
            className={styles.scroll}
            role="region"
            aria-label={es.stories.tree.regionLabel}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be reachable by keyboard
            tabIndex={0}
          >
            <TreeGraph nodes={tree.tree.nodes} />
          </div>
        </>
      )}
    </>
  );
}

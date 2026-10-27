import { useId, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { ExternalLink } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import { buildTree, nodeText, type Branch } from "./story-tree";
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
          <p className={styles.note}>{es.stories.tree.reading}</p>
          <p className={styles.note}>{es.stories.tree.moreHint}</p>
          <p className={styles.note}>
            {formatMessage(es.stories.tree.method, {
              threshold: tree.tree.linkThreshold.toLocaleString("es"),
              days: String(tree.tree.linkWindowDays),
            })}
          </p>
          <div
            className={styles.scroll}
            role="region"
            aria-label={es.stories.tree.regionLabel}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be reachable by keyboard
            tabIndex={0}
          >
            <ul className={styles.tree}>
              <BranchView branch={buildTree(tree.tree.nodes)} />
            </ul>
          </div>
        </>
      )}
    </>
  );
}

function BranchView({ branch }: { branch: Branch }): React.JSX.Element {
  const text = nodeText(branch.node);
  const [open, setOpen] = useState(false);
  const listId = useId();
  return (
    <li className={styles.branch}>
      <article className={styles.node} data-open={open}>
        <small className={styles.meta}>{text.started}</small>
        {text.link !== null && <small className={styles.meta}>{text.link}</small>}
        <span className={styles.outlet}>{text.first.outletName}</span>
        <ExternalLink href={text.first.url} className={styles.headline}>
          {text.first.headline}
        </ExternalLink>
        {text.rest.length > 0 && (
          <>
            <button
              type="button"
              className={styles.more}
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => {
                setOpen(!open);
              }}
            >
              {open
                ? es.stories.tree.fold
                : formatMessage(es.stories.tree.unfold, { more: text.moreOutlets })}
            </button>
            {open && (
              <ul id={listId} className={styles.articles}>
                {text.rest.map((article) => (
                  <li key={article.url}>
                    <span className={styles.outlet}>{article.outletName}</span>
                    <ExternalLink href={article.url}>{article.headline}</ExternalLink>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </article>
      {branch.children.length > 0 && (
        <ul className={styles.children}>
          {branch.children.map((child) => (
            <BranchView key={child.node.storyId} branch={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

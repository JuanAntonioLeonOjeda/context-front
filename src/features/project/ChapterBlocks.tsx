import type { es } from "@/i18n/es";

import styles from "./ProjectPage.module.css";

/** One piece of a chapter's text, as written in `es.project.chapters`. */
export type Block = (typeof es.project.chapters)[number]["blocks"][number];

function BlockView({ block }: { block: Block }): React.JSX.Element {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;
    case "h2":
      return <h2 className={styles.blockHeading}>{block.text}</h2>;
    case "list":
      return (
        <ul className={styles.list}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <aside className={styles.callout} aria-label={block.title}>
          <p className={styles.calloutTitle}>{block.title}</p>
          <p>{block.text}</p>
        </aside>
      );
    case "stats":
      return (
        <dl className={styles.stats}>
          {block.items.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt>{stat.label}</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
              <dd className={styles.statDetail}>{stat.detail}</dd>
            </div>
          ))}
        </dl>
      );
    case "table":
      return (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, index) => (
                    <td key={`${String(index)}-${cell}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/** The text of a chapter, block after block. */
export function ChapterBlocks({ blocks }: { blocks: readonly Block[] }): React.JSX.Element {
  return (
    <>
      {blocks.map((block, index) => (
        <BlockView key={`${block.kind}-${String(index)}`} block={block} />
      ))}
    </>
  );
}

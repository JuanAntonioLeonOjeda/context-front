import { Link, NavLink, Navigate } from "react-router";

import { es } from "@/i18n/es";

import { ChapterBlocks } from "./ChapterBlocks";
import { HowItWorks } from "./HowItWorks";
import styles from "./ProjectPage.module.css";

const { project } = es;
const CHAPTERS = project.chapters;

/** The address of a chapter. */
export function chapterPath(slug: string): string {
  return `/proyecto/${slug}`;
}

/** Where `/proyecto` and the old `/como-funciona` lead: the first chapter. */
export const FIRST_CHAPTER_PATH = chapterPath(CHAPTERS[0].slug);

function fill(template: string, values: Record<string, number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}

/**
 * "El proyecto": the chapters that explain how the portal is built, with the list of chapters on
 * the side and the previous and next ones at the end. An unknown chapter leads to the first one.
 */
export function ProjectPage({ slug }: { slug: string | undefined }): React.JSX.Element {
  const index = CHAPTERS.findIndex((item) => item.slug === slug);
  const chapter = CHAPTERS[index];
  if (chapter === undefined) return <Navigate to={FIRST_CHAPTER_PATH} replace />;

  const previous = index > 0 ? CHAPTERS[index - 1] : undefined;
  const next = index < CHAPTERS.length - 1 ? CHAPTERS[index + 1] : undefined;
  const position = { n: index + 1, total: CHAPTERS.length };

  return (
    <div className={styles.layout}>
      <title>{`${chapter.title} · ${project.page.title} · ${es.app.shell.name}`}</title>
      <nav aria-label={project.page.chaptersLabel} className={styles.sidebar}>
        <p className={styles.sidebarTitle}>{project.page.title}</p>
        <p className={styles.sidebarCount}>{fill(project.page.chapterCount, position)}</p>
        <ol className={styles.chapterList}>
          {CHAPTERS.map((item, itemIndex) => (
            <li key={item.slug}>
              <NavLink to={chapterPath(item.slug)} className={styles.chapterLink ?? ""}>
                <span className={styles.chapterNumber} aria-hidden="true">
                  {itemIndex + 1}
                </span>
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ol>
      </nav>

      <article className={styles.page}>
        <p className={styles.crumb}>{fill(project.page.crumb, position)}</p>
        <h1 className={styles.title}>{chapter.title}</h1>
        <p className={styles.lead}>{chapter.summary}</p>
        <div className={styles.prose}>
          {index === 0 ? <HowItWorks /> : <ChapterBlocks blocks={chapter.blocks} />}
        </div>
        <nav aria-label={project.page.pagerLabel} className={styles.pager}>
          {previous ? (
            <Link to={chapterPath(previous.slug)} className={styles.pagerLink}>
              <span className={styles.pagerDirection}>{project.page.previous}</span>
              {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={chapterPath(next.slug)} className={styles.pagerNext}>
              <span className={styles.pagerDirection}>{project.page.next}</span>
              {next.title}
            </Link>
          ) : (
            <Link to="/" className={styles.pagerNext}>
              <span className={styles.pagerDirection}>{project.page.after}</span>
              {project.page.afterLink}
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}

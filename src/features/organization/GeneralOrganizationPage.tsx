import { Link } from "react-router";

import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import { BoxesSection, ExecutiveSection } from "./ChartSections";
import { useGeneralOrganization } from "./useOrganization";

import styles from "./Organization.module.css";

/** The general chart: the State's executive, parliament, courts and the local bodies, and a way
 *  into each community's own chart. */
export function GeneralOrganizationPage(): React.JSX.Element {
  const organization = useGeneralOrganization();
  const { page, sections } = es.organization;
  return (
    <div className={styles.page}>
      <title>{`${page.generalTitle} · ${es.app.shell.name}`}</title>
      <h1 className={styles.title}>{page.generalTitle}</h1>
      {organization.state === "loading" && <p role="status">{page.loading}</p>}
      {organization.state === "error" && (
        <div role="alert">
          <p>{page.error}</p>
          <button type="button" onClick={organization.retry}>
            {page.retry}
          </button>
        </div>
      )}
      {organization.state === "ready" && (
        <>
          <p className={styles.lead}>{page.generalIntro}</p>
          <p className={styles.note}>
            {page.scope}{" "}
            {formatMessage(page.asOf, { date: formatLongDate(organization.chart.asOf) })}
          </p>
          <ExecutiveSection
            id="state-executive"
            title={sections.executiveState}
            executive={organization.chart.executive}
          />
          <BoxesSection
            id="state-parliament"
            title={sections.parliament}
            boxes={organization.chart.parliaments}
          />
          <BoxesSection
            id="state-judiciary"
            title={sections.judiciary}
            boxes={organization.chart.judiciary}
          />
          <BoxesSection id="local" title={sections.local} boxes={organization.chart.local} />
          <section aria-labelledby="communities" className={styles.section}>
            <h2 id="communities">{sections.communities}</h2>
            <p className={styles.note}>{es.organization.communities.intro}</p>
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops the list semantics of a list styled without markers (WCAG 1.3.1) */}
            <ul role="list" className={styles.communities}>
              {organization.communities.map((community) => (
                <li key={community.territoryId}>
                  <Link to={community.href}>{community.name}</Link>
                  <span className={styles.meta}>{community.status}</span>
                </li>
              ))}
            </ul>
          </section>
          <p className={styles.note}>{es.organization.state.attribution}</p>
        </>
      )}
    </div>
  );
}

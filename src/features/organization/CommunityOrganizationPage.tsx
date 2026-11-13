import { Link } from "react-router";

import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import { BoxesSection, ExecutiveSection } from "./ChartSections";
import { useCommunityOrganization } from "./useOrganization";

import styles from "./Organization.module.css";

/** One community's chart: its executive, its parliament, the court that sits in it and the local
 *  bodies that apply to it. */
export function CommunityOrganizationPage({
  territoryId,
}: {
  territoryId: string;
}): React.JSX.Element {
  const organization = useCommunityOrganization(territoryId);
  const { page, sections } = es.organization;
  return (
    <div className={styles.page}>
      {organization.state === "loading" && <p role="status">{page.loading}</p>}
      {organization.state === "error" && (
        <div role="alert">
          <p>{page.error}</p>
          <button type="button" onClick={organization.retry}>
            {page.retry}
          </button>
        </div>
      )}
      {organization.state === "not-found" && (
        <>
          <title>{`${es.errors.notFound.title} · ${es.app.shell.name}`}</title>
          <h1 className={styles.title}>{es.errors.notFound.title}</h1>
          <p>{page.notFound}</p>
        </>
      )}
      {organization.state === "ready" && (
        <>
          <title>
            {`${formatMessage(page.communityTitle, { community: organization.name })} · ${es.app.shell.name}`}
          </title>
          <h1 className={styles.title}>
            {formatMessage(page.communityTitle, { community: organization.name })}
          </h1>
          <p className={styles.lead}>
            {formatMessage(page.communityIntro, { community: organization.name })}
          </p>
          <p className={styles.note}>
            {page.scope}{" "}
            {formatMessage(page.asOf, { date: formatLongDate(organization.chart.asOf) })}
          </p>
          <p className={styles.links}>
            <Link to={`/comunidades/${territoryId}`}>
              {formatMessage(page.toCommunity, { community: organization.name })}
            </Link>
            <Link to="/organigrama">{page.toGeneral}</Link>
          </p>
          <ExecutiveSection
            id="community-executive"
            title={sections.executiveCommunity}
            executive={organization.chart.executive}
          />
          <BoxesSection
            id="community-parliament"
            title={sections.parliament}
            boxes={organization.chart.parliaments}
          />
          <BoxesSection
            id="community-judiciary"
            title={sections.judiciary}
            boxes={organization.chart.judiciary}
          />
          <BoxesSection id="local" title={sections.local} boxes={organization.chart.local} />
        </>
      )}
    </div>
  );
}

import { Link } from "react-router";

import { es } from "@/i18n/es";
import { formatLongDate, formatMessage } from "@/i18n/format";

import { BoxesSection, ExecutiveSection } from "./ChartSections";
import { officialLanguage } from "./organization-view";
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
  const lang = officialLanguage(territoryId);
  const title =
    organization.state === "ready"
      ? formatMessage(page.communityTitle, { community: organization.name })
      : organization.state === "not-found"
        ? es.errors.notFound.title
        : page.communityLoadingTitle;
  return (
    <div className={styles.page}>
      <title>{`${title} · ${es.app.shell.name}`}</title>
      <h1 className={styles.title}>{title}</h1>
      {organization.state === "loading" && <p role="status">{page.loading}</p>}
      {organization.state === "error" && (
        <div role="alert">
          <p>{page.error}</p>
          <button type="button" onClick={organization.retry}>
            {page.retry}
          </button>
        </div>
      )}
      {organization.state === "not-found" && <p>{page.notFound}</p>}
      {organization.state === "ready" && (
        <>
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
            lang={lang}
          />
          <BoxesSection
            id="community-parliament"
            title={sections.parliament}
            boxes={organization.chart.parliaments}
            lang={lang}
          />
          <BoxesSection
            id="community-judiciary"
            title={sections.judiciary}
            boxes={organization.chart.judiciary}
            lang={lang}
          />
          <BoxesSection id="local" title={sections.local} boxes={organization.chart.local} />
          <p className={styles.note}>{es.organization.community.sources}</p>
        </>
      )}
    </div>
  );
}

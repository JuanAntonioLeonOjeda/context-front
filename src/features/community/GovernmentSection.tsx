import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { TermParty } from "./community-api";
import type { GovernmentView } from "./community-card";

import styles from "./CommunityCard.module.css";

function PartyList({
  title,
  parties,
}: {
  title: string;
  parties: readonly TermParty[];
}): React.JSX.Element | null {
  if (parties.length === 0) return null;
  return (
    <>
      <h3>{title}</h3>
      <ul className={styles.parties}>
        {parties.map((party) => (
          <li key={party.partyId}>
            {party.shortName}{" "}
            <a
              href={party.sourceUrl}
              aria-label={formatMessage(es.community.government.sourceOf, {
                party: party.shortName,
              })}
            >
              {es.community.government.source}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Who governs and since when: president, caretaker note, partners and supporters, with sources. */
export function GovernmentSection({
  government,
}: {
  government: GovernmentView;
}): React.JSX.Element {
  return (
    <section aria-labelledby="government-title" className={styles.section}>
      <h2 id="government-title">{es.community.government.title}</h2>
      <p>
        {government.president}. {government.since}.{" "}
        <a href={government.sourceUrl}>{es.community.government.sourceOfTerm}</a>
      </p>
      {government.isCaretaker && <p>{es.community.government.caretaker}</p>}
      <PartyList title={es.community.government.governing} parties={government.governing} />
      <PartyList title={es.community.government.support} parties={government.support} />
    </section>
  );
}

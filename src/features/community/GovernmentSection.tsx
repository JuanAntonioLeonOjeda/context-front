import { useQuery } from "@tanstack/react-query";

import { partyTable, type Party } from "@/design/parties";
import { fetchParties } from "@/features/map";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { TermParty } from "./community-api";
import type { GovernmentView } from "./community-card";

import styles from "./CommunityCard.module.css";

function PartyList({
  title,
  parties,
  table,
}: {
  title: string;
  parties: readonly TermParty[];
  table: ReadonlyMap<string, Party> | undefined;
}): React.JSX.Element | null {
  if (parties.length === 0) return null;
  return (
    <div>
      <h3>{title}</h3>
      <ul className={styles.parties}>
        {parties.map((party) => (
          <li key={party.partyId} className={styles.party}>
            {/* The party's own colour, as on the map; the name beside it says the same in text. */}
            <span
              className={styles.partySwatch}
              style={{ background: table?.get(party.partyId)?.colour }}
              aria-hidden="true"
            />
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
    </div>
  );
}

/** Who governs and since when: president, caretaker note, partners and supporters, with sources. */
export function GovernmentSection({
  government,
}: {
  government: GovernmentView;
}): React.JSX.Element {
  // Only colours come from here: when the table is late the names are already on the page.
  const parties = useQuery({
    queryKey: ["parties"],
    queryFn: fetchParties,
    staleTime: 60 * 60 * 1000,
  });
  const table = parties.data ? partyTable(parties.data) : undefined;
  return (
    <section
      aria-labelledby="government-title"
      className={`${styles.section ?? ""} ${styles.government ?? ""}`}
    >
      <h2 id="government-title">{es.community.government.title}</h2>
      <p className={styles.president}>
        {government.president}. {government.since}.{" "}
        <a href={government.sourceUrl}>{es.community.government.sourceOfTerm}</a>
      </p>
      {government.isCaretaker && <p>{es.community.government.caretaker}</p>}
      <PartyList
        title={es.community.government.governing}
        parties={government.governing}
        table={table}
      />
      <PartyList
        title={es.community.government.support}
        parties={government.support}
        table={table}
      />
    </section>
  );
}

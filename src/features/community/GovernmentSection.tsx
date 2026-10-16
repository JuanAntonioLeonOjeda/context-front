import { useQuery } from "@tanstack/react-query";

import { onPartyColour, partyTable, type Party } from "@/design/parties";
import { fetchParties } from "@/features/map";
import { ExternalLink } from "@/features/shell";
import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import type { TermParty } from "./community-api";
import type { GovernmentView } from "./community-card";

import styles from "./CommunityCard.module.css";

function PartyList({
  title,
  parties,
  table,
  supporting = false,
}: {
  title: string;
  parties: readonly TermParty[];
  table: ReadonlyMap<string, Party> | undefined;
  supporting?: boolean;
}): React.JSX.Element | null {
  if (parties.length === 0) return null;
  return (
    <div className={styles.tip} data-tip={title}>
      {/* Seals: the party's own colour with its name written inside, a little overlapped. The
          ones that only supported the investiture are outlined, not filled. */}
      <ul className={styles.badges} aria-label={title}>
        {parties.map((party) => {
          const colour = table?.get(party.partyId)?.colour;
          return (
            <li
              key={party.partyId}
              className={supporting ? styles.badgeSupport : styles.badge}
              style={
                colour === undefined
                  ? undefined
                  : supporting
                    ? { borderColor: colour }
                    : { background: colour, color: onPartyColour(colour) }
              }
            >
              <ExternalLink
                href={party.sourceUrl}
                aria-label={formatMessage(es.community.government.sourceOf, {
                  party: party.shortName,
                })}
              >
                {party.shortName}
              </ExternalLink>
            </li>
          );
        })}
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
      <div className={styles.who}>
        <p className={styles.president}>{government.president}</p>
        <p className={styles.since}>
          <ExternalLink href={government.sourceUrl}>{government.since}</ExternalLink>.
        </p>
        {government.isCaretaker && (
          <p className={styles.since}>{es.community.government.caretaker}</p>
        )}
      </div>
      <div className={styles.groups}>
        <PartyList
          title={es.community.government.governing}
          parties={government.governing}
          table={table}
        />
        <PartyList
          title={es.community.government.support}
          parties={government.support}
          table={table}
          supporting
        />
      </div>
    </section>
  );
}

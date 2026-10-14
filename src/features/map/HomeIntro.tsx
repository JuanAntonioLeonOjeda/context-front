import { es } from "@/i18n/es";
import { pluralForm } from "@/i18n/format";

import type { CommunityLook } from "./community-look";
import type { GovernmentSummary } from "./party-summary";

import styles from "./GovernmentOverview.module.css";

/** The headline of the home page and what to do first: go to a community. */
export function HomeIntro(props: {
  looks?: readonly CommunityLook[];
  summary?: GovernmentSummary;
  onChoose?: (territoryId: string) => void;
}): React.JSX.Element {
  const { hero } = es.map;
  const { looks, summary, onChoose } = props;
  return (
    <div className={styles.intro}>
      <h1 className={styles.title}>{hero.title}</h1>
      <p className={styles.lead}>{hero.lead}</p>
      {looks && onChoose && <CommunitySelect looks={looks} onChoose={onChoose} />}
      {summary && (
        <dl className={styles.facts} aria-label={hero.facts.label}>
          <Fact value={summary.total} forms={hero.facts.communities} />
          <Fact value={summary.rows.length} forms={hero.facts.parties} />
          <Fact value={summary.coalitions} forms={hero.facts.coalitions} />
        </dl>
      )}
    </div>
  );
}

function Fact(props: { value: number; forms: { one: string; other: string } }): React.JSX.Element {
  return (
    <div className={styles.fact}>
      <dt>{pluralForm(props.forms, props.value)}</dt>
      <dd>{props.value}</dd>
    </div>
  );
}

/** A plain select and a button: arrow keys must not navigate, so choosing and going are apart. */
function CommunitySelect(props: {
  looks: readonly CommunityLook[];
  onChoose: (territoryId: string) => void;
}): React.JSX.Element {
  const { select } = es.map.hero;
  const byName = [...props.looks].sort((a, b) => a.name.localeCompare(b.name, "es"));
  return (
    <form
      className={styles.select}
      onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("community");
        if (typeof value === "string" && value !== "") props.onChoose(value);
      }}
    >
      <label htmlFor="community-select">{select.label}</label>
      <div className={styles.selectRow}>
        <select id="community-select" name="community" required defaultValue="">
          <option value="" disabled>
            {select.placeholder}
          </option>
          {byName.map((look) => (
            <option key={look.territoryId} value={look.territoryId}>
              {look.name}
            </option>
          ))}
        </select>
        <button type="submit">{select.submit}</button>
      </div>
    </form>
  );
}

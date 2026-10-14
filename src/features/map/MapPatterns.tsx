import type { CommunityLook } from "./community-look";

import styles from "./CommunityMap.module.css";

const STRIPE = 7; // user units, before the 45° rotation
const SEPARATOR = 1.5; // thin light line between partners (ADR-0013)
const HATCH = 6;

export const NO_DATA_PATTERN_ID = "no-data-hatch";

/**
 * One `<pattern>` per distinct coalition (communities with the same partners share it) and
 * the hatch for communities without data. Party colours arrive as data; separators and the
 * hatch use design tokens.
 */
export function MapPatterns({ looks }: { looks: readonly CommunityLook[] }): React.JSX.Element {
  const coalitions = new Map<string, readonly string[]>();
  for (const look of looks) {
    if (look.fill.kind === "stripes") coalitions.set(look.fill.patternId, look.fill.colours);
  }

  return (
    <defs>
      {[...coalitions].map(([id, colours]) => (
        <pattern
          key={id}
          id={id}
          patternUnits="userSpaceOnUse"
          width={colours.length * (STRIPE + SEPARATOR)}
          height={STRIPE}
          patternTransform="rotate(45)"
        >
          {colours.map((colour, index) => (
            <g key={`${colour}-${String(index)}`}>
              <rect x={index * (STRIPE + SEPARATOR)} width={STRIPE} height={STRIPE} fill={colour} />
              <rect
                className={styles.separator}
                x={index * (STRIPE + SEPARATOR) + STRIPE}
                width={SEPARATOR}
                height={STRIPE}
              />
            </g>
          ))}
        </pattern>
      ))}
      <pattern
        id={NO_DATA_PATTERN_ID}
        patternUnits="userSpaceOnUse"
        width={HATCH}
        height={HATCH}
        patternTransform="rotate(45)"
      >
        <rect className={styles.noData} width={HATCH} height={HATCH} />
        <rect className={styles.hatch} width={1} height={HATCH} />
      </pattern>
    </defs>
  );
}

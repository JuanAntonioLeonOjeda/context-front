import type { Fill } from "./community-look";
import { NO_DATA_PATTERN_ID } from "./MapPatterns";

/** The SVG `fill` of a community: its party colour, its coalition pattern or the hatch. */
export function svgFill(fill: Fill): string {
  switch (fill.kind) {
    case "solid":
      return fill.colour;
    case "stripes":
      return `url(#${fill.patternId})`;
    case "no-data":
      return `url(#${NO_DATA_PATTERN_ID})`;
    default: {
      const never: never = fill;
      return never;
    }
  }
}

/**
 * The same fill as a CSS background, for the HTML markers of very small territories. Stripes
 * keep the light separator between partners, as on the map.
 */
export function cssBackground(fill: Fill): string {
  switch (fill.kind) {
    case "solid":
      return fill.colour;
    case "stripes": {
      const step = 8;
      const stops = fill.colours.flatMap((colour, i) => [
        `${colour} ${String(i * step)}px ${String(i * step + step - 2)}px`,
        `var(--color-map-separator) ${String(i * step + step - 2)}px ${String((i + 1) * step)}px`,
      ]);
      return `repeating-linear-gradient(45deg, ${stops.join(", ")})`;
    }
    case "no-data":
      return "repeating-linear-gradient(45deg, var(--color-map-no-data) 0 5px, var(--color-map-no-data-hatch) 5px 6px)";
    default: {
      const never: never = fill;
      return never;
    }
  }
}

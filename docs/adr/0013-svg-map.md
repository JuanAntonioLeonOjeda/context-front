# ADR-0013: The map is an SVG drawn with d3-geo, one link per community

- **Status:** Accepted
- **Date:** 2026-10-13
- **Phase:** map-governments

## Context

The home page is a map of the 19 communities coloured by the parties that govern each one
(`GET /map/governments`), drawn from the IGN boundaries the backend serves
(`GET /map/geometry`, about 223 KB) with the party colours of `GET /parties`. The main use is
clicking a community to open its card. The Canary Islands are far from the peninsula, Ceuta
and Melilla are a few square kilometres, and several governments are coalitions whose party
colours can look alike (PSOE and Geroa Bai in Navarra).

## Options considered

### Rendering
- **A — own SVG with `d3-geo`** (chosen): one `<path>` per community, projected in the browser.
  - Pros: one small library; full control of colour, stripes and outline; no tiles and no
    external service; testable with Testing Library.
  - Cons: the inset and the small territories are drawn by hand.
- **B — a tile map (MapLibre, Leaflet).**
  - Cons: heavy; needs a tile provider; built for zooming streets, not for 19 shapes.

### Interaction
- **A — each community is an SVG link to its card** (chosen): the mouse click is the main use;
  being a link, it also works with the keyboard and screen readers with no extra code.
- **B — click handlers on paths.** Cons: mouse only; keyboard and names would be extra work.

## Decision

- **Projection:** a conformal conic projection fitted to the peninsula and the Balearic
  Islands, so shapes look as people know them.
- **Canary Islands:** drawn with their own projection in an inset at the bottom left, inside a
  frame, as on Spanish official maps.
- **Ceuta and Melilla:** a circle marker at their position besides their real shape, at least
  24 px across, so they can be seen and clicked (WCAG 2.5.8).
- **Colour:** each party's colour comes only from `GET /parties`. A one-party government is a
  solid fill. A coalition is a diagonal stripe pattern with one stripe per governing party,
  in alphabetical order of party id, separated by a thin light line, so partners with similar
  colours (PSOE and Geroa Bai) still read as two. Parties that only support a government never
  colour the map.
- **Outline:** every community has a double outline, light inside and dark outside, so its edge
  is visible whatever its fill and in both themes; party colours are not altered for contrast.
- **No data:** a community without a government on the date is drawn in a neutral hatch and
  says so in its name.
- **Links:** each community is an `<a>` to its card with an accessible name that states the
  facts: "Canarias: gobiernan CC y PP", "Galicia: gobierna PP (en funciones)".
- **Legend:** always visible, listing every party shown with its colour and name.
- **List of communities:** under the map, every community as a link with the same text as its
  name on the map ("Canarias: gobiernan CC y PP"), in INE order. It is the equivalent control
  that keeps every community reachable with a 44 px target on a phone, where La Rioja, Asturias
  and Cantabria measure about 20 px on the map (WCAG 2.5.8), and it writes down who governs.
  Added after the phase review (2026-10-14).
- **Attribution:** the IGN attribution from the geometry file is shown at the foot of the map
  (CC BY 4.0 requires it).

## Consequences

- What gets easier: the map is a few components and pure functions (projection, pattern per
  coalition, accessible name), each testable without a browser.
- What gets harder / what we accept: the inset and the markers are hand-placed; the stripe
  pattern needs one SVG `<pattern>` per distinct coalition.
- What would make us revisit this: municipalities or provinces on the map (thousands of
  shapes), or zooming.

## Verification

- Geometry, size and attribution: `back/data/geo/README.md` (checked 2026-10-13).
- Look-alike partners: CIEDE2000 difference PSOE–Geroa Bai 9.7, PSOE–ASG 7.1, PSOE–Sumar 12.9
  (palette proposal, 2026-10-13).
- Not verified yet: the look in a real browser; to be checked when the component exists.

---
description: Web app layout, feature folders, data fetching, the map and the dependency rules.
---

# Architecture

## Boundaries

- The app only talks to the backend API, through the generated client in
  `src/api/`. Never to outlets, statistics sites or a model provider.
- The generated client is not edited by hand. A contract change starts in the backend and
  ends with `pnpm api:generate`.
- Responses are validated at the edge (zod schemas derived from or checked against the
  OpenAPI types) before reaching components.

## Layout

```
src/
  api/          # generated client and the thin fetch wrapper
  design/       # tokens (light and dark), parties.ts, shared primitives
  i18n/         # es.ts: every user-facing string
  features/
    map/        # Spain map, community selection, coalition rendering
    community/  # community page: government, indicators
    stories/    # news by outlet, story page, timeline
    voters/     # voter profiles
  routes/       # React Router route modules, composition only
  main.tsx
```

- A feature folder contains its components, hooks and tests; it does not import another
  feature's internals, only its public entry (`index.ts`).
- Data fetching lives in hooks (`useStories(communityCode, sector)`), not in components.
- Routes compose features and own loading, error and empty states.
- Server rendering, when enabled for story pages (ADR-0004), is per route and does not
  change this layout.

## The map

- SVG generated from the geometries of the API (or a static asset derived from IGN/CNIG
  data), projected with d3-geo; the Canary Islands in an inset.
- The map is a control: every community is reachable and operable by keyboard, has an
  accessible name and announces its governing party in text.
- Coalitions render with stripes of each party's colour plus a text label; the legend
  lists every party shown.

## When NOT to apply this literally

- Tiny presentational components do not need a folder each.
- Do not create a context or a global store before two features need the same state.

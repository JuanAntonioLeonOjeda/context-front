# Review of the foundation phase, web app (2026-10-13)

Done with the criteria of `ts-reviewer` and `accessibility-reviewer` (`.claude/agents/`),
applied as mechanical checks and a read of the code. The accessibility review is static: it
cannot show conformance (see the manual checks below).

## ts-reviewer

| Check | Result |
|---|---|
| Only `src/api/client.ts` calls `fetch`; no host written outside the API configuration | pass |
| Generated client not edited by hand: CI regenerates the types and fails on any difference | pass |
| Components do not import `src/api/`; only the feature's data file does | pass |
| No deep imports into a feature from outside (checked with grep; no rule enforces it yet); no `../` imports (lint rule) | pass |
| API responses parsed with zod before use; a body outside the contract is "unreachable", never "up" | pass |
| No `as` casts or `!` on external data; the one `eslint-disable` carries its reason | pass |
| No `useEffect`; data through TanStack Query in a hook | pass |
| Loading, error and ready states of the shell; failures of a page and of the layout | pass |
| User-facing text only in `src/i18n/es.ts`; colours only in `src/design/` (tests) | pass |
| Logic in the browser (statistics, attribution, sorting) | none yet |
| Defensibility: dependency versions argued in the plan; React Router 8 vs ADR-0004 (v7) | note below |

## accessibility-reviewer (static)

| Check | Result |
|---|---|
| Landmarks: skip link first, `banner`, `main`, `contentinfo`; `lang="es"`; one `h1` per page; a `title` per route | pass |
| Skip link moves focus to `main` by code (Safari and jsdom do not follow fragments reliably) | pass, tested |
| Visible focus on every control, 3 px ring, contrast of the ring and of text pairs in both themes | pass (tests on tokens) |
| Colour is never the only cue: the error state differs by block and text | pass |
| `prefers-reduced-motion` respected | pass |
| Target size of the "Reintentar" button (about 21 px by default, below 2.5.8) | **fixed**: buttons styled with tokens, 44 px high |
| Live region of the status: same element across states, so changes are announced | pass |

## Notes, not blocking

- **ADR-0004** says "React Router v7" and the project now uses 8.4. The decision (React
  Router, library mode, server rendering later) is unchanged and every v8 change was available
  in v7 behind flags, so no supersession is needed; add a dated addendum to the ADR.
- **Status announcement:** "Datos disponibles" is announced on each page load. If it turns
  out to be noisy with a screen reader, announce only the failure.
- **Route changes** do not move focus or announce the new page yet; to do with the first real
  routes (`map-governments`).

## Not verified (needs a real browser and assistive technology)

Contrast on rendered pages, zoom to 200 % and 400 % reflow, forced-colors mode, touch target
sizes on a phone, VoiceOver and NVDA behaviour. A Playwright-based check is proposed for the
map phase, where the rendering matters.

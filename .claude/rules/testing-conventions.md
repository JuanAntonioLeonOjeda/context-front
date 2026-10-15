---
description: Testing conventions — Vitest and Testing Library, API fixtures, accessibility checks and what must be tested.
---

# Testing conventions

## Tools

- **Vitest** with **Testing Library** (`@testing-library/react`, `user-event`), queries by
  role and accessible name. **axe** checks on rendered views (`axe-core` through a small helper in `src/test/`;
  `vitest-axe` is unmaintained since 2022).
- **MSW** to serve API fixtures; fixtures are real API responses captured from the backend
  (`src/test/fixtures/`), never invented shapes.
- No snapshot tests of whole pages.

## What must be tested

- Map: every community reachable and operable by keyboard; accessible name includes the
  governing party; coalition renders text plus pattern; Canary Islands inset present.
- Story views: all outlets shown in the API order; confidence visible; empty, loading and
  error states.
- Hooks and view-model functions with hand-computed expectations.
- Neutrality: the party table is the only source of colours (a test fails if a component
  hard-codes a party colour).
- Axe: no violations on map, community and story pages in light and dark.

## Determinism

- No network, no real time (fake timers). A test that passes only locally breaks CI.

## CI

`.github/workflows/ci.yml`: install → lint → typecheck → tests → build. Green CI is
required to merge.

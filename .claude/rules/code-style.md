---
description: TypeScript and React code style — strictness, lint/format, validation at the edges, errors, accessibility basics and comments.
---

# Code style

Complements `naming-conventions.md`, `import-conventions.md` and
`atomic-functions-solid.md`.

## Language

Code, identifiers, comments, commits, ADRs and specs in **English**. User-facing strings
in Spanish, only in `src/i18n/es.ts`.

## TypeScript

- `strict: true`, plus `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`.
- No `any`. Unknown external data is `unknown` until a zod schema parses it.
- No non-null assertions (`!`); model the absence.
- Explicit return types on exported functions; discriminated unions for states; exhaustive
  `switch` with a `never` check.

## React

- Function components and hooks. State as local as possible; derive instead of
  duplicating.
- Every async view handles loading, error and empty states explicitly.
- No `useEffect` for data fetching that a hook with a query library can do; no effects to
  derive state.
- No inline colours or sizes: tokens from `src/design/`.

## Accessibility basics (reviewed by `accessibility-reviewer`)

- Semantic HTML first; ARIA only to fill gaps.
- Visible focus, keyboard operation for everything interactive, contrast per WCAG 2.2 AA
  in light and dark.
- Colour never the only cue. Respect `prefers-reduced-motion`.

## Format and lint

- Prettier and ESLint (typescript-eslint type-aware, `react-hooks`, `jsx-a11y`). Zero
  warnings. No `eslint-disable` without a justification in the same comment.

## Errors

- Expected API failures are typed results handled in the UI; unexpected ones reach an
  error boundary per route.
- Never an empty `catch`.

## Comments

- Comment the **why**: map projection choices, accessibility decisions, links to ADRs.
- No commented-out code. `TODO` only with enough context to resume it.

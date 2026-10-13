---
description: Naming conventions for files, components, hooks, types, i18n keys and tokens.
---

# Naming conventions

- Components `PascalCase.tsx` (`CommunityMap.tsx`); hooks `useXxx.ts`; everything else
  `kebab-case.ts`.
- One main responsibility per file; `utils.ts` or `helpers.ts` is a smell.
- Tests next to the code: `<file>.test.ts(x)`.
- `PascalCase` types and components, `camelCase` variables and functions,
  `SCREAMING_SNAKE_CASE` only for true module constants.
- Booleans as affirmative questions: `isCoalition`, `hasConfidence`.
- API fields keep the backend's names in the client types (`snake_case`); mapped to
  `camelCase` view models in one place per feature.
- Dates say what they are (`publishedAt`); territories are identified by INE code strings,
  never by display name.
- i18n keys: `feature.screen.element` (`stories.timeline.linkTypeAntecedent`).
- Design tokens: semantic names (`--color-surface`, `--color-text-muted`), never
  `--blue-500` in components. Party colours only in `parties.ts`.

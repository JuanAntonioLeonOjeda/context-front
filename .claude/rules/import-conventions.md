---
description: Import by alias, feature public entries only, no deep relative paths.
---

# Import conventions

- One alias, `@/` → `src/`. Relative imports only within the same folder.
- A feature is imported through its `index.ts` (`@/features/map`), never through its
  internal files; no feature imports another feature's internals.
- `src/api/` (generated) is imported by hooks, not by components.
- `import type` for type-only imports (enforced by `consistent-type-imports`).
- No barrel files outside feature entries.

## Why

Moving a file does not break importers, and the dependency direction
(`routes → features → design/api`) is visible in the path.

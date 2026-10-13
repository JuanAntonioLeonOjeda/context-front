# AGENTS.md — Regional news context portal (web app)

Route index.

Project context, scope, phases, commands, neutrality rules and what not to do live in
`.claude/rules/project-policies.md`. How the assistant must collaborate (design first,
explain, core zones written together) lives in `.claude/rules/ai-collaboration.md`. Both
are always loaded with this index. The brief and the project-wide ADRs live in the sibling
repo: `../back/docs/project-brief.md` and `../back/docs/adr/`.

## Code map

Status: ⏳ planned (does not exist yet) · 🚧 in progress · ✅ done.
Update the status column when a phase creates or finishes a path.

| Path | Content | Status |
|---|---|---|
| `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `tsconfig.json` | pnpm project, Vite, strict TypeScript | ⏳ |
| `src/api/` | typed client generated from the backend's OpenAPI; thin fetch wrapper | ⏳ |
| `src/design/` | tokens (light and dark), `parties.ts`, shared primitives | ⏳ |
| `src/i18n/es.ts` | every user-facing string (Spanish) | ⏳ |
| `src/features/map/` | Spain map, community selection, coalition rendering | ⏳ |
| `src/features/community/` | community page: government, indicators | ⏳ |
| `src/features/stories/` | news by outlet, story page, timeline | ⏳ |
| `src/features/voters/` | voter profiles | ⏳ |
| `src/routes/` | React Router route modules (composition, loading and error states) | ⏳ |
| `src/test/` | fixtures (real API responses), MSW handlers | ⏳ |
| `.env.example` | public configuration (`VITE_API_BASE_URL`) | ⏳ |
| `.github/workflows/ci.yml` | lint, typecheck, tests, build | ⏳ |
| `docs/adr/` | front-only ADRs (project-wide ones are in `../back/docs/adr/`) | ⏳ |
| `specs/<phase>/` | `spec.md`, `plan.md`, `tasks.md` for each phase (workflow `spec-driven-phase`) | ⏳ |

Dependency rules: `.claude/rules/architecture.md` and `.claude/rules/import-conventions.md`.

## `.claude/` map and agent config

| Path | What it holds |
|---|---|
| `.claude/settings.json` | team permissions: allowed read-only/dev commands, `.env` blocked |
| `.claude/rules/project-policies.md` | context, phases, commands, attribution, neutrality in the UI, what not to do |
| `.claude/rules/ai-collaboration.md` | the AI-assisted working agreement: design first, explain, collaborative core zones, small commits |
| `.claude/rules/architecture.md` | boundaries, feature folders, data fetching, the map |
| `.claude/rules/code-style.md` | strict TypeScript, React, accessibility basics, lint/format, errors |
| `.claude/rules/naming-conventions.md` | files, components, hooks, i18n keys, tokens |
| `.claude/rules/import-conventions.md` | `@/` alias, feature public entries |
| `.claude/rules/atomic-functions-solid.md` | atomic functions and the SOLID that applies here |
| `.claude/rules/testing-conventions.md` | Vitest, Testing Library, MSW, axe, what must be tested |
| `.claude/rules/core-zones.md` | (path-scoped) map, timeline, voters, party table: collaborative mode |
| `.claude/agents/ts-reviewer.md` | project reviewer (read-only): boundaries, states, edges, strictness |
| `.claude/agents/accessibility-reviewer.md` | WCAG 2.2 AA reviewer (read-only) |
| `.claude/agents/neutrality-reviewer.md` | neutrality reviewer (read-only): party table, outlet order, wording, confidence shown |
| `.claude/agents/code-reviewer.md` | generic reviewer (read-only): security, correctness, performance, maintainability |
| `.claude/commands/create-pr.md` | `/create-pr`: PR with `gh`, conventional commit, generated description |
| `.claude/commands/new-adr.md` | `/new-adr <title>`: ADR skeleton that the author fills in |
| `.claude/commands/defend.md` | `/defend <path or topic>`: interview-style questions on a piece of the system |
| `.claude/workflows/spec-driven-phase.md` | plan (and wait) → spec → plan → tasks → implementation → tests → review → ADR → defend |
| `.claude/workflows/git-workflow.md` | `main`/`develop`, branch naming, Conventional Commits, small atomic commits |
| `.claude/workflows/architecture-decision.md` | when an ADR is needed and how to write one together |

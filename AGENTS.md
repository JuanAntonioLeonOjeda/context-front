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
| `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `tsconfig.json` | pnpm project, Vite, strict TypeScript; `/api` dev proxy | ✅ |
| `src/api/` | typed client generated from the backend's OpenAPI (`pnpm api:generate`; `openapi.json` and `schema.d.ts` are generated, never edited by hand); `client.ts`, `config.ts` | ✅ |
| `src/design/` | tokens (light and dark, including the map's), base styles, contrast helper, `parties.ts` (the only place that turns parties into colours and names; colours come from the API); the typeface, Atkinson Hyperlegible Next, from `@fontsource-variable` and served by our own nginx | ✅ |
| `src/i18n/es.ts` | every user-facing string (Spanish) | ✅ |
| `src/features/map/` | the map (ADR-0013): projection with the Canary Islands inset, each community's fill and accessible name, SVG links, stripes for coalitions, HTML markers for Ceuta and Melilla, legend, data hook; the party panel beside the map (a row per party with a square per community, ordered by name, highlights its communities) | ✅ |
| `src/features/community/` | community page: government with sources, caretaker note, parties that govern and that only supported the investiture, the five INE indicators as cards with an SVG line chart (no library), its extremes in words and its data in a table; news by sector (`?sector=`) as a timeline by day with the stripe of the responsible parties, who is responsible, the basis and the confidence in words; data and news side by side from 64rem, two tabs below it (`?view=`) | ✅ |
| `src/features/stories/` | news by outlet, story page, timeline | ⏳ |
| `src/features/voters/` | voter profiles | ⏳ |
| `src/routes/` | React Router route tree (`buildRoutes`), root layout, home, not found, error boundaries | 🚧 |
| `src/features/health/` | backend health: validated fetch, hook, status shown in the footer | ✅ |
| `src/test/` | fixtures (real API responses), MSW server, axe helper, health and query helpers | ✅ |
| `.env.example` | public configuration (`VITE_API_BASE_URL`, `API_PROXY_TARGET`) | ✅ |
| `scripts/` | `api-generate.mjs`: downloads the backend contract and generates the types | ✅ |
| `Dockerfile`, `nginx.conf`, `.dockerignore` | production-style image: pnpm build, then nginx serving the app and forwarding `/api` to the backend; built by the compose file in `../back` (project `datos`, service `front`, profile `app`) | ✅ |
| `.github/workflows/ci.yml` | format, lint, typecheck, generated types in sync, tests, build | ✅ |
| `docs/adr/` | front-only ADRs: 0013 (the map as an SVG with d3-geo); project-wide ones are in `../back/docs/adr/` | 🚧 |
| `specs/<phase>/` | `spec.md`, `plan.md`, `tasks.md` for each phase (workflow `spec-driven-phase`); `foundation` and `map-governments` also have `review.md` (the latter in `../back/specs/` for both repos) | 🚧 |

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
| `.claude/workflows/spec-driven-phase.md` | plan (and wait) → spec → plan → tasks → implementation → tests → review → ADR (`/defend` optional) |
| `.claude/workflows/git-workflow.md` | `main`/`develop`, branch naming, Conventional Commits, small atomic commits |
| `.claude/workflows/architecture-decision.md` | when an ADR is needed and how to write one together |

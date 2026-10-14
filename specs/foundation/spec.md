# Phase 0 — foundation: spec (web app)

## What it solves

A web app skeleton with its quality gates, design tokens and a typed connection to the
backend, so `map-governments` can start on the map itself.

## Out of scope

The map, community pages and any data view (phase `map-governments`). Server rendering
(phase `story-contrast`, ADR-0004).

## Acceptance criteria

**AC1 — runs.** Given a clean checkout, when the author runs `pnpm install` and `pnpm dev`
with the backend up, then a page shell shows the app name and the backend health status.

**AC2 — quality gates.** Given any commit, when CI runs, then lint, typecheck, tests and
build pass.

**AC3 — typed API.** Given the backend's OpenAPI, when `pnpm api:generate` runs, then a
typed client exists in `src/api/` and the health call uses it, validated with zod.

**AC4 — tokens and themes.** Given the design tokens, when the system theme is light or
dark, then the shell renders with the matching palette and axe reports no violations in
either.

**AC5 — states.** Given the backend down, when the shell loads, then it shows an error
state written in `src/i18n/es.ts`, not a crash.

## Open questions

None blocking. Dependencies are listed in `plan.md` for the author's yes.

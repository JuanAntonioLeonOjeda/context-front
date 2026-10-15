---
description: Project description, scope and phases, commands, secrets, attribution, neutrality in the UI and what not to do.
---

# Project policies and context

## What this is

The **web app** of a public portfolio project: an interactive map of Spain where each
community (CCAA) and sector shows recent news from several outlets grouped by story, the
governing party or coalition (no news item is attributed to a party, ADR-0018), a
timeline of earlier events, statistical context and voter profiles. The backend and data
pipeline live in the sibling repo `../back`, which also holds the brief
(`../back/docs/project-brief.md`) and the project-wide ADRs (`../back/docs/adr/`).

Priority: **clarity, accessibility and neutrality over features**. The working agreement
with the assistant: `.claude/rules/ai-collaboration.md`.

## Phases

Same phases and names as the backend (`../back/.claude/rules/project-policies.md`); each
goes through `.claude/workflows/spec-driven-phase.md` with its own `specs/<phase>/` and
`feature/<phase>` branch.

| # | Phase | What the web app does in it |
|---|---|---|
| 0 | `foundation` | Vite + React + React Router v7, tooling, API client from OpenAPI, design tokens |
| 1 | `map-governments` | map coloured by governing party, community page with government and basic indicators |
| 2 | `news-live` | sector filter, latest news by outlet (the party responsible was removed by ADR-0018) |
| 3 | `story-contrast` | story page: all outlets side by side, common summary; server rendering for shareable pages |
| 4 | `history-trace` | timeline of linked events with link type and confidence |
| 5 | `context-voters` | indicators next to each story, voter profile pages |
| 6 | `verification` | verification sheets and verdicts |

**Do not start a phase without the previous one closed.**

## Commands

Fill in the real scripts during `foundation` and keep this list true:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm api:generate     # regenerate the typed client from the backend's OpenAPI
```

## Secrets and configuration

- Only public configuration reaches the browser (`VITE_*`): the API base URL. Anything
  secret stays in the backend. `.env` is never committed or read by the assistant.

## Attribution

Data sources shown in the app (INE, ministries, CIS, election results, outlets) keep
their attribution visible on the pages that use them.

## Neutrality in the UI

- Party colours and names come only from `src/design/parties.ts`, fed by the API's party
  table. No component branches on a party.
- Colour is never the only cue: coalitions and parties also carry text or pattern.
- Outlets appear in the order the API returns, which is stable and documented; the UI
  never re-ranks them.
- No news item is tied to a party (ADR-0018): no responsible, no party colour next to an item.
- Confidence of a link is shown, not hidden.
- Texts (`src/i18n/es.ts`) have no evaluative adjectives about parties or governments.
- Review with `neutrality-reviewer`.

## What NOT to do

- Do not implement a phase without its plan being confirmed by the author.
- Do not generate a core zone in one go (see `ai-collaboration.md`, section 2).
- Do not compute statistics, attributions or dates in the browser: they come from the API.
- Do not call outlets, statistics sites or an LLM from the browser.
- Do not add dependencies outside the stack in the ADRs without justifying them first and
  getting a yes.
- Do not commit secrets or `.env`.
- Do not create content in `.claude/` just to fill a folder: add it when the need is real.

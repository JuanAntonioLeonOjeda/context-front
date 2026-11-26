# Proposal 0001: Voting by sex in the voter profile

- **Status:** Proposed — awaiting the author's decision
- **Date:** 2026-11-19
- **Phase it would belong to:** `context-voters` (phase 5) or a later one
- **Scope:** cross-repo. The decision that matters (data source + endpoint) is a
  project-wide one and, once taken, becomes an ADR in `../back/docs/adr/`; the web app's
  presentation of it becomes a front-only ADR here. This file only frames the decision and
  asks the questions, as `.claude/workflows/architecture-decision.md` requires. Nothing is
  decided or built yet.

## The request

> "Ver solo hombres, mujeres, no binarios o todos en las gráficas de perfil de votante, y
> —si el INE lo permite— filtrar también por orientación sexual."

## What we already established (prior conversation)

1. **The voter profile is an ecological inference, not people.** It groups a community's
   **municipalities** into bands of an INE statistic (income, size, education, age, born
   abroad) and shows how those municipalities voted. Its own on-screen note says it
   "describes areas, not people" (`src/i18n/es.ts:395`). There is no per-voter datum in it.
2. **Official results carry no sex.** Election results come from the Ministerio del Interior,
   aggregated by municipality; the ballot is secret. Neither the Interior nor the INE
   publishes who each sex voted for. So a sex **filter cannot be layered on the current
   profile**: the dimension does not exist in that data.
3. **The INE has the electoral _census_ by sex** (who may vote, by sex and age) — not how
   they voted. Different thing.
4. **The only source that crosses vote × sex is the CIS**, through its post-electoral
   surveys ("recuerdo de voto" tabulated by sex). That is **survey** data: a sample, with a
   margin of error, self-reported — not official results.
5. **Non-binary and sexual orientation have no source at all** for vote: not in the INE, not
   in the standard CIS post-electoral cross-tabulation (it tabulates sex as man/woman). This
   part of the request cannot be honoured by anyone's data today.

## The decision to take

Do we add a **new, clearly separated "voting by sex" view** based on CIS post-electoral
data — a different source and a different method from the ecological profile — or do we not
build it? And if we build it, at what geographic level, given the CIS sample is national?

## Options

### A — Do not build it (keep the method honest)
- **Pros:** no new source to maintain; the voter profile stays one coherent method
  (official results + INE areas); no risk of users reading a survey as if it were results;
  nothing promises data we cannot stand behind.
- **Cons:** the user's question goes unanswered in the product.

### B — A separate "voting by sex" view, sourced from the CIS post-electoral survey
A new section (not a toggle inside the ecological profile), labelled as a survey, showing
the CIS recall-of-vote by sex with its margin of error and a link to the study.
- **Pros:** it is the only honest way to show vote × sex; fits the project's rule of
  **showing confidence, not hiding it** (margins of error, sample size, field dates); keeps
  the two methods visibly apart so neither contaminates the other.
- **Cons / what it costs:**
  - A **new data source** (CIS) with its own ingestion in the backend; a **new endpoint**;
    then `pnpm api:generate` and a new feature folder here. This repo (frontend) cannot do
    any of that alone.
  - **Geography mismatch — the biggest risk.** The CIS post-electoral sample is national
    (a few thousand respondents). A robust vote × sex break for a single community (e.g. La
    Rioja) generally **does not exist or has an unusable margin of error**. The whole app is
    organised **per community**. So a CIS view would most likely be **national only**, which
    sits awkwardly on community pages. Decide this before anything else.
  - Only **man/woman**. Still no non-binary, still no sexual orientation.

### C — A new ecological **dimension** `sex_ratio` (municipalities by share of women)
Group municipalities by their percentage of women (the INE municipal census has population
by sex), exactly like the existing `born_abroad` dimension. It would be **area-level**, with
the same "describes areas, not people" caveat.
- **Pros:** same method, same shape as today; fits per community; only a backend dimension +
  `pnpm api:generate`, no new source family.
- **Cons:** it is **not** "how men vs women voted" — it is "how municipalities with more vs
  fewer women voted". Presenting it as the former would be the ecological fallacy the feature
  explicitly warns against. Non-binary and orientation still impossible. It arguably does not
  answer the request, only sounds like it does.

## Recommendation (the author decides)

If the goal is genuinely "how did men and women vote", **Option B**, built as a **separate,
clearly-labelled survey section**, probably **national-level first**, is the only faithful
answer — and only if the author accepts the survey nature and the geography limit. If the
goal is "a sex-related angle on the existing per-community map of how areas voted", **Option
C** is cheap and consistent but must never be worded as individual vote by sex. **Non-binary
and sexual orientation are out of scope in every option** for lack of any source; the UI
should say so plainly rather than offer an empty control.

My lean: **B, national, survey-labelled**, or **A** if the national-only limitation makes B
not worth the new source. I would not do C under a "género" label — too easy to misread.

## If we go with B — shape to agree with the backend

Frontend cannot invent this; it is here only to make the contract concrete for the
conversation with the backend. A possible response shape (to be decided there):

- the election it refers to, with source (CIS study id + URL, field dates);
- `level`: `national` (and `community` only where the sample supports it);
- per sex group (`man`, `woman`): recall-of-vote shares per party, each with its
  **confidence interval** and the **base** (unweighted n);
- the method note and the margin of error, always shown.

Party colours and names would still come only from `src/design/parties.ts`. Every figure
would carry its confidence. Outlets/parties order unchanged. No value computed in the
browser.

## Frontend presentation principles (if built)

- A **new feature folder** (e.g. `src/features/voters-survey/`), not a mode of the ecological
  profile; the two methods must not share a chart or a caption.
- Every number shown **as a survey**: "Encuesta postelectoral del CIS", sample size, field
  dates, margin of error visible next to the figure, link to the study (attribution rule).
- The same neutrality rules as everywhere: colour never the only cue, all parties one code
  path, confidence shown not hidden.
- Accessibility reviewed (keyboard, names, contrast) and `neutrality-reviewer` run, since it
  touches party figures and wording.

## Consequences

- **Easier:** answers a real question users have; demonstrates the project can hold two
  different evidential standards (official vs survey) side by side without conflating them.
- **Harder / accepted:** a second data source to ingest and keep fresh; a view that is
  national while the rest is per community; the permanent gap that non-binary and orientation
  cannot be shown.
- **Revisit if:** the CIS (or another body) ever publishes a robust per-community vote × sex
  break, or any source adds non-binary / orientation.

## Open questions for the author

1. Option **A, B or C** — and is the **survey nature** of B acceptable in this project?
2. For B, is **national-only** acceptable on community pages, or must it be per community
   (which the CIS sample likely cannot support)?
3. Do we state explicitly in the UI that **non-binary and sexual orientation have no data**,
   or leave them out silently?
4. Which election(s) first — only the latest, or the series the CIS covers?
5. Does this become its **own phase**, or ride inside `context-voters`?

Once answered, this becomes: a project-wide ADR in `../back/docs/adr/` (source + endpoint),
a front-only ADR here (presentation), and a `specs/<phase>/` spec/plan/tasks.

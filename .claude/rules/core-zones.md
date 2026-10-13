---
paths:
  - "src/features/map/**"
  - "src/features/stories/timeline/**"
  - "src/features/voters/**"
  - "src/design/parties.ts"
---

# You are in a core zone

These files are what an interviewer will ask the author to explain or change live.
Follow `.claude/rules/ai-collaboration.md`, section 2:

1. Explain the concept and the options first, without code.
2. Ask: does the author write it, write it together, or want it written with an
   explanation?
3. One small unit at a time, every non-obvious line explained, wait for review.
4. Close with 2–3 interview questions about what was just built.

Also:

- Check the accessibility behaviour (keyboard, names, contrast) before calling a task
  done, and run `accessibility-reviewer`.
- If the change embodies a decision, check that an ADR covers it; if not, propose
  `/new-adr`.

---
description: Atomic functions and the practical SOLID that applies to this React project.
---

# Atomic functions and SOLID

- A function or component does **one** thing. If its description needs an "and", split it.
- Pure functions for data shaping (view models, sorting that the API did not do, formatting
  of values the API sent); components stay thin.
- Past ~25 lines or 2–3 levels of nesting in a function, extract named sub-functions. More
  than 3 positional parameters → an options object.
- Components take data and callbacks via props; they do not reach for global state or fetch
  by themselves. Hooks own data fetching.
- Open/closed: a new sector or link type is a new entry in a table or config consumed by
  the components, not another `if` in them.
- Over-engineering is as hard to defend as messy code: no abstraction for one use.

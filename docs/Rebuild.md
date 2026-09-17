# Rebuild

**Status:** Agreed  
**Date:** 17 September 2026

## Why this is a rebuild and not a refinement

An earlier build of Wizly Labs exists. Many agents wrote it in parallel, each in its own worktree, and the work was merged together. It passed its automated checks: 529 tests and every build gate. Other agents reviewed it repeatedly. It was never used end to end in a browser.

The first five minutes of real use found four defects none of those checks had caught:

- Home sent more than six hundred requests within seconds, the pace limit refused Quick Notes, and the page reported the notes as unavailable.
- Code Lab opened with no starter, and pressing Run ended at once.
- Code never really ran, because development used stand-in services instead of the execution server.
- Pages showed specification sentences as interface text.

Three things decided the question.

1. **The product changed at its foundations.** Each change below runs through access, content handling or configuration, and every domain stands on those.
   - Three fixed roles are read from WordPress, with no permission editor inside Labs.
   - Published content stays editable.
   - Permanent delete keeps learner history.
   - Written lessons and video share one Subject → Chapter → Lesson hierarchy.
   - There is one `.env`.
   - There are no stand-in services.
   - There is no sign-in during development.
2. **Adapting the old code costs as much as writing it again.**
   - The earlier code is about 228,000 handwritten lines.
   - It follows conventions this product no longer uses: a named permission on every method, a permission matrix, 335 configuration names, stand-in services and generated client code.
   - Carrying a module across means stripping those out. That costs about what a rewrite costs, carries more risk and gives a worse result.
3. **The way of working changed.** Reviews by other agents cost days and still let defects through. With the owner's manual check of each slice setting the pace, copying old code saves almost nothing. This build is different:
   - It is written once, in sequence, on `main`, against real services.
   - Each slice is complete: backend, pages and staff screens.
   - The owner checks each slice by hand before the next one starts.

## What is carried forward

Knowledge, not code. The earlier build solved hard problems:

- running code safely
- timed tests
- rewards that never pay twice
- erasure
- background work that survives a restart

Its engines may be read to learn those cases before the same capability is written here. Nothing is copied. This page is the only place in the repository that refers to the earlier build.

| Read for reference only | Where |
|---|---|
| The earlier build, its engines above all | `H:\Claude\Sprinkle-Jelly\Sprinkle-Jelly` |
| The local development flow this build follows: one start script, one `.env`, automatic sign-in in development | `H:\Claude\Wizly Learning\labs-refresh` |

The execution server is already deployed, and it is used as it stands. It is infrastructure, not code in this repository.

## What this build promises

- One architecture, simple enough to state in one document, with its boundaries enforced from the first commit.
- Real services everywhere, so a broken dependency shows at once.
- Nothing counts as done until it has been seen working.

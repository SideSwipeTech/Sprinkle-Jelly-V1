# DifficultyBadge

The level tag — replaces the literal difficulty chips that were painted with
rgba literals (teal/amber/rose) or with `chip--accent`, a class that had **no
backing styles** (used at Practice.tsx:394/886 and six Assess sites — Hard
rendered as a plain chip).

## Tell

A three-pip meter: easy fills one, medium two, hard three. The **count** — not
the hue — carries the level, so it survives greyscale, colour-blindness and
every accent theme. Tone reinforces via `data-level` (easy→`--c-success`,
medium→`--c-warning`, hard→`--c-error`).

## Props

- `level` — `"Easy" | "Medium" | "Hard"` (matches the data verbatim).
- `meta` — trailing fact, e.g. `"20 XP"` → renders "(20 XP)".
- `label` — visible-word override when a surface needs different copy.
- `className` — escape hatch.

`aria-label="Difficulty: <level>"` — the meter is `aria-hidden`.

## States

`data-level="easy|medium|hard"` drives pip fill + tone. Static tag only —
difficulty is a fact, not a toggle (filters are `Chip`).

## Used on

- `/challenges` — catalogue rows (Practice.tsx:194-212)
- `/challenges/:id` — statement card tag (Practice.tsx:394)
- `/tracks/:id` — sequence rows (Practice.tsx:274)
- `/debug`, `/debug/:caseId` — case cards (Practice.tsx:842/886)
- `/daily` archive rows, `/challenges/history`
- `/assessments`, `/assessments/browse`, `/company/:id` — paper/company level
- Kitchen Sink `/element-lab` — "Easy (20 XP)" tints

## Notes

- `data/data.ts` carries exactly three difficulty values — the set is closed.
- The pill silhouette matches `x-chip` so badges sit cleanly beside filters.

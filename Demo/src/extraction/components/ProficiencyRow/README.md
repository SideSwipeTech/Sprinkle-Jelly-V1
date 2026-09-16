# ProficiencyRow (+ ProficiencyPanel)

Per-category figure rows on the scorecard, and the inset panel that hosts them.

## Props

`ProficiencyRow`
- `label: string`
- `pct: number | null` — null → em dash + empty track (never a zero claim)
- `verdict?: "met" | "gap" | "unknown"` — defaults: 100 → `met`, below → `gap`,
  null → `unknown`. Explicit override for rubrics whose benchmark is not 100.

`ProficiencyPanel`
- `title: string` — the eyebrow over the inset
- `children` — the rows

## Non-colour tells

Verdict rides `data-verdict` plus an icon (check / alert / minus) and a meter bar
whose length states the figure even in greyscale.

## Used on

- `/mock/:paperId/result` — MockResult "Category proficiency" inset

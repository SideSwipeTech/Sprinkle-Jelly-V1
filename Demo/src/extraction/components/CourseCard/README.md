# CourseCard

One catalogue entry — cover variant for interactive courses, plain for studio
video.

## Props

- `eyebrow`, `title`, `icon?: IconName`, `summary`
- `cover?: boolean` — the accent-gradient strip (lessons family)
- `coverage?: "not-started" | "learning" | "covered" | "completed"` — renders the
  kit `CoverageTag` in the header action slot
- `enrolled?: boolean` — the "Enrolled" chip (success tone + check icon)
- `meta?: string[]` — quiet chips (first one loud, matching the demo)
- `action?: ReactNode` — CTA row
- `index?: number` — Card entrance stagger

## Legacy violations fixed

- `rgba(45,212,191,.15)` + `#2dd4bf` "Enrolled" chip → `color-mix` on
  `--c-success` + check icon + word (non-colour tell).
- `marginTop:12` CTA row → `--space-3`.

## Composes

Kit `Card`, `CardHeader`, `CoverageTag`; `x-chip`/`x-chip--quiet`
(controls/Chip); `x-btn` (controls/Button).

## Used on

- `/courses` — the interactive-lessons grid (cover) and video grid (plain)

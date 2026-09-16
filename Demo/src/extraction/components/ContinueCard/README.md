# ContinueCard

The "resume where you left off" region — one anatomy, two layouts.

## Props

- `item: { title, context, percent, to } | null` — null renders the honest
  `empty` StateBlock; nothing is invented as a target.
- `layout?: "hero" | "rail"` — hero puts the Resume action in the card header
  (Dashboard cell); rail is the narrow tinted card with the CTA at the foot
  (Courses page, was `.continue`).
- `emptyAction?: ReactNode`, `emptyMessage?: string` — the empty state's way
  onward and copy.
- `chargeLabel?: string` — accessible name for the `Charge` bar.
- `className?: string` — the Dashboard cell's grid span stays the page's
  (`home__continue`); pass it here.

## Composes

Kit `Card` (`live` when an item exists), `CardHeader`, `StateBlock`, `Charge`;
`x-btn x-btn--primary` (controls/Button) for Resume.

## Used on

- `/` — Dashboard "Continue" cell (PRG.CONT.01)
- `/courses` — Learn "Continue learning" card

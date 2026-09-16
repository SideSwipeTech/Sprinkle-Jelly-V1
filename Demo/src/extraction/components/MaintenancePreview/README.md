# MaintenancePreview

The learner-facing read of a declared maintenance window — status chip, affected
paths, learner-safe message, window facts, closing note.

## Props

- `status: string` — the chip word ("Declared")
- `title: string` — affected paths
- `message: ReactNode` — the learner-safe message
- `facts: { term, value }[]` — starts / expected end; null → em dash
- `note?: ReactNode` — the "no manual End control" inset

Renders only when declared — the pre-declaration state is the caller's
`StateBlock` (see the `undeclared` state).

## Composes

`x-chip x-chip--quiet` (controls/Chip), `x-key-value` dl (containers/KeyValueRow).

## Used on

- `/admin/maintenance` — "Learner preview" card

# ActionRail

The action rail a person's admin detail carries: every administrative action
grouped by stakes — `ordinary` / `elevated` / `destructive` / `restorative` —
with restorative in the opposite tone from destructive (admin/01-pages
"Confirmation friction"; admin.F11).

## Props

- `groups: ActionRailGroup[]` — each group: `stakes`, `label`, optional `note`,
  `actions`. An empty group renders nothing (honest absence); a rail with no
  actions at all renders nothing.
- `label?: string` — accessible `nav` name (default "Actions").
- `className`.

### ActionRailItem

- `id`, `label`, `hint?` — the action's name and its consequence line.
- `icon?: IconName`.
- `to?` → router `Link` row · `onClick?` → real `<button>` row.
- `friction?: "confirm" | "typed" | "typed-reason"` — the confirmation tier the
  action demands, stated on the row in the spec's own words ("an ordinary
  confirm" / "a typed confirmation" / "a typed confirmation + reason").
- `disabled` + `disabledReason` — an inert control explains why rather than
  failing silently (dashed frame, warning-toned reason, `aria-disabled`,
  removed from tab order, refuses activation for pointer/keyboard/AT).

## States

`data-stakes` on the group: `ordinary` (neutral) · `elevated` (warning) ·
`destructive` (error) · `restorative` (success). Tone is the group frame +
heading + marker icon — colour never carries alone, and there is no edge
stripe.

## Used on

- `/admin/users/:userId` — the person's detail (admin/01-pages "beside an
  action rail grouped by stakes")

## Notes

`--tracking-micro` does not exist yet; used with `normal` fallback, same as the
other extraction micro labels.

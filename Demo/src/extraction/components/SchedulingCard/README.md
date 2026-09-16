# SchedulingCard

The daily studio's one addition to the shared practice editing space: the
product-date schedule card. It states the product date a Daily occupies, the
date's classification, and the gap indicator.

## Props

| Prop | Type | Notes |
|---|---|---|
| `date` | `string` (ISO `YYYY-MM-DD`) | the product date; absent on a draft |
| `status` | `unscheduled \| scheduled \| empty \| blocked` | the schedule-health classification + draft's unscheduled |
| `occupyingTitle` / `occupyingDate` | `string` | the clash names the occupying challenge and its date |
| `isGap` | `boolean` | an empty date inside the health window = schedule risk |
| `readOnly` | `boolean` | the date renders as a fact, no controls |
| `onDateChange` | `(iso) => void` | editable `<input type="date">` |
| `onUnschedule` | `() => void` | frees the date — offered only while scheduled |

## States

`scheduled` · `empty-gap` · `blocked-clash` · `unscheduled-draft` · `read-only`

## Spec truths carried

- **A draft carries no date** — assigning one is an act of publishing
  (unscheduled state says so in its own words).
- **A clash names the occupying challenge and its date and writes nothing.**
- **An empty date is a neutral date** — a plain statement, never an error,
  a dead card or a disabled control pretending a challenge exists; inside the
  health window it renders as schedule risk.
- Status rides a `StatusText` chip (icon + tone) — never colour alone.

## Depends on

`StatusText`, `Button` (sibling imports per the task brief's composition
sanction), kit `Icon`.

## Used on

- `/admin/daily/:date` — DailyEditor (the `children` slot of
  PracticeEditorSpace)

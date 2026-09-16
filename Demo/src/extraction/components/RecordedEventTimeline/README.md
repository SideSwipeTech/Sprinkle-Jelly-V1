# RecordedEventTimeline

The ordered integrity timeline of one test (assessments.F22). Read-only; neutral
vocabulary throughout — a count is never a finding about a person.

## Props

- `events: RecordedEventEntry[]` — each entry carries `kind` (one of the five
  counted kinds), `at` (the platform-clock instant), `test` (the test it belongs
  to), `counted`, `source` (the technical source that reported it) and an
  optional `note` saying why an uncounted entry did not count.
- `status?: "ready" | "unavailable"` — `unavailable` renders the honesty state
  instead of a guessed timeline.
- `label?: string` — accessible name for the ordered list.

## Behaviour

- Entries sort by `at` ascending; the five kind labels are the records
  document's own (fullscreen exit, page hidden, window blur, clipboard action,
  restricted navigation).
- `data-counted` marks the entry; counted/uncounted is icon + word, never colour
  alone.
- Empty and unavailable render `StateBlock`, never an empty rail.

## Used on

- `/admin/sittings/:sittingId/events` — recorded-event review

# ErasureFlow

The staged account-erasure control — adopted from Account.tsx:277-298, which was
already token-clean. The page owns the stage; the component renders it.

## Props

- `stage: "idle" | "review" | "requested"` — the three honest stages
- `onReview`, `onSubmit`, `onCancelReview`, `onCancelRequest` — the transitions
- `consequences: { icon: IconName; text: ReactNode }[]` — the review list
- `cancellationDeadline?: string` — appended to the requested message
- `intro?: ReactNode` — idle copy

## Notes

- Review renders a `pending` StateBlock + the consequence list (sibling
  `x-home-list`/`x-home-row` classes — domain/HomeRow, muted icon tone) +
  submit/cancel.
- Requested renders `pending` + the received-event row (was `.timeline-row`) +
  cancel.
- No stage renders a fake progress bar — the queue is a fact, not a meter.

## Used on

- `/settings` (privacy tab) — "Account erasure" card

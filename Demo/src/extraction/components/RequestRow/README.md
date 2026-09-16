# RequestRow (+ RequestHistory)

One private topic request — title, date, status chip, withdraw where honest —
plus the labelled "Your requests" section.

## Props

`RequestHistory` — `title?`, `kicker?`, `children`. Landmark via
`aria-labelledby` on the generated heading id.

`RequestRow`
- `title`, `createdAt: string`
- `status: "Under Review" | "Planned" | "In Authoring" | "Published" | "Withdrawn"`
  — closed set; rides `data-status` on the chip (each tone keeps its word).
- `onWithdraw?: () => void` — rendered only for `Under Review`; a withdrawn
  request is not re-opened here.

## Composes

`x-list`, `x-list-row` (containers), `x-chip x-chip--quiet`, `x-btn x-btn--quiet`
(controls).

## Used on

- `/requests` — RequestsPage "Your requests" section

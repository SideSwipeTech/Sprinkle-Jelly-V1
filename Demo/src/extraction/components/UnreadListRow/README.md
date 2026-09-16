# UnreadListRow

The notification record row — a `list-row` article with an unread tell.
Extracted from Account.tsx:72-88 (`/notifications`), the only unread-row site.

Pure `x-list-row` composition (contract §6 — class emitted, sibling not
imported): the frame, the hover affordance and the `data-unread` accent edge
all come from containers/ListRow. This component owns the inner anatomy —
head (`title` + `meta` + marker) over a body line.

## Props

- `title: ReactNode` — the record's headline.
- `meta?: ReactNode` — trailing stamp ("2h ago"), sits beside the marker.
- `children` — the body line under the head.
- `unread?: boolean` — `data-unread` (the 3×border-width accent edge) + shows the marker.
- `badge?: ReactNode` — the marker text; `"NEW"` by default, `null` hides it.
  The edge alone remains a shape tell when the marker is suppressed.
- `to?` → router `Link`; `onClick?` → real `<button>`; `as?` → `article` (default) / `div`.
- `selected?`, `disabled?` — the shared row semantics (`data-on`/`aria-pressed`; real `disabled`/`aria-disabled`, never pointer-events).

## States (states.ts)

`unread` · `read` · `unread-no-badge` · `link` · `stack`.

## Legacy violations fixed

- `border-left: 3px solid var(--c-accent-primary)` inline → `data-unread`.
- Marker `color: "white"` → `var(--c-on-accent-primary)` — the ink is not white
  in every theme.
- Marker `marginLeft: "6px"` → `--space-2` gap in the meta slot; `fontSize:
  "10px"` → `--text-2xs`.

## Needed tokens

- `--tracking-micro` — micro-label tracking (used with `normal` fallback,
  same convention as work/Workbench's stdin label).

## Used on

- `/notifications` (Account.tsx) — notification rows.

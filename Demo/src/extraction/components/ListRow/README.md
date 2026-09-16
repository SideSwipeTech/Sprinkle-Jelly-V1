# ListRow

The polymorphic row and its stack — `.list` / `.list-row` (app.css:83-102),
the single most reused container in the demo (~25 sites). Every page built
catalogue rows, result rows, chapter pickers and record rows on it.

## Exports

| Export | What it is |
|---|---|
| `List` | `x-list` — the flex-column stack (`--space-3` gap). Plain `div`; use `HomeList` when `ul`/`li` semantics are the honest call. |
| `ListRow` | `x-list-row` — one row. Element resolves in order: `to` → router `Link`; `onClick` → real `<button type="button">`; `as` → `article` / `div` (default `div`). |

## Props

- `to?: string` — route target. The row navigates; it is a real link.
- `onClick` — action. Always produces a `<button>` (an interactive row must be a real interactive element — the demo never had a clickable div worth keeping).
- `as?: "div" | "article"` — static element; `article` for self-contained records (requests, certificates).
- `selected?: boolean` — `data-on`; on a button row also `aria-pressed`.
- `current?: boolean` — `data-on` + `aria-current="true"` (the row points at the open thing).
- `done?: boolean` — `data-done`, the success edge (was `border-left:3px solid #2dd4bf` at Practice.tsx:184).
- `unread?: boolean` — `data-unread`, the accent edge (was the same literal at Account.tsx:72). The full unread anatomy is sibling `UnreadListRow`.
- `disabled?: boolean` — real inert semantics: `disabled` + `aria-disabled` on buttons, `aria-disabled` + `tabIndex={-1}` + click-suppressed on links.
- `align?: "start" | "center"` — `--center` modifier; the demo's recurring inline `alignItems:"center"` override.
- `label?: string` — `aria-label` when the row's text doesn't name it.
- `[data-*]` passthrough — `data-hover` / `data-focus` are sink pins that paint those states statically; pages never set them.

## States (states.ts)

`static` · `link` · `button` · `selected` · `current` · `done` · `hover` (pin) ·
`focus` (pin) · `disabled` · `align-center` · `empty` · `pending` · `stack`.

Empty and pending are honest-absence states: a `StateBlock` inside the `List`,
never a styled empty container. The states family owns `Skeleton` for pending
rows when it lands.

## Composes (sibling classes, not imports)

`x-chip` (controls/Chip) in trailing slots; `meta` global utility for the
sub-line. `SequenceRow` and `UnreadListRow` emit `x-list-row` directly — this
sheet is their frame.

## Legacy violations fixed

- Hover accent painted on every row including static `div`/`article` records —
  an affordance nothing honoured. Now interactive elements only.
- `border-left: 3px solid #2dd4bf` / `border-left: 3px solid accent` inline
  literals → `data-done` / `data-unread` edge tells (`calc(--border-width × 3)` —
  a shape tell, not colour alone).
- `alignItems: "center"` inline overrides → `x-list-row--center`.

## Used on

Practically every page — course/track catalogues, sitting results, chapter
pickers, settings lists, request records, certificates.

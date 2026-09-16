# HeaderMenu

The header icon-button popover, concretely — the notification panel from
`Shell.tsx:135-179` with all ~15 inline literals killed (`rgba(99,102,241,0.08)` →
accent `color-mix`, `rgba(0,0,0,0.5)` shadow → `rgba(var(--c-shadow-rgb), …)`, px
padding/gaps/font sizes → tokens).

## Anatomy

`x-hmenu` (relative anchor) → `x-hmenu__trigger` (icon button, `aria-expanded`,
`aria-controls`, `aria-haspopup="dialog"`, unread `x-hmenu__badge`) +
`x-hmenu__panel` (`role="dialog"`, absolute right, `--z-popover`) containing
`x-hmenu__head`/`__title`/`__action`, `x-hmenu__list` of `x-hmenu__item[data-unread]`,
`x-hmenu__foot`. Header actions use `x-btn x-btn--quiet x-btn--sm` (controls/Button).

## Props

- `icon`, `label` — trigger icon + accessible name.
- `badge` — unread count; `0`/`undefined` hides the dot.
- `title` — panel heading.
- `action` — optional header action (e.g. "Mark read").
- `items: {id, title, body?, unread?}[]` — list rows; `unread` sets `data-unread`.
- `footer` — slot, typically a "View all" link.
- `emptyMessage` — honest absence text when `items` is empty.
- `defaultOpen` — for the sink.

## Behaviour

Escape closes + returns focus to the trigger; pointer-down outside closes.
Non-modal — focus is not trapped (use `Dialog` for that).

## States

`closed` (badge on trigger) · `open-unread` · `open-read` · `empty`.

## Used on

- Learner shell header — notifications (`Shell.tsx:135-179`).
- Admin topbar popover slot (`admin-shell.css:96-106` `.admin-top .header-pop`).

# IconButton

The icon-only square button — extracted from `.icon-btn` (`shell.css:603-612`),
used across the shell, admin shell and companion.

## Props

- `icon` — Keyline `IconName` (required).
- `label` — accessible name (**required** — an icon-only control has no
  visible text; the demo relied on hand-written `aria-label` at every site).
- `badge` — unread count, renders the sibling `x-badge-dot` (referenced by
  class per contract §6; the pip's styles live in `BadgeDot.css`);
  `0`/`null` renders nothing.
- `badgeLabel` — folds the count into the accessible name
  ("Notifications" + "3 unread" → "Notifications, 3 unread"). The dot itself
  is `aria-hidden`.
- `iconSize` — glyph size (default 18; companion dismiss used 14).
- `expanded` — `aria-expanded` for popover/panel triggers.
- `active` — `data-on` for on/off icon toggles.
- `disabled` — real semantics: `disabled` + `aria-disabled` + `data-disabled`
  (never `pointer-events: none`).
- `onClick`, `className`.

## States

hover · `data-on` · `data-disabled` · `aria-expanded` · badge pinned.

## Used on

- Shell header — notifications (with badge), Quick Notes — all learner routes
- Drawer close, admin nav mobile close (`/admin/*`)
- Companion — dismiss + guide close
- Spine/dock/dual nav models — pinned icon controls

## Notes

- The 36px size is `calc(var(--space-7) + var(--space-1))` — no size token
  exists for control heights; see the family report for the `--size-*` gap.

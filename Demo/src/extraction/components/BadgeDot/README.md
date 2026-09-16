# BadgeDot

The unread/count pip — extracted from `.badge-dot` (`shell.css:614-627`; live
site `Shell.tsx:144` on the notifications button).

## Anatomy

Absolute-positioned marker pinned top-right of a positioned host
(`x-icon-btn` is already `position: relative`). Content is a count, or a bare
presence dot.

## Props

- `count` — unread count; `null`/`0` renders **nothing** (honest absence —
  a greyed-out zero would claim "you have zero" as a fact worth showing).
- `max` — display cap; overflow renders `"99+"`.
- `dot` — presence-only dot, no numeral.
- `className` — escape hatch.

## Accessibility

`aria-hidden` always — a bare "3" floating on a bell is noise out of context.
The host control folds the count into its own accessible name; `IconButton`'s
`badge` + `badgeLabel` props do this for you.

## States

`count` · `dot` · overflow cap · zero → absent.

## Used on

- Shell header — notifications button (all learner routes)
- Spine/dock nav models — per-section unread pins
- `/admin/*` top bar — queue counts

## Notes

- The demo's 9px type has no token floor; `--text-2xs` (11px) is the minimum,
  and the pip grows to a `--space-4` cell to carry it honestly.
- `pointer-events: none` — the pip never steals its host's click.

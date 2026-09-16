# HomeRow

The compact in-card row: icon marker · title · trailing chips · `when` stamp.
Rehomed from Dashboard's private sheet (home.css:109-135 — `home__list` /
`home__row`), which Learn, Practice, Assess, Account, More and Admin all
borrowed while it lived in one page's stylesheet.

This is the *quiet* row — hairline rules, no boxes, `--row-height` tall. For
the boxed interactive row see `ListRow`.

## Exports

| Export | What it is |
|---|---|
| `HomeList` | `x-home-list` — a real `<ul>`; accepts `label` (aria-label). |
| `HomeRow` | `x-home-row` — an `<li>`: icon, title (span or Link), free slot, `when`. |

## Props

- `icon?: IconName` — keyline marker, decorative (`aria-hidden`).
- `iconTone?: "success" | "accent" | "info" | "warning" | "muted"` — the demo
  painted every icon success-teal regardless of meaning (`home__row svg`);
  tone now follows `data-tone`. Default `success` matches the dominant
  "done / confirmed" usage — pass `muted`/`info` for neutral markers.
- `title?: ReactNode` — truncates with ellipsis (the demo's overflow rules).
- `to?: string` — wraps the title in a router `Link` (Dashboard's
  `home__row-title` link case).
- `when?: ReactNode` — the trailing stamp, `--text-2xs` faint.
- `children` — free slot between title and `when` (chips, counts, badges).
- Omit `title` for a freeform row (the plain-text cases in More / Admin).

## States (states.ts)

`activity` (the Dashboard shape) · `announcements` · `plain` · `tones` ·
`truncate`.

## Composes

`x-chip` in the free slot; `@icons` `Icon` for the marker.

## Used on

- `/` Dashboard — recent activity, announcements, quick links
- `/learn` (Learn), `/practice` (Practice), `/assess` (Assess — briefing rules
  style rows, now also served by domain/BriefingRulesList), `/account`,
  `/more` (More), admin records pages

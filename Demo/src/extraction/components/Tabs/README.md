# Tabs

The family tablist — `courses.css:38-83`, `Learn.tsx:64-75`. Card-like tabs
(icon + title + subtitle + count badge), visibly separate destinations rather than
a segmented control.

## Anatomy

`x-tabs` (`role="tablist"`, auto-fit grid) → `x-tabs__tab` (`role="tab"`,
`aria-selected`, roving `tabIndex`) containing `x-tabs__icon`,
`x-tabs__text` (`x-tabs__title` + `x-tabs__sub`), `x-tabs__count`.

## ARIA contract

- `role="tablist"` + `aria-label` on the row.
- `role="tab"` + `aria-selected` per tab; only the selected tab is in the Tab order
  (roving tabindex).
- `panelIds` wires `aria-controls` → each `role="tabpanel"` (pair with
  `aria-labelledby` → `x-tab-<key>` on the panel side).
- Keyboard: `ArrowLeft/Right` (and Up/Down) roam with wrap, `Home`/`End` jump —
  automatic activation: selection follows focus, matching the demo.

## Props

- `tabs: {key, title, subtitle?, icon?, count?}[]`.
- `value`, `onChange(key)` — controlled selection.
- `label` — tablist accessible name.
- `panelIds` — optional aria-controls wiring.

## States

`first-selected` · `second-selected` · `many` · `no-count`.

## Used on

- `/courses` — Interactive Lessons / Video Studio family switch (`Learn.tsx:64-75`).
- Anywhere two-to-four sibling panels need a visible destination switch.

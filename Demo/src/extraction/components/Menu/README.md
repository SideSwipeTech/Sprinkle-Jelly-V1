# Menu

The dropdown item list — the header-menu / dock-popover pattern generalized into a
proper APG menu-button.

## Anatomy

`x-menu` → `x-menu__trigger` (`aria-haspopup="menu"`,
`aria-expanded`, `aria-controls`) + `x-menu__panel` (`role="menu"`,
`popover="manual"`) of `x-menu__item[role="menuitem"]` rows (icon + label,
`data-destructive`, `aria-disabled`).

The panel keeps its place in the DOM (natural tab order, the trigger's
outside-pointer-down check still reaches it) but renders on the **top layer**
with fixed coordinates anchored to the trigger — `overflow` on cards, rows and
table wraps cannot clip it, and a hovered surface's transform cannot shift it.
It flips above the trigger and clamps to the viewport when it would overflow,
and re-anchors on scroll/resize. Without the Popover API it still opens —
fixed-positioned — degrading to the old clipping behaviour, never to a missing
menu.

Trigger and item clicks stop at the menu (`stopPropagation`), so a Menu beside
a link inside a clickable card or row can never navigate that card.

## Props

- `trigger` — trigger content (text or icon glyph).
- `triggerLabel` — accessible name; required when the trigger is icon-only.
- `items: {id, label, icon?, destructive?, disabled?}[]`.
- `onSelect(id)` — fired on item activation; the menu closes itself.
- `align: "start" | "end"` — panel alignment (default `start`).
- `defaultOpen` — for the sink.

## Keyboard

- Trigger: `Enter`/`Space`/`ArrowDown` open + focus first item; `ArrowUp` opens
  focusing the last.
- Menu: `ArrowUp`/`ArrowDown` roam with wrap; `Home`/`End` jump; a printable
  character typeaheads to the next matching label; `Escape` closes and returns
  focus to the trigger; `Tab` closes and passes focus through.
- Disabled items are skipped by roving and carry `aria-disabled` — never a
  pointer-events hack.

## States

`closed` · `open` · `open-end` · `icon-trigger`.

## Used on

- File-row overflow menus (FileExplorer rows, project workspaces).
- Header "more" affordances; anywhere `⋯` needs a real menu.

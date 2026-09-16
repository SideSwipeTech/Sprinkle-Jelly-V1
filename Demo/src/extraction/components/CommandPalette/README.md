# CommandPalette

The ⌘K surface — `Shell.tsx:510-696` rebuilt with real classes and real ARIA. Kills
the demo's heaviest inline-style cluster (~15 literals: scrim/shadow rgba, row
backgrounds, 3px selection bars, 10px chip type, px padding everywhere).

## Anatomy

`x-palette` (fixed layer, `--z-modal`, `padding-top: --shell-nav-command-palette-top`)
→ `x-palette__scrim` + `x-palette__panel` (`role="dialog"` `aria-modal`,
`--shell-nav-command-palette-width`) containing `x-palette__field` (icon + combobox
input + kbd), `x-palette__results` (`x-palette__list[role="listbox"]` of
`x-palette__row[role="option"][aria-selected][data-active]` or `x-palette__empty`),
`x-palette__foot` (kbd hints).

## ARIA contract

Input: `role="combobox"`, `aria-expanded`, `aria-controls` → listbox,
`aria-activedescendant` → the active `x-palette-opt-<id>`, `aria-autocomplete="list"`.
Rows: `role="option"` + `aria-selected` (+ `data-active` for styling, kept in sync).

## Props

- `items: {id, title, subtitle?, category?, icon?}[]` — the corpus; filtering
  (title/subtitle/category substring) is internal.
- `onSelect(item)` — consumer decides what select means (navigate, run, insert).
- `onClose` — Escape, scrim, and selection all call it.
- `onFullSearch(query)` — optional "full search →" escape on Enter with no match
  and in the empty state.
- `previewCount` — rows shown before a query is typed (default 8, the demo's value).
- `open`, `placeholder`, `label`.

## Behaviour

`ArrowUp`/`ArrowDown` move selection with wrap and keep the row in view;
hover syncs selection; `Enter` activates (or falls through to full search);
`Escape` closes and returns focus to the opener.

## States

`closed` · `open-preview` · `with-full-search` · `empty`.
(Type-a-query states are interactive — the sink exercises them live.)

## Used on

- Learner shell — ⌘K / Ctrl K quick search (`Shell.tsx:510-696`), surfaced by the
  `command` nav model strip and the header search field.

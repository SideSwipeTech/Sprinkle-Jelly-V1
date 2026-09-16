# Tooltip

CSS-only tooltip — the `.spine__tip` pattern (`shell.css:242-258`) generalised to any
trigger, four sides.

## Anatomy

`x-tip` (relative inline host) → trigger child + `x-tip__label[role="tooltip"]`
(`data-side` = placement). The trigger gains `aria-describedby` → the tip, so the
label is announced, not just shown — the spine original was visual-only.

## Props

- `label` — tip text (short; a label, not documentation).
- `side: "right" | "left" | "top" | "bottom"` — default `right` (spine pattern).
- `children` — exactly one trigger element, or content that gets wrapped.

## Behaviour

- Shows on `:hover` and `:focus-within` — pointer and keyboard both covered, zero JS.
- A host carrying `aria-expanded="true"` (or `.x-tip[data-quiet]`) suppresses the tip —
  the spine's `is-open` case generalised.
- `prefers-reduced-motion` removes the fade transition.

## States

`rest` · `right` · `top` · `bottom` · `left` (visible states use the `x-tip--force`
sink fixture — hover can't be scripted declaratively).

## Used on

- Shell spine nav — section names on icon groups (`shell.css:242-258`).
- Any icon-only button needing a name (`dual__dot` title attributes, workbench tools).

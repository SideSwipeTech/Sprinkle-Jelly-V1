# AcknowledgeGate

"Tick the box, then the action unlocks" — the sitting-briefing acknowledgement
(Assess.tsx:380-384, 851-854) and the admin broadcast confirmations
(AdminPages.tsx:393-394).

## Props (in words)

- `checked` / `onChange(checked)` — controlled acknowledgement.
- `label` — the acknowledgement sentence beside the box.
- `hint` — supporting line, wired via `aria-describedby`.
- `children` — **render prop** `(acknowledged) => ReactNode`. The gate's contract:
  children put `disabled` on the gated control. With `Button` that means real
  `disabled` on a button, and `aria-disabled` + `tabIndex=-1` + refused navigation on
  a link — not the demo's `pointerEvents:none` + `opacity` hack, which left the link
  focusable and keyboard-activatable.
- `id`, `className`.

## States

`data-acknowledged` on the root · checkbox hover/checked (drawn check, no image) ·
gated children carry their own `data-disabled`.

## Used on

- `/mock/:paperId` — briefing acknowledgement gates "Start Sealed Sitting Now"
  (Assess.tsx:380-395)
- `/company/:companyId/briefing` — company sitting gate (Assess.tsx:851-864)
- `/admin/*` broadcasts — the two-acknowledgement + body gate (compose two
  `AcknowledgeGate`s or a field-level equivalent — AdminPages.tsx:393-397)

## Notes

The checkbox is `appearance:none` with the check drawn as a rotated border in
`--c-on-accent-primary` — no asset, every theme. Focus ring comes from the global
`:focus-visible` rule.

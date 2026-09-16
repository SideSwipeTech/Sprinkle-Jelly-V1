# Button

The action element. One component over the legacy `.btn` family plus the three states
the demo faked: `destructive` (inline rose literals), `sm` (lived orphaned in
`demo.css`), `loading` (pages re-implemented per site), and a **real disabled**.

## Props (in words)

- `children` — the label.
- `variant` — `primary` (accent solid), `secondary` (outlined), `quiet` (bare accent
  text), `destructive` (error language, replaces the inline `color:#fb7185` hacks).
- `size` — `md` default, `sm` for workbench/toolbar rows.
- `to` — route target; renders a router `Link`. A disabled `to` is `aria-disabled`,
  leaves the tab order (`tabIndex=-1`) and refuses navigation — for pointer, keyboard
  and assistive tech alike. This is the fix for the `pointerEvents:none` + `opacity`
  violation at `Assess.tsx:388,859`, which left the gated link fully activatable.
- `type` — `button` | `submit` (ignored on links).
- `icon` / `iconEnd` — Keyline icons flanking the label.
- `loading` — orbit-motion loader icon, `aria-busy`, interaction held via
  `aria-disabled` + click suppression (stays focusable so the busy state announces).
- `loadingLabel` — alternate text while busy.
- `disabled` — `disabled` attribute on `<button>`; `data-disabled` on both element
  kinds for styling.
- `onClick`, `label`, `className`.

## States

default · hover · `:active` press (per theme: Halo compress, Voyage/Forge seat,
Meridian none — preserved verbatim, suppressed under reduced motion) · `data-disabled`
· `data-loading` · variant × size matrix.

## Used on

Everywhere — ~40 call-sites: `/courses` CTAs, `/codelab` run/reset, `/challenges/:id`
submit, `/assessments/*` briefing & sitting actions, `/settings` save rows, `/requests`
form submit, `/admin/*` lifecycle tools, `/` dashboard, page-level `Back` links
(kit `Page.tsx`).

## Notes

- `loading` uses `aria-disabled` rather than the `disabled` attribute so the control
  remains focusable and the busy state is announced; `disabled` uses the real attribute.
- Press transforms (`scale(.97)`, `translateY(1px)`) are the demo's own constants —
  transform magnitudes have no token; flagged in the report rather than invented.

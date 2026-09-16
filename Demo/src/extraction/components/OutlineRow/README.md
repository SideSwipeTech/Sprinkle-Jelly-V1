# OutlineRow (+ OutlineList)

The numbered, divided row of a curriculum outline — mono index, title, meta,
trailing status.

## Props

`OutlineList` — `children`, `label?: string` (aria-label; `role="list"`).

`OutlineRow`
- `n: number` — rendered padded ("01")
- `to?: string` — makes the row a link (`role="listitem"` kept either way)
- `done?: boolean` — `data-done`: success left edge + tinted numeral + default
  check glyph. Never colour alone.
- `title`, `meta?: ReactNode`
- `trailing?: ReactNode` — defaults to check (done) or chevron (pending);
  override for status chips.

## Legacy violations fixed

`borderLeft: "3px solid #2dd4bf"` → `data-done` on `--c-success`; the literal
"Completed" chip callers used belongs in `trailing` as a token chip.

## Used on

- `/courses/:courseId` — Curriculum outline tab

# KeyValueRow

Term on the left, value on the right. Three demo constructions merged into one
anatomy:

- `DiagnosticRow` (Assess.tsx:403-414) — padded inset pill, `fontSize:12px`,
  value a `strong` tinted `#2dd4bf`
- `ProfileFactRow` (Assess.tsx:871-883) — the same pill, tone by provenance
- `.account-facts` (app.css:213-217) — a `<dl>` strip: ruled rows on a
  `minmax(120px, .45fr) 1fr` grid, `dt`/`dd` semantics

## Exports

| Export | What it is |
|---|---|
| `KeyValueTable` | `x-key-value` — the bordered `<dl>` strip; children are `KeyValueRow as="definition"`. Collapses term-over-value at the compact band (599px). |
| `KeyValueRow` | `x-key-value__row` — one row. `as="pair"` renders `span`+`strong`; `as="definition"` renders `dt`+`dd` inside a `div` (valid `dl` child per HTML). `inset` gives the standalone pill surface. |

## Props

- `term: ReactNode` / `value?: ReactNode` — the cells. `value` nullish renders
  an em dash, never zero (honest absence).
- `tone?: "default" | "muted" | "accent" | "success" | "warning" | "error" | "info"`
  — colours the value (`data-tone`). Colour only reinforces: pair it with
  `icon` or a textual tell (the demo's "✓ Available").
- `icon?: IconName` — leading tell inside the value.
- `as?: "pair" | "definition"` — element semantics; `definition` is required
  inside `KeyValueTable`.
- `inset?: boolean` — standalone inset pill. Inside an InsetPanel or a
  KeyValueTable the row is bare — don't combine.

## Component tokens

- `--x-kv-term-min: 120px` — the term-column floor (was `minmax(120px,…)`);
  override on `.x-key-value` if a surface needs a wider term track.

## States (states.ts)

`inset-pills` · `inset-panel` (bare pairs inside the InsetPanel sibling) ·
`tones` · `table` · `missing`.

## Sibling contract

`CompletionFactPanel` (domain/) emits `x-key-value` / `x-key-value__row` /
`__term` / `__value` directly — this sheet is the implementation it composes
onto (contract §6). Do not rename.

## Legacy violations fixed

- `color: "#2dd4bf"` and `color: accent` literals on values → `data-tone`.
- `fontSize: "12px"` → `--text-xs`; `padding: "6px 10px"` →
  `--space-2 --space-3` on the inset pill (scale snap).
- `.account-facts` carried `margin: var(--space-4) 0` — dropped; containers own
  no outer margin, pages own spacing.
- The 520px hand-rolled collapse threshold → compact band edge (599px).

## Used on

- `/assess` — System Diagnostics, profile facts, sitting records
- `/account`, `/admin/*` — fact strips
- `/company/:id/result` — via domain/CompletionFactPanel

# CodeBlock

The canonical `.code` block — mono inset surface — in two render modes:
- **display** → `<pre class="x-code"><code>` (semantic, wraps)
- **editable** → `<textarea class="x-code x-code--edit">` (labelled input)

Canonicalises app.css:138-146 and retires the ad-hoc `.code` textarea in
More.tsx's DailySolve.

## Props

| Prop | Type | Notes |
|---|---|---|
| `code` | `string` | display-mode content |
| `editable` | `boolean` | switches render to textarea |
| `value` / `onChange` | `string` / `(v)=>void` | editable-mode control |
| `label` | `string` | `aria-label` in editable mode (default "Code") |
| `rows` | `number` | editable-mode line budget (default 4) |
| `readOnly` | `boolean` | editable-mode review state |
| `tone` | `"default" \| "output"` | output paints the terminal palette |
| `language` | `string` | stamped on `data-language` |

## States

`display` · `editable` · `output` · `editable-readonly`

## Fixed violations

- `background: var(--c-surface-elevated)` + `rgba(0,0,0,.2)` border →
  `--c-surface-inset` + `--c-border`; `14px` → `--text-sm`; the raw font stack →
  `--font-mono`; `12px 14px`/`8px` radii → `--space-*`/`--radius-sm`.
- The editable variant had no accessible name → required `aria-label` path.
- `pre.code.output` → `tone="output"` (`--terminal-bg/-fg` where defined).

## Used on

- `/daily/solve` (DailySolve editor + run output)
- `/challenges/:challengeId`, `/debug/:caseId` (run output blocks)
- `/courses/:courseId/lessons/:lessonId` (lesson code samples)
- Kitchen sink content demos

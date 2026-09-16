# EditorTabs

The open-files strip above an editor surface. Canonicalises the kit `EditorTabs`.

## Props

| Prop | Type | Notes |
|---|---|---|
| `files` | `EditorFile[]` | same shape as the kit — `{path, name?, language?, isDirty?, content}` |
| `activeFile` | `string` | path of the selected tab |
| `onSelectFile` | `(path) => void` | click or Arrow/Home/End keys |
| `onCloseFile` | `(path) => void` | optional; hidden when only one file remains |
| `onAddFile` | `() => void` | optional; renders the `plus` affordance |
| `label` | `string` | tablist accessible name (default "Open files") |

## States

`default` (dirty marker + close + add) · `read-only-strip`

## Surface language

- The active tab carries accent two ways — the 2×border-width underline seam
  AND a 10% accent wash over `--c-surface` (families keep their `--editor-tab-active`).
  Hover is a preview: half the wash + a `--c-border-strong` underline, so the
  selection keeps its distinction.
- The dirty dot is a shape tell (filled `--c-warning` dot + faint ring), not
  colour alone; it keeps `role="img"` + `aria-label`.
- Close hover is neutral (`--c-surface-elevated`) — closing is routine, not
  destructive.

## Fixed violations

- **`alert` icon misused as "+"** (kit EditorTabs.tsx:80-81) → the real `plus`
  keyline glyph; the inline `+` text node is gone.
- `is-active` class soup → `data-on` + `role="tablist"/"tab"`, `aria-selected`,
  roving `tabIndex`, and Arrow/Home/End navigation (the kit had none).
- The add button's `title`-only naming → real `aria-label`.
- All spacing/radii read `--space-*`/`--radius-*`; close-hover is a surface
  tint, never a stated rgba.

## Depends on

- kit `fileIcon` (`@components/CodeEditor/language`) — extension → glyph map.

## Used on

- `/codelab` (inside Workbench)
- `/projects/:projectId`, `/workspace`
- Kitchen sink workbench demo

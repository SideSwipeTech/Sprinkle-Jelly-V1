# TemplateFileSet

The workspace-variant file-set surface (decision 182): a file rail, a tab
strip, the path row beneath it, an editor well and an output dock, with an
optional checklist strip on the right — the arrangement a starter template is
authored in and the one a learner meets it in, so the two never drift.

Same contract as `Workbench`: this component owns the **arrangement only**.
Every region is a slot; the caller composes the real siblings, which fuse into
the frame by their `x-*` classes (`.x-file-explorer`, `.x-editor-tabs`,
`.x-editor`, `.x-terminal`) — the fusion rules also cover the legacy kit
classes so mixed pages join the same way.

## Props

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | required — the region's accessible name |
| `explorer` | `ReactNode` | required — a FileExplorer (`x-file-explorer`) |
| `tabs` | `ReactNode` | an EditorTabs (`x-editor-tabs`) strip |
| `pathRow` | `ReactNode` | the open file's address + per-file actions (entry-file pin, download, format) |
| `editor` | `ReactNode` | a CodeEditorChrome (`x-editor`); absent → honest `empty` StateBlock |
| `output` | `ReactNode` | a Terminal (`x-terminal`); absent → the dock is not rendered (a browser-preview runtime has no run) |
| `checklist` | `ReactNode` | the right strip — the learner checklist the template carries; absent → the column collapses |
| `mode` | `"author" \| "preview"` | `author` is the studio's editing surface; `preview` is the draft exactly as a learner meets it |

## States

`author` (all six regions) · `preview` (no output dock) · `no-side` (checklist
column collapses) · `empty` (no files — honest empty editor well)

## Surface language

- One bordered instrument on `--c-surface`; regions join by `--c-border`
  hairlines, the editor well sits on `--editor-bg`/`--c-surface-inset`, the
  output dock on `--terminal-bg`/`--c-surface` — the workbench's own planes.
- Rail and checklist columns take the named local-pane width
  `--shell-nav-dual-local-width`; the dock is four `--row-height`s; the floor
  is sixteen.
- `data-mode` (`author`/`preview`) and `data-side="checklist"` carry state,
  never class soup.
- `container-type: inline-size` — below `45rem` the rail stacks above the
  column and clips to four rows, the checklist drops beneath.
- No toolbar, no status bar: the studio's save chrome and the page header sit
  outside this surface; the full solve-bench chrome stays `Workbench`'s.

## Used on

- `/admin/templates/:id` and `/admin/templates/new` — the template studio's
  authoring surface and its learner preview (both `mode`s)
- Kitchen sink work-surface family demo

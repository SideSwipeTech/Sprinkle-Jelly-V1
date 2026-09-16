# FileExplorer

The workbench's file rail: header + new-file affordance, file list, per-row
rename/delete actions. Inside a `Workbench` it fuses into the frame (border off,
right divider on) via the workbench's panel rules.

## Props

| Prop | Type | Notes |
|---|---|---|
| `files` | `EditorFile[]` | shared shape with EditorTabs |
| `activeFile` | `string` | selected path (`aria-current` on the row's select button) |
| `onSelectFile` | `(path) => void` | |
| `onAddFile` | `(name) => void` | optional; enables the `plus` header action + inline name form |
| `onDeleteFile` | `(path) => void` | optional; routes through the `x-dialog` confirm, hidden at 1 file |
| `onRenameFile` | `(oldPath, newPath) => void` | **implemented** — inline row editor (was declared-but-dead in the kit) |
| `label` | `string` | panel title (default "Explorer") |

## States

`full` (add/rename/delete) · `read-only` (selection only)

## Fixed violations

- **`alert` icon as "+"** (kit FileExplorer.tsx:49) → `plus` keyline glyph.
- **`window.confirm` delete** (kit :91) → confirm rendered on the overlays
  family's `x-dialog` hooks (`x-dialog`/`__scrim`/`__panel`/`__head`/`__icon`/
  `__title`/`__close`/`__body`/`__actions`), with the action buttons on
  controls/Button's `x-btn x-btn--quiet` / `x-btn--destructive` hooks.
  **Dependency:** the classes are owned by `extraction/components/Dialog` +
  `/Button` (contract §6 sibling class reference); interim Escape+autofocus are
  handled locally — consolidation swaps `DeleteConfirm` for
  `<ConfirmDialog destructive/>`.
- `onRenameFile` declared-but-unimplemented → implemented (decision: kept the
  prop — both call sites that offer delete offer rename semantics equally).
- Item rows were click-only divs → `<button>` select with `aria-current`; row
  actions reveal on `:focus-within` as well as `:hover` (keyboard reachability).
- Delete affordance icon `x` → `trash` (semantics over close-glyph reuse).
- **Drift fix:** the confirm's action buttons were still on `x-dialog__btn`
  `[data-variant]` hooks that Dialog no longer emits — the row read as plain
  text. Now on the current `x-btn` contract, and the panel gained
  `aria-describedby` like the real Dialog.

## Surface language

- Standalone frame carries the card accent edge (`--card-edge`); the selected
  row's edge tell is the same 3×border-width seam, so file selection and card
  selection are one vocabulary.
- Flat path lists render as a tree by depth: `--x-fe-depth` indents the row,
  the label is the basename, and the directory survives as a faint suffix
  (`parse.py  helpers/`, truncates before the name). Folder rows are not
  fabricated — the `files` prop is a flat list.
- `files.length === 0` renders an `empty` StateBlock (honest absence).
- Panel title casing follows `--micro-case` per identity.

## Used on

- `/codelab` (Workbench side rail)
- `/projects/:projectId`, `/workspace` (project file tree)
- Kitchen sink workbench demo

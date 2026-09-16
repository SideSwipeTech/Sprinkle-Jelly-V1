# Workbench

The canonical code-workbench shell. One bordered panel; the suite panels inside it
(FileExplorer, editor, Terminal) lose their own chrome and join by hairline dividers.

Canonicalises `.workbench` (lab.css:230-471). Replaces the three hand-rolled inline
grids at Practice.tsx:379 (challenge solve), :879 (debug solve) and :1077 (project
workspace) — one system serves all four surfaces.

## Exports

| Export | Role |
|---|---|
| `Workbench` | `<section>` landmark; requires `label` |
| `WorkbenchToolbar` | chrome strip — two `WorkbenchTools` groups, context left / actions right |
| `WorkbenchTools` | a group inside the toolbar |
| `WorkbenchHint` | passive mono readout (active file · detected runtime) |
| `ToolButton` | toolbar control; pass `on` for toggle semantics (`data-on` + `aria-pressed`) |
| `RunButton` | the accent run action; `running` gates it and swaps in a live icon |
| `StdinRow` | labelled stdin strip, rendered conditionally |
| `WorkbenchMain` | grid; pass `side` for the sidebar layout |
| `WorkbenchPane` | the editor column (tabs → editor → output) |
| `WorkbenchEditorArea` | flex region the editor fills; no children → honest `empty` StateBlock ("no file open") |
| `WorkbenchOutput` | fixed output dock (4 × `--row-height`) |
| `StatusBar` + `StatusGroup` | foot strip; group items joined by separators |

## Surface language

- The frame carries the card family's accent edge (`--card-edge` — overridable
  per consumer) so the bench sits in the same seam vocabulary as the surfaces
  around it.
- Toolbar and status bar are the chrome bookends: light inset tint
  (`--c-surface-inset` 40% over `--c-surface`) and a tinted `--x-workbench-seam`
  hairline. Content dividers (stdin strip, output dock) stay neutral `--c-border`.
- The editor well is `--editor-bg`/`--c-surface-inset`; the output dock rides
  `--c-surface` — the two regions read as distinct planes (Atlas's
  `--terminal-bg` still wins inside the dock).
- `RunButton` is a tinted accent action (14% wash, half-strength accent border);
  `data-running` keeps `cursor: progress` — gated but alive.
- Status bar + hint set `--numerals` so `Ln/Col` figures use the identity's
  figure style.

## Composition

```tsx
<Workbench label="CodeLab workbench">
  <WorkbenchToolbar>
    <WorkbenchTools>…LanguageSelect, WorkbenchHint…</WorkbenchTools>
    <WorkbenchTools>
      <ToolButton icon="terminal" on={showStdin} onClick={…}>stdin</ToolButton>
      <ToolButton icon="reset" onClick={…}>Reset starter</ToolButton>
      <RunButton running={pending} onClick={…} />
    </WorkbenchTools>
  </WorkbenchToolbar>
  {showStdin && <StdinRow value={v} onChange={setV} />}
  <WorkbenchMain side={<FileExplorer … />}>
    <WorkbenchPane>
      <EditorTabs … />            {/* sibling, class contract */}
      <WorkbenchEditorArea><CodeEditorChrome … /></WorkbenchEditorArea>
      <WorkbenchOutput><Terminal … /></WorkbenchOutput>
    </WorkbenchPane>
  </WorkbenchMain>
  <StatusBar>
    <StatusGroup items={[`Ln ${l}, Col ${c}`, `${n} lines`]} />
    <StatusGroup items={[lang, "UTF-8", "Ctrl+Enter to run"]} />
  </StatusBar>
</Workbench>
```

## States (states.ts)

`sidebar-idle` · `stdin-open` · `running` · `plain` (no side rail) ·
`empty-editor` (no file open → StateBlock in the well)

## Notes

- Responsive split is a **container query** (`container-type: inline-size` +
  `@container (max-width: 45rem)`) — the bench collapses when *it* is narrow, so no
  viewport number is restated (bands stay the only viewport authority).
- Min height uses `min(78dvh, var(--band-tablet-narrow-content-max))`; the 200px rail
  became `--shell-nav-dual-local-width`; the 190px dock became `4 × --row-height`
  (density-aware). `--tracking-micro` is a proposed token for the stdin label
  (currently `normal` fallback).
- Panel fusion also covers the legacy `.file-explorer` / `.pro-editor` /
  `.pro-terminal` classes so mixed pages fuse identically.

## Used on

- `/codelab` (Learn.tsx CodeLab — the canonical bench)
- `/challenges/:challengeId` (Practice.tsx ChallengeSolve right pane)
- `/debug/:caseId` (Practice.tsx DebugSolve panes)
- `/projects/:projectId`, `/workspace` (Practice.tsx ProjectWorkspace grid)

/**
 * FileExplorer — the workbench's file rail.
 *
 * Fixes vs the kit (FileExplorer.tsx):
 *  - the "new file" button misused the `alert` glyph plus an inline `+` text
 *    node → the keyline `plus` icon;
 *  - `window.confirm` delete (kit :91) → ConfirmDialog (overlays/Dialog) — the
 *    real focus-trapped alertdialog, destructive tone, focus landing on the
 *    safe exit;
 *  - `onRenameFile` was declared-but-unimplemented → implemented as an inline
 *    row rename (same pattern as the new-file form: Enter/blur commits,
 *    Escape cancels);
 *  - item rows were click-only divs → real buttons with `aria-current`, and the
 *    row actions reveal on `:focus-within` too (keyboard users can reach them);
 *  - flat path lists now render as a tree by depth — the row indents per path
 *    segment, the label is the basename, and the directory survives as a faint
 *    suffix (`parse.py  helpers/`). No folder rows are fabricated from nothing.
 */

import { useState } from "react";
import type { FormEvent } from "react";
import { Icon } from "@icons/Icon";
import type { EditorFile } from "@components/CodeEditor";
import { fileIcon } from "@components/CodeEditor/language";
import { StateBlock } from "@components/Card";
import { ConfirmDialog } from "../Dialog/Dialog.variants";
import "./FileExplorer.css";

export interface FileExplorerProps {
  files: EditorFile[];
  activeFile: string;
  onSelectFile: (path: string) => void;
  onAddFile?: (filename: string) => void;
  onDeleteFile?: (path: string) => void;
  /** Implemented: renames via an inline row editor. */
  onRenameFile?: (oldPath: string, newPath: string) => void;
  /** Panel label for assistive tech. */
  label?: string;
}

/* ── Inline name form (new file + rename share it) ───────────────────────── */

function NameForm({
  initial = "",
  placeholder,
  label,
  onSubmit,
  onCancel
}: {
  initial?: string;
  placeholder?: string;
  label: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };
  return (
    <form className="x-file-explorer__form" onSubmit={submit}>
      <input
        className="x-file-explorer__input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoFocus
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="off"
        onBlur={() => {
          if (value.trim() && value.trim() !== initial) onSubmit(value.trim());
          else onCancel();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onCancel();
          }
        }}
      />
    </form>
  );
}

export function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  label = "Explorer"
}: FileExplorerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  return (
    <div className="x-file-explorer">
      <div className="x-file-explorer__head">
        <span className="x-file-explorer__title">
          <Icon name="folder" size={14} />
          <span>{label}</span>
        </span>

        {onAddFile ? (
          <button
            type="button"
            className="x-file-explorer__action"
            data-on={isCreating || undefined}
            aria-pressed={isCreating}
            onClick={() => setIsCreating((v) => !v)}
            aria-label="New file"
            title="New file"
          >
            <Icon name="plus" size={14} />
          </button>
        ) : null}
      </div>

      {isCreating ? (
        <div className="x-file-explorer__new">
          <NameForm
            placeholder="filename.py"
            label="New file name"
            onSubmit={(name) => {
              onAddFile?.(name);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      ) : null}

      {files.length === 0 ? (
        /* Don't point at a "+" that read-only rails don't render. */
        <StateBlock
          state="empty"
          compact
          message={onAddFile ? "No files yet — the + above creates one." : "No files in this workspace."}
        />
      ) : (
        <ul className="x-file-explorer__tree">
          {files.map((file) => {
            const isActive = file.path === activeFile;
            /* The flat path list renders as a tree by depth: the row indents
               per segment and the label is the basename, the directory kept as
               a faint suffix so `a/util.py` and `b/util.py` never collide
               visually. Folder rows are NOT fabricated — the data is flat. */
            const segments = file.path.split("/");
            const depth = segments.length - 1;
            const fileName = file.name ?? segments[segments.length - 1]!;
            const dir = depth > 0 ? `${segments.slice(0, -1).join("/")}/` : null;
            return (
              <li
                key={file.path}
                className="x-file-explorer__item"
                data-on={isActive || undefined}
                style={{ ["--x-fe-depth" as string]: depth }}
              >
                {renaming === file.path ? (
                  <NameForm
                    initial={file.path}
                    label={`Rename ${file.path}`}
                    onSubmit={(next) => {
                      onRenameFile?.(file.path, next);
                      setRenaming(null);
                    }}
                    onCancel={() => setRenaming(null)}
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      className="x-file-explorer__select"
                      aria-current={isActive || undefined}
                      onClick={() => onSelectFile(file.path)}
                    >
                      <span className="x-file-explorer__icon">
                        <Icon name={fileIcon(file.path)} size={14} />
                      </span>
                      <span className="x-file-explorer__label">
                        <span className="x-file-explorer__name">{fileName}</span>
                        {dir ? <span className="x-file-explorer__dir">{dir}</span> : null}
                      </span>
                    </button>

                    <span className="x-file-explorer__item-actions">
                      {onRenameFile ? (
                        <button
                          type="button"
                          className="x-file-explorer__icon-btn"
                          onClick={() => setRenaming(file.path)}
                          aria-label={`Rename ${fileName}`}
                          title="Rename file"
                        >
                          <Icon name="edit" size={11} />
                        </button>
                      ) : null}
                      {onDeleteFile && files.length > 1 ? (
                        <button
                          type="button"
                          className="x-file-explorer__icon-btn x-file-explorer__icon-btn--danger"
                          onClick={() => setPendingDelete(file.path)}
                          aria-label={`Delete ${fileName}`}
                          title="Delete file"
                        >
                          <Icon name="trash" size={11} />
                        </button>
                      ) : null}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pendingDelete ? (
        <ConfirmDialog
          destructive
          title={`Delete ${pendingDelete}?`}
          confirmLabel="Delete file"
          onClose={() => setPendingDelete(null)}
          onConfirm={() => {
            onDeleteFile?.(pendingDelete);
            setPendingDelete(null);
          }}
        >
          <p>The file is removed from this workspace. This cannot be undone.</p>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

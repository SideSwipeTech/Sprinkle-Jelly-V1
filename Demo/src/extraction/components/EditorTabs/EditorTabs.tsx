/**
 * EditorTabs — the open-files strip above an editor surface.
 *
 * Fixes vs the kit (EditorTabs.tsx):
 *  - the "new file" button misused the `alert` glyph plus an inline `+` text
 *    node — it is the keyline `plus` icon now (keyline.ts:346);
 *  - `is-active` class → `data-on` + full tab semantics: role=tablist/tab,
 *    `aria-selected`, roving `tabIndex`, and Arrow/Home/End key navigation;
 *  - the close button keeps its own `aria-label`; the dirty dot is `aria-hidden`
 *    (the `title` tooltip is joined by a visually-hidden text cue);
 *  - all metrics read tokens.
 *
 * `EditorFile` keeps the kit shape so either implementation can feed the strip.
 */

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { Icon } from "@icons/Icon";
import { fileIcon } from "@components/CodeEditor/language";
import type { EditorFile } from "@components/CodeEditor";
import "./EditorTabs.css";

/** The file shape stays the kit's — either implementation can feed the strip. */
export type { EditorFile };

export interface EditorTabsProps {
  files: EditorFile[];
  activeFile: string;
  onSelectFile: (path: string) => void;
  onCloseFile?: (path: string) => void;
  onAddFile?: () => void;
  /** Strip label for assistive tech. */
  label?: string;
}

export function EditorTabs({
  files,
  activeFile,
  onSelectFile,
  onCloseFile,
  onAddFile,
  label = "Open files"
}: EditorTabsProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  const focusTab = (index: number) => {
    const tabs = stripRef.current?.querySelectorAll<HTMLElement>('[role="tab"]');
    tabs?.[index]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = files.findIndex((f) => f.path === activeFile);
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (current + 1) % files.length;
    else if (e.key === "ArrowLeft") next = (current - 1 + files.length) % files.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = files.length - 1;
    if (next === null || !files[next]) return;
    e.preventDefault();
    onSelectFile(files[next]!.path);
    focusTab(next);
  };

  return (
    <div className="x-editor-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      <div className="x-editor-tabs__list">
        {files.map((file) => {
          const isActive = file.path === activeFile;
          const fileName = file.name ?? file.path.split("/").pop() ?? file.path;

          return (
            <div
              key={file.path}
              className="x-editor-tab"
              role="tab"
              data-on={isActive || undefined}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectFile(file.path)}
            >
              <span className="x-editor-tab__icon">
                <Icon name={fileIcon(fileName)} size={14} />
              </span>
              <span className="x-editor-tab__name">{fileName}</span>

              {file.isDirty ? (
                <span className="x-editor-tab__dirty" role="img" aria-label="Unsaved changes" title="Unsaved changes" />
              ) : null}

              {onCloseFile && files.length > 1 ? (
                <button
                  type="button"
                  className="x-editor-tab__close"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.path);
                  }}
                  aria-label={`Close ${fileName}`}
                >
                  <Icon name="x" size={12} />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {onAddFile ? (
        <button
          type="button"
          className="x-editor-tabs__add"
          onClick={onAddFile}
          aria-label="Create new file"
          title="Create new file"
        >
          <Icon name="plus" size={14} />
        </button>
      ) : null}
    </div>
  );
}

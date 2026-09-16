/**
 * TemplateFileSet — the workspace-variant file-set surface (decision 182).
 *
 * The arrangement a starter template is authored in and a learner meets it in:
 * a file rail; a tabbed editor over an output dock; the path row between the
 * tabs and the editor carrying the open file's address and its per-file
 * actions (entry-file pin, download, format). The template studio renders it
 * twice — `mode="author"` for the draft and `mode="preview"` for exactly what
 * a learner gets — so the two can never drift apart.
 *
 * Same contract as the work/ family's Workbench: this component owns the
 * arrangement only and every region is a slot — the caller composes the real
 * siblings, which fuse into the frame by their x-* classes:
 *
 *   <TemplateFileSet
 *     label="Notes CLI Utility — draft"
 *     mode="author"
 *     explorer={<FileExplorer … />}          x-file-explorer
 *     tabs={<EditorTabs … />}                x-editor-tabs
 *     pathRow={<>main.py …</>}               the path/breadcrumb row
 *     editor={<CodeEditorChrome … />}        x-editor
 *     output={<Terminal … />}                x-terminal
 *     checklist={<>…</>}                     the template's learner checklist
 *   />
 *
 * Boundary: no toolbar and no status bar — the studio's own header and save
 * chrome sit outside this surface; the full solve-bench chrome stays
 * Workbench's. An absent `editor` renders the honest empty block; an absent
 * `output` collapses the dock entirely rather than showing an empty panel.
 */

import type { ReactNode } from "react";
import { StateBlock } from "@components/Card";
import "./TemplateFileSet.css";

export interface TemplateFileSetProps {
  /** Accessible landmark name — every file-set surface needs one. */
  label: string;
  /** The file rail — a FileExplorer (`x-file-explorer` fuses by class). */
  explorer: ReactNode;
  /** The open-files strip — an EditorTabs (`x-editor-tabs`). */
  tabs?: ReactNode;
  /** The path row beneath the tabs — the open file's address plus the
   *  per-file actions (pin as entry file, download, format). */
  pathRow?: ReactNode;
  /** The editor surface — a CodeEditorChrome (`x-editor`). Absent → the
   *  honest "no file open" block, never a bare void. */
  editor?: ReactNode;
  /** The output dock — a Terminal (`x-terminal`). Absent → the dock is not
   *  rendered at all (a browser-preview runtime has no run). */
  output?: ReactNode;
  /** The right strip — the learner checklist the template carries, so an
   *  author reads it beside the files rather than inferring it. */
  checklist?: ReactNode;
  /** `author` — the studio's editing surface. `preview` — the draft exactly
   *  as a learner meets it (read-only siblings inside). */
  mode?: "author" | "preview";
  className?: string;
}

export function TemplateFileSet({
  label,
  explorer,
  tabs,
  pathRow,
  editor,
  output,
  checklist,
  mode = "author",
  className = ""
}: TemplateFileSetProps) {
  return (
    <section
      className={`x-template-files${className ? ` ${className}` : ""}`}
      data-mode={mode}
      data-side={checklist ? "checklist" : undefined}
      aria-label={label}
    >
      <div className="x-template-files__rail">{explorer}</div>
      {tabs ? <div className="x-template-files__tabs">{tabs}</div> : null}
      {pathRow ? <div className="x-template-files__path">{pathRow}</div> : null}
      <div className="x-template-files__editor">
        {editor ?? (
          <StateBlock
            state="empty"
            compact
            message="No file open in this set. Pick a file from the rail."
          />
        )}
      </div>
      {output ? <div className="x-template-files__output">{output}</div> : null}
      {checklist ? <aside className="x-template-files__side">{checklist}</aside> : null}
    </section>
  );
}

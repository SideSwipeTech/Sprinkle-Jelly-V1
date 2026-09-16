/**
 * LessonBlockEditor — the course studio's block editor and live preview
 * (courses/01-pages.md "The lesson editor and its preview", courses.F31/F34).
 *
 * The six authored block types (courses.F08): heading, rich text, callout,
 * image, display-only code and runnable code — a closed set. Blocks reorder
 * by explicit up/down controls and remove by their own action; adding a block
 * picks from the six, never a seventh.
 *
 * Spec truths encoded:
 *  - Every region where a person types code renders the one registered code
 *    editor — the `courses` variant of CodeEditorChrome (compact, inline,
 *    set in the reader's measure).
 *  - The live preview is the real learner view with running disabled, so it
 *    cannot diverge: a runnable block reads Preview only and an unsupported
 *    language reads coming soon.
 *  - The save line is honest: saving · saved · not saved, tap to retry ·
 *    saved locally (which never renders as "saved").
 *  - Leaving with unsaved work is guarded — the page hands the guard in via
 *    `leaveGuard`; the dialog is the overlays family's, never a native
 *    confirm.
 *  - A save against content another save has replaced is refused as a named
 *    conflict WITH a comparison — the saved revision beside your draft — and
 *    is never overwritten.
 *
 * Sibling imports (Field, Select, CodeEditorChrome, Dialog) are composed
 * directly — a deliberate §6 deviation the task brief sanctions: behaviour,
 * not just chrome, is shared. Same licence as PracticeEditorSpace.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import { StateBlock } from "@components/Card";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import {
  BLOCK_LABEL,
  BLOCK_ORDER,
  BlockFields,
  BlockPreview,
  blockSummary,
  emptyBlock
} from "./blocks";
import type { LessonBlock } from "./blocks";
import "./LessonBlockEditor.css";

export type { LessonBlock, LessonBlockKind, CalloutKind } from "./blocks";

/** The save line — the spec's four readings plus the refused conflict. */
export type BlockSaveState =
  | "saved"
  | "saving"
  | "retry"
  | "saved-locally"
  | "conflict";

/** A named save conflict — the revision another save landed beside yours. */
export interface SaveConflict {
  savedBy: string;
  savedAt: string;
  theirBlocks: LessonBlock[];
}

/** The unsaved-work guard — the page owns the navigation, the dialog is ours. */
export interface LeaveGuard {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export interface LessonBlockEditorProps {
  blocks: LessonBlock[];
  onChange?: (blocks: LessonBlock[]) => void;
  /** Unsaved-work marker — drives the dirty dot and the guard's meaning. */
  dirty?: boolean;
  saveState?: BlockSaveState;
  onSave?: () => void;
  conflict?: SaveConflict | null;
  /** "reload" takes the saved revision into the editor; "keep" keeps editing. */
  onConflictResolve?: (choice: "reload" | "keep") => void;
  leaveGuard?: LeaveGuard;
  /** Extra content under the block list (the lesson's non-block fields). */
  children?: ReactNode;
  className?: string;
}

const SAVE_LABEL: Record<BlockSaveState, string> = {
  saved: "Saved",
  saving: "Saving…",
  retry: "Not saved — tap to retry",
  "saved-locally": "Saved locally — not yet on the server",
  conflict: "Save refused — a newer revision exists"
};

function SaveStatus({ state, dirty }: { state: BlockSaveState; dirty: boolean }) {
  return (
    <span className="x-block-editor__save" data-state={state} role="status">
      {dirty && state === "saved" ? (
        <>
          <i className="x-block-editor__dirty-dot" aria-hidden="true" /> Unsaved work
        </>
      ) : (
        SAVE_LABEL[state]
      )}
    </span>
  );
}

function ConflictPanel({
  conflict,
  draftBlocks,
  onResolve
}: {
  conflict: SaveConflict;
  draftBlocks: LessonBlock[];
  onResolve?: (choice: "reload" | "keep") => void;
}) {
  const rows = Math.max(conflict.theirBlocks.length, draftBlocks.length);
  return (
    <section
      className="x-block-editor__conflict"
      role="alert"
      aria-label="Save conflict"
    >
      <StateBlock
        state="refused"
        message={`Save refused — ${conflict.savedBy} saved a newer revision at ${conflict.savedAt}. Your draft was not overwritten.`}
      />
      <div className="x-block-editor__compare" role="table" aria-label="Revision comparison">
        <div className="x-block-editor__compare-row x-block-editor__compare-row--head" role="row">
          <span role="columnheader">#</span>
          <span role="columnheader">Saved revision — {conflict.savedBy}</span>
          <span role="columnheader">Your draft</span>
        </div>
        {Array.from({ length: rows }, (_, i) => {
          const theirs = conflict.theirBlocks[i];
          const mine = draftBlocks[i];
          const differs =
            theirs && mine ? blockSummary(theirs) !== blockSummary(mine) : theirs !== mine;
          return (
            <div className="x-block-editor__compare-row" role="row" key={i} data-differs={differs || undefined}>
              <span role="cell" className="x-block-editor__compare-idx">{i + 1}</span>
              <span role="cell">{theirs ? blockSummary(theirs) : "—"}</span>
              <span role="cell">{mine ? blockSummary(mine) : "—"}</span>
            </div>
          );
        })}
      </div>
      <p className="x-block-editor__conflict-note">
        The comparison lists the saved revision beside your draft's order —
        keep editing, or load the saved revision and lose this draft.
      </p>
      <div className="x-block-editor__conflict-actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onResolve?.("reload")}
        >
          Load the saved revision
        </Button>
        <Button variant="quiet" size="sm" onClick={() => onResolve?.("keep")}>
          Keep editing — the save stays refused
        </Button>
      </div>
    </section>
  );
}

export function LessonBlockEditor({
  blocks,
  onChange,
  dirty = false,
  saveState = "saved",
  onSave,
  conflict = null,
  onConflictResolve,
  leaveGuard,
  children,
  className = ""
}: LessonBlockEditorProps) {
  const patch = (id: string, p: Partial<LessonBlock>) =>
    onChange?.(blocks.map((b) => (b.id === id ? { ...b, ...p } : b)));

  const move = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(i, 1);
    next.splice(j, 0, item!);
    onChange?.(next);
  };

  const remove = (id: string) => onChange?.(blocks.filter((b) => b.id !== id));

  const add = (type: (typeof BLOCK_ORDER)[number]) =>
    onChange?.([...blocks, emptyBlock(type, `blk-${type}-${Math.random().toString(36).slice(2, 9)}`)]);

  return (
    <div className={`x-block-editor ${className}`.trim()}>
      <header className="x-block-editor__bar">
        <SaveStatus state={saveState} dirty={dirty} />
        {onSave ? (
          <Button
            variant={saveState === "retry" ? "primary" : "secondary"}
            size="sm"
            icon="save"
            loading={saveState === "saving"}
            loadingLabel="Saving…"
            disabled={saveState === "conflict" || saveState === "saving"}
            onClick={onSave}
          >
            {saveState === "retry" ? "Retry save" : "Save"}
          </Button>
        ) : null}
      </header>

      {conflict ? (
        <ConflictPanel conflict={conflict} draftBlocks={blocks} onResolve={onConflictResolve} />
      ) : null}

      <div className="x-block-editor__panes">
        <div className="x-block-editor__canvas" aria-label="Blocks">
          {blocks.length === 0 ? (
            <p className="x-block-editor__empty">
              No blocks yet — an incomplete draft always saves.
            </p>
          ) : (
            blocks.map((block, i) => (
              <section className="x-block-editor__block" key={block.id}>
                <header className="x-block-editor__block-head">
                  <span className="x-block-editor__block-type">
                    {BLOCK_LABEL[block.type]}
                  </span>
                  <span className="x-block-editor__block-tools">
                    <button
                      type="button"
                      className="x-block-editor__tool"
                      aria-label={`Move ${BLOCK_LABEL[block.type]} block up`}
                      disabled={i === 0}
                      onClick={() => move(block.id, -1)}
                    >
                      <Icon name="chevron-up" size={14} />
                    </button>
                    <button
                      type="button"
                      className="x-block-editor__tool"
                      aria-label={`Move ${BLOCK_LABEL[block.type]} block down`}
                      disabled={i === blocks.length - 1}
                      onClick={() => move(block.id, 1)}
                    >
                      <Icon name="chevron-down" size={14} />
                    </button>
                    <button
                      type="button"
                      className="x-block-editor__tool"
                      aria-label={`Remove ${BLOCK_LABEL[block.type]} block`}
                      onClick={() => remove(block.id)}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </span>
                </header>
                <BlockFields block={block} onPatch={(p) => patch(block.id, p)} />
              </section>
            ))
          )}

          <div className="x-block-editor__add" role="group" aria-label="Add a block">
            {BLOCK_ORDER.map((type) => (
              <button
                key={type}
                type="button"
                className="x-block-editor__add-btn"
                onClick={() => add(type)}
              >
                <Icon name="plus" size={13} /> {BLOCK_LABEL[type]}
              </button>
            ))}
          </div>

          {children}
        </div>

        <aside className="x-block-editor__preview" aria-label="Live preview">
          <header className="x-block-editor__preview-head">
            <strong>Live preview</strong>
            <span>The real learner view — running disabled</span>
          </header>
          <div className="x-block-editor__preview-body">
            {blocks.length === 0 ? (
              <p className="x-block-editor__empty">Nothing to preview yet.</p>
            ) : (
              blocks.map((block) => (
                <div className="x-block-editor__pv-block" key={block.id}>
                  <BlockPreview block={block} />
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {leaveGuard?.open ? (
        <Dialog
          title="Unsaved work"
          icon="alert"
          onClose={leaveGuard.onStay}
          actions={
            <>
              <button
                type="button"
                className="x-btn x-btn--quiet"
                data-autofocus=""
                onClick={leaveGuard.onStay}
              >
                Stay and keep editing
              </button>
              <button
                type="button"
                className="x-btn x-btn--destructive"
                onClick={leaveGuard.onLeave}
              >
                Leave without saving
              </button>
            </>
          }
        >
          Leaving now loses the unsaved work on this lesson. Saved work is
          never lost — only what you have changed since the last save.
        </Dialog>
      ) : null}
    </div>
  );
}

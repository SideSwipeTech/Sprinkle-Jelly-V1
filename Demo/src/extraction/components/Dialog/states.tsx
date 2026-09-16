/**
 * Dialog state matrix — what the Kitchen Sink renders.
 * Every state is the real component; `closed` shows only its trigger, which is what
 * "closed" honestly looks like.
 */

import type { ReactNode } from "react";
import { Dialog } from "./Dialog";
import { AlertDialog, ConfirmDialog, PromptDialog, TypedConfirmDialog } from "./Dialog.variants";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "closed",
    label: "Closed (trigger only)",
    render: () => (
      <button type="button" className="x-btn x-btn--primary">
        Open dialog
      </button>
    )
  },
  {
    key: "confirm",
    label: "Confirm",
    render: () => (
      <ConfirmDialog title="Leave this sitting?" onConfirm={() => {}} onClose={() => {}}>
        <p>Progress in the current attempt is not kept once you leave.</p>
      </ConfirmDialog>
    )
  },
  {
    key: "confirm-destructive",
    label: "Confirm — destructive (focus lands on the safe exit)",
    render: () => (
      <ConfirmDialog
        title="Delete main.py?"
        destructive
        confirmLabel="Delete file"
        onConfirm={() => {}}
        onClose={() => {}}
      >
        <p>The file is removed from the workspace. This cannot be undone.</p>
      </ConfirmDialog>
    )
  },
  {
    key: "prompt",
    label: "Prompt (replaces window.prompt)",
    render: () => (
      <PromptDialog
        title="New file"
        fieldLabel="File name"
        placeholder="module.py"
        submitLabel="Create file"
        onSubmit={() => {}}
        onClose={() => {}}
      />
    )
  },
  {
    key: "alert",
    label: "Alert (replaces alert())",
    render: () => (
      <AlertDialog title="Value staged" onClose={() => {}}>
        <p>Proposed value staged for the selected variable. Recorded in the admin audit trail.</p>
      </AlertDialog>
    )
  },
  {
    key: "typed-confirm",
    label: "Typed confirmation — locked until echo matches",
    render: () => (
      <TypedConfirmDialog
        title="Permanently delete course?"
        confirmText="Python Foundations"
        onConfirm={() => {}}
        onClose={() => {}}
      >
        <p>
          Permanent delete removes the draft and every revision. A bad echo leaves the action
          unreachable.
        </p>
      </TypedConfirmDialog>
    )
  },
  {
    key: "persistent",
    label: "Persistent (no Escape / scrim exit)",
    render: () => (
      <Dialog
        title="Sitting in progress"
        persistent
        onClose={() => {}}
        actions={
          <button type="button" className="x-btn x-btn--primary">
            Return to sitting
          </button>
        }
      >
        <p>This dialog can only be resolved by its own action.</p>
      </Dialog>
    )
  }
];

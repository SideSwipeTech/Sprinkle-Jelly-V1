/**
 * Dialog.variants — the four native crutches, as components.
 *
 * Split from Dialog.tsx for the file bound; everything here composes the base Dialog.
 * window.confirm → ConfirmDialog · window.prompt → PromptDialog · alert() → AlertDialog ·
 * the admin typed-echo delete → TypedConfirmDialog.
 */

import { useId, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Dialog } from "./Dialog";

export interface ConfirmDialogProps {
  open?: boolean;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}

/** window.confirm. Destructive confirms mark the action, never rely on colour alone. */
export function ConfirmDialog({
  open = true,
  title,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onClose,
  children
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      icon={destructive ? "alert" : undefined}
      tone={destructive ? "destructive" : "default"}
      onClose={onClose}
      actions={
        <>
          {/* Destructive confirms land focus on the safe exit — the dangerous action
              is reachable but never pre-selected. Buttons use controls/Button's
              x-btn classes (contract §6 — siblings by class, not import). */}
          <button
            type="button"
            className="x-btn x-btn--quiet"
            data-autofocus={destructive ? "" : undefined}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`x-btn ${destructive ? "x-btn--destructive" : "x-btn--primary"}`}
            data-autofocus={destructive ? undefined : ""}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}

export interface PromptDialogProps {
  open?: boolean;
  title: string;
  fieldLabel: string;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
  children?: ReactNode;
}

/** window.prompt. Submit is disabled until the field is non-empty — never a dead button. */
export function PromptDialog({
  open = true,
  title,
  fieldLabel,
  initialValue = "",
  placeholder,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onSubmit,
  onClose,
  children
}: PromptDialogProps) {
  const [value, setValue] = useState(initialValue);
  const fieldId = useId();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    onClose();
  }

  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      actions={
        <>
          <button type="button" className="x-btn x-btn--quiet" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="submit"
            form={fieldId}
            className="x-btn x-btn--primary"
            disabled={!value.trim()}
            data-disabled={!value.trim() || undefined}
            aria-disabled={!value.trim() || undefined}
          >
            {submitLabel}
          </button>
        </>
      }
    >
      {children}
      <form id={fieldId} className="x-dialog__form" onSubmit={submit}>
        <label className="x-dialog__field">
          <span className="x-dialog__field-label">{fieldLabel}</span>
          <input
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            data-autofocus=""
          />
        </label>
      </form>
    </Dialog>
  );
}

export interface AlertDialogProps {
  open?: boolean;
  title: string;
  acknowledgeLabel?: string;
  onClose: () => void;
  children?: ReactNode;
}

/** alert(). One way out: acknowledge. role="alertdialog" announces it as an alert. */
export function AlertDialog({
  open = true,
  title,
  acknowledgeLabel = "OK",
  onClose,
  children
}: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      role="alertdialog"
      icon="info"
      onClose={onClose}
      actions={
        <button
          type="button"
          className="x-btn x-btn--primary"
          data-autofocus=""
          onClick={onClose}
        >
          {acknowledgeLabel}
        </button>
      }
    >
      {children}
    </Dialog>
  );
}

export interface TypedConfirmDialogProps {
  open?: boolean;
  title: string;
  /** The exact string that unlocks the action — e.g. the course title in admin deletes. */
  confirmText: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}

/**
 * The admin permanent-delete pattern (AdminPages typed echo): the destructive action stays
 * disabled until the field echoes `confirmText` exactly. A bad echo leaves it unreachable —
 * that is the point, so disabled is a real attribute, not a style.
 */
export function TypedConfirmDialog({
  open = true,
  title,
  confirmText,
  confirmLabel = "Delete permanently",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  children
}: TypedConfirmDialogProps) {
  const [echo, setEcho] = useState("");
  const matched = echo === confirmText;

  return (
    <Dialog
      open={open}
      title={title}
      icon="alert"
      tone="destructive"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="x-btn x-btn--quiet" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="x-btn x-btn--destructive"
            disabled={!matched}
            data-disabled={!matched || undefined}
            aria-disabled={!matched || undefined}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
      <div className="x-dialog__form">
        <label className="x-dialog__field">
          <span className="x-dialog__field-label">
            Type <strong>{confirmText}</strong> to continue
          </span>
          <input
            value={echo}
            onChange={(e) => setEcho(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            data-autofocus=""
            data-matched={matched || undefined}
          />
        </label>
      </div>
    </Dialog>
  );
}

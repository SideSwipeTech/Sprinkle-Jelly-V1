/**
 * Dialog — the modal primitive the native crutches retire into.
 *
 * Replaces window.confirm / window.prompt / alert() (contract §7): every call site the demo
 * routed through a browser chrome dialog — FileExplorer's delete confirm, EditorTabs' new-file
 * prompt, the admin stage alert, and the admin permanent-delete typed echo — is one of the
 * four variants below.
 *
 * Anatomy is constant: a scrim button (click = cancel) behind a centred panel with
 * role="dialog" aria-modal="true", the title labelled, the body described. Focus moves in on
 * mount, Tab cycles inside, Escape cancels, and focus returns to whatever opened it.
 * `persistent` removes the two soft exits (Escape + scrim) for flows that must be answered.
 */

import { useEffect, useId, useRef } from "react";
import type React from "react";
import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./Dialog.css";

/** Everything a Tab cycle may land on, in DOM order. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared modal behaviour: initial focus, Tab trap, Escape, and focus restore.
 * Kept per-component (not imported) so each extracted file stands alone.
 */
function useModal(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  persistent: boolean,
  active: boolean
) {
  /* Latest-ref: callback identity changes must not re-fire the focus trap —
     without this, any parent re-render restores focus then re-focuses the
     panel, and the browser scrolls the dialog into view. */
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const panel = ref.current;
    if (!active || !panel) return;
    const previous = document.activeElement as HTMLElement | null;
    const first =
      panel.querySelector<HTMLElement>("[data-autofocus]") ??
      panel.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel).focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!persistent) {
          event.stopPropagation();
          closeRef.current();
        }
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.tabIndex !== -1
      );
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const head = items[0]!;
      const tail = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === head) {
        event.preventDefault();
        tail.focus();
      } else if (!event.shiftKey && document.activeElement === tail) {
        event.preventDefault();
        head.focus();
      }
    }

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      previous?.focus();
    };
  }, [ref, persistent, active]);
}

export interface DialogProps {
  /** Consumer mounts conditionally or drives `open`; closed renders nothing (honest absence). */
  open?: boolean;
  title: string;
  icon?: IconName;
  /** `alertdialog` for the alert() replacement — assertive, no implied choice. */
  role?: "dialog" | "alertdialog";
  tone?: "default" | "destructive";
  /** Removes Escape and scrim-click exits — the action must be answered in-panel. */
  persistent?: boolean;
  onClose: () => void;
  /** Action row — buttons carry controls/Button's `x-btn x-btn--<variant>` classes. */
  actions?: ReactNode;
  children?: ReactNode;
}

export function Dialog({
  open = true,
  title,
  icon,
  role = "dialog",
  tone = "default",
  persistent = false,
  onClose,
  actions,
  children
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const bodyId = useId();
  useModal(panelRef, onClose, persistent, open);

  if (!open) return null;

  return (
    <div className="x-dialog" data-tone={tone === "destructive" ? "destructive" : undefined}>
      {persistent ? (
        /* Persistent dialogs get an inert dim layer — a button that does nothing is a lie. */
        <div className="x-dialog__scrim" aria-hidden="true" />
      ) : (
        <button
          type="button"
          className="x-dialog__scrim"
          aria-label="Dismiss"
          tabIndex={-1}
          onClick={onClose}
        />
      )}
      <div
        className="x-dialog__panel"
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={children ? bodyId : undefined}
        ref={panelRef}
        tabIndex={-1}
      >
        <header className="x-dialog__head">
          {icon ? (
            <span className="x-dialog__icon" aria-hidden="true">
              <Icon name={icon} size={20} />
            </span>
          ) : null}
          <h2 className="x-dialog__title" id={titleId}>
            {title}
          </h2>
          {persistent ? null : (
            <button type="button" className="x-dialog__close" aria-label="Close" onClick={onClose}>
              <Icon name="x" size={16} />
            </button>
          )}
        </header>
        {children ? (
          <div className="x-dialog__body" id={bodyId}>
            {children}
          </div>
        ) : null}
        {actions ? <footer className="x-dialog__actions">{actions}</footer> : null}
      </div>
    </div>
  );
}

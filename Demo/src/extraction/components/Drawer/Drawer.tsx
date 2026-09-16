/**
 * Drawer — the edge-anchored navigation panel.
 *
 * Generalises the learner shell's DrawerNav (Shell.tsx:434-455) and the admin mobile nav
 * (admin-shell.css:189-233: .admin-nav.is-open + .admin-nav-scrim). Scrim + left-edge panel,
 * role="dialog" aria-modal, focus moves in on open and restores on close, Escape and scrim
 * click close. Below Standard every nav model collapses into this (OR-O2) — it is the
 * shared escape hatch, not a per-model feature.
 */

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./Drawer.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DrawerProps {
  open?: boolean;
  onClose: () => void;
  /** Accessible name for the dialog (e.g. "Navigation"). */
  label: string;
  /** Which edge the panel anchors to. Nav drawers are left; right exists for parity. */
  side?: "left" | "right";
  /** Optional heading row — a title plus the close button (the admin mobile-head pattern). */
  heading?: ReactNode;
  /** Hide the close button — e.g. when the consumer renders its own in `heading`. */
  hideClose?: boolean;
  children: ReactNode;
}

export function Drawer({
  open = true,
  onClose,
  label,
  side = "left",
  heading,
  hideClose = false,
  children
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const previous = document.activeElement as HTMLElement | null;
    (panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
        return;
      }
      // The drawer is modal — Tab cycles inside rather than escaping behind the scrim.
      if (event.key === "Tab" && panel) {
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
    }
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="x-drawer" data-side={side}>
      <button
        type="button"
        className="x-drawer__scrim"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        className="x-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        ref={panelRef}
        tabIndex={-1}
      >
        {heading || !hideClose ? (
          <header className="x-drawer__head">
            {heading ? <div className="x-drawer__heading">{heading}</div> : null}
            {hideClose ? null : (
              <button
                type="button"
                className="x-drawer__close"
                aria-label="Close"
                onClick={onClose}
              >
                <Icon name="x" size={18} />
              </button>
            )}
          </header>
        ) : null}
        <div className="x-drawer__body">{children}</div>
      </div>
    </div>
  );
}

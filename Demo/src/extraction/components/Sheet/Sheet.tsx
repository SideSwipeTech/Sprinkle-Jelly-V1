/**
 * Sheet — the edge panel that docks under the header.
 *
 * The NotesPanel anatomy (Shell.tsx:458-499, shell.css:726-763) generalised: a fixed panel
 * anchored to the right edge, starting below the header, going full-width on compact
 * dock contexts (the source 599px notes-panel rule, keyed to the sheet's own box via
 * container query — the viewport in the app, the state cell in the sink). Scrim is opt-in —
 * the reference usage (quick notes) is a working panel you type in while the page stays
 * visible, so its scrim defaults off.
 */

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./Sheet.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface SheetProps {
  open?: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  /** Anchored edge — right is the notes-panel pattern; left for parity. */
  side?: "left" | "right";
  /** Render the dimming scrim behind the panel (default off — see file header). */
  scrim?: boolean;
  /** Head row content — typically a kicker + title block. */
  heading?: ReactNode;
  children: ReactNode;
}

export function Sheet({
  open = true,
  onClose,
  label,
  side = "right",
  scrim = false,
  heading,
  children
}: SheetProps) {
  const panelRef = useRef<HTMLElement>(null);
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
      // With a scrim the sheet is modal — Tab cycles inside. Without one the page stays
      // live and focus must be free to leave.
      if (event.key === "Tab" && scrim && panel) {
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
  }, [open, scrim]);

  if (!open) return null;

  return (
    <div className="x-sheet" data-side={side}>
      {scrim ? (
        <button
          type="button"
          className="x-sheet__scrim"
          aria-label="Close"
          tabIndex={-1}
          onClick={onClose}
        />
      ) : null}
      <section
        className="x-sheet__panel"
        role="dialog"
        /* aria-modal only when the scrim makes it true — without one the page stays
           interactive and claiming modality would lie to assistive tech. */
        aria-modal={scrim || undefined}
        aria-label={label}
        ref={panelRef}
        tabIndex={-1}
      >
        <header className="x-sheet__head">
          {heading ? <div className="x-sheet__heading">{heading}</div> : null}
          <button
            type="button"
            className="x-sheet__close"
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="x" size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

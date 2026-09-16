/**
 * Popover — the anchored panel primitive.
 *
 * Generalises `.header-menu` + `.header-pop` (shell.css:641-647): a relative anchor holding
 * a trigger and an absolutely-positioned panel. Escape and pointer-down outside close it;
 * closing returns focus to the trigger. The trigger controls `aria-expanded` and owns
 * `aria-controls` pointing at the panel.
 *
 * Not a menu and not a dialog — a Popover holds arbitrary content (lists, cards, forms).
 * For item lists with roving focus use Menu; for modality use Dialog.
 */

import { useEffect, useId, useRef, useState } from "react";
import type React from "react";
import type { ReactNode } from "react";
import "./Popover.css";

export interface PopoverTriggerArgs {
  open: boolean;
  /** Toggle handler — wire to the trigger's onClick. */
  toggle: () => void;
  /** aria-expanded + aria-controls, spread onto the trigger element. */
  triggerProps: {
    "aria-expanded": boolean;
    "aria-controls": string;
    "aria-haspopup": "dialog";
  };
  /** Ref the trigger so close can return focus to it. Attach to a <button>. */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export interface PopoverProps {
  /** Render-prop trigger — the popover needs to attach handlers and aria to it. */
  trigger: (args: PopoverTriggerArgs) => ReactNode;
  /** Panel content — arbitrary. */
  children: ReactNode;
  /** Which edge of the trigger the panel aligns to. */
  align?: "start" | "end";
  /** Accessible name for the panel region. */
  label?: string;
  /** Move focus into the panel on open (default: focus stays on the trigger). */
  focusOnOpen?: boolean;
  /** Start open — for the sink/state matrix. Interaction still closes it. */
  defaultOpen?: boolean;
  className?: string;
}

export function Popover({
  trigger,
  children,
  align = "end",
  label,
  focusOnOpen = false,
  defaultOpen = false,
  className = ""
}: PopoverProps) {
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  // Pointer-down outside + Escape anywhere inside close the panel.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  // Optional focus hand-off into the panel.
  useEffect(() => {
    if (!open || !focusOnOpen) return;
    const panel = panelRef.current;
    if (!panel) return;
    (panel.querySelector<HTMLElement>("a[href], button, input, [tabindex]") ?? panel).focus();
  }, [open, focusOnOpen]);

  return (
    <div className={`x-pop ${className}`} ref={rootRef}>
      {trigger({
        open,
        toggle: () => setOpen((v) => !v),
        triggerProps: {
          "aria-expanded": open,
          "aria-controls": panelId,
          "aria-haspopup": "dialog"
        },
        triggerRef
      })}
      {open ? (
        <div
          className="x-pop__panel"
          id={panelId}
          role="dialog"
          aria-label={label}
          data-align={align}
          ref={panelRef}
          tabIndex={-1}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

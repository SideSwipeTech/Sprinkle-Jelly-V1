/**
 * HeaderMenu — the header popover, concretely.
 *
 * The notification popover from Shell.tsx:135-179, class-ified: icon-button trigger with an
 * unread badge, a titled panel with an optional header action, an item list whose unread rows
 * carry a data attribute (not a hardcoded rgba tint), and a footer link. Escape and
 * pointer-down outside close it; the trigger owns aria-expanded/aria-controls.
 */

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./HeaderMenu.css";

export interface HeaderMenuItem {
  id: string;
  title: string;
  body?: string;
  unread?: boolean;
}

export interface HeaderMenuProps {
  /** Trigger icon + accessible name. */
  icon: IconName;
  label: string;
  /** Unread count — shown as a badge on the trigger; 0 or undefined hides it. */
  badge?: number;
  /** Panel heading, e.g. "Notifications (3 new)". */
  title: string;
  /** Header action — e.g. a "Mark read" quiet button. Rendered only when supplied. */
  action?: ReactNode;
  items: HeaderMenuItem[];
  /** Footer slot — e.g. a "View all" link. */
  footer?: ReactNode;
  /** Honest absence: what the panel says when there is nothing to show. */
  emptyMessage?: string;
  /** Start open — for the sink/state matrix. */
  defaultOpen?: boolean;
}

export function HeaderMenu({
  icon,
  label,
  badge,
  title,
  action,
  items,
  footer,
  emptyMessage = "Nothing here yet.",
  defaultOpen = false
}: HeaderMenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
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

  return (
    <div className="x-hmenu" ref={rootRef}>
      <button
        type="button"
        className="x-hmenu__trigger"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={icon} size={18} />
        {badge ? <span className="x-hmenu__badge">{badge}</span> : null}
      </button>

      {open ? (
        <div className="x-hmenu__panel" id={panelId} role="dialog" aria-label={title}>
          <div className="x-hmenu__head">
            <p className="x-hmenu__title">{title}</p>
            {action ? <div className="x-hmenu__action">{action}</div> : null}
          </div>

          {items.length === 0 ? (
            <p className="x-hmenu__empty">{emptyMessage}</p>
          ) : (
            <div className="x-hmenu__list">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="x-hmenu__item"
                  data-unread={item.unread || undefined}
                >
                  <p className="x-hmenu__item-title">{item.title}</p>
                  {item.body ? <p className="x-hmenu__item-body">{item.body}</p> : null}
                </div>
              ))}
            </div>
          )}

          {footer ? <div className="x-hmenu__foot">{footer}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

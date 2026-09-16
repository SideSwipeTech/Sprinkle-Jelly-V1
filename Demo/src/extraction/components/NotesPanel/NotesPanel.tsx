/**
 * NotesPanel — the floating scratch pad with its autosave honesty.
 *
 * Extracted from Shell.tsx:458-499 (styles: shell.css:726-763). A floating pad at
 * the bottom-right corner (no scrim — you write while the page stays visible),
 * header with kicker + title +
 * close, a lead line, the textarea, and a footer that tells the truth about persistence:
 * a save-state dot (saved/saving, colour AND text — never colour alone) plus the
 * character count against the cap.
 */

import { useEffect, useRef, useState } from "react";
import { Icon } from "@icons/Icon";
import "./NotesPanel.css";

export interface NotesPanelProps {
  open?: boolean;
  onClose: () => void;
  /** Controlled value — the persisted note. */
  value: string;
  /** Called on every edit — the consumer persists (store, localStorage, wire). */
  onChange: (value: string) => void;
  maxLength?: number;
  /** Kicker line above the title. */
  kicker?: string;
  title?: string;
  lead?: string;
  placeholder?: string;
  /** Debounce before the indicator flips back to "saved" (ms shown, not styled). */
  settleMs?: number;
  /**
   * Optional external save-state override. When set, the indicator follows the caller
   * (async persistence) instead of the internal debounce.
   */
  saveState?: "saved" | "saving";
}

export function NotesPanel({
  open = true,
  onClose,
  value,
  onChange,
  maxLength = 50000,
  kicker = "Private scratchpad",
  title = "Quick Notes",
  lead = "One continuous note across eligible learning surfaces. Staff never see this content.",
  placeholder = "Capture an invariant, question, or next step...",
  settleMs = 350,
  saveState
}: NotesPanelProps) {
  const [internal, setInternal] = useState<"saved" | "saving">("saved");
  const status = saveState ?? internal;
  const timer = useRef<number | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Focus in on open, restore on close; Escape closes (no scrim to click).
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // The textarea is the point of the panel — focus it first (the demo's autoFocus).
    (panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector<HTMLElement>("textarea, button")
    )?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      previous?.focus();
    };
  }, [open]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  function update(next: string) {
    setInternal("saving");
    onChange(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setInternal("saved"), settleMs);
  }

  if (!open) return null;

  return (
    /* No scrim — the page stays live, so this is a non-modal dialog: role="dialog"
       without aria-modal (the demo claimed modality it did not enforce). */
    <aside
      className="x-notes"
      role="dialog"
      aria-label={title}
      ref={panelRef}
    >
      <header className="x-notes__head">
        <div className="x-notes__heading">
          <p className="micro x-notes__kicker">{kicker}</p>
          <h2 className="x-notes__title">{title}</h2>
        </div>
        <button
          type="button"
          className="x-notes__close"
          onClick={onClose}
          aria-label={`Close ${title}`}
        >
          <Icon name="x" size={18} />
        </button>
      </header>

      <p className="x-notes__lead">{lead}</p>

      <textarea
        className="x-notes__area"
        data-autofocus=""
        value={value}
        maxLength={maxLength}
        onChange={(e) => update(e.target.value)}
        placeholder={placeholder}
        aria-label={`${title} content`}
      />

      <footer className="x-notes__foot">
        <span
          className="x-notes__save"
          data-saving={status === "saving" || undefined}
          role="status"
        >
          <span className="x-notes__save-dot" aria-hidden="true" />
          {status === "saving" ? "Saving…" : "Saved"}
        </span>
        <span className="x-notes__count">
          {value.length.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      </footer>
    </aside>
  );
}

/**
 * CommandPalette — the ⌘K surface, rebuilt with real classes and real ARIA.
 *
 * Replaces Shell.tsx:510-696 — the demo's heaviest inline-style cluster (~15 literals:
   scrim rgba, panel shadow, row backgrounds, border-left selection bars, 10px chip type).
 * The interaction is an ARIA combobox: input role="combobox" with aria-expanded +
 * aria-activedescendant, results role="listbox", rows role="option" aria-selected.
 * Arrow keys move the selection (with wrap), Enter activates, Escape closes, the scrim
 * is a cancel button. Hover syncs the selection for parity.
 *
 * The component owns query + filtering; the consumer owns the item corpus and what
 * "select" means (navigate, run a command, insert…).
 */

import { useEffect, useId, useRef, useState } from "react";
import type React from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./CommandPalette.css";

export interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  /** Grouping chip, e.g. "Navigation" | "Course" | "Challenge". */
  category?: string;
  icon?: IconName;
}

export interface CommandPaletteProps {
  open?: boolean;
  items: PaletteItem[];
  onSelect: (item: PaletteItem) => void;
  onClose: () => void;
  /** Full-search escape — Enter/empty-state affordance navigates to a search surface. */
  onFullSearch?: (query: string) => void;
  placeholder?: string;
  /** How many items show before a query is typed (the demo's 8). */
  previewCount?: number;
  /** Field label for assistive tech. */
  label?: string;
}

function matches(item: PaletteItem, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    item.title.toLowerCase().includes(needle) ||
    (item.subtitle ?? "").toLowerCase().includes(needle) ||
    (item.category ?? "").toLowerCase().includes(needle)
  );
}

export function CommandPalette({
  open = true,
  items,
  onSelect,
  onClose,
  onFullSearch,
  placeholder = "Search or jump to…",
  previewCount = 8,
  label = "Command palette"
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const listboxId = useId();

  const filtered = query.trim()
    ? items.filter((i) => matches(i, query))
    : items.slice(0, previewCount);

  // Query changes reset the selection to the top.
  useEffect(() => setActiveIdx(0), [query]);

  // Keep the active option in view while arrowing.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  // Escape anywhere closes; focus restore is the consumer's trigger's concern, but
  // handing it back is the honest default.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
        return;
      }
      // Modal: keep Tab cycling inside the panel rather than behind the scrim.
      if (event.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const items = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.tabIndex !== -1);
        if (items.length === 0) return;
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

  function activate(idx: number) {
    const item = filtered[idx];
    if (item) {
      onSelect(item);
      closeRef.current();
    } else if (query.trim() && onFullSearch) {
      onFullSearch(query.trim());
      closeRef.current();
    }
  }

  function onFieldKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIdx((v) => (filtered.length ? (v + 1) % filtered.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIdx((v) => (filtered.length ? (v - 1 + filtered.length) % filtered.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      activate(activeIdx);
    }
  }

  if (!open) return null;

  return (
    <div className="x-palette">
      <button
        type="button"
        className="x-palette__scrim"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        className="x-palette__panel"
        role="dialog"
        aria-label={label}
        aria-modal="true"
        ref={panelRef}
      >
        <label className="x-palette__field">
          <span className="x-palette__field-icon" aria-hidden="true">
            <Icon name="search" size={18} />
          </span>
          <input
            className="x-palette__input"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={
              filtered[activeIdx] ? `x-palette-opt-${filtered[activeIdx]!.id}` : undefined
            }
            aria-autocomplete="list"
            autoFocus
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onFieldKeyDown}
          />
          <kbd className="x-palette__kbd">ESC</kbd>
        </label>

        <div className="x-palette__results">
          {filtered.length === 0 ? (
            <div className="x-palette__empty">
              <p className="x-palette__empty-text">
                No matches for “{query.trim()}”
              </p>
              {onFullSearch && query.trim() ? (
                <button
                  type="button"
                  className="x-btn x-btn--secondary x-btn--sm x-palette__empty-action"
                  onClick={() => {
                    onFullSearch(query.trim());
                    closeRef.current();
                  }}
                >
                  Full search for “{query.trim()}” →
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="x-palette__list" role="listbox" id={listboxId} ref={listRef}>
              {filtered.map((item, idx) => {
                const active = idx === activeIdx;
                return (
                  <li key={item.id} role="none">
                    <button
                      type="button"
                      role="option"
                      id={`x-palette-opt-${item.id}`}
                      aria-selected={active}
                      data-active={active || undefined}
                      className="x-palette__row"
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => activate(idx)}
                    >
                      <span className="x-palette__row-icon" aria-hidden="true">
                        {item.icon ? <Icon name={item.icon} size={16} /> : null}
                      </span>
                      <span className="x-palette__row-text">
                        <span className="x-palette__row-title">{item.title}</span>
                        {item.subtitle ? (
                          <span className="x-palette__row-sub">{item.subtitle}</span>
                        ) : null}
                      </span>
                      {item.category ? (
                        <span className="x-palette__cat">{item.category}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="x-palette__foot">
          <span>
            Navigate <kbd className="x-palette__kbd">↑</kbd>{" "}
            <kbd className="x-palette__kbd">↓</kbd>
          </span>
          <span>
            Select <kbd className="x-palette__kbd">↵ Enter</kbd>
          </span>
        </footer>
      </div>
    </div>
  );
}

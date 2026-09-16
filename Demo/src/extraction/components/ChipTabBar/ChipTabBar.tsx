/**
 * ChipTabBar — the chip row that switches CONTENT, not a filter: KitchenSink's top
 * tabs, the course-hub tabs (Learn.tsx:213-233), the solutions view switcher. In the
 * demo these were `.chip` buttons with `data-on` and no tablist semantics at all —
 * keyboard users got a row of unlabelled toggles.
 *
 * Real `role="tablist"` + `role="tab"` + `aria-selected`, roving tabindex and
 * arrow/Home/End navigation. It still paints the sibling `x-chip` classes (CONTRACT §6),
 * so the family look holds; the selected tab keeps `data-on` as well as aria-selected.
 */

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./ChipTabBar.css";

export interface ChipTab {
  id: string;
  label: ReactNode;
  icon?: IconName;
  disabled?: boolean;
}

export interface ChipTabBarProps {
  tabs: readonly ChipTab[];
  /** The active tab id. */
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the tablist — required. */
  label: string;
  /** Ruled bottom edge — the course-hub tab row drew this with an inline border. */
  ruled?: boolean;
  className?: string;
}

export function ChipTabBar({ tabs, value, onChange, label, ruled, className = "" }: ChipTabBarProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const moveFocus = (from: number, dir: 1 | -1 | "home" | "end") => {
    const enabled = tabs.filter((t) => !t.disabled);
    const current = tabs[from];
    if (!current) return;
    const at = Math.max(0, enabled.indexOf(current));
    const next =
      dir === "home" ? enabled[0] : dir === "end" ? enabled[enabled.length - 1]
      : enabled[(at + dir + enabled.length) % enabled.length];
    if (!next) return;
    onChange(next.id);
    listRef.current
      ?.querySelector<HTMLElement>(`[data-tab="${next.id}"]`)
      ?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const index = tabs.findIndex((t) => t.id === (event.target as HTMLElement).dataset.tab);
    if (index < 0) return;
    if (event.key === "ArrowRight") { event.preventDefault(); moveFocus(index, 1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); moveFocus(index, -1); }
    else if (event.key === "Home") { event.preventDefault(); moveFocus(index, "home"); }
    else if (event.key === "End") { event.preventDefault(); moveFocus(index, "end"); }
  };

  return (
    <div
      ref={listRef}
      className={`x-chiptabbar ${ruled ? "x-chiptabbar--ruled" : ""} ${className}`}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
    >
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            data-tab={tab.id}
            className="x-chip"
            data-on={selected || undefined}
            data-disabled={tab.disabled || undefined}
            aria-selected={selected}
            disabled={tab.disabled}
            // Roving tabindex: only the selected tab is in the order; arrows move.
            tabIndex={selected && !tab.disabled ? 0 : -1}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon ? <Icon name={tab.icon} size={14} /> : null}
            <span className="x-chip__text">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

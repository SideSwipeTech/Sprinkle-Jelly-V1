/**
 * SettingsTabs — the icon tab strip from `.settings-tabs` (app.css:174-201), the
 * section switcher at the top of Settings.
 *
 * The legacy version swapped display:grid for a scrolling flex row at a bespoke
 * 760px media query — a breakpoint a component may not invent (CONTRACT: query its own
 * container or wrap intrinsically). This version needs no breakpoint at all: tabs are
 * `flex: 1 1 0` from a zero basis, so they fill equally when they fit and fall back to
 * content width + horizontal scroll the moment they don't.
 *
 * Semantics upgraded: `role="tablist"`, `role="tab"`, `aria-selected`, roving tabindex
 * with arrow/Home/End keys. The demo used <nav> + data-on only.
 */

import { useRef, type KeyboardEvent } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./SettingsTabs.css";

export interface SettingsTab {
  id: string;
  label: string;
  icon: IconName;
  disabled?: boolean;
}

export interface SettingsTabsProps {
  tabs: readonly SettingsTab[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name — e.g. "Settings sections". */
  label: string;
  className?: string;
}

export function SettingsTabs({ tabs, value, onChange, label, className = "" }: SettingsTabsProps) {
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
      className={`x-settingstabs ${className}`}
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
            className="x-settingstabs__tab"
            data-on={selected || undefined}
            data-disabled={tab.disabled || undefined}
            aria-selected={selected}
            disabled={tab.disabled}
            tabIndex={selected && !tab.disabled ? 0 : -1}
            onClick={() => onChange(tab.id)}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

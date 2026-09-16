/**
 * Tabs — the family tablist (courses.css:38-83, Learn.tsx:64-75).
 *
 * Visibly separate destinations, not a segmented control: each tab is a card-like button
 * with icon, title, subtitle and an optional count badge. The selected tab carries the
 * charge seam — the same "you are here" language the rail uses.
 *
 * ARIA: role="tablist" on the row, role="tab" + aria-selected on each tab, roving
 * tabindex (only the selected tab is in the Tab order), ArrowLeft/Right roam with wrap,
 * Home/End jump — the APG automatic-activation pattern (selection follows focus, the
 * demo's behaviour).
 */

import { useRef } from "react";
import type React from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./Tabs.css";

export interface TabItem {
  key: string;
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Count badge — e.g. the family size. `null`/undefined hides it. */
  count?: number | string | null;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Key of the selected tab. */
  value: string;
  onChange: (key: string) => void;
  /** Accessible name for the tablist (e.g. "Course families"). */
  label: string;
  /**
   * Ids of the panels each tab controls (same order as `tabs`). Optional but
   * recommended — it wires aria-controls/aria-labelledby both ways.
   */
  panelIds?: string[];
}

export function Tabs({ tabs, value, onChange, label, panelIds }: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIdx = Math.max(0, tabs.findIndex((t) => t.key === value));

  function focusTab(idx: number) {
    const tab = tabs[idx];
    if (!tab) return;
    onChange(tab.key);
    tabRefs.current[idx]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const count = tabs.length;
    if (count === 0) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusTab((selectedIdx + 1) % count);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusTab((selectedIdx - 1 + count) % count);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(count - 1);
    }
  }

  return (
    <div className="x-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((tab, idx) => {
        const selected = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`x-tab-${tab.key}`}
            className="x-tabs__tab"
            aria-selected={selected}
            aria-controls={panelIds?.[idx]}
            tabIndex={selected ? 0 : -1}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            onClick={() => onChange(tab.key)}
          >
            {tab.icon ? (
              <span className="x-tabs__icon" aria-hidden="true">
                <Icon name={tab.icon} size={18} />
              </span>
            ) : null}
            <span className="x-tabs__text">
              <strong className="x-tabs__title">{tab.title}</strong>
              {tab.subtitle ? <small className="x-tabs__sub">{tab.subtitle}</small> : null}
            </span>
            {tab.count !== undefined && tab.count !== null ? (
              <span className="x-tabs__count">{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

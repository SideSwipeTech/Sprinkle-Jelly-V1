/**
 * FilterBar — the catalogue filter row: search field + filter chips + result count.
 *
 * Kills the duplicated `.filters` (app.css:60-64 vs courses.css:89-94 — same name, two
 * gaps) and folds in `.filters__search` + `.filters__count` (courses.css:96-129).
 *
 * Composition is by sibling classes per CONTRACT §6: the search slot renders the
 * `x-searchfield` markup directly, chips/selects arrive as children already wearing
 * `x-chip` / `x-select` classes (ChipGroup, TagCloud, Select — or hand-emitted).
 * The count pins itself to the row's end.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./FilterBar.css";

export interface FilterBarSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export interface FilterBarProps {
  /** Filter rows (ChipGroup / TagCloud / Select / x-chip buttons) as children. */
  children?: ReactNode;
  /** Search slot config — renders x-searchfield markup (sibling, by class). */
  search?: FilterBarSearch;
  /** Result count text — e.g. "12 challenges". Renders only when given. */
  count?: ReactNode;
  /** Accessible group name — e.g. "Challenge filters". */
  label?: string;
  className?: string;
}

export function FilterBar({ children, search, count, label, className = "" }: FilterBarProps) {
  return (
    <div className={`x-filterbar ${className}`} role="group" aria-label={label}>
      {search ? (
        <label className="x-searchfield x-searchfield--grow">
          <Icon name="search" size={16} />
          <input
            className="x-searchfield__input"
            type="search"
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder ?? "Search…"}
            aria-label={search.label ?? search.placeholder ?? "Search"}
            autoComplete="off"
          />
        </label>
      ) : null}
      {children}
      {count != null ? <p className="x-filterbar__count">{count}</p> : null}
    </div>
  );
}

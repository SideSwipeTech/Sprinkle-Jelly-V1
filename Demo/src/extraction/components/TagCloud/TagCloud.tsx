/**
 * TagCloud — the dense tag selector on /challenges (Practice.tsx:162-175): a wrapped
 * cloud of small quiet chips, single-select. In the demo every chip carried
 * `style={{ fontSize: "11px" }}` — the `x-chip--sm` modifier replaces that.
 *
 * Emits sibling `x-chip` classes (CONTRACT §6). Each tag is `aria-pressed` + `data-on`;
 * the cloud itself is `role="group"` + `aria-label`. Pass `selected`/`onSelect` for a
 * controlled filter; omit `onSelect` for a static tag display.
 */

import "./TagCloud.css";

export interface TagCloudProps {
  tags: readonly string[];
  /** Selected tag, or null/undefined for none. */
  selected?: string | null;
  onSelect?: (tag: string) => void;
  /** Accessible group name — e.g. "Filter by tag". */
  label?: string;
  className?: string;
}

export function TagCloud({ tags, selected, onSelect, label = "Tags", className = "" }: TagCloudProps) {
  return (
    <div className={`x-tagcloud ${className}`} role="group" aria-label={label}>
      {tags.map((tag) => {
        const on = tag === selected;
        if (onSelect) {
          return (
            <button
              key={tag}
              type="button"
              className="x-chip x-chip--quiet x-chip--sm"
              data-on={on || undefined}
              aria-pressed={on}
              onClick={() => onSelect(tag)}
            >
              <span className="x-chip__text">{tag}</span>
            </button>
          );
        }
        return (
          <span key={tag} className="x-chip x-chip--quiet x-chip--sm" data-on={on || undefined}>
            <span className="x-chip__text">{tag}</span>
          </span>
        );
      })}
    </div>
  );
}

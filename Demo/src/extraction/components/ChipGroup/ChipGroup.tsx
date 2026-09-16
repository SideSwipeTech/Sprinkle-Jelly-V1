/**
 * ChipGroup — the labelled chip row the demo built out of `.filters` + `.chip`
 * buttons: a micro prefix ("TRACK:", "STATUS:") and a single-select run of toggles.
 *
 * Emits the sibling `x-chip` classes rather than importing Chip (CONTRACT §6 — siblings
 * by class, not import). Each option is a real button with `aria-pressed`; the group
 * itself is `role="group"` + `aria-label` so the prefix is announced, not just shown.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./ChipGroup.css";

export interface ChipGroupOption {
  id: string;
  label: ReactNode;
  icon?: IconName;
  disabled?: boolean;
}

export interface ChipGroupProps {
  options: readonly ChipGroupOption[];
  /** Currently selected option id, or null for none. */
  value: string | null;
  onChange: (id: string) => void;
  /** Visible micro prefix AND the group's accessible name — pass it always. */
  label: string;
  /** Chip variant/size passthrough — quiet rows like the tag filter use these. */
  variant?: "default" | "quiet" | "accent";
  size?: "md" | "sm";
  /** Hide the visible prefix while keeping the accessible name. */
  hideLabel?: boolean;
  className?: string;
}

export function ChipGroup({
  options,
  value,
  onChange,
  label,
  variant,
  size,
  hideLabel,
  className = ""
}: ChipGroupProps) {
  const chipClass = [
    "x-chip",
    variant && variant !== "default" ? `x-chip--${variant}` : "",
    size === "sm" ? "x-chip--sm" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`x-chipgroup ${className}`} role="group" aria-label={label}>
      {hideLabel ? null : (
        <span className="x-chipgroup__label" aria-hidden="true">
          {label}:
        </span>
      )}
      {options.map((option) => {
        const on = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className={chipClass}
            data-on={on || undefined}
            data-disabled={option.disabled || undefined}
            aria-pressed={on}
            disabled={option.disabled}
            onClick={() => onChange(option.id)}
          >
            {option.icon ? (
              <Icon name={option.icon} size={size === "sm" ? 12 : 14} />
            ) : null}
            <span className="x-chip__text">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

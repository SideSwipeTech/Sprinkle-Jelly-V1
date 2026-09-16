/**
 * SegmentedControl — the inset pill group from `.segmented-control` (app.css:220-222),
 * used for the companion presentation/volume choices in Settings.
 *
 * `role="group"` + `aria-label` (required — the demo labelled it correctly), options
 * as `aria-pressed` buttons with `data-on`. Inset track, accent-solid selected cell.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./SegmentedControl.css";

export interface SegmentedOption {
  id: string;
  label: ReactNode;
  icon?: IconName;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: readonly SegmentedOption[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible group name — required (the demo set it correctly). */
  label: string;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  label,
  className = ""
}: SegmentedControlProps) {
  return (
    <div className={`x-segmented ${className}`} role="group" aria-label={label}>
      {options.map((option) => {
        const on = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className="x-segmented__option"
            data-on={on || undefined}
            data-disabled={option.disabled || undefined}
            aria-pressed={on}
            disabled={option.disabled}
            onClick={() => onChange(option.id)}
          >
            {option.icon ? <Icon name={option.icon} size={14} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

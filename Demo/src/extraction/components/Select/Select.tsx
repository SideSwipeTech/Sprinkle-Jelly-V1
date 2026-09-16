/**
 * Select — the one styled select. Three existed: the canonical workbench select
 * (lab.css `.workbench__select`), a divergent inline one painted on a dark stage
 * (Learn.tsx:658-676), and an unstyled native one (Practice.tsx:472-491). All three
 * collapse to this.
 *
 * It stays a real `<select>` — native popup, native keyboard, `color-scheme`-aware —
 * with the chevron drawn by the kit Icon, never a background-image data URI. `sm` is
 * the compact toolbar/mono register; `md` is field height and drops cleanly into
 * `Field`, which injects `id`/`aria-*`/`required`/`disabled` onto the inner `<select>`
 * through the forwarded props.
 */

import type { ChangeEvent, ReactNode, SelectHTMLAttributes } from "react";
import { Icon } from "@icons/Icon";
import "./Select.css";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "size"> {
  /** Called with the new value (and the event), not just the event. */
  onChange?: (value: string, event: ChangeEvent<HTMLSelectElement>) => void;
  /** Option list — or pass <option> children instead. */
  options?: readonly SelectOption[];
  /** sm = compact toolbar (workbench canonical, mono). md = field height. */
  size?: "sm" | "md";
  /** Accessible name — required when no visible Field label wraps it. */
  "aria-label"?: string;
}

export function Select({
  onChange,
  options,
  size = "md",
  className = "",
  children,
  disabled,
  ...rest
}: SelectProps) {
  return (
    <span
      className={`x-select x-select--${size} ${className}`}
      data-disabled={disabled || undefined}
    >
      <select
        className="x-select__input"
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value, event)}
        {...rest}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      <Icon name="chevron-down" size={size === "sm" ? 12 : 14} />
    </span>
  );
}

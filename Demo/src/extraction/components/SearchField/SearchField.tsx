/**
 * SearchField — the icon-and-input search control from `.filters__search`
 * (courses.css:96-116), used identically on Learn, Practice and Assess browses.
 *
 * A labelled `type="search"` input inside a bordered shell; the icon sits inside the
 * `<label>` so clicking it still focuses the field. When no visible label is given,
 * `aria-label` falls back to the placeholder — the demo's placeholders were already
 * doing that job implicitly.
 */

import type { InputHTMLAttributes } from "react";
import { Icon } from "@icons/Icon";
import "./SearchField.css";

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "size"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Visible or announced name. Falls back to placeholder, then "Search". */
  label?: string;
  /** Take the available row space (the legacy flex: 1 1 260px) or hug content. */
  grow?: boolean;
}

export function SearchField({
  value,
  defaultValue,
  onChange,
  label,
  placeholder = "Search…",
  grow = true,
  disabled,
  className = "",
  ...rest
}: SearchFieldProps) {
  return (
    <label
      className={`x-searchfield ${grow ? "x-searchfield--grow" : ""} ${className}`}
      data-disabled={disabled || undefined}
    >
      <Icon name="search" size={16} />
      <input
        className="x-searchfield__input"
        type="search"
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        disabled={disabled}
        autoComplete="off"
        {...rest}
      />
    </label>
  );
}

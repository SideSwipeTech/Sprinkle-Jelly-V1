/**
 * LanguageSelect — the language/runtime picker: the controls family's Select
 * anatomy (`x-select`/`x-select__input`/`x-select--sm` hooks — sibling class
 * reference, contract §6) plus the canonical language option set.
 *
 * The shared Select canonicalises `.workbench__select` (lab.css:259-292); this
 * component supplies what the workbench pickers actually want — the supported-
 * language list — and an optional visible micro label. Native <select>
 * semantics all the way down.
 */

import { useId } from "react";
import { Icon } from "@icons/Icon";
import "./LanguageSelect.css";

export interface LanguageOption {
  value: string;
  label: string;
}

/** The canonical runtime set (CodeLab starter picker, Practice challenge select). */
export const LANGUAGES: readonly LanguageOption[] = [
  { value: "python", label: "Python 3" },
  { value: "javascript", label: "JavaScript (ES6)" },
  { value: "typescript", label: "TypeScript 5.5" },
  { value: "java", label: "Java 21" },
  { value: "cpp", label: "C++ 20" },
  { value: "go", label: "Go 1.22" }
];

export interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Defaults to `LANGUAGES`; strings self-label. */
  options?: readonly (string | LanguageOption)[];
  /** Accessible name. Rendered visually when `showLabel` is set. */
  label: string;
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LanguageSelect({
  value,
  onChange,
  options = LANGUAGES,
  label,
  showLabel = false,
  disabled = false,
  className = ""
}: LanguageSelectProps) {
  const id = useId();
  return (
    <span className={`x-lang-select x-select x-select--sm${className ? ` ${className}` : ""}`}>
      {showLabel ? (
        <label className="x-lang-select__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className="x-select__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={showLabel ? undefined : label}
        disabled={disabled}
        aria-disabled={disabled || undefined}
      >
        {options.map((opt) => {
          const { value: v, label: l } = typeof opt === "string" ? { value: opt, label: opt } : opt;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
      {/* the x-select stylesheet positions the direct .icon child */}
      <Icon name="chevron-down" size={12} />
    </span>
  );
}

/**
 * Slider — a styled `input[type=range]`. The demo's only ranges (Weekly Goals,
 * Learn.tsx:1384-1406) were unstyled natives with a width:100% inline style.
 *
 * The fill is a `--x-slider-pct` custom property set from the value — the same
 * data-driven-var technique Charge uses for its fill width, so the track's filled
 * portion follows the thumb without a pixel of JavaScript geometry.
 *
 * Label row: name on the left, current value on the right (the demo's pattern:
 * "Target Problems: 5 per week" + a quiet chip of context, here an `aside` slot).
 */

import { useId, type ReactNode } from "react";
import "./Slider.css";

export interface SliderProps {
  /** The control's visible + accessible name. */
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Format the value readout — default: the number itself. */
  formatValue?: (value: number) => ReactNode;
  /** Context on the right of the head row (the demo's "3 completed this week" chip). */
  aside?: ReactNode;
  /** Supporting line under the track. */
  hint?: ReactNode;
  disabled?: boolean;
  /** Spoken value when the formatted number alone would mislead. */
  valueText?: string;
  id?: string;
  name?: string;
  className?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  aside,
  hint,
  disabled,
  valueText,
  id,
  name,
  className = ""
}: SliderProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const inputId = id ?? `x-slider-${uid}`;
  const hintId = `x-slider-hint-${uid}`;

  const pct = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;

  return (
    <div className={`x-slider ${className}`} data-disabled={disabled || undefined}>
      <div className="x-slider__head">
        <label className="x-slider__label" htmlFor={inputId}>
          {label}
        </label>
        <span className="x-slider__value">
          {formatValue ? formatValue(value) : value}
        </span>
        {aside ? <span className="x-slider__aside">{aside}</span> : null}
      </div>
      <input
        className="x-slider__input"
        type="range"
        id={inputId}
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={valueText}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ ["--x-slider-pct" as string]: `${pct}%` }}
      />
      {hint ? (
        <p className="x-slider__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

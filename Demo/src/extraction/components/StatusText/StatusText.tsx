/**
 * StatusText — the tonal status label. Kills the ~20 hand-coloured status
 * chips and texts scattered across the demo:
 *
 *   `.status-good`                  (app.css:218 — plain success text)
 *   diagnostics "✓ Available"       (Assess.tsx:403-414 — literal teal strongs)
 *   "Active" exam-flag chips        (Assess.tsx:420-427)
 *   verdict chips                   (KitchenSink.tsx:289-292 — ACCEPTED/TLE/
 *                                    RUNTIME/BENCHMARK, rgba literals)
 *   "NEW" notification chip         (Account.tsx:79 — solid accent)
 *   "DEGRADED"/"SEALED" chips       (KitchenSink.tsx:650/658 — solid literals)
 *   "Enrolled"/"Completed"/"Accepted"/"100% Score" chips
 *                                   (Learn.tsx:113/248, More.tsx:55-71)
 *   "+50 XP On-Time Bonus"          (Practice.tsx:766)
 *
 * Six tones, each with a default glyph so the state never rides colour alone
 * (SHR-R38); neutral uses a square dot — the shape of "no signal":
 *
 *   neutral  · dot     info     i-circle    success  check
 *   warning  △ alert   error    x-circle    accent   ✦ sparkles
 *
 * Three cuts:
 *   inline   bare text + icon (`.status-good`, diagnostic values)
 *   chip     tinted pill (the literal chip sites)
 *   solid    filled pill, on-tone ink (DEGRADED / SEALED / NEW / Score)
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./StatusText.css";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "error" | "accent";
export type StatusVariant = "inline" | "chip" | "solid";

const TONE_ICON: Record<Exclude<StatusTone, "neutral">, IconName> = {
  info: "info",
  success: "check",
  warning: "alert",
  error: "error",
  accent: "sparkles"
};

export interface StatusTextProps {
  tone?: StatusTone;
  variant?: StatusVariant;
  /** Icon override; `null` suppresses the mark entirely (neutral shows its dot). */
  icon?: IconName | null;
  children: ReactNode;
  className?: string;
}

export function StatusText({ tone = "neutral", variant = "chip", icon, children, className = "" }: StatusTextProps) {
  const resolved: IconName | null = icon === null ? null : icon ?? (tone === "neutral" ? null : TONE_ICON[tone]);

  return (
    <span
      className={`x-status-text ${variant !== "chip" ? `x-status-text--${variant}` : ""} ${className}`.trim()}
      data-tone={tone}
    >
      {resolved ? (
        <Icon name={resolved} size={12} />
      ) : tone === "neutral" && icon !== null ? (
        <span className="x-status-text__dot" aria-hidden="true" />
      ) : null}
      <span className="x-status-text__label">{children}</span>
    </span>
  );
}

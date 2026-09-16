/**
 * Notice — the tonal callout. One component consolidating six hand-rolled
 * variants that all said "a box with a sentence and a colour":
 *
 *   - the KEY TAKEAWAY callout        (Learn.tsx:332-336 — accent tint + border)
 *   - the [NOTE] callout              (Learn.tsx:339-342 — teal left bar)
 *   - quiz feedback                   (Learn.tsx:521-528 — teal/rose by verdict)
 *   - `.settings-note`                (app.css:207 — plain inset panel)
 *   - `.form-message`                 (app.css:231 — success tint, role=status)
 *   - interceptor banners             (KitchenSink.tsx:645-659 — DEGRADED/SEALED)
 *
 * Five tones, each with a non-colour tell (SHR-R38 — tone never rides colour
 * alone):
 *
 *   neutral  quiet inset panel, no border          — sticky-note icon
 *   info     inline-start accent bar               — info icon
 *   success  solid tinted frame                    — check icon
 *   warning  DASHED tinted frame (deferred care)   — alert icon
 *   error    solid frame + -45deg barrier hatch     — error icon
 *            (the same barrier language as StateBlock[refused])
 *
 * `title` renders the micro label the callouts hand-wrote ("KEY TAKEAWAY",
 * "NOTE"). `action` is the trailing slot the interceptor banners used for
 * their status chips (e.g. a solid `x-status-text`).
 *
 * Live regions: `live="polite"` → role=status (form confirmations, quiz
 * feedback), `live="assertive"` → role=alert (interceptors). Default off —
 * static notices on first paint are content, not announcements.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./Notice.css";

export type NoticeTone = "neutral" | "info" | "success" | "warning" | "error";

const TONE_ICON: Record<NoticeTone, IconName> = {
  neutral: "sticky-note",
  info: "info",
  success: "check",
  warning: "alert",
  error: "error"
};

export interface NoticeProps {
  tone?: NoticeTone;
  /** The micro label above the body — "KEY TAKEAWAY", "NOTE", "MAINTENANCE". */
  title?: string;
  /** Icon override; `null` hides the mark (the border treatment still tells). */
  icon?: IconName | null;
  /** Trailing slot — status chips, dismiss controls, links. */
  action?: ReactNode;
  /**
   * Live-region behaviour. `off` (default) for static content; `polite`
   * → role=status (form confirmations, quiz feedback); `assertive`
   * → role=alert (maintenance interceptors, sealed-sitting constraints).
   */
  live?: "off" | "polite" | "assertive";
  /** Tighter padding for dense surfaces (the [NOTE] callout's cut). */
  compact?: boolean;
  children: ReactNode;
  className?: string;
}

export function Notice({
  tone = "neutral",
  title,
  icon,
  action,
  live = "off",
  compact,
  children,
  className = ""
}: NoticeProps) {
  const mark = icon === null ? null : icon ?? TONE_ICON[tone];
  const role = live === "polite" ? "status" : live === "assertive" ? "alert" : undefined;

  return (
    <div
      className={`x-notice ${compact ? "x-notice--compact" : ""} ${className}`.trim()}
      data-tone={tone}
      role={role}
    >
      {mark ? (
        <span className="x-notice__mark" aria-hidden="true">
          <Icon name={mark} size={compact ? 14 : 16} />
        </span>
      ) : null}
      <div className="x-notice__body">
        {title ? <p className="x-notice__title">{title}</p> : null}
        <div className="x-notice__content">{children}</div>
      </div>
      {action ? <div className="x-notice__action">{action}</div> : null}
    </div>
  );
}

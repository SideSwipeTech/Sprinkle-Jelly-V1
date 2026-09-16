/**
 * LoadingState — the announced "working" indicator. NEW: the demo's only
 * loading UI was the bare `.spinner` (code-editor.css:691, used by the Monaco
 * mount and the Terminal), which said nothing and announced nothing.
 *
 * Here the loader is the Keyline `loader` glyph in `orbit` motion plus a
 * visible label — "working" is always a sentence, never a silent spin.
 * `role="status"` announces it politely; `pending` StateBlocks stay the
 * choice for whole-region placeholders (this is the in-flow indicator).
 *
 * Reduced motion: `orbit` is already suppressed by icon.css under both the OS
 * signal and `data-reduced-motion`, leaving a fully drawn circle — the words
 * carry the meaning, so nothing else is needed.
 */

import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./LoadingState.css";

export interface LoadingStateProps {
  /** The visible + announced sentence. Required — a bare spinner is a lie of silence. */
  label: string;
  /** Override glyph; default `loader`. */
  icon?: IconName;
  /** compact = inline density for toolbars/status bars. */
  compact?: boolean;
  className?: string;
}

export function LoadingState({ label, icon = "loader", compact, className = "" }: LoadingStateProps) {
  return (
    <div
      className={`x-loading-state ${compact ? "x-loading-state--compact" : ""} ${className}`.trim()}
      role="status"
    >
      <span className="x-loading-state__mark" aria-hidden="true">
        <Icon name={icon} size={compact ? 14 : 18} motion="orbit" />
      </span>
      <span className="x-loading-state__label">{label}</span>
    </div>
  );
}

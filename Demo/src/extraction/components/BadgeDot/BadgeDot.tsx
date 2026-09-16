/**
 * BadgeDot — the unread/count pip, extracted from `.badge-dot`
 * (shell.css:614-627; live site Shell.tsx:144 on the notifications button).
 *
 * It is an ABSOLUTE-positioned marker: it only exists pinned to the corner of
 * a positioned host (`x-icon-btn` is already `position: relative`). Content
 * is a count, or bare when a presence dot is enough.
 *
 * The visual is `aria-hidden` — a count read out of context ("3" floating on
 * a bell) is noise. The host control folds the count into its own accessible
 * name: `IconButton`'s `badge`/`badgeLabel` props do exactly that.
 *
 * Honest-absence rule: `count` of 0 or null renders nothing — an absent badge
 * IS the "nothing unread" state, never a greyed-out zero.
 */

import "./BadgeDot.css";

export interface BadgeDotProps {
  /** Unread count. `null`/`0` renders nothing — absence is the empty state. */
  count?: number | null;
  /** Cap for display; overflow renders "{max}+". */
  max?: number;
  /** Presence-only dot — no numeral. */
  dot?: boolean;
  className?: string;
}

export function BadgeDot({ count, max = 99, dot, className = "" }: BadgeDotProps) {
  if (count === null || count === undefined || count === 0) {
    if (!dot) return null;
  }
  const text = dot ? null : count !== null && count !== undefined && count > max ? `${max}+` : count;

  return (
    <span className={`x-badge-dot ${dot ? "x-badge-dot--dot" : ""} ${className}`.trim()} aria-hidden="true">
      {text}
    </span>
  );
}

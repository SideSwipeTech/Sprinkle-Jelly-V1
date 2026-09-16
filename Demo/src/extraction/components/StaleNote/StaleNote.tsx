/**
 * StaleNote — the freshness banner, extracted from `.stale`
 * (src/pages/surfaces.css:113-119; only live site Learn.tsx:1356, the device
 * measurement ledger on /skills).
 *
 * It is the inline cousin of `StateBlock state="stale"`: where that is a whole
 * region, this is a one-line provenance strip — "these figures have an age,
 * and the age is stated". The DASHED border is the same freshness tell the
 * state-block uses, and the clock mark is the tokenised `--state-stale-tell`
 * (tokens.css:151).
 *
 * Not a live region: freshness is declared at render, not announced. When the
 * age changes asynchronously the caller re-renders the prop.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./StaleNote.css";

export interface StaleNoteProps {
  /** The freshness statement — e.g. "derived from completed lessons and local terminal runs". */
  children: ReactNode;
  /** The age of the figures — renders as "as of …". A stale claim with no age is noise. */
  asOf?: string;
  className?: string;
}

export function StaleNote({ children, asOf, className = "" }: StaleNoteProps) {
  return (
    <p className={`x-stale-note ${className}`.trim()} data-state="stale">
      <span className="x-stale-note__mark" aria-hidden="true">
        <Icon name="clock" size={14} />
      </span>
      <span className="x-stale-note__text">
        {children}
        {asOf ? <span className="x-stale-note__asof"> · as of {asOf}</span> : null}
      </span>
    </p>
  );
}

/**
 * StateBlock — the honest not-data state, adopted from the kit
 * (src/components/Card.tsx:128-141, styles card.css:53-146).
 *
 * There are seven states because PRODUCT.md §10 forbids collapsing them:
 * unavailable is not empty, pending is not failed, and missing is never zero.
 * The set is CLOSED — `StateKey` comes from tokens/values.ts, and each key
 * carries a distinct icon AND a distinct border/fill pattern, so the
 * difference survives greyscale and colour-blindness (SHR-R38):
 *
 *   key          tone     tell (non-colour carrier)
 *   data         neutral  solid neutral frame + check icon
 *   stale        warning  dashed border + clock icon + `asOf` age text
 *   pending      info     solid border + loader icon in `flow` motion
 *   unavailable  muted    45deg hatch background + alert icon
 *   empty        muted    dashed border (open field) + inbox icon, `trace` motion
 *   refused      error    solid border + -45deg barrier hatch + lock icon
 *   pruned       muted    dotted border + history icon
 *
 * Honest-absence rule (contract §3): never render an empty container — a
 * missing thing gets a StateBlock or nothing; an unreadable figure renders
 * an em dash, never zero.
 *
 * The canonical gallery is the `ErrorStates` page (src/pages/More.tsx:300,
 * route /error-states) and KitchenSink's "7 Canonical Honesty States" card.
 */

import type React from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import type { StateKey } from "@tokens/values";
import "./StateBlock.css";

const STATE_ICON: Record<StateKey, IconName> = {
  data: "check",
  stale: "clock",
  pending: "loader",
  unavailable: "alert",
  empty: "inbox",
  refused: "lock",
  pruned: "history"
};

/** Icon motion per state — pending loops (work in progress), empty traces in. */
const STATE_MOTION: Record<StateKey, "flow" | "trace" | "none"> = {
  pending: "flow",
  empty: "trace",
  data: "none",
  stale: "none",
  unavailable: "none",
  refused: "none",
  pruned: "none"
};

export interface StateBlockProps {
  state: StateKey;
  /** The plain sentence — every one of these has to say something true. */
  message: string;
  /** Where a learner is stopped and cannot resolve it themselves, a way onward. */
  action?: React.ReactNode;
  /** For `stale`: how old the figure is. A number with no age invites a decision it cannot support. */
  asOf?: string;
  compact?: boolean;
  className?: string;
}

export function StateBlock({ state, message, action, asOf, compact, className = "" }: StateBlockProps) {
  return (
    <div
      className={`x-state-block ${compact ? "x-state-block--compact" : ""} ${className}`.trim()}
      data-state={state}
    >
      <span className="x-state-block__mark" aria-hidden="true">
        <Icon name={STATE_ICON[state]} size={compact ? 16 : 20} motion={STATE_MOTION[state]} />
      </span>
      <div className="x-state-block__text">
        <p className="x-state-block__message">{message}</p>
        {asOf ? <p className="x-state-block__meta">as of {asOf}</p> : null}
      </div>
      {action ? <div className="x-state-block__action">{action}</div> : null}
    </div>
  );
}

/**
 * Card — the anatomy every identity dresses differently.
 *
 * The shape is constant: eyebrow, title, optional action, body, optional footer. What
 * changes per identity is construction (plane / layered / chamfered plate / ruled),
 * elevation, radius, density and entrance — all of which live in CSS, not here.
 *
 * The reason this is one component and not four is the point of the whole exercise: the
 * anatomy is the hybrid, the expression is the identity.
 */

import type React from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import type { StateKey } from "@tokens/values";
import "./card.css";

export interface CardProps {
  children: React.ReactNode;
  /** Marks the card as carrying live state — Forge draws its charge seam only on these. */
  live?: boolean;
  /** Interactive cards get hover/press affordances and a pointer. */
  as?: "div" | "article" | "section";
  /**
   * The bay address. Only Forge renders it — the "everything is addressable" idea from the
   * instrument reading. Every other identity ignores the attribute entirely, which is the
   * cheapest possible way to give one identity a signature the others do not have.
   */
  addr?: string;
  className?: string;
  index?: number;
}

export function Card({
  children,
  live,
  as: Tag = "article",
  addr,
  className = "",
  index = 0
}: CardProps) {
  return (
    <Tag
      className={`surface card ${live ? "surface--live" : ""} enter ${className}`}
      style={{ ["--enter-index" as string]: index }}
      data-reveal=""
      {...(addr ? { "data-addr": addr } : {})}
    >
      {children}
      {/* The bay address is a real element, not a pseudo. Two attempts at doing it in CSS
          failed for instructive reasons: ::before collided with Forge's charge seam (one
          pseudo, two contents — the address silently won and the seam vanished), and
          attr() only reads the attribute off the element the pseudo belongs to, so moving
          it to the eyebrow rendered a separator with nothing after it. */}
      {addr ? <span className="card__addr" aria-hidden="true">{addr}</span> : null}
    </Tag>
  );
}

export interface CardHeaderProps {
  eyebrow?: string;
  title: string;
  icon?: IconName;
  action?: React.ReactNode;
  /** Size of the title. `hero` is for the one card that owns a screen. */
  scale?: "default" | "hero";
}

export function CardHeader({ eyebrow, title, icon, action, scale = "default" }: CardHeaderProps) {
  return (
    <header className="card__header">
      {icon ? (
        <span className="card__icon">
          <Icon name={icon} size={20} treatment="plate" />
        </span>
      ) : null}
      <div className="card__heading">
        {eyebrow ? <p className="micro card__eyebrow">{eyebrow}</p> : null}
        <h3 className={`display card__title ${scale === "hero" ? "card__title--hero" : ""}`}>
          {title}
        </h3>
      </div>
      {action ? <div className="card__action">{action}</div> : null}
    </header>
  );
}

// ── The honesty states ───────────────────────────────────────────────────────

const STATE_ICON: Record<StateKey, IconName> = {
  data: "check",
  stale: "clock",
  pending: "loader",
  unavailable: "alert",
  empty: "inbox",
  refused: "lock",
  pruned: "history"
};

const STATE_MOTION = {
  pending: "flow",
  data: "none",
  stale: "none",
  unavailable: "none",
  empty: "trace",
  refused: "none",
  pruned: "none"
} as const;

export interface StateBlockProps {
  state: StateKey;
  /** The plain sentence. PRODUCT.md §10 — every one of these has to say something true. */
  message: string;
  /** Where a learner is stopped and cannot resolve it themselves, SHR-R23 requires a way onward. */
  action?: React.ReactNode;
  /** For `stale`: how old the figure is. A number with no age invites a decision it cannot support. */
  asOf?: string;
  compact?: boolean;
}

/**
 * StateBlock — the honest not-data state.
 *
 * There are seven because PRODUCT.md §10 forbids collapsing them: unavailable is not
 * empty, pending is not failed, and missing is never zero. Each carries a distinct icon
 * AND a distinct pattern, so the difference survives greyscale and colour-blindness.
 */
export function StateBlock({ state, message, action, asOf, compact }: StateBlockProps) {
  return (
    <div className={`state-block ${compact ? "state-block--compact" : ""}`} data-state={state}>
      <span className="state-block__mark" aria-hidden="true">
        <Icon name={STATE_ICON[state]} size={compact ? 16 : 20} motion={STATE_MOTION[state]} />
      </span>
      <div className="state-block__text">
        <p className="state-block__message">{message}</p>
        {asOf ? <p className="state-block__meta">as of {asOf}</p> : null}
      </div>
      {action ? <div className="state-block__action">{action}</div> : null}
    </div>
  );
}

// ── Stat ─────────────────────────────────────────────────────────────────────

export interface StatProps {
  label: string;
  /** null renders an honest dash, never a fabricated zero. */
  value: number | string | null;
  unit?: string;
  icon?: IconName;
  /** Freshness, where the figure is derived. */
  asOf?: string;
  hero?: boolean;
}

export function Stat({ label, value, unit, icon, asOf, hero }: StatProps) {
  const unavailable = value === null;
  return (
    <div className="stat" data-unavailable={unavailable || undefined}>
      {icon ? (
        <span className="stat__icon">
          <Icon name={icon} size={16} />
        </span>
      ) : null}
      <span className={`numeral stat__value ${hero ? "numeral--hero" : ""}`}>
        {unavailable ? "—" : value}
        {unit && !unavailable ? <span className="stat__unit">{unit}</span> : null}
      </span>
      <span className="micro stat__label">{label}</span>
      {unavailable ? (
        <span className="stat__note">Unavailable</span>
      ) : asOf ? (
        <span className="stat__note">as of {asOf}</span>
      ) : null}
    </div>
  );
}

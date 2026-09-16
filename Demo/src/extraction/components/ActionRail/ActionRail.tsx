/**
 * ActionRail — the action rail a person's admin detail carries: every
 * administrative action grouped by stakes (admin/01-pages "A person's detail";
 * admin.F11 "Stakes-tiered confirmation").
 *
 * The groups are the stakes themselves — ordinary, elevated, destructive and
 * restorative — and restorative carries the opposite tone from destructive,
 * per the confirmation-friction table: "Three visually distinct levels,
 * matched to stakes, and restorative actions carry the opposite tone from
 * destructive ones." Tone rides `data-stakes` on the group and is reinforced
 * by the group's marker icon — never colour alone, and never an edge stripe.
 *
 * Each item states the confirmation tier it demands (`friction`) so the click
 * never surprises: "confirm" (an ordinary confirm), "typed" (a typed
 * confirmation), "typed-reason" (a typed confirmation plus a reason —
 * anything that writes to a person).
 *
 * An inert item is `disabled` with `disabledReason` rendered in place — "the
 * control explaining why rather than failing silently" (admin/05 §Moderation).
 * An action nobody may take is simply absent (honest-absence rule), and an
 * empty group renders nothing at all.
 */

import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./ActionRail.css";

export type ActionStakes = "ordinary" | "elevated" | "destructive" | "restorative";

/** The console's three confirmation tiers, named as the spec names them. */
export type ActionFriction = "confirm" | "typed" | "typed-reason";

export const FRICTION_LABEL: Record<ActionFriction, string> = {
  confirm: "an ordinary confirm",
  typed: "a typed confirmation",
  "typed-reason": "a typed confirmation + reason"
};

const STAKES_ICON: Record<ActionStakes, IconName> = {
  ordinary: "arrow-right",
  elevated: "alert",
  destructive: "trash",
  restorative: "reset"
};

export interface ActionRailItem {
  id: string;
  /** The action's name. */
  label: ReactNode;
  /** What the action does, or its exact consequence. */
  hint?: ReactNode;
  icon?: IconName;
  /** Route target — renders a router link row. */
  to?: string;
  onClick?: () => void;
  /** The confirmation tier the action demands — stated on the row. */
  friction?: ActionFriction;
  disabled?: boolean;
  /** Why the control is inert — rendered in place, never silent. */
  disabledReason?: ReactNode;
}

export interface ActionRailGroup {
  stakes: ActionStakes;
  /** The group's own heading, e.g. "Ordinary", "Destructive". */
  label: string;
  /** A line under the heading — what the tier means here. */
  note?: ReactNode;
  actions: ActionRailItem[];
}

export interface ActionRailProps {
  groups: ActionRailGroup[];
  /** Accessible name — default "Actions". */
  label?: string;
  className?: string;
}

function RailItem({ item }: { item: ActionRailItem }) {
  const body = (
    <>
      <span className="x-action-rail__lead">
        {item.icon ? <Icon name={item.icon} size={15} /> : null}
        <span className="x-action-rail__name">{item.label}</span>
        {item.friction ? (
          <span className="x-action-rail__friction">{FRICTION_LABEL[item.friction]}</span>
        ) : null}
      </span>
      {item.disabled && item.disabledReason ? (
        <span className="x-action-rail__hint x-action-rail__hint--disabled">{item.disabledReason}</span>
      ) : item.hint ? (
        <span className="x-action-rail__hint">{item.hint}</span>
      ) : null}
    </>
  );

  const shared = {
    className: "x-action-rail__item",
    "data-disabled": item.disabled || undefined
  };

  const guard = (event: MouseEvent<HTMLElement>) => {
    // An inert action does not navigate or fire — pointer, keyboard, AT alike.
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.onClick?.();
  };

  if (item.to) {
    return (
      <Link
        {...shared}
        to={item.to}
        aria-disabled={item.disabled || undefined}
        tabIndex={item.disabled ? -1 : undefined}
        onClick={guard}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      {...shared}
      type="button"
      disabled={item.disabled}
      aria-disabled={item.disabled || undefined}
      onClick={guard}
    >
      {body}
    </button>
  );
}

export function ActionRail({ groups, label = "Actions", className = "" }: ActionRailProps) {
  const present = groups.filter((group) => group.actions.length > 0);
  // Honest absence: no actions at all renders nothing rather than an empty frame.
  if (present.length === 0) return null;
  return (
    <nav className={`x-action-rail ${className}`} aria-label={label}>
      {present.map((group) => (
        <section key={group.stakes} className="x-action-rail__group" data-stakes={group.stakes}>
          <p className="x-action-rail__heading">
            <Icon name={STAKES_ICON[group.stakes]} size={13} />
            {group.label}
          </p>
          {group.note ? <p className="x-action-rail__note">{group.note}</p> : null}
          <div className="x-action-rail__items">
            {group.actions.map((item) => (
              <RailItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </nav>
  );
}

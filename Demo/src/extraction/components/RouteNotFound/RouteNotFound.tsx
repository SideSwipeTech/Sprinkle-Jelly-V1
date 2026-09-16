/**
 * RouteNotFound — the 404 row: search plate, "we could not find that page",
 * the no-disclosure line, a way back.
 *
 * Adopted from Account.tsx:731-743 (`.route-not-found`, already token-clean).
 * The copy is honest-absence by design: "No information about another record or
 * account is revealed."
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./RouteNotFound.css";

export interface RouteNotFoundProps {
  icon?: IconName;
  title?: string;
  /** The no-disclosure line. */
  detail?: string;
  /** The way back — a `x-btn` link. */
  action: ReactNode;
}

export function RouteNotFound({
  icon = "search",
  title = "We could not find that page",
  detail = "No information about another record or account is revealed.",
  action
}: RouteNotFoundProps) {
  return (
    <div className="x-route-not-found">
      <span className="x-route-not-found__icon" aria-hidden="true">
        <Icon name={icon} size={24} />
      </span>
      <div className="x-route-not-found__text">
        <h2 className="x-route-not-found__title">{title}</h2>
        <p className="x-route-not-found__detail">{detail}</p>
      </div>
      <div className="x-route-not-found__action">{action}</div>
    </div>
  );
}

/**
 * HomeRow — the compact card row: icon · title · trailing chips · when.
 *
 * Rehomed from Dashboard's private stylesheet (home.css:109-135, `home__list`
 * / `home__row`) — the classes were borrowed by Learn, Practice, Assess,
 * Account, More and Admin while living in a page's own sheet. This is the
 * shared version.
 *
 * Two exports:
 *   HomeList  the `<ul>` stack — real list semantics, no boxes, hairline rules
 *   HomeRow   one `<li>` — icon marker, truncated title (span or Link), free
 *             trailing slot (chips, badges), fixed `when` stamp
 *
 * The demo coloured every icon success-teal regardless of meaning; here the
 * icon carries `data-tone` (success | accent | info | warning | muted), default
 * `success` to match the dominant "done / confirmed" usage. Icons are
 * decorative — the row's text carries the fact.
 *
 * For the boxed, interactive row see containers/ListRow; this is the quiet
 * in-card form.
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./HomeRow.css";

export type HomeRowIconTone = "success" | "accent" | "info" | "warning" | "muted";

export interface HomeListProps {
  children: ReactNode;
  /** Accessible name for the list — rendered as aria-label. */
  label?: string;
  className?: string;
}

export function HomeList({ children, label, className = "" }: HomeListProps) {
  return (
    <ul className={`x-home-list${className ? ` ${className}` : ""}`} aria-label={label}>
      {children}
    </ul>
  );
}

export interface HomeRowProps {
  /** Keyline marker — decorative by default. */
  icon?: IconName;
  /** Marker tone — `success` matches the demo's blanket rule; pick by meaning. */
  iconTone?: HomeRowIconTone;
  /** Row title — truncates; wrapped in a Link when `to` is set. */
  title?: ReactNode;
  /** Route target for the title. */
  to?: string;
  /** Trailing stamp — time, day, count. Fixed at the row's end. */
  when?: ReactNode;
  /** Free slot between title and `when` — chips, counts, badges. */
  children?: ReactNode;
  className?: string;
  [key: `data-${string}`]: unknown;
}

export function HomeRow({
  icon,
  iconTone = "success",
  title,
  to,
  when,
  children,
  className = "",
  ...rest
}: HomeRowProps) {
  return (
    <li className={`x-home-row${className ? ` ${className}` : ""}`} {...rest}>
      {icon ? (
        <span className="x-home-row__icon" data-tone={iconTone} aria-hidden="true">
          <Icon name={icon} size={16} />
        </span>
      ) : null}
      {title !== undefined ? (
        to ? (
          <Link className="x-home-row__title" to={to}>
            {title}
          </Link>
        ) : (
          <span className="x-home-row__title">{title}</span>
        )
      ) : null}
      {children}
      {when !== undefined ? <span className="x-home-row__when">{when}</span> : null}
    </li>
  );
}

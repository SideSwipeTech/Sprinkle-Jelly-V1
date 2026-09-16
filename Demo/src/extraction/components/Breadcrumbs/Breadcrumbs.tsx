/**
 * Breadcrumbs — one component, two consumers.
 *
 * Tokenizes src/components/Breadcrumbs.tsx (all-inline-styles) and absorbs the admin
 * topbar's hand-rolled crumb (admin-shell.css:81-83 + admin-nav.ts:92-100). Same data
 * in, two presentations:
 *
 *   "trail"   — the full path: linked ancestors, chevron separators, aria-current="page"
 *               on the last crumb. The learner-shell pattern.
 *   "current" — the admin pattern: ancestors collapsed to a small "A / B" context line,
 *               the current page as the strong title.
 *
 * Crumb resolution (path → labels) stays with the consumer — the extracted component is
 * presentation-only and never imports data/.
 */

import { Link } from "react-router-dom";
import { Icon } from "@icons/Icon";
import "./Breadcrumbs.css";

export interface Crumb {
  label: string;
  /** Route target. Absent on the current page (and anywhere not navigable). */
  to?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  /** `trail` = full path (learner). `current` = context line + title (admin topbar). */
  variant?: "trail" | "current";
  /** aria-label for the nav landmark. */
  label?: string;
}

export function Breadcrumbs({ items, variant = "trail", label = "Breadcrumb" }: BreadcrumbsProps) {
  // Honest absence: no crumbs → nothing rendered, never an empty nav landmark.
  if (items.length === 0) return null;

  const last = items[items.length - 1]!;
  const ancestors = items.slice(0, -1);

  if (variant === "current") {
    return (
      <nav className="x-crumbs x-crumbs--current" aria-label={label}>
        {ancestors.length > 0 ? (
          <small className="x-crumbs__context">
            {ancestors.map((c) => c.label).join(" / ")}
          </small>
        ) : null}
        <strong className="x-crumbs__here" aria-current="page">
          {last.label}
        </strong>
      </nav>
    );
  }

  return (
    <nav className="x-crumbs" aria-label={label}>
      <ol className="x-crumbs__list">
        {items.map((crumb, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li className="x-crumbs__item" key={`${crumb.label}-${idx}`}>
              {idx > 0 ? (
                <span className="x-crumbs__sep" aria-hidden="true">
                  <Icon name="chevron-right" size={10} />
                </span>
              ) : null}
              {isLast || !crumb.to ? (
                <span className="x-crumbs__label" aria-current={isLast ? "page" : undefined}>
                  {crumb.label}
                </span>
              ) : (
                <Link className="x-crumbs__link" to={crumb.to}>
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

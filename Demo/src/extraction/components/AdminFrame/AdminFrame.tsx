/**
 * AdminFrame — the staff console's own shell, outside the learner AppFrame.
 *
 * Extracted from src/admin/AdminShell.tsx + admin-shell.css. A 236px nav column by a
 * 64px top bar (component tokens, proposed as the --admin-* family — see README), the
 * brand corner, the ungrouped operations-hub row above the spec's seven groups, the
 * stacked crumb (the overlays family's Breadcrumbs `x-crumbs`
 * anatomy is referenced, not imported), the compact operational-health chip,
 * the user chip, and the mobile drawer at the below-Standard edge.
 *
 * AdminPage is the admin page head. It stays separate from kit Page for one reason:
 * Page hardcodes `enter`/`data-reveal` and a closed `kind` union, and admin pages
 * deliberately do not animate in. The fold path is a `reveal?: boolean` prop on kit
 * Page — documented in README.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useMatch, useResolvedPath } from "react-router-dom";
import { Icon } from "../../../icons/Icon";
import type { IconName } from "../../../icons/keyline";
import { StateBlock } from "../../../components/Card";
import "./AdminFrame.css";

/* ── AdminNav ────────────────────────────────────────────────────────────── */

export interface AdminNavSection {
  title: string;
  items: { label: string; to: string; icon: IconName }[];
}

/** A destination that sits under no group — the operations hub at the root. */
export interface AdminNavHome {
  label: string;
  to: string;
  icon: IconName;
}

function AdminNavItem({ to, className, onClick, children }: { to: string; className: string; onClick?: () => void; children: ReactNode }) {
  const resolved = useResolvedPath(to);
  const active = useMatch({ path: resolved.pathname, end: to === "/admin" }) !== null;
  return (
    <Link
      to={to}
      className={className}
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export function AdminNav({
  sections,
  home,
  open = false,
  onClose,
  label = "Administration"
}: {
  sections: AdminNavSection[];
  /** Ungrouped destination rendered above the groups — the operations hub. */
  home?: AdminNavHome;
  /** Drawer state — only meaningful below the Standard band. */
  open?: boolean;
  onClose?: () => void;
  label?: string;
}) {
  return (
    <nav className="x-admin-nav" aria-label={label} data-open={open || undefined} data-active-style="tint">
      <div className="x-admin-nav__mobile-head">
        <strong>{label}</strong>
        <button className="x-icon-btn" type="button" onClick={onClose} aria-label="Close navigation">
          <Icon name="x" size={18} />
        </button>
      </div>
      {home ? (
        <div className="x-admin-nav__home">
          <AdminNavItem to={home.to} className="x-admin-nav__item" onClick={onClose}>
            <span className="x-admin-nav__icon">
              <Icon name={home.icon} size={16} />
            </span>
            {home.label}
          </AdminNavItem>
        </div>
      ) : null}
      {sections.map((section) => (
        <div className="x-admin-nav__group" key={section.title}>
          <p className="micro x-admin-nav__legend">{section.title}</p>
          {section.items.map((item) => (
            <AdminNavItem key={item.to} to={item.to} className="x-admin-nav__item" onClick={onClose}>
              <span className="x-admin-nav__icon">
                <Icon name={item.icon} size={16} />
              </span>
              {item.label}
            </AdminNavItem>
          ))}
        </div>
      ))}
    </nav>
  );
}

/* ── AdminPage ───────────────────────────────────────────────────────────── */

export function AdminPage({
  title,
  lead,
  kicker,
  actions,
  children
}: {
  title: string;
  lead?: string;
  kicker?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="x-admin-page">
      <header className="x-admin-page__head">
        <div>
          {kicker ? <p className="micro x-admin-page__kicker">{kicker}</p> : null}
          <h1 className="display x-admin-page__title">{title}</h1>
          {lead ? <p className="x-admin-page__lead">{lead}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </div>
  );
}

/* ── The frame ───────────────────────────────────────────────────────────── */

/** The compact operational-health indication the top bar carries. */
export interface OpsHealth {
  verdict: "healthy" | "degraded" | "unknown";
  note?: string;
}

const OPS_VERDICT_ICON: Record<OpsHealth["verdict"], IconName> = {
  healthy: "check",
  degraded: "alert",
  unknown: "help"
};

export interface AdminFrameProps {
  /** Staff gate. "refused" renders the refusal surface instead of the shell. */
  access?: "granted" | "refused";
  refusalAction?: ReactNode;
  refusalMessage?: string;
  sections: AdminNavSection[];
  /** The operations hub at the administrative root — under no group. */
  home?: AdminNavHome;
  crumb: { group: string; title: string };
  /** Published health signal; when absent the chip renders unknown — never healthy. */
  health?: OpsHealth;
  user?: { name: string };
  brandTitle?: string;
  brandCaption?: string;
  backTo?: { to: string; label: string };
  children?: ReactNode;
}

export function AdminFrame({
  access = "granted",
  refusalAction,
  refusalMessage = "Access unavailable.",
  sections,
  home,
  crumb,
  health,
  user,
  brandTitle = "Wizly Admin",
  brandCaption = "Staff operations",
  backTo = { to: "/", label: "Back to learning" },
  children
}: AdminFrameProps) {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  // An unread signal is unknown, never healthy.
  const opsHealth: OpsHealth = health ?? { verdict: "unknown", note: "No published health signal" };

  // Route changes close the drawer — the staff equivalent of the learner shell's rule.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  if (access === "refused") {
    return (
      <div className="x-admin-refusal">
        <div className="surface card x-admin-refusal__card">
          <StateBlock state="refused" message={refusalMessage} action={refusalAction} />
        </div>
      </div>
    );
  }

  return (
    <div className="x-admin-frame">
      <div className="x-admin-frame__brand">
        <strong>{brandTitle}</strong>
        <small>{brandCaption}</small>
        {backTo ? (
          <Link className="x-admin-frame__back" to={backTo.to}>
            {backTo.label}
          </Link>
        ) : null}
      </div>

      {navOpen ? (
        <button
          className="x-admin-nav-scrim"
          type="button"
          aria-label="Close administration navigation"
          onClick={() => setNavOpen(false)}
        />
      ) : null}
      <AdminNav sections={sections} home={home} open={navOpen} onClose={() => setNavOpen(false)} />

      <header className="x-admin-frame__top">
        <button
          className="x-admin-frame__menu"
          type="button"
          aria-label="Open administration navigation"
          aria-expanded={navOpen}
          onClick={() => setNavOpen(true)}
        >
          <Icon name="menu" size={19} />
        </button>

        {/* The stacked crumb IS the sibling Breadcrumbs' `variant="current"` markup —
            x-crumbs classes referenced, not imported (consolidation may promote this
            to an import). x-admin-frame__crumb adds only the topbar's ellipsis layout. */}
        <nav className="x-crumbs x-crumbs--current x-admin-frame__crumb" aria-label="Administration breadcrumb">
          <small className="x-crumbs__context">{crumb.group}</small>
          <strong className="x-crumbs__here" aria-current="page">
            {crumb.title}
          </strong>
        </nav>

        <div className="x-admin-frame__top-end">
          <span
            className="x-admin-health"
            data-verdict={opsHealth.verdict}
            role="status"
            aria-label={`Operational health: ${opsHealth.note ?? opsHealth.verdict}`}
            title={`Operational health — ${opsHealth.note ?? opsHealth.verdict}`}
          >
            <Icon name={OPS_VERDICT_ICON[opsHealth.verdict]} size={13} />
            <strong>{opsHealth.verdict}</strong>
          </span>
          {user ? (
            <span className="x-admin-frame__user">
              {/* Sibling: states/ family's Avatar (x-avatar). */}
              <span className="x-avatar x-avatar--sm" aria-hidden="true">
                {user.name.slice(0, 1)}
              </span>
              <span className="x-admin-frame__user-name">{user.name}</span>
            </span>
          ) : null}
          {/* Appearance is chosen in Settings › Appearance and nowhere else (pack O,
              O-A) — "nowhere else" is not a learner-only rule (OR-O17). */}
        </div>
      </header>

      <main className="x-admin-frame__main" id="main">
        {children}
      </main>
    </div>
  );
}

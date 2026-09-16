import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { StateBlock } from "@components/Card";
import { Avatar } from "../extraction/components/Avatar/Avatar";
import { useStore } from "@state/useStore";
import { setRole, type Store } from "@state/store";
import { ADMIN_HUB, ADMIN_NAV, adminBreadcrumb } from "./admin-nav";
import { isStaff } from "./roles";
import "./admin-shell.css";

export function AdminLayout({ children }: { children: ReactNode }) {
  const store = useStore();
  /* Prototype: the console is a visual reference — no access gate. Entering it
     promotes the demo session to superadmin so capability-gated controls render
     their working form; refused states stay reachable via each page's preview
     chips. `setRole` persists, so the lift survives reloads on this device. */
  const role = store.session?.role;
  useEffect(() => {
    if (!isStaff(role)) setRole("superadmin");
  }, [role]);
  return <AdminShell>{children}</AdminShell>;
}

type OpsVerdict = "healthy" | "degraded" | "unknown";

const OPS_VERDICT_ICON: Record<OpsVerdict, IconName> = {
  healthy: "check",
  degraded: "alert",
  unknown: "help"
};

/**
 * The header's compact operational-health read. The demo store carries no
 * published health fixture yet, so the signal is unread — which renders
 * unknown, never healthy. When a fixture lands as `store.opsHealth`, the chip
 * reads it verbatim.
 */
function opsHealth(store: Store): { verdict: OpsVerdict; note: string } {
  const fixture = (store as Store & { opsHealth?: { verdict?: string; note?: string } }).opsHealth;
  if (fixture?.verdict === "healthy" || fixture?.verdict === "degraded") {
    return { verdict: fixture.verdict, note: fixture.note ?? fixture.verdict };
  }
  return { verdict: "unknown", note: "No published health signal this session" };
}

function AdminShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const store = useStore();
  const crumb = adminBreadcrumb(location.pathname);
  const health = opsHealth(store);
  const [navOpen, setNavOpen] = useState(false);

  /* Route change closes the drawer — item clicks are not the only way to move
     (browser back, deep links), so the drawer follows the address. */
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-shell">
      <div className="admin-brand">
        <Link className="admin-brand__home" to={ADMIN_HUB.to}>
          <span className="admin-brand__mark">
            <Icon name="admin" size={18} />
          </span>
          <span className="admin-brand__word">
            <strong>Wizly Admin</strong>
            <small className="micro">Staff operations</small>
          </span>
        </Link>
      </div>

      {navOpen ? <button className="admin-nav-scrim" type="button" aria-label="Close administration navigation" onClick={() => setNavOpen(false)} /> : null}
      <nav className={`admin-nav ${navOpen ? "is-open" : ""}`} aria-label="Administration">
        <div className="admin-nav__mobile-head">
          <strong>Administration</strong>
          <button className="icon-btn" type="button" onClick={() => setNavOpen(false)} aria-label="Close navigation"><Icon name="x" size={18} /></button>
        </div>
        {/* The operations hub sits at the administrative root under no group. */}
        <div className="admin-nav__hub">
          <NavLink
            to={ADMIN_HUB.to}
            end
            onClick={() => setNavOpen(false)}
            className={({ isActive }) => `admin-nav__item ${isActive ? "is-active" : ""}`}
          >
            <span className="icon-slot"><Icon name={ADMIN_HUB.icon} size={16} /></span>
            {ADMIN_HUB.label}
          </NavLink>
        </div>
        {ADMIN_NAV.map((section) => (
          <div className="admin-nav__group" key={section.title}>
            <p className="micro admin-nav__legend">{section.title}</p>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                onClick={() => setNavOpen(false)}
                className={({ isActive }) => `admin-nav__item ${isActive ? "is-active" : ""}`}
              >
                <span className="icon-slot"><Icon name={item.icon} size={16} /></span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
        {/* The console exit lives at the rail's foot — pinned, so it never
            scrolls away under a long section list. */}
        <div className="admin-nav__foot">
          <Link className="admin-nav__item admin-nav__exit" to="/">
            <span className="icon-slot"><Icon name="arrow-left" size={16} /></span>
            Back to learning
          </Link>
        </div>
      </nav>

      <header className="admin-top">
        <button className="admin-menu" type="button" aria-label="Open administration navigation" aria-expanded={navOpen} onClick={() => setNavOpen(true)}>
          <Icon name="menu" size={19} />
        </button>
        <nav className="admin-crumb" aria-label="Administration breadcrumb">
          <small className="micro">{crumb.group}</small>
          <strong>{crumb.title}</strong>
        </nav>
        <div className="admin-top-end">
          <span
            className="admin-health-chip"
            data-verdict={health.verdict}
            role="status"
            aria-label={`Operational health: ${health.note}`}
            title={`Operational health — ${health.note}`}
          >
            <Icon name={OPS_VERDICT_ICON[health.verdict]} size={13} />
            <strong>{health.verdict}</strong>
          </span>
          <span className="admin-user"><Avatar name={store.session.name} size="sm" /><span className="admin-user__name">{store.session.name}</span></span>
          {/* Appearance is chosen in Settings › Appearance and nowhere else (pack O, O-A); the
              admin header switcher retires with the learner shell's — "nowhere else" is not a
              learner-only rule (owner review: OR-O17). */}
        </div>
      </header>

      <main className="admin-main" id="main">{children}</main>
    </div>
  );
}

export function AdminUnknown() {
  return (
    <div className="admin-page sink">
      <StateBlock state="unavailable" message="This administration address does not exist." action={<Link className="btn btn--secondary" to="/admin">Operations hub</Link>} />
    </div>
  );
}

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
    <div className="admin-page sink">
      <header className="sink__head">
        <div>
          {kicker ? <p className="micro page__kicker">{kicker}</p> : null}
          <h1 className="display sink__title">{title}</h1>
          {lead ? <p className="page__lead">{lead}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </div>
  );
}

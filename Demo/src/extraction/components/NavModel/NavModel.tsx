/**
 * NavModel — ONE interface (`sections`) behind five presentations.
 *
 * Extracted from src/nav/Shell.tsx:222-432. Destinations, order and sectioning are the
 * caller's (`sections`); the demo passes SIDEBAR from src/nav/nav-data.ts. Every model
 * renders the same sections — only the presentation differs. The drawer collapse lives
 * in ./DrawerNav.tsx (below-Standard is a behaviour, not a model — SHR-R31; OR-O2).
 *
 * Active state is carried by `data-active` + `aria-current="page"` on the item and a
 * `data-active-style` NAME on the nav root that says which active idiom it paints:
 *   rail + drawer — accent-tinted surface marks the active row
 *   accent-text  spine links · dock links · dual local — accent colour + semibold
 *   solid        dual dots — solid accent fill (dock groups use it for data-open)
 * The idioms are deliberately named, not merged: each form factor's active affordance
 * is sized for its density. See README for the rationale.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useMatch, useResolvedPath } from "react-router-dom";
import { Icon } from "../../../icons/Icon";
import type { IconName } from "../../../icons/keyline";
import { isExactNav, type NavSection } from "../../../nav/nav-data";
import type { NavModelKey } from "../../../tokens/values";
import "./NavModel.css";
import "./NavModel.overlay.css";

/* ── Shared item ─────────────────────────────────────────────────────────── */

export interface NavItemLinkProps {
  to: string;
  className: string;
  title?: string;
  onClick?: () => void;
  children: ReactNode;
}

/**
 * A link that carries `data-active` + `aria-current="page"` — NavLink's own matching
 * (prefix match unless the destination is exact-nav), expressed as attributes so all
 * five models read one state carrier.
 */
export function NavItemLink({ to, className, title, onClick, children }: NavItemLinkProps) {
  const resolved = useResolvedPath(to);
  const active = useMatch({ path: resolved.pathname, end: isExactNav(to) }) !== null;
  return (
    <Link
      to={to}
      className={className}
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export function NavItemBody({
  item,
  iconSize
}: {
  item: NavSection["items"][number];
  iconSize: number;
}) {
  return (
    <>
      <span className="x-nav-icon">
        <Icon name={item.icon} size={iconSize} />
      </span>
      <span>{item.label}</span>
    </>
  );
}

/* ── 1 · Anchored rail ───────────────────────────────────────────────────── */

export function RailNav({
  sections,
  lab,
  ariaLabel = "Learner navigation",
  onNavigate
}: {
  sections: NavSection[];
  lab?: { icon: IconName; title: string; caption: string };
  ariaLabel?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="x-nav-rail" aria-label={ariaLabel} data-active-style="tint">
      {lab ? (
        <div className="x-nav-rail__lab">
          <span className="x-nav-icon">
            <Icon name={lab.icon} size={20} />
          </span>
          <span>
            <strong>{lab.title}</strong>
            <small>{lab.caption}</small>
          </span>
        </div>
      ) : null}
      {sections.map((section) => (
        <div className="x-nav-rail__group" key={section.title}>
          <p className="micro x-nav-rail__legend">{section.title}</p>
          {section.items.map((item) => (
            <NavItemLink key={item.label + item.to} to={item.to} className="x-nav-rail__item" onClick={onNavigate}>
              <NavItemBody item={item} iconSize={20} />
            </NavItemLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

/* ── 2 · Icon spine + flyout ─────────────────────────────────────────────── */

/** Read a --duration-* token as milliseconds; a missing/unparseable token is 0. */
function readDurationMs(name: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (raw.endsWith("ms")) return Number.parseFloat(raw) || 0;
  if (raw.endsWith("s")) return (Number.parseFloat(raw) || 0) * 1000;
  return Number.parseFloat(raw) || 0;
}

export function SpineNav({
  sections,
  ariaLabel = "Learner navigation"
}: {
  sections: NavSection[];
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  function enter(section: string) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(section);
  }
  function leave() {
    // The hover-intent window is the identity's own fast duration (was a fixed 180ms —
    // which happened to be Halo's --duration-fast). Now each register sets its own pace.
    closeTimer.current = window.setTimeout(() => setOpen(null), readDurationMs("--duration-fast"));
  }
  useEffect(() => () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); }, []);

  const active = sections.find((section) => section.title === open);

  return (
    <nav className="x-nav-spine" aria-label={ariaLabel} onMouseLeave={leave} data-active-style="accent-text">
      <div className="x-nav-spine__rail">
        {sections.map((section) => (
          <button
            key={section.title}
            type="button"
            className="x-nav-spine__group"
            data-open={open === section.title || undefined}
            onMouseEnter={() => enter(section.title)}
            onFocus={() => enter(section.title)}
            // Click toggles for keyboard users only (detail 0 = keyboard/SR click):
            // a pointer tap already opened the flyout via focus, so toggling here
            // would open-then-close in one gesture (the source had that race).
            onClick={(e) => {
              if (e.detail === 0) setOpen(open === section.title ? null : section.title);
            }}
            aria-expanded={open === section.title}
            aria-label={section.title}
          >
            <Icon name={section.icon} size={20} />
            <span className="x-nav-spine__tip">{section.title}</span>
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="x-nav-spine__flyout"
          role="group"
          aria-label={active.title}
          onMouseEnter={() => enter(active.title)}
        >
          <p className="micro x-nav-spine__flyout-title">{active.title}</p>
          {active.items.map((item) => (
            <NavItemLink key={item.label + item.to} to={item.to} className="x-nav-spine__link">
              <NavItemBody item={item} iconSize={16} />
            </NavItemLink>
          ))}
        </div>
      ) : null}
    </nav>
  );
}

/* ── 3 · Command model — the status strip ────────────────────────────────── */

export interface StripItem {
  icon: IconName;
  label: ReactNode;
}

export function CommandStrip({ items, hint }: { items: StripItem[]; hint?: ReactNode }) {
  return (
    <div className="x-nav-strip" role="status">
      {items.map((item, i) => (
        <span className="x-nav-strip__item" key={i}>
          {i > 0 ? <span className="x-nav-strip__sep" aria-hidden="true" /> : null}
          <Icon name={item.icon} size={14} />
          {item.label}
        </span>
      ))}
      {hint ? <span className="x-nav-strip__item x-nav-strip__hint">{hint}</span> : null}
    </div>
  );
}

/* ── 4 · Floating dock ───────────────────────────────────────────────────── */

export function DockNav({
  sections,
  ariaLabel = "Learner navigation"
}: {
  sections: NavSection[];
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const active = sections.find((section) => section.title === open);

  return (
    <nav className="x-nav-dock" aria-label={ariaLabel} data-active-style="accent-text">
      {active ? (
        <div className="x-nav-dock__popover" role="group" aria-label={active.title}>
          {active.items.map((item) => (
            <NavItemLink
              key={item.label + item.to}
              to={item.to}
              className="x-nav-dock__link"
              onClick={() => setOpen(null)}
            >
              <NavItemBody item={item} iconSize={16} />
            </NavItemLink>
          ))}
        </div>
      ) : null}

      <div className="x-nav-dock__pill">
        {sections.map((section) => (
          <button
            key={section.title}
            type="button"
            className="x-nav-dock__group"
            data-open={open === section.title || undefined}
            onClick={() => setOpen(open === section.title ? null : section.title)}
            aria-expanded={open === section.title}
          >
            <Icon name={section.icon} size={18} />
            <span>{section.title}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ── 5 · Dual rail — thin spine + the owning section's local rail ────────── */

export function DualNav({
  sections,
  spineLabel = "Sections",
  localLabel = "Section"
}: {
  sections: NavSection[];
  spineLabel?: string;
  localLabel?: string;
}) {
  const location = useLocation();
  // The local rail carries whichever section the current destination belongs to — the
  // whole argument for this model is that a deep section gets a second level, no flyout.
  const owner =
    sections.find((section) =>
      section.items.some((item) => item.to !== "/" && location.pathname.startsWith(item.to))
    ) ?? sections[0];

  return (
    <>
      <nav className="x-nav-dual__spine" aria-label={spineLabel} data-active-style="solid">
        {sections.map((section) => (
          <div className="x-nav-dual__group" key={section.title}>
            <span className="x-nav-dual__group-icon" title={section.title}>
              <Icon name={section.icon} size={18} />
            </span>
            {section.items.map((item) => (
              <NavItemLink
                key={item.label + item.to}
                to={item.to}
                className="x-nav-dual__dot"
                title={item.label}
              >
                <Icon name={item.icon} size={16} />
              </NavItemLink>
            ))}
          </div>
        ))}
      </nav>

      <nav className="x-nav-dual__local" aria-label={localLabel} data-active-style="accent-text">
        <p className="micro x-nav-dual__local-title">{owner?.title}</p>
        {(owner?.items ?? []).map((item) => (
          <NavItemLink key={item.label + item.to} to={item.to} className="x-nav-dual__local-link">
            {item.label}
          </NavItemLink>
        ))}
        {owner && owner.items.length === 0 ? (
          <p className="x-nav-dual__local-empty">No sub-sections here.</p>
        ) : null}
      </nav>
    </>
  );
}

/* ── The dispatcher — one interface, five presentations ──────────────────── */

export interface NavModelProps {
  model: NavModelKey;
  sections: NavSection[];
  /** Rail header block ("{name}'s Lab" in the demo). Omit for a bare rail. */
  lab?: { icon: IconName; title: string; caption: string };
  /** Command model's status figures — the caller's store, never this file's. */
  stripItems?: StripItem[];
  stripHint?: ReactNode;
  ariaLabel?: string;
}

export function NavModel({ model, sections, lab, stripItems = [], stripHint, ariaLabel }: NavModelProps) {
  switch (model) {
    case "spine":
      return <SpineNav sections={sections} ariaLabel={ariaLabel} />;
    case "command":
      return <CommandStrip items={stripItems} hint={stripHint} />;
    case "dock":
      return <DockNav sections={sections} ariaLabel={ariaLabel} />;
    case "dual":
      return <DualNav sections={sections} />;
    default:
      return <RailNav sections={sections} lab={lab} ariaLabel={ariaLabel} />;
  }
}

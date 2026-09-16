/**
 * AppFrame — the learner shell grid, the skip link, and the sticky header.
 *
 * Extracted from src/nav/Shell.tsx:60-220. The frame owns the grid (`data-model` /
 * `data-band`), never the nav itself: the active presentation is passed in through the
 * `nav` slot (see NavModel), and below Standard every model gives way to the drawer —
 * a behaviour, never a preference (SHR-R31; OR-O2).
 *
 * Slots, not stores: level, unread counts and the avatar arrive as `pill` / `actions`
 * so the frame never imports state. The notification popover and quick-notes sheet are
 * the overlays family's (`x-popover`, `x-sheet`) — they mount through `actions` and
 * `overlays`.
 */

import { useEffect, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "../../../icons/Icon";
import type { IconName } from "../../../icons/keyline";
import { VALUES, type BandKey, type NavModelKey } from "../../../tokens/values";
import { readAppearance, NAV_BELOW_STANDARD } from "../../../foundation/appearance";
import "./AppFrame.css";

/* ── Band + model resolution ─────────────────────────────────────────────── */

export function currentBand(width: number): BandKey {
  const ordered = [...VALUES.bands].sort((a, b) => b.min - a.min);
  return (ordered.find((b) => width >= b.min)?.key ?? "compact") as BandKey;
}

/** The live viewport band, from the package's band table — the only place widths live. */
export function useBand(): BandKey {
  const [band, setBand] = useState<BandKey>(() =>
    currentBand(typeof window === "undefined" ? 1440 : window.innerWidth)
  );
  useEffect(() => {
    const onResize = () => setBand(currentBand(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return band;
}

/** Below Standard every model gives way to the drawer (OR-O2) — the band table's own
 *  `shell` column says so; no band name is restated here. */
export function isDrawerBand(band: BandKey): boolean {
  return VALUES.bands.find((b) => b.key === band)?.shell === NAV_BELOW_STANDARD;
}

/** The learner's chosen model — Settings › Appearance owns the choice (O-A); the frame obeys. */
export function useNavModel(): NavModelKey {
  const [model, setModel] = useState<NavModelKey>(() => readAppearance().nav);
  useEffect(() => {
    const sync = () => setModel(readAppearance().nav);
    window.addEventListener("wp-appearance", sync);
    return () => window.removeEventListener("wp-appearance", sync);
  }, []);
  return model;
}

/* ── Header pieces ───────────────────────────────────────────────────────── */

export interface Brand {
  to: string;
  icon: IconName;
  wordmark: string;
}

export const DEFAULT_BRAND: Brand = { to: "/", icon: "flask", wordmark: "Wizly Labs" };

/** The search affordance — opens the command palette (overlays family). */
export function SearchTrigger({
  label = "Quick search or jump…",
  kbd = "Ctrl K",
  onClick
}: {
  label?: string;
  kbd?: string;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="x-search-trigger" onClick={onClick}>
      <Icon name="search" size={16} />
      <span className="x-search-trigger__label">{label}</span>
      <kbd className="x-kbd">{kbd}</kbd>
    </button>
  );
}

/** A small header readout (level pill in the demo). Content is the caller's. */
export function HeaderPill({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <span className="x-header-pill">
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  );
}

export interface ShellHeaderProps {
  /** Show the menu button (drawer, command and dock models carry no persistent list). */
  menu?: boolean;
  menuOpen?: boolean;
  onMenuOpen?: () => void;
  brand?: Brand;
  /** Search trigger. Pass `false` to suppress. */
  search?: { label?: string; kbd?: string; onClick?: () => void } | false;
  /** Header readout slot — render <HeaderPill> here. */
  pill?: ReactNode;
  /** End slot — icon buttons (x-icon-btn), badge dots (x-badge-dot), avatar (x-avatar). */
  actions?: ReactNode;
}

export function ShellHeader({
  menu = false,
  menuOpen,
  onMenuOpen,
  brand = DEFAULT_BRAND,
  search,
  pill,
  actions
}: ShellHeaderProps) {
  return (
    <header className="x-shell-header">
      {menu ? (
        <button
          type="button"
          className="x-shell-header__menu"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          onClick={onMenuOpen}
        >
          <Icon name="menu" size={20} />
        </button>
      ) : null}

      <NavLink className="x-shell-header__brand" to={brand.to}>
        <span className="x-shell-header__mark">
          <Icon name={brand.icon} size={20} />
        </span>
        <span className="x-shell-header__wordmark display">{brand.wordmark}</span>
      </NavLink>

      {search === false ? null : (
        <SearchTrigger label={search?.label} kbd={search?.kbd} onClick={search?.onClick} />
      )}

      <div className="x-shell-header__end">
        {pill}
        {/* Appearance is chosen in Settings › Appearance and nowhere else (O-A; pack O) —
            there is deliberately no switcher slot here. */}
        {actions}
      </div>
    </header>
  );
}

/* ── The frame ───────────────────────────────────────────────────────────── */

export interface AppFrameProps {
  /** Resolved presentation. Omit to read the appearance axis + band automatically. */
  model?: NavModelKey | "drawer";
  /** Omit to track the live viewport band. */
  band?: BandKey;
  /** The header — render <ShellHeader>. */
  header?: ReactNode;
  /** The nav presentation — render <NavModel>, or nothing under drawer/command/dock. */
  nav?: ReactNode;
  /** Breadcrumb slot — the overlays family's Breadcrumbs (`x-crumbs`). */
  breadcrumbs?: ReactNode;
  children?: ReactNode;
  /** Drawers, palette, sheets — overlay siblings mount here. */
  overlays?: ReactNode;
  /** The companion corner (x-companion). */
  companion?: ReactNode;
  /** Live-region notice slot content. */
  notices?: ReactNode;
}

export function AppFrame({
  model: modelProp,
  band: bandProp,
  header,
  nav,
  breadcrumbs,
  children,
  overlays,
  companion,
  notices
}: AppFrameProps) {
  const detectedBand = useBand();
  const detectedModel = useNavModel();
  const band = bandProp ?? detectedBand;
  const model = modelProp ?? (isDrawerBand(band) ? "drawer" : detectedModel);

  return (
    <div className="x-app-frame" data-model={model} data-band={band}>
      <a className="x-skip-link" href="#main">
        Skip to content
      </a>

      {header}
      {nav}

      <main className="x-app-frame__main" id="main">
        {breadcrumbs}
        {children}
      </main>

      {overlays}
      {companion}
      <div className="x-app-frame__notices" aria-live="polite">
        {notices}
      </div>
    </div>
  );
}

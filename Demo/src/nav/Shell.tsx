import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@icons/Icon";
import { Companion } from "@companion/Companion";
import { SIDEBAR, SIDEBAR_FLAT, isExactNav } from "./nav-data";
import { VALUES, type BandKey } from "@tokens/values";
import { readAppearance, type NavModelKey } from "@foundation/appearance";
import { Breadcrumbs } from "@components/Breadcrumbs";
import { DEMO_ADMIN_ENABLED } from "@demo/config";
import { ThemePicker } from "./ThemePicker";
import { useStore } from "@state/useStore";
import { markNotificationsRead, updateScratchpad } from "@state/store";
import {
  CHALLENGES,
  COMPANIES,
  COURSES,
  DEBUG_CASES,
  MOCKS,
  NOTIFICATIONS,
  PROJECT_TEMPLATES
} from "@data/catalog";
import "./shell.css";

function currentBand(width: number): BandKey {
  const ordered = [...VALUES.bands].sort((a, b) => b.min - a.min);
  return (ordered.find((b) => width >= b.min)?.key ?? "compact") as BandKey;
}

function useBand(): BandKey {
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

/** Below Standard every model gives way to the drawer — a behaviour, never a preference
 *  (`SHR-R31`; OR-O2, pack O). No navigation model opts out of it. */
function isDrawerBand(band: BandKey): boolean {
  return band === "compact" || band === "tabletNarrow";
}

/**
 * The navigation model the learner chose in Settings › Appearance (O-A). It is read from the
 * appearance state, never from a header control — pack O moved the choice to Settings and the
 * shell only obeys it.
 */
function useNavModel(): NavModelKey {
  const [model, setModel] = useState<NavModelKey>(() => readAppearance().nav);
  useEffect(() => {
    const sync = () => setModel(readAppearance().nav);
    window.addEventListener("wp-appearance", sync);
    return () => window.removeEventListener("wp-appearance", sync);
  }, []);
  return model;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const band = useBand();
  const drawer = isDrawerBand(band);
  const model = useNavModel();
  /** command and dock carry no persistent list, so they keep the drawer as their menu. */
  const usesDrawerMenu = drawer || model === "command" || model === "dock";
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const location = useLocation();
  const store = useStore();
  const unreadItems = NOTIFICATIONS.filter((n) => n.unread && !store.notificationsRead.includes(n.id));
  const unread = unreadItems.length;
  const needsMenu = usesDrawerMenu;

  useEffect(() => {
    setNavOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setNavOpen(false);
        setNotifOpen(false);
        setNotesOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="shell" data-model={drawer ? "drawer" : model} data-band={band}>
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="shell__header">
        {needsMenu ? (
          <button
            type="button"
            className="shell__menu"
            aria-label="Open navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <Icon name="menu" size={20} />
          </button>
        ) : null}

        <NavLink className="shell__brand" to="/">
          <span className="shell__mark"><Icon name="flask" size={20} /></span>
          <span className="shell__wordmark display">Wizly Labs</span>
        </NavLink>

        <button type="button" className="shell__search" onClick={() => setPaletteOpen(true)}>
          <Icon name="search" size={16} />
          <span>Quick search or jump…</span>
          <kbd className="shell__kbd">Ctrl K</kbd>
        </button>

        <div className="shell__header-end">
          <span className="header-pill">
            <Icon name="zap" size={14} />
            Lvl {store.profile.level}
          </span>

          {/* Appearance is chosen in Settings › Appearance and nowhere else (O-A; pack O). */}

          {/* Notification Popover */}
          <div className="header-menu">
            <button
              type="button"
              className="icon-btn"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((v) => !v)}
            >
              <Icon name="notifications" size={18} />
              {unread > 0 ? <span className="badge-dot">{unread}</span> : null}
            </button>
            {notifOpen ? (
              <div className="header-pop" style={{ width: 320, padding: 12, background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius-md)", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid var(--c-border)" }}>
                  <strong style={{ fontSize: "13px" }}>Notifications ({unread} new)</strong>
                  {unread > 0 ? (
                    <button
                      type="button"
                      className="btn btn--quiet"
                      style={{ fontSize: "11px", padding: "2px 6px" }}
                      onClick={() => markNotificationsRead()}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                  {NOTIFICATIONS.slice(0, 3).map((n) => {
                    const isUnread = n.unread && !store.notificationsRead.includes(n.id);
                    return (
                      <div key={n.id} style={{ padding: "6px 8px", borderRadius: "var(--radius-sm)", background: isUnread ? "rgba(99, 102, 241, 0.08)" : "transparent", fontSize: "12px" }}>
                        <div style={{ fontWeight: 600, color: "var(--c-text-primary)" }}>{n.title}</div>
                        <div style={{ color: "var(--c-text-muted)", fontSize: "11px", marginTop: 2 }}>{n.body}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid var(--c-border)", textAlign: "center" }}>
                  <Link to="/notifications" style={{ fontSize: "12px", color: "var(--c-accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                    View all notifications →
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          {DEMO_ADMIN_ENABLED ? (
            <Link to="/admin" className="icon-btn" aria-label="Administration" title="Administration">
              <Icon name="shield" size={18} />
            </Link>
          ) : null}
          <ThemePicker />
          <button type="button" className="icon-btn" aria-label="Quick Notes" aria-expanded={notesOpen} onClick={() => setNotesOpen((value) => !value)}>
            <Icon name="sticky-note" size={18} />
          </button>
          <NavLink to="/profile" className="avatar" aria-label="Profile">
            {store.session.name.slice(0, 1)}
          </NavLink>
        </div>
      </header>

      {/* All five models render. The axis is WIRED, not merely offered: a Settings control
          that changed nothing would be the defect the peer audit registers, so the four
          non-rail models were lifted from the archived hybrid's shell — whose CSS this
          prototype already carried (owner review: OR-O16).

          `shell.css`'s `.model-picker` block (:114-127) styles the retired header picker and
          is now dead. It stays: the package cites `shell.css` by line number in twelve
          `_source` fields, so deleting the block would move every line below it and make
          those citations wrong. Removing it (and re-recording the lines) is a first-build-pass
          tidy (owner review: OR-O23). Do not delete it from here. */}
      {!drawer && model === "rail" ? <RailNav /> : null}
      {!drawer && model === "spine" ? <SpineNav /> : null}
      {!drawer && model === "command" ? <CommandStrip /> : null}
      {!drawer && model === "dock" ? <DockNav /> : null}
      {!drawer && model === "dual" ? <DualNav /> : null}

      <main className="shell__main" id="main">
        <Breadcrumbs />
        {children}
      </main>

      {usesDrawerMenu && navOpen ? (
        <DrawerNav onClose={() => setNavOpen(false)} />
      ) : null}
      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
      {notesOpen ? <NotesPanel onClose={() => setNotesOpen(false)} /> : null}
      <Companion />
      <div className="shell__notice-slot" aria-live="polite" />
    </div>
  );
}

function NavLinks({ className }: { className: string }) {
  return (
    <>
      {SIDEBAR.map((section) => (
        <div className="rail__group" key={section.title}>
          <p className="micro rail__legend">{section.title}</p>
          {section.items.map((item) => (
            <NavLink
              key={item.label + item.to}
              to={item.to}
              end={isExactNav(item.to)}
              className={({ isActive }) => `${className} ${isActive ? "is-active" : ""}`}
            >
              <span className="icon-slot"><Icon name={item.icon} size={20} /></span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </>
  );
}

function RailNav() {
  const store = useStore();
  return (
    <nav className="rail" aria-label="Learner navigation">
      <div className="rail__lab">
        <span className="icon-slot"><Icon name="flask" size={20} /></span>
        <span>
          <strong>{store.session.name}'s Lab</strong>
          <small>Workspace</small>
        </span>
      </div>
      <NavLinks className="rail__item" />
    </nav>
  );
}

/* The other four navigation models. Their forms and dimensions are the package's
   (`shell.nav`, `--shell-nav-*`); the markup is `shell.css`'s, which has carried all five
   since the hybrid prototype. Destinations and their order are `SIDEBAR`'s in every model. */

function SpineNav() {
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  function enter(section: string) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(section);
  }
  function leave() {
    closeTimer.current = window.setTimeout(() => setOpen(null), 180);
  }

  const active = SIDEBAR.find((section) => section.title === open);

  return (
    <nav className="spine" aria-label="Learner navigation" onMouseLeave={leave}>
      <div className="spine__rail">
        {SIDEBAR.map((section) => (
          <button
            key={section.title}
            type="button"
            className={`spine__group ${open === section.title ? "is-open" : ""}`}
            onMouseEnter={() => enter(section.title)}
            onFocus={() => enter(section.title)}
            onClick={() => setOpen(open === section.title ? null : section.title)}
            aria-expanded={open === section.title}
            aria-label={section.title}
          >
            <Icon name={section.icon} size={20} />
            <span className="spine__tip">{section.title}</span>
          </button>
        ))}
      </div>

      {active ? (
        <div className="spine__flyout" onMouseEnter={() => enter(active.title)}>
          <p className="micro spine__flyout-title">{active.title}</p>
          {active.items.map((item) => (
            <NavLink
              key={item.label + item.to}
              to={item.to}
              end={isExactNav(item.to)}
              className={({ isActive }) => `spine__link ${isActive ? "is-active" : ""}`}
            >
              <span className="icon-slot"><Icon name={item.icon} size={16} /></span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      ) : null}
    </nav>
  );
}

/** The command model's status strip. Its three figures are this store's own — level, streak,
 *  solved. The archived strip also showed a credit figure; it was not carried, because this
 *  store has no credits field and a number is never invented to fill a slot
 *  *(owner review: OR-O22)*. */
function CommandStrip() {
  const store = useStore();
  return (
    <div className="strip" role="status">
      <span className="strip__item"><Icon name="zap" size={14} /> Lvl {store.profile.level}</span>
      <span className="strip__sep" />
      <span className="strip__item"><Icon name="target" size={14} /> {store.profile.streak}-day streak</span>
      <span className="strip__sep" />
      <span className="strip__item"><Icon name="challenges" size={14} /> {store.profile.solvedCount} solved</span>
      <span className="strip__item strip__hint">
        Press <kbd className="shell__kbd">Ctrl K</kbd> to go anywhere
      </span>
    </div>
  );
}

function DockNav() {
  const [open, setOpen] = useState<string | null>(null);
  const active = SIDEBAR.find((section) => section.title === open);

  return (
    <nav className="dock" aria-label="Learner navigation">
      {active ? (
        <div className="dock__popover">
          {active.items.map((item) => (
            <NavLink
              key={item.label + item.to}
              to={item.to}
              end={isExactNav(item.to)}
              className={({ isActive }) => `dock__link ${isActive ? "is-active" : ""}`}
              onClick={() => setOpen(null)}
            >
              <span className="icon-slot"><Icon name={item.icon} size={16} /></span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      ) : null}

      <div className="dock__pill">
        {SIDEBAR.map((section) => (
          <button
            key={section.title}
            type="button"
            className={`dock__group ${open === section.title ? "is-open" : ""}`}
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

function DualNav() {
  const location = useLocation();
  // The local rail carries whichever section the current destination belongs to — the whole
  // argument for this model is that a deep section gets a second level without a flyout.
  const owner =
    SIDEBAR.find((section) =>
      section.items.some((item) => item.to !== "/" && location.pathname.startsWith(item.to))
    ) ?? SIDEBAR[0];

  return (
    <>
      <nav className="dual__spine" aria-label="Sections">
        {SIDEBAR.map((section) => (
          <div className="dual__group" key={section.title}>
            <span className="dual__group-icon" title={section.title}>
              <Icon name={section.icon} size={18} />
            </span>
            {section.items.map((item) => (
              <NavLink
                key={item.label + item.to}
                to={item.to}
                end={isExactNav(item.to)}
                className={({ isActive }) => `dual__dot ${isActive ? "is-active" : ""}`}
                title={item.label}
                aria-label={item.label}
              >
                <Icon name={item.icon} size={16} />
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <nav className="dual__local" aria-label="Section">
        <p className="micro dual__local-title">{owner?.title}</p>
        {(owner?.items ?? []).map((item) => (
          <NavLink
            key={item.label + item.to}
            to={item.to}
            end={isExactNav(item.to)}
            className={({ isActive }) => `dual__local-link ${isActive ? "is-active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
        {owner && owner.items.length === 0 ? (
          <p className="dual__local-empty">No sub-sections here.</p>
        ) : null}
      </nav>
    </>
  );
}

function DrawerNav({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    node?.querySelector<HTMLElement>("a, button")?.focus();
    return () => previous?.focus();
  }, []);

  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label="Navigation">
      <button type="button" className="drawer__scrim" aria-label="Close navigation" onClick={onClose} />
      <nav className="drawer__panel" ref={ref} aria-label="Learner navigation">
        <button type="button" className="drawer__close" aria-label="Close" onClick={onClose}>
          <Icon name="x" size={18} />
        </button>
        <NavLinks className="rail__item" />
      </nav>
    </div>
  );
}


function NotesPanel({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const [draft, setDraft] = useState(store.scratchpad);
  const [status, setStatus] = useState<"saved" | "saving">("saved");

  function update(value: string) {
    setDraft(value);
    setStatus("saving");
    updateScratchpad(value);
    window.setTimeout(() => setStatus("saved"), 350);
  }

  return (
    <aside className="notes-panel" role="dialog" aria-modal="true" aria-label="Quick Notes">
      <header className="notes-panel__header">
        <div>
          <p className="micro">Private scratchpad</p>
          <h2>Quick Notes</h2>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close Quick Notes">
          <Icon name="x" size={18} />
        </button>
      </header>
      <p className="notes-panel__lead">One continuous note across eligible learning surfaces. Staff never see this content.</p>
      <textarea
        autoFocus
        value={draft}
        maxLength={50000}
        onChange={(event) => update(event.target.value)}
        placeholder="Capture an invariant, question, or next step..."
        aria-label="Quick Notes content"
      />
      <footer className="notes-panel__footer">
        <span className="save-state" data-saving={status === "saving" || undefined}>
          <span aria-hidden="true" />
          {status === "saving" ? "Saving..." : "Saved"}
        </span>
        <span>{draft.length.toLocaleString()} / 50,000</span>
      </footer>
    </aside>
  );
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Course" | "Challenge" | "Assessment" | "Template";
  icon: string;
  to: string;
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const searchIndex: SearchItem[] = [
    ...SIDEBAR_FLAT.map((i) => ({
      id: `nav-${i.to}`,
      title: i.label,
      subtitle: "Page destination",
      category: "Navigation" as const,
      icon: i.icon,
      to: i.to
    })),
    ...COURSES.map((c) => ({
      id: `course-${c.id}`,
      title: c.title,
      subtitle: `${c.lessons} lessons · ${c.track} track`,
      category: "Course" as const,
      icon: "course",
      to: `/courses/${c.id}`
    })),
    ...CHALLENGES.map((c) => ({
      id: `chl-${c.id}`,
      title: c.title,
      subtitle: `${c.difficulty} · ${c.tags.join(" · ")}`,
      category: "Challenge" as const,
      icon: "challenges",
      to: `/challenges/${c.id}`
    })),
    ...DEBUG_CASES.map((d) => ({
      id: `dbg-${d.id}`,
      title: `Debug: ${d.title}`,
      subtitle: `${d.difficulty} · ${d.brief}`,
      category: "Challenge" as const,
      icon: "debug",
      to: `/debug/${d.id}`
    })),
    ...MOCKS.map((m) => ({
      id: `mock-${m.id}`,
      title: m.title,
      subtitle: `${m.minutes} min · ${m.questions} items`,
      category: "Assessment" as const,
      icon: "clipboard",
      to: `/mock/${m.id}`
    })),
    ...COMPANIES.map((c) => ({
      id: `cmp-${c.id}`,
      title: `${c.name} Assessment Simulation`,
      subtitle: `${c.difficulty} track · ${c.focusAreas.join(" · ")}`,
      category: "Assessment" as const,
      icon: "companies",
      to: `/company/${c.id}`
    })),
    ...PROJECT_TEMPLATES.map((t) => ({
      id: `tpl-${t.id}`,
      title: t.title,
      subtitle: `${t.language} · ${t.fileCount} starter files`,
      category: "Template" as const,
      icon: "projects",
      to: `/projects/new?template=${t.id}`
    }))
  ];

  const filtered = q.trim()
    ? searchIndex.filter(
        (i) =>
          i.title.toLowerCase().includes(q.toLowerCase()) ||
          i.subtitle.toLowerCase().includes(q.toLowerCase()) ||
          i.category.toLowerCase().includes(q.toLowerCase())
      )
    : searchIndex.slice(0, 8);

  useEffect(() => {
    setSelectedIdx(0);
  }, [q]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIdx]) {
        navigate(filtered[selectedIdx]!.to);
        onClose();
      } else if (q.trim()) {
        navigate(`/search?q=${encodeURIComponent(q.trim())}`);
        onClose();
      }
    }
  };

  return (
    <div className="palette">
      <button type="button" className="palette__scrim" aria-label="Close search" onClick={onClose} />
      <div className="palette__panel" role="dialog" aria-label="Command Palette" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius-lg)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)", overflow: "hidden", maxWidth: 620 }}>
        <label className="palette__field" style={{ padding: "12px 16px", borderBottom: "1px solid var(--c-border)" }}>
          <Icon name="search" size={18} />
          <input
            autoFocus
            placeholder="Search courses, challenges, assessments, or commands..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ fontSize: "var(--text-base)" }}
          />
          <kbd className="shell__kbd">ESC to close</kbd>
        </label>

        <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px" }}>
          {filtered.length === 0 ? (
            <div className="palette__empty" style={{ textAlign: "center", padding: "24px" }}>
              <p style={{ margin: 0, color: "var(--c-text-muted)" }}>No matches found for “{q}”</p>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ marginTop: 12, fontSize: "12px" }}
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(q.trim())}`);
                  onClose();
                }}
              >
                Full search for “{q.trim()}” →
              </button>
            </div>
          ) : (
            <ul className="palette__list" style={{ margin: 0 }}>
              {filtered.map((item, idx) => {
                const isSelected = idx === selectedIdx;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="palette__row"
                      style={{
                        width: "100%",
                        background: isSelected ? "var(--c-surface-inset)" : "transparent",
                        
                        padding: "8px 12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        textAlign: "left",
                        cursor: "pointer"
                      }}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      onClick={() => {
                        navigate(item.to);
                        onClose();
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                        <span className="icon-slot" style={{ color: isSelected ? "var(--c-accent-primary)" : "var(--c-text-muted)" }}>
                          <Icon name={item.icon} size={16} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: isSelected ? "var(--c-text-primary)" : "var(--c-text-muted)", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--c-text-faint)" }}>
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <span className="chip chip--quiet" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
                        {item.category}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div style={{ padding: "8px 16px", background: "var(--c-surface-inset)", borderTop: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--c-text-faint)" }}>
          <span>Navigate with <kbd className="shell__kbd">↑</kbd> <kbd className="shell__kbd">↓</kbd></span>
          <span>Select with <kbd className="shell__kbd">↵ Enter</kbd></span>
        </div>
      </div>
    </div>
  );
}


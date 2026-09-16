/**
 * DrawerNav — the below-Standard collapse, and the menu command/dock keep.
 *
 * Extracted from src/nav/Shell.tsx:434-455. It renders the same `sections` with the
 * rail's tint idiom — the drawer is not a sixth model, it is the fallback form of
 * all five (SHR-R31; OR-O2).
 *
 * Focus management (contract §4): first destination focused on open, focus returned to
 * the opener on close, Escape closes, Tab wraps inside the panel.
 */

import { useEffect, useRef } from "react";
import { Icon } from "../../../icons/Icon";
import type { NavSection } from "../../../nav/nav-data";
import { NavItemLink, NavItemBody } from "./NavModel";

export function DrawerNav({
  sections,
  onClose,
  label = "Navigation"
}: {
  sections: NavSection[];
  onClose: () => void;
  label?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    node?.querySelector<HTMLElement>("a, button")?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const focusables = node.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  return (
    <div className="x-nav-drawer" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" className="x-nav-drawer__scrim" aria-label="Close navigation" onClick={onClose} />
      <nav className="x-nav-drawer__panel" ref={ref} aria-label={label} data-active-style="tint">
        <button type="button" className="x-nav-drawer__close" aria-label="Close" onClick={onClose}>
          <Icon name="x" size={18} />
        </button>
        {sections.map((section) => (
          <div className="x-nav-rail__group" key={section.title}>
            <p className="micro x-nav-rail__legend">{section.title}</p>
            {section.items.map((item) => (
              <NavItemLink
                key={item.label + item.to}
                to={item.to}
                className="x-nav-rail__item"
                onClick={onClose}
              >
                <NavItemBody item={item} iconSize={20} />
              </NavItemLink>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

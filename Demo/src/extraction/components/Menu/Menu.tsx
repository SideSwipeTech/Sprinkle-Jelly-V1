/**
 * Menu — the dropdown item list, generalized from the header-menu / dock-popover pattern.
 *
 * A menu-button + role="menu" pair following APG: the trigger owns aria-haspopup="menu"
 * and aria-expanded; opening moves DOM focus into the items; ArrowUp/ArrowDown roam (with
 * wrap), Home/End jump, a printable character jumps to the next matching label (typeahead),
 * Escape or Tab close — Escape returns focus to the trigger. Disabled items carry
 * aria-disabled and are skipped by roving, never pointer-events'd.
 *
 * Two hard-won invariants:
 *
 *   - The panel renders on the top layer (popover="manual") with fixed coordinates
 *     anchored to the trigger. Cards, rows and table wrappers that clip positioned
 *     descendants (overflow:auto/hidden) — and identities whose surfaces transform on
 *     hover — can never crop or shift it. Where the Popover API is missing the panel
 *     still renders fixed-positioned; it degrades to the old clipping behaviour, never
 *     to a missing menu.
 *   - Clicks on the trigger and the items stop at the menu. A Menu sitting beside a
 *     link inside a clickable card or row can never navigate that card — the shared
 *     rule is a link and a sibling menu button, and the component enforces its half.
 */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./Menu.css";

export interface MenuItem {
  id: string;
  label: string;
  icon?: IconName;
  /** Marks the item as a destructive action — styled, and a non-colour tell via icon. */
  destructive?: boolean;
  disabled?: boolean;
}

export interface MenuProps {
  /** Trigger content — the component supplies the button chrome. */
  trigger: ReactNode;
  /** Accessible name when the trigger is icon-only or ambiguous. */
  triggerLabel?: string;
  items: MenuItem[];
  onSelect: (id: string) => void;
  /** Panel alignment under the trigger. */
  align?: "start" | "end";
  /** Start open — for the sink/state matrix. */
  defaultOpen?: boolean;
}

export function Menu({
  trigger,
  triggerLabel,
  items,
  onSelect,
  align = "start",
  defaultOpen = false
}: MenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeIdx, setActiveIdx] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const labelWarned = useRef(false);

  if (!labelWarned.current && triggerLabel === undefined && typeof trigger !== "string") {
    labelWarned.current = true;
    console.warn(
      "Menu: a non-text trigger carries no accessible name — pass triggerLabel (e.g. \"Actions for <title>\")."
    );
  }

  const enabledIdx = items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => !item.disabled)
    .map(({ i }) => i);

  function openMenu(startAt: "first" | "last" = "first") {
    setOpen(true);
    const target =
      startAt === "last" ? enabledIdx[enabledIdx.length - 1] ?? 0 : enabledIdx[0] ?? 0;
    setActiveIdx(target);
  }

  function closeMenu(refocus = true) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function move(dir: 1 | -1) {
    if (enabledIdx.length === 0) return;
    const at = enabledIdx.indexOf(activeIdx);
    const next = enabledIdx[(at + dir + enabledIdx.length) % enabledIdx.length] ?? 0;
    setActiveIdx(next);
  }

  function typeahead(char: string) {
    const match = enabledIdx.find((i) =>
      items[i]!.label.toLowerCase().startsWith(char.toLowerCase())
    );
    if (match !== undefined) setActiveIdx(match);
  }

  function choose(idx: number) {
    const item = items[idx];
    if (!item || item.disabled) return;
    onSelect(item.id);
    closeMenu();
  }

  /** Anchor the top-layer panel to the trigger's viewport rect, flipping above
   *  the trigger and clamping inside the viewport when the panel would overflow. */
  const anchor = useCallback(() => {
    const btn = triggerRef.current;
    const panel = panelRef.current;
    if (!btn || !panel) return;
    const rect = btn.getBoundingClientRect();
    // The gap/edge come from the token, never a literal.
    const gap = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--space-2")
    ) || 0;
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = rect.bottom + gap;
    if (top + ph > vh - gap && rect.top - gap - ph > gap) top = rect.top - gap - ph;
    top = Math.max(gap, Math.min(top, Math.max(gap, vh - gap - ph)));

    let left = align === "end" ? rect.right - pw : rect.left;
    left = Math.max(gap, Math.min(left, Math.max(gap, vw - gap - pw)));

    setPos({ top, left });
  }, [align]);

  // Keep DOM focus on the roving item.
  useEffect(() => {
    if (open) itemRefs.current[activeIdx]?.focus();
  }, [open, activeIdx]);

  // Raise the panel to the top layer and anchor it; re-anchor on any scroll
  // (capture — inner scrollers like table wraps do not bubble) or resize.
  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (panel && typeof panel.showPopover === "function" && !panel.matches(":popover-open")) {
      try {
        panel.showPopover();
      } catch {
        /* Already open (StrictMode re-mount) — positioning proceeds either way. */
      }
    }
    anchor();
    window.addEventListener("resize", anchor);
    window.addEventListener("scroll", anchor, { capture: true, passive: true });
    return () => {
      window.removeEventListener("resize", anchor);
      window.removeEventListener("scroll", anchor, { capture: true });
    };
  }, [open, anchor]);

  // Pointer-down outside closes (focus stays where it lands). The panel sits in
  // place in the DOM — rootRef still contains it — so this check survives the
  // top-layer rendering untouched.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onTriggerKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open ? setActiveIdx(enabledIdx[0] ?? 0) : openMenu("first");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      open ? setActiveIdx(enabledIdx[enabledIdx.length - 1] ?? 0) : openMenu("last");
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu();
    }
  }

  function onMenuKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIdx(enabledIdx[0] ?? 0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIdx(enabledIdx[enabledIdx.length - 1] ?? 0);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    } else if (event.key === "Tab") {
      // Menus pass focus through — let the browser's default move focus on past
      // the trigger's slot (the panel sits there in DOM order), then close after
      // the transition so the unmount can never steal the destination.
      window.setTimeout(() => setOpen(false), 0);
    } else if (event.key.length === 1 && /\S/.test(event.key)) {
      typeahead(event.key);
    }
  }

  return (
    <div className="x-menu" ref={rootRef}>
      <button
        type="button"
        className="x-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={triggerLabel}
        ref={triggerRef}
        onClick={(event) => {
          // A menu activation is never the card's or the sibling link's.
          event.stopPropagation();
          open ? closeMenu(false) : openMenu();
        }}
        onKeyDown={onTriggerKeyDown}
      >
        {trigger}
      </button>

      {open ? (
        <div
          className="x-menu__panel"
          role="menu"
          popover="manual"
          id={menuId}
          aria-label={triggerLabel}
          onKeyDown={onMenuKeyDown}
          ref={panelRef}
          style={{
            top: pos?.top,
            left: pos?.left,
            visibility: pos ? undefined : "hidden"
          }}
        >
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="x-menu__item"
              data-destructive={item.destructive || undefined}
              aria-disabled={item.disabled || undefined}
              tabIndex={-1}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onMouseEnter={() => !item.disabled && setActiveIdx(idx)}
              onClick={(event) => {
                event.stopPropagation();
                choose(idx);
              }}
            >
              {item.icon || item.destructive ? (
                <span className="x-menu__item-icon" aria-hidden="true">
                  <Icon name={item.icon ?? "alert"} size={16} />
                </span>
              ) : null}
              <span className="x-menu__item-label">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

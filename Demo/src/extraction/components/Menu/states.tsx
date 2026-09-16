/**
 * Menu state matrix.
 */

import type { ReactNode } from "react";
import { Menu } from "./Menu";
import type { MenuItem } from "./Menu";

const ITEMS: MenuItem[] = [
  { id: "rename", label: "Rename file", icon: "edit" },
  { id: "duplicate", label: "Duplicate", icon: "copy" },
  { id: "history", label: "Version history", icon: "history" },
  { id: "share", label: "Share…", icon: "external-link", disabled: true },
  { id: "delete", label: "Delete", icon: "trash", destructive: true }
];

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "closed",
    label: "Closed (trigger only)",
    render: () => <Menu trigger="File actions" items={ITEMS} onSelect={() => {}} />
  },
  {
    key: "open",
    label: "Open — arrow keys roam, typeahead jumps",
    render: () => (
      <div className="x-menu__demo">
        <Menu trigger="File actions" items={ITEMS} onSelect={() => {}} defaultOpen />
      </div>
    )
  },
  {
    key: "open-end",
    label: "Open — end-aligned",
    render: () => (
      <div className="x-menu__demo x-menu__demo--end">
        <Menu trigger="File actions" items={ITEMS} onSelect={() => {}} align="end" defaultOpen />
      </div>
    )
  },
  {
    key: "icon-trigger",
    label: "Icon-only trigger (⋯ more)",
    render: () => (
      <div className="x-menu__demo">
        <Menu trigger="⋯" triggerLabel="More actions" items={ITEMS} onSelect={() => {}} defaultOpen />
      </div>
    )
  }
];

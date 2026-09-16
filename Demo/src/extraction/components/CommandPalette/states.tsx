/**
 * CommandPalette state matrix.
 */

import type { ReactNode } from "react";
import { CommandPalette } from "./CommandPalette";
import type { PaletteItem } from "./CommandPalette";

const ITEMS: PaletteItem[] = [
  { id: "nav-home", title: "Dashboard", subtitle: "Page destination", category: "Navigation", icon: "dashboard" },
  { id: "nav-courses", title: "Courses", subtitle: "Page destination", category: "Navigation", icon: "courses" },
  { id: "course-1", title: "Python Foundations", subtitle: "24 lessons · Programming track", category: "Course", icon: "courses" },
  { id: "chl-1", title: "Two-pointer warmup", subtitle: "Easy · arrays · strings", category: "Challenge", icon: "challenges" },
  { id: "mock-1", title: "Systems Design Mock", subtitle: "90 min · 12 items", category: "Assessment", icon: "clipboard" },
  { id: "tpl-1", title: "Flask starter", subtitle: "Python · 6 starter files", category: "Template", icon: "projects" }
];

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "closed",
    label: "Closed (renders nothing — its trigger is the ⌘K search field)",
    render: () => (
      <CommandPalette open={false} items={ITEMS} onSelect={() => {}} onClose={() => {}} />
    )
  },
  {
    key: "open-preview",
    label: "Open — preview list before a query",
    render: () => <CommandPalette items={ITEMS} onSelect={() => {}} onClose={() => {}} />
  },
  {
    key: "with-full-search",
    label: "With full-search escape",
    render: () => (
      <CommandPalette items={ITEMS} onSelect={() => {}} onClose={() => {}} onFullSearch={() => {}} />
    )
  },
  {
    key: "empty",
    label: "Empty index — honest absence",
    render: () => <CommandPalette items={[]} onSelect={() => {}} onClose={() => {}} />
  }
];

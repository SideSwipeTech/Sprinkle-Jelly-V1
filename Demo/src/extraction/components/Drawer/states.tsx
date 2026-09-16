/**
 * Drawer state matrix.
 */

import type { ReactNode } from "react";
import { Drawer } from "./Drawer";

const navItems = (
  <nav aria-label="Demo navigation">
    {["Home", "Courses", "Practice", "Assessments"].map((label, i) => (
      <a key={label} href="#" className="x-drawer__demo-link" data-on={i === 1 || undefined}>
        {label}
      </a>
    ))}
  </nav>
);

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "closed",
    label: "Closed (renders nothing)",
    render: () => (
      <Drawer open={false} onClose={() => {}} label="Navigation">
        {navItems}
      </Drawer>
    )
  },
  {
    key: "open-left",
    label: "Open — left (navigation drawer)",
    render: () => (
      <Drawer onClose={() => {}} label="Navigation">
        {navItems}
      </Drawer>
    )
  },
  {
    key: "open-heading",
    label: "Open — with heading (admin mobile-head pattern)",
    render: () => (
      <Drawer onClose={() => {}} label="Administration" heading="Administration">
        {navItems}
      </Drawer>
    )
  },
  {
    key: "open-right",
    label: "Open — right edge",
    render: () => (
      <Drawer onClose={() => {}} label="Panel" side="right">
        {navItems}
      </Drawer>
    )
  }
];

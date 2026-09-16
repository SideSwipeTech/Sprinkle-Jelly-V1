/**
 * Breadcrumbs state matrix — trail + current variants over the same items.
 */

import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";

const LEARNER = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Python Foundations", to: "/courses/python-foundations" },
  { label: "Knowledge Check" }
];

const ADMIN = [
  { label: "Administration" },
  { label: "Content" },
  { label: "Coding Challenges" }
];

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "trail",
    label: "Trail — linked ancestors, current page last",
    render: () => <Breadcrumbs items={LEARNER} />
  },
  {
    key: "trail-short",
    label: "Trail — two levels",
    render: () => <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Assessments" }]} />
  },
  {
    key: "current",
    label: "Current — the admin topbar crumb",
    render: () => <Breadcrumbs items={ADMIN} variant="current" />
  },
  {
    key: "current-root",
    label: "Current — root page (no context line)",
    render: () => <Breadcrumbs items={[{ label: "Admin Hub" }]} variant="current" />
  },
  {
    key: "empty",
    label: "Empty — honest absence renders nothing",
    render: () => <Breadcrumbs items={[]} />
  }
];

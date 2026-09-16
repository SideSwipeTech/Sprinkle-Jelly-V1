import type { IconName } from "@icons/keyline";
import type { StaffRole } from "./roles";

export interface AdminNavItem {
  label: string;
  to: string;
  icon: IconName;
  source?: string;
  roles?: StaffRole[];
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

/**
 * The operations hub sits at the administrative root under no group — a real
 * destination, never a redirect into a studio.
 */
export const ADMIN_HUB: AdminNavItem = { label: "Operations hub", to: "/admin", icon: "dashboard", source: "admin.html" };

/**
 * Staff nav — the learner platform sidebar is never mixed in. The groups are a
 * closed set of seven in the destinations table's order; grouping is labelling
 * only, never a second authorization boundary and never a second shell.
 */
export const ADMIN_NAV: AdminNavSection[] = [
  {
    title: "Assessments",
    items: [
      { label: "Assessment studio", to: "/admin/mocks", icon: "clipboard", source: "ADM-F5 one Mock-or-Company pipeline" },
      { label: "Tracks", to: "/admin/tracks", icon: "tracks", source: "ADM-F5 tracks studio" }
    ]
  },
  {
    title: "Content",
    items: [
      { label: "Courses", to: "/admin/curriculum", icon: "courses", source: "admin-curriculum.html" },
      { label: "Coding Challenges", to: "/admin/challenges", icon: "challenges", source: "admin-challenges.html" },
      { label: "Daily studio", to: "/admin/daily", icon: "daily", source: "ADM-R10 / hub attention" },
      { label: "Debug studio", to: "/admin/debug", icon: "debug", source: "ADM-R13 practice studios" },
      { label: "Project templates", to: "/admin/templates", icon: "projects", source: "ADM-F5 workspace templates" },
      { label: "Knowledge Base", to: "/admin/knowledge", icon: "info", source: "ADM-R46 Content > Knowledge Base" },
      { label: "Publish Approvals", to: "/admin/approvals", icon: "check", source: "ADM-R46 Content > Publish Approvals" },
      { label: "Editorial studio", to: "/admin/editorial", icon: "solutions", source: "ADM-R49" },
      { label: "Taxonomy", to: "/admin/taxonomy", icon: "skills", source: "ADM-R19" },
      { label: "Review Queue", to: "/admin/review", icon: "inbox", source: "admin-review-queue.html" },
      { label: "Topic requests", to: "/admin/requests", icon: "alert", source: "ADM-R24 topic requests" },
      { label: "Content gaps", to: "/admin/gaps", icon: "search", source: "ADM-F17" },
      { label: "Home suggestion", to: "/admin/suggestion", icon: "star", source: "ADM-R58" }
    ]
  },
  {
    title: "People",
    items: [
      { label: "Broadcasts", to: "/admin/broadcasts", icon: "notifications", source: "admin-broadcasts.html" },
      { label: "Users", to: "/admin/users", icon: "users", source: "ADM-R46 People > Users" }
    ]
  },
  {
    title: "Governance",
    items: [
      { label: "Data Lifecycle", to: "/admin/lifecycle", icon: "lock", source: "ADM-R46 Governance > Data Lifecycle" },
      { label: "Audit Trail", to: "/admin/audit", icon: "clock", source: "ADM-R46 Governance > Audit Trail" },
      { label: "Reporting", to: "/admin/reporting", icon: "grid", source: "admin-analytics.html" },
      { label: "Economy configuration", to: "/admin/economy", icon: "zap", source: "ADM-R46 Governance > Economy configuration" }
    ]
  },
  {
    title: "Credentials",
    items: [
      { label: "Certificates", to: "/admin/certificates", icon: "shield", source: "ADM-R46 Credentials > Certificates" },
      { label: "Credit correction", to: "/admin/credits", icon: "credits", source: "ADM-R11 rewards / economy" }
    ]
  },
  {
    title: "Operations",
    items: [
      { label: "Progress reset", to: "/admin/progress-reset", icon: "reset", source: "ADM-R46 Progress reset — nine scopes" },
      { label: "Identity Delivery", to: "/admin/identity", icon: "user", source: "ADM-R57" },
      { label: "Maintenance windows", to: "/admin/maintenance", icon: "settings", source: "ADM-R50" },
      { label: "Failed rewards", to: "/admin/rewards", icon: "reset", source: "ADM-R11 / hub failed_rewards" },
      { label: "Economy operations", to: "/admin/economy-operations", icon: "zap", source: "ADM-R44 frame only" },
      { label: "Recorded events", to: "/admin/sittings", icon: "history", source: "ADM-R23" }
    ]
  },
  {
    title: "Assistant",
    items: [
      { label: "Identity", to: "/admin/assistant", icon: "message", source: "ADM-R46 Assistant > Identity" },
      { label: "Responses", to: "/admin/assistant/responses", icon: "edit", source: "ADM-R46 Assistant > Responses" },
      { label: "Nudges", to: "/admin/assistant/nudges", icon: "sparkles", source: "ADM-R46 Assistant > Nudges" },
      { label: "Knowledge", to: "/admin/assistant/knowledge", icon: "info", source: "ADM-R46 Assistant > Knowledge Base administration" }
    ]
  }
];

export function adminBreadcrumb(pathname: string): { group: string; title: string } {
  for (const section of ADMIN_NAV) {
    const item = [...section.items]
      .sort((a, b) => b.to.length - a.to.length)
      .find((i) => i.to === pathname || pathname.startsWith(`${i.to}/`));
    if (item) return { group: `Administration / ${section.title}`, title: item.label };
  }
  // The administrative root — and any address no entry names — resolves to the
  // hub, which sits under no group.
  return { group: "Administration", title: ADMIN_HUB.label };
}

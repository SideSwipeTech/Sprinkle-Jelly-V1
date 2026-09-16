import type { IconName } from "@icons/keyline";

export interface NavItem {
  label: string;
  to: string;
  icon: IconName;
  match?: string;
}

export interface NavSection {
  title: string;
  icon: IconName;
  items: NavItem[];
}

/** Canonical learner navigation. Internal reference surfaces never appear here. */
export const SIDEBAR: NavSection[] = [
  {
    title: "Main",
    icon: "dashboard",
    items: [
      { label: "Home", to: "/", icon: "dashboard" },
      { label: "Skills", to: "/skills", icon: "skills" },
      { label: "Progress", to: "/progress", icon: "target" }
    ]
  },
  {
    title: "Learn",
    icon: "courses",
    items: [
      { label: "Courses", to: "/courses", icon: "courses" },
      { label: "Code Lab", to: "/codelab", icon: "codelab" }
    ]
  },
  {
    title: "Practice",
    icon: "challenges",
    items: [
      { label: "Challenges", to: "/challenges", icon: "challenges" },
      { label: "Daily Challenge", to: "/daily", icon: "daily" },
      { label: "Debug Detective", to: "/debug", icon: "debug" },
      { label: "Projects", to: "/projects", icon: "projects" },
      { label: "Solutions", to: "/solutions", icon: "solutions" }
    ]
  },
  {
    title: "Assessments",
    icon: "clipboard",
    items: [
      { label: "Overview", to: "/assessments", icon: "clipboard" },
      { label: "Browse", to: "/assessments/browse", icon: "browse-tests" },
      { label: "History", to: "/assessments/history", icon: "history" }
    ]
  },
  {
    title: "Personal",
    icon: "settings",
    items: [
      { label: "Achievements", to: "/achievements", icon: "achievements" },
      { label: "Notifications", to: "/notifications", icon: "notifications" },
      { label: "Certificates", to: "/certificates", icon: "shield" },
      { label: "Topic Requests", to: "/requests", icon: "inbox" },
      { label: "Kitchen Sink", to: "/kitchen-sink", icon: "layers" },
      { label: "Settings", to: "/settings", icon: "settings" }
    ]
  }
];

export const SIDEBAR_FLAT = SIDEBAR.flatMap((section) => section.items);

export function isExactNav(to: string): boolean {
  return to === "/" || to === "/assessments";
}

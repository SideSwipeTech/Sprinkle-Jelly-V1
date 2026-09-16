// GENERATED — ported from Prototyping/assets/js/icons.js by package/port-icons.mjs.
// Do not hand-edit; re-run the port instead.
//
// The Keyline construction contract, which every glyph obeys:
//   CANVAS     24x24, live area 2-22. Coordinates snap to 0.25, angles to 0/30/45/60/90.
//   STRUCTURE  stroke 1.5, currentColor, linecap BUTT, linejoin MITER. Hard and drafted.
//              This is the un-generic tell: Lucide, Phosphor and Heroicons are all
//              round/round, which is why they feel interchangeable.
//   CHARGE     stroke 1.9, the cool->hot gradient, linecap ROUND. Soft where the
//              structure is hard. One charge idea per glyph, and ONLY where the thing
//              has state, progress or liveness. A chevron has none, so it has no charge.
//   CHAMFER    Every containment form loses one corner to a 45 degree cut. Never two.
//
//   ms/mc      Micro redraws for 16px and below. Six glyphs measured as failing at true
//              16px get simplified geometry; the other 71 keep their paths.

export interface KeylineGlyph {
  label: string;
  cat: string;
  /** Structure layer — currentColor, butt caps, miter joins. */
  s: string;
  /** Charge layer — the gradient. Absent where a glyph has no state to express. */
  c?: string;
  /** Micro structure — used at <=16px where the base drawing collapses. */
  ms?: string;
  /** Micro charge. */
  mc?: string;
}

export const KEYLINE_CATEGORIES = ["action","domain","object","reward","shell","status"] as const;

export const KEYLINE: Record<string, KeylineGlyph> = {
  "achievements": {
    "label": "Achievements",
    "cat": "domain",
    "s": "<circle cx=\"12\" cy=\"10\" r=\"6\"/><path d=\"M8.25 15L6.5 21L12 18.5L17.5 21L15.75 15\"/>",
    "c": "<path d=\"M12 4A6 6 0 0 1 18 10\"/>"
  },
  "admin": {
    "label": "Admin",
    "cat": "shell",
    "s": "<path d=\"M12 3L20 6.25V11.5A9.75 9.75 0 0 1 12 21A9.75 9.75 0 0 1 4 11.5V6.25Z\"/>",
    "c": "<circle cx=\"12\" cy=\"10.5\" r=\"1.9\"/><path d=\"M12 12.4V15.5\"/>"
  },
  "alert": {
    "label": "Alert",
    "cat": "status",
    "s": "<path d=\"M10.75 3.75H13.25L21.1 17.75A1.85 1.85 0 0 1 19.5 20.5H4.5A1.85 1.85 0 0 1 2.9 17.75Z\"/>",
    "c": "<path d=\"M12 9.5V13.75\"/><circle cx=\"12\" cy=\"16.9\" r=\"1.3\" stroke=\"none\"/>"
  },
  "arrow-left": {
    "label": "Back",
    "cat": "action",
    "s": "<path d=\"M20 12H4.75\"/><path d=\"M10.25 6.5L4.75 12L10.25 17.5\"/>"
  },
  "arrow-right": {
    "label": "Continue",
    "cat": "action",
    "s": "<path d=\"M4 12H19.25\"/><path d=\"M13.75 6.5L19.25 12L13.75 17.5\"/>"
  },
  "briefcase": {
    "label": "Work",
    "cat": "object",
    "s": "<path d=\"M6 7.5H20.5V19.5H3.5V10Z\"/><path d=\"M8.75 7.5V5A1.5 1.5 0 0 1 10.25 3.5H13.75A1.5 1.5 0 0 1 15.25 5V7.5\"/>"
  },
  "browse-tests": {
    "label": "Mock Tests",
    "cat": "domain",
    "s": "<path d=\"M6.5 4.5H15L18.5 8V19A1.5 1.5 0 0 1 17 20.5H6.5A1.5 1.5 0 0 1 5 19V6A1.5 1.5 0 0 1 6.5 4.5Z\"/><path d=\"M8 11.5H13\"/><path d=\"M8 15H15\"/>",
    "c": "<path d=\"M15 4.5A3.5 3.5 0 0 1 18.5 8\"/>"
  },
  "challenges": {
    "label": "Challenges",
    "cat": "domain",
    "s": "<path d=\"M12 3L20 7.5V16.5L12 21L4 16.5V7.5Z\"/>",
    "c": "<path d=\"M8.5 13.5L12 10L15.5 13.5\"/>"
  },
  "check": {
    "label": "Success",
    "cat": "status",
    "s": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/>",
    "c": "<path d=\"M8 12.25L10.9 15.15L16.25 9\"/>"
  },
  "check-mark": {
    "label": "Confirm",
    "cat": "action",
    "s": "<path d=\"M4.75 12.5L9.75 17.5L19.25 8\"/>"
  },
  "chevron-down": {
    "label": "Expand",
    "cat": "action",
    "s": "<path d=\"M5.5 9.5L12 16L18.5 9.5\"/>"
  },
  "chevron-left": {
    "label": "Previous",
    "cat": "action",
    "s": "<path d=\"M14.5 5.5L8 12L14.5 18.5\"/>"
  },
  "chevron-right": {
    "label": "Next",
    "cat": "action",
    "s": "<path d=\"M9.5 5.5L16 12L9.5 18.5\"/>"
  },
  "chevron-up": {
    "label": "Collapse",
    "cat": "action",
    "s": "<path d=\"M5.5 14.5L12 8L18.5 14.5\"/>"
  },
  "clipboard": {
    "label": "Clipboard",
    "cat": "object",
    "s": "<path d=\"M8.5 5.5H6.5A1.5 1.5 0 0 0 5 7V19A1.5 1.5 0 0 0 6.5 20.5H17.5A1.5 1.5 0 0 0 19 19V7A1.5 1.5 0 0 0 17.5 5.5H15.5\"/><rect x=\"8.5\" y=\"3.5\" width=\"7\" height=\"4\" rx=\"1\"/><path d=\"M8.5 12H15.5\"/><path d=\"M8.5 16H13\"/>"
  },
  "clock": {
    "label": "Time",
    "cat": "status",
    "s": "<circle cx=\"12\" cy=\"12\" r=\"8.25\"/><path d=\"M12 7V12H16.25\"/>",
    "c": "<path d=\"M12 3.75A8.25 8.25 0 0 1 20.25 12\"/>"
  },
  "code": {
    "label": "Code",
    "cat": "action",
    "s": "<path d=\"M8.75 6.5L3.5 12L8.75 17.5\"/><path d=\"M15.25 6.5L20.5 12L15.25 17.5\"/>",
    "c": "<path d=\"M13.25 5.5L10.75 18.5\"/>"
  },
  "codelab": {
    "label": "CodeLab",
    "cat": "domain",
    "s": "<path d=\"M9.75 3.5V9L5.25 17.5A2 2 0 0 0 7 20.5H17A2 2 0 0 0 18.75 17.5L14.25 9V3.5\"/><path d=\"M8.5 3.5H15.5\"/>",
    "c": "<path d=\"M10 14.25L12.25 16.25L10 18.25\"/>",
    "ms": "<path d=\"M9.5 3.5V8.5L5 17.5A2 2 0 0 0 6.75 20.5H17.25A2 2 0 0 0 19 17.5L14.5 8.5V3.5\"/><path d=\"M8.25 3.5H15.75\"/>",
    "mc": "<path d=\"M9.25 14.5L13.25 17.25L9.25 20\"/>"
  },
  "companies": {
    "label": "Company Tests",
    "cat": "domain",
    "s": "<path d=\"M3.5 20.5V9.5H11V20.5\"/><path d=\"M11 20.5V4.5H20.5V20.5\"/><path d=\"M3 20.5H21\"/>",
    "c": "<path d=\"M14 8.5H17.5\"/><path d=\"M14 12.5H17.5\"/>",
    "ms": "<path d=\"M3.5 20.5V10H10.5V20.5\"/><path d=\"M10.5 20.5V4.5H20.5V20.5\"/><path d=\"M2.75 20.5H21.25\"/>",
    "mc": "<rect x=\"13.25\" y=\"8\" width=\"4.5\" height=\"4.5\" rx=\"1\" stroke=\"none\"/>"
  },
  "copy": {
    "label": "Copy",
    "cat": "action",
    "s": "<path d=\"M8 8V4.5H20.5V17H17\"/><path d=\"M6 8H16.5V20.5H3.5V10.5Z\"/>"
  },
  "courses": {
    "label": "Courses",
    "cat": "domain",
    "s": "<path d=\"M8 3.5H17.25L20.5 6.75V15.5\"/><path d=\"M4 8V19.5H17.5V10L14 6.5H4Z\"/><path d=\"M7 12H12\"/>",
    "c": "<path d=\"M7 15.75H13.5\"/>",
    "ms": "<path d=\"M5.5 3.5H14.5L19 8V20.5H5.5Z\"/><path d=\"M8.5 11.5H15.5\"/>",
    "mc": "<path d=\"M8.5 16H14.5\"/>"
  },
  "credits": {
    "label": "Credits",
    "cat": "domain",
    "s": "<rect x=\"3.5\" y=\"6.5\" width=\"15\" height=\"11\" rx=\"2.5\"/><path d=\"M20.75 10V14\"/>",
    "c": "<rect x=\"6\" y=\"9\" width=\"5.5\" height=\"6\" rx=\"1.25\" stroke=\"none\"/>"
  },
  "daily": {
    "label": "Daily Challenges",
    "cat": "domain",
    "s": "<path d=\"M4 6.5H20V17.5L17 20.5H4Z\"/><path d=\"M4 11H20\"/><path d=\"M8.5 3.5V6.5\"/><path d=\"M15.5 3.5V6.5\"/>",
    "c": "<rect x=\"9.5\" y=\"14\" width=\"5\" height=\"4\" rx=\"1\" stroke=\"none\"/>"
  },
  "dashboard": {
    "label": "Dashboard",
    "cat": "domain",
    "s": "<rect x=\"3.5\" y=\"3.5\" width=\"8\" height=\"8\"/><rect x=\"14\" y=\"3.5\" width=\"6.5\" height=\"4.25\"/><rect x=\"14\" y=\"10.25\" width=\"6.5\" height=\"10.25\"/>",
    "c": "<rect x=\"3.5\" y=\"14\" width=\"8\" height=\"6.5\" rx=\"0.5\"/>"
  },
  "debug": {
    "label": "Debug Detective",
    "cat": "domain",
    "s": "<path d=\"M3 12H6.75\"/><path d=\"M17.25 12H21\"/><path d=\"M6.75 8.5V15.5\"/><path d=\"M17.25 8.5V15.5\"/>",
    "c": "<path d=\"M6.75 12L9.5 8.75L12 15.25L14.5 9.5L17.25 12\"/>",
    "ms": "<path d=\"M3 12H7.5\"/><path d=\"M16.5 12H21\"/>",
    "mc": "<path d=\"M7.5 12L10.5 7L13.5 17L16.5 12\"/>"
  },
  "download": {
    "label": "Download",
    "cat": "action",
    "s": "<path d=\"M4 15.5V20.5H20V15.5\"/>",
    "c": "<path d=\"M12 3.5V14.75\"/><path d=\"M8.25 11L12 14.75L15.75 11\"/>"
  },
  "edit": {
    "label": "Edit",
    "cat": "action",
    "s": "<path d=\"M4 20L4.9 16.25L15.5 5.65L18.35 8.5L7.75 19.1Z\"/><path d=\"M13.75 7.4L16.6 10.25\"/>"
  },
  "error": {
    "label": "Error",
    "cat": "status",
    "s": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/>",
    "c": "<path d=\"M9.25 9.25L14.75 14.75\"/><path d=\"M14.75 9.25L9.25 14.75\"/>"
  },
  "external-link": {
    "label": "Open external",
    "cat": "action",
    "s": "<path d=\"M13.5 4.5H4.5V19.5H19.5V10.5\"/>",
    "c": "<path d=\"M11.5 12.5L20 4\"/><path d=\"M14.5 4H20V9.5\"/>"
  },
  "file": {
    "label": "File",
    "cat": "object",
    "s": "<path d=\"M6 3.5H14.5L19 8V20.5H6Z\"/><path d=\"M14.5 3.5V8H19\"/><path d=\"M9 13H16\"/><path d=\"M9 16.5H13.5\"/>"
  },
  "flame": {
    "label": "Streak",
    "cat": "reward",
    "s": "<path d=\"M4.5 20.5V15.5\"/><path d=\"M9.5 20.5V12\"/><path d=\"M14.5 20.5V8.5\"/>",
    "c": "<path d=\"M19.5 20.5V5.4\"/><circle cx=\"19.5\" cy=\"3.5\" r=\"1.35\" stroke=\"none\"/>"
  },
  "flask": {
    "label": "Dev / test mode",
    "cat": "shell",
    "s": "<path d=\"M9.75 3.5V9L5.25 17.5A2 2 0 0 0 7 20.5H17A2 2 0 0 0 18.75 17.5L14.25 9V3.5\"/><path d=\"M8.5 3.5H15.5\"/>",
    "c": "<path d=\"M7.25 16.5H16.75\"/>"
  },
  "folder": {
    "label": "Folder",
    "cat": "object",
    "s": "<path d=\"M3.5 19.5V5.5H9.5L12 8.5H20.5V19.5Z\"/>"
  },
  "folder-open": {
    "label": "Folder open",
    "cat": "object",
    "s": "<path d=\"M3.5 19.5V5.5H9.5L12 8.5H19V11\"/><path d=\"M3.5 19.5L6.5 11H21.25L18.5 19.5Z\"/>"
  },
  "grid": {
    "label": "Grid view",
    "cat": "object",
    "s": "<rect x=\"3.5\" y=\"3.5\" width=\"7.75\" height=\"7.75\"/><rect x=\"12.75\" y=\"3.5\" width=\"7.75\" height=\"7.75\"/><rect x=\"3.5\" y=\"12.75\" width=\"7.75\" height=\"7.75\"/><rect x=\"12.75\" y=\"12.75\" width=\"7.75\" height=\"7.75\"/>"
  },
  "help": {
    "label": "Help",
    "cat": "shell",
    "s": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/>",
    "c": "<path d=\"M9.4 9.9A2.6 2.6 0 1 1 12 12.9V14.25\"/><circle cx=\"12\" cy=\"17\" r=\"1.25\" stroke=\"none\"/>"
  },
  "history": {
    "label": "History",
    "cat": "status",
    "s": "<path d=\"M3.5 12A8.5 8.5 0 1 0 6.6 5.4L3.5 8.25\"/><path d=\"M12 7.75V12.5L16 14.5\"/>",
    "c": "<path d=\"M3.5 4V8.25H7.75\"/>"
  },
  "inbox": {
    "label": "Queue",
    "cat": "object",
    "s": "<path d=\"M3.5 13.5H8.25L9.75 16.25H14.25L15.75 13.5H20.5V20.5H3.5Z\"/>",
    "c": "<path d=\"M12 3.5V10.75\"/><path d=\"M8.75 7.5L12 10.75L15.25 7.5\"/>"
  },
  "info": {
    "label": "Info",
    "cat": "status",
    "s": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/>",
    "c": "<circle cx=\"12\" cy=\"8.1\" r=\"1.3\" stroke=\"none\"/><path d=\"M12 11.25V16.5\"/>"
  },
  "layers": {
    "label": "Taxonomy",
    "cat": "object",
    "s": "<path d=\"M12 11.5L20.5 15.75L12 20L3.5 15.75Z\"/><path d=\"M3.5 11.5L12 15.75L20.5 11.5\"/>",
    "c": "<path d=\"M12 3.5L20.5 7.75L12 12L3.5 7.75Z\"/>"
  },
  "lessons": {
    "label": "Lessons (reader)",
    "cat": "domain",
    "s": "<path d=\"M12 6.5C10 4.75 7.5 4.25 4 4.5V18C7.5 17.75 10 18.25 12 20\"/><path d=\"M12 6.5C14 4.75 16.5 4.25 20 4.5V18C16.5 17.75 14 18.25 12 20\"/>",
    "c": "<path d=\"M12 6.5V20\"/>"
  },
  "list": {
    "label": "List view",
    "cat": "object",
    "s": "<circle cx=\"5\" cy=\"7\" r=\"1.3\" stroke=\"none\"/><circle cx=\"5\" cy=\"12\" r=\"1.3\" stroke=\"none\"/><circle cx=\"5\" cy=\"17\" r=\"1.3\" stroke=\"none\"/><path d=\"M9.5 7H20.5\"/><path d=\"M9.5 12H20.5\"/><path d=\"M9.5 17H20.5\"/>"
  },
  "loader": {
    "label": "Loading",
    "cat": "status",
    "s": "<circle cx=\"12\" cy=\"12\" r=\"7.75\"/>",
    "c": "<path d=\"M12 4.25A7.75 7.75 0 0 1 19.75 12\"/>"
  },
  "lock": {
    "label": "Locked",
    "cat": "status",
    "s": "<rect x=\"4.5\" y=\"10.5\" width=\"15\" height=\"10\"/><path d=\"M8 10.5V7.5A4 4 0 0 1 16 7.5V10.5\"/>",
    "c": "<path d=\"M12 14V17\"/>"
  },
  "logout": {
    "label": "Sign out",
    "cat": "shell",
    "s": "<path d=\"M14 4.5H5V19.5H14\"/>",
    "c": "<path d=\"M11 12H20.5\"/><path d=\"M17.25 8.75L20.5 12L17.25 15.25\"/>"
  },
  "maximize": {
    "label": "Expand",
    "cat": "action",
    "s": "<path d=\"M4 9V4H9\"/><path d=\"M15 4H20V9\"/><path d=\"M20 15V20H15\"/><path d=\"M9 20H4V15\"/>"
  },
  "menu": {
    "label": "Menu",
    "cat": "shell",
    "s": "<path d=\"M4 12H20\"/><path d=\"M4 17H14.5\"/>",
    "c": "<path d=\"M4 7H20\"/>"
  },
  "message": {
    "label": "Send feedback",
    "cat": "action",
    "s": "<path d=\"M7 4.5H20.5V16.5H10L5.5 20.5V16.5H3.5V8Z\"/>",
    "c": "<path d=\"M12 8V13\"/><path d=\"M9.5 10.5H14.5\"/>"
  },
  "minus": {
    "label": "Remove",
    "cat": "action",
    "s": "<path d=\"M5.5 12H18.5\"/>"
  },
  "more": {
    "label": "More",
    "cat": "action",
    "s": "<circle cx=\"6\" cy=\"12\" r=\"1.3\" stroke=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"1.3\" stroke=\"none\"/><circle cx=\"18\" cy=\"12\" r=\"1.3\" stroke=\"none\"/>"
  },
  "notifications": {
    "label": "Notifications",
    "cat": "shell",
    "s": "<circle cx=\"9.5\" cy=\"12\" r=\"2\"/><path d=\"M13.75 8.5A5 5 0 0 1 13.75 15.5\"/>",
    "c": "<path d=\"M17.25 6A9 9 0 0 1 17.25 18\"/>"
  },
  "panel-left": {
    "label": "Open sidebar",
    "cat": "shell",
    "s": "<path d=\"M6 4.5H20.5V19.5H3.5V7Z\"/>",
    "c": "<path d=\"M9.25 5V19.5\"/>"
  },
  "panel-left-close": {
    "label": "Close sidebar",
    "cat": "shell",
    "s": "<path d=\"M6 4.5H20.5V19.5H3.5V7Z\"/><path d=\"M9.25 5V19.5\"/>",
    "c": "<path d=\"M16 9.5L13 12L16 14.5\"/>"
  },
  "play": {
    "label": "Run",
    "cat": "action",
    "s": "",
    "c": "<path d=\"M8.25 5.75L19 12L8.25 18.25Z\"/>"
  },
  "plus": {
    "label": "Add",
    "cat": "action",
    "s": "<path d=\"M12 5.5V18.5\"/><path d=\"M5.5 12H18.5\"/>"
  },
  "projects": {
    "label": "Projects",
    "cat": "domain",
    "s": "<path d=\"M12 3.25L20 8L12 12.75L4 8Z\"/><path d=\"M4 8V16L12 20.75V12.75\"/>",
    "c": "<path d=\"M20 8V16L12 20.75\"/>"
  },
  "reset": {
    "label": "Reset / retry",
    "cat": "status",
    "s": "<path d=\"M20.5 12A8.5 8.5 0 1 1 17.4 5.4L20.5 8.25\"/>",
    "c": "<path d=\"M20.5 4V8.25H16.25\"/>"
  },
  "save": {
    "label": "Save",
    "cat": "action",
    "s": "<path d=\"M4 4.5H16.5L20 8V20.5H4Z\"/><path d=\"M8 4.5V9.5H15V4.5\"/>",
    "c": "<path d=\"M8 16H16\"/>"
  },
  "search": {
    "label": "Search",
    "cat": "shell",
    "s": "<circle cx=\"10.75\" cy=\"10.75\" r=\"6.25\"/><path d=\"M15.4 15.4L20.5 20.5\"/>",
    "c": "<path d=\"M10.75 6.75A4 4 0 0 1 14.75 10.75\"/>"
  },
  "settings": {
    "label": "Settings",
    "cat": "shell",
    "s": "<path d=\"M3.5 7H20.5\"/><path d=\"M3.5 12H20.5\"/><path d=\"M3.5 17H20.5\"/><rect x=\"6.75\" y=\"5\" width=\"3.5\" height=\"4\" rx=\"1\"/><rect x=\"14\" y=\"15\" width=\"3.5\" height=\"4\" rx=\"1\"/>",
    "c": "<rect x=\"10.5\" y=\"10\" width=\"3.5\" height=\"4\" rx=\"1.25\" stroke=\"none\"/>",
    "ms": "<path d=\"M3.5 8.5H20.5\"/><path d=\"M3.5 15.5H20.5\"/><rect x=\"13.5\" y=\"5.75\" width=\"5\" height=\"5.5\" rx=\"1.5\"/>",
    "mc": "<rect x=\"5.5\" y=\"12.75\" width=\"5\" height=\"5.5\" rx=\"1.5\" stroke=\"none\"/>"
  },
  "shield": {
    "label": "Security",
    "cat": "shell",
    "s": "<path d=\"M12 3L20 6.25V11.5A9.75 9.75 0 0 1 12 21A9.75 9.75 0 0 1 4 11.5V6.25Z\"/>",
    "c": "<path d=\"M8.75 11.75L11 14L15.5 9.25\"/>"
  },
  "skills": {
    "label": "Skills",
    "cat": "domain",
    "s": "<path d=\"M4.75 10.25A7.5 7.5 0 1 1 12 19.5\"/><path d=\"M8.4 10.7A3.7 3.7 0 1 1 12 15.7\"/>",
    "c": "<path d=\"M12 4.5A7.5 7.5 0 0 1 19.05 9.4\"/><circle cx=\"19.05\" cy=\"9.4\" r=\"1.35\" stroke=\"none\"/>"
  },
  "solutions": {
    "label": "Solutions",
    "cat": "domain",
    "s": "<path d=\"M12 3L20 7.5V16.5L12 21L4 16.5V7.5Z\"/>",
    "c": "<path d=\"M8.5 12.25L11 14.75L15.5 9.75\"/>"
  },
  "sparkles": {
    "label": "New / highlight",
    "cat": "reward",
    "s": "<path d=\"M18.1 3.4L18.85 5.65L21.1 6.4L18.85 7.15L18.1 9.4L17.35 7.15L15.1 6.4L17.35 5.65Z\"/><path d=\"M6 15L6.6 16.9L8.5 17.5L6.6 18.1L6 20L5.4 18.1L3.5 17.5L5.4 16.9Z\"/>",
    "c": "<path d=\"M11.5 5L13.2 10.3L18.5 12L13.2 13.7L11.5 19L9.8 13.7L4.5 12L9.8 10.3Z\"/>"
  },
  "star": {
    "label": "Favourite",
    "cat": "reward",
    "s": "<path d=\"M12 3L14.27 8.87L20.56 9.22L15.68 13.2L17.29 19.28L12 15.87L6.71 19.28L8.32 13.2L3.44 9.22L9.73 8.87Z\"/>"
  },
  "sticky-note": {
    "label": "Notes",
    "cat": "object",
    "s": "<path d=\"M4 4.5H20V14.5L14.5 20.5H4Z\"/><path d=\"M20 14.5H14.5V20.5\"/>",
    "c": "<path d=\"M7.5 9.5H16\"/>"
  },
  "target": {
    "label": "Goal",
    "cat": "reward",
    "s": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><circle cx=\"12\" cy=\"12\" r=\"4.75\"/>",
    "c": "<circle cx=\"12\" cy=\"12\" r=\"1.6\" stroke=\"none\"/>"
  },
  "terminal": {
    "label": "Terminal",
    "cat": "action",
    "s": "<path d=\"M6 4.5H20.5V19.5H3.5V7Z\"/><path d=\"M7.25 9.5L10.25 12L7.25 14.5\"/>",
    "c": "<path d=\"M12.75 15H17\"/>"
  },
  "theme": {
    "label": "Theme",
    "cat": "shell",
    "s": "<circle cx=\"12\" cy=\"12\" r=\"7.25\"/>",
    "c": "<path d=\"M12 4.75A7.25 7.25 0 0 1 12 19.25Z\" stroke=\"none\"/>"
  },
  "tracks": {
    "label": "Tracks",
    "cat": "domain",
    "s": "<path d=\"M2.75 12H7.5\"/><path d=\"M7.5 12C10.25 12 10.25 6.75 13 6.75H21\"/>",
    "c": "<path d=\"M7.5 12C10.25 12 10.25 17.25 13 17.25H21\"/>"
  },
  "trash": {
    "label": "Delete",
    "cat": "action",
    "s": "<path d=\"M4.5 6.75H19.5\"/><path d=\"M9.5 6.75V4.75H14.5V6.75\"/><path d=\"M6.75 6.75L7.75 20.5H16.25L17.25 6.75\"/><path d=\"M10.5 10.25V17\"/><path d=\"M13.5 10.25V17\"/>"
  },
  "trophy": {
    "label": "Leaderboard",
    "cat": "reward",
    "s": "<path d=\"M7.5 3.5H16.5V9A4.5 4.5 0 0 1 7.5 9Z\"/><path d=\"M7.5 5H4.5V6.75A3 3 0 0 0 7.5 9.75\"/><path d=\"M16.5 5H19.5V6.75A3 3 0 0 1 16.5 9.75\"/><path d=\"M12 13.5V16.5\"/><path d=\"M8.5 16.5H15.5L16.75 20.5H7.25Z\"/>",
    "c": "<path d=\"M9.75 8L12 5.75L14.25 8\"/>",
    "ms": "<path d=\"M7 4H17V9.5A5 5 0 0 1 7 9.5Z\"/><path d=\"M12 14.5V17.5\"/><path d=\"M7.5 20.5H16.5\"/>",
    "mc": "<path d=\"M8.5 7.5H15.5\"/>"
  },
  "type": {
    "label": "Text",
    "cat": "action",
    "s": "<path d=\"M4.5 6.5V4.5H19.5V6.5\"/><path d=\"M12 4.5V19.5\"/><path d=\"M8.5 19.5H15.5\"/>"
  },
  "user": {
    "label": "Account",
    "cat": "shell",
    "s": "<circle cx=\"12\" cy=\"8.25\" r=\"3.75\"/><path d=\"M4.75 20.5A7.25 7.25 0 0 1 19.25 20.5\"/>"
  },
  "users": {
    "label": "Users",
    "cat": "shell",
    "s": "<circle cx=\"9.5\" cy=\"8.5\" r=\"3.5\"/><path d=\"M3 20.5A6.5 6.5 0 0 1 16 20.5\"/><path d=\"M16.25 5.5A3.5 3.5 0 0 1 16.25 12\"/><path d=\"M17.5 15.25A6.5 6.5 0 0 1 21 20.5\"/>"
  },
  "x": {
    "label": "Close",
    "cat": "action",
    "s": "<path d=\"M6.25 6.25L17.75 17.75\"/><path d=\"M17.75 6.25L6.25 17.75\"/>"
  },
  "zap": {
    "label": "XP",
    "cat": "reward",
    "s": "",
    "c": "<path d=\"M13.2 3.2L6 13.4H11.6L10.7 20.8L18 10.6H12.4Z\"/>"
  }
};

export type IconName = keyof typeof KEYLINE;

export const ICON_NAMES = Object.keys(KEYLINE) as IconName[];

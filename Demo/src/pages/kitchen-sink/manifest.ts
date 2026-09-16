/**
 * Kitchen-sink manifest — the order families render in, and the "Used on"
 * route list shown under each component's name (from extraction/coverage.md).
 * Components not listed render under "other" with no used-on line.
 */

export interface Family {
  key: string;
  title: string;
  blurb: string;
  /** Component folder names in render order. */
  components: string[];
}

export const FAMILIES: Family[] = [
  {
    key: "states",
    title: "Honest states & feedback",
    blurb: "Nothing missing renders as zero — the seven honesty keys, skeletons, badges and tells.",
    components: [
      "StateBlock", "Skeleton", "LoadingState", "Notice", "StaleNote",
      "DifficultyBadge", "SolvedBadge", "ProvenanceChip", "StatusText",
      "BadgeDot", "IconButton", "Avatar", "WeekStrip", "StreakDial"
    ]
  },
  {
    key: "controls",
    title: "Controls & forms",
    blurb: "Buttons, fields, selects, chips and gates — real disabled, real aria.",
    components: [
      "Button", "Field", "Select", "SearchField", "Slider",
      "Chip", "ChipGroup", "ChipTabBar", "SegmentedControl", "SettingsTabs",
      "FilterBar", "TagCloud", "AcknowledgeGate", "ConfirmByTyping"
    ]
  },
  {
    key: "containers",
    title: "Containers, rows & layout",
    blurb: "Cards, rows, panels and the grids pages sit on.",
    components: [
      "ListRow", "UnreadListRow", "HomeRow", "InsetPanel", "KeyValueRow",
      "GridTwo", "CardGrid", "WorkbenchLayout"
    ]
  },
  {
    key: "overlays",
    title: "Overlays & dialogs",
    blurb: "Everything that opens over the page — focus trapped, focus restored.",
    components: [
      "Dialog", "Popover", "HeaderMenu", "Drawer", "Sheet", "Tooltip",
      "Menu", "CommandPalette", "NotesPanel", "Tabs", "Breadcrumbs"
    ]
  },
  {
    key: "work",
    title: "Work surface",
    blurb: "Editor chrome, terminal, workbench — the build side of the platform.",
    components: [
      "Workbench", "CodeEditorChrome", "EditorTabs", "FileExplorer", "Terminal",
      "LanguageSelect", "HintLadder", "ProblemPanel", "SandboxCard", "CodeBlock",
      "VideoStage"
    ]
  },
  {
    key: "domain",
    title: "Domain widgets",
    blurb: "Assessment chrome, course widgets, admin compositions — one sitting shell serves Mock and Company.",
    components: [
      "ExamChrome", "BriefingRulesList", "ScorecardHero", "ProficiencyRow",
      "ReviewItemCard", "CompletionFactPanel", "ExamFlagRow",
      "ContinueCard", "CourseCard", "OutlineRow", "SequenceRow",
      "AchievementTile", "DataTable", "HealthTileGrid", "ToolCluster",
      "ActionPanel", "FormGrid", "MaintenancePreview",
      "RequestForm", "RequestRow", "CertificateCard", "CertificateSeal",
      "ErasureFlow", "PreferenceRow", "CompanionNameField",
      "RouteNotFound", "RestrictedNotice"
    ]
  },
  {
    key: "shell",
    title: "Shell & companion",
    blurb: "The frame itself, the five nav models, the admin frame, the companion corner.",
    components: [
      "AppFrame", "NavModel", "AdminFrame", "Companion", "ActivityHeatmap"
    ]
  },
  {
    key: "studio",
    title: "Admin authoring",
    blurb: "The studios' own surfaces — shared practice space, block + question editors, staff tooling.",
    components: [
      "PracticeEditorSpace", "SchedulingCard", "LessonBlockEditor",
      "QuestionEditor", "RecordedEventTimeline", "TemplateFileSet",
      "ActionRail"
    ]
  }
];

/** "Used on" — the demo routes each component appears on (coverage.md). */
export const USED_ON: Record<string, string[]> = {
  StateBlock: ["every page — the honest state"],
  Skeleton: ["new — loading placeholders everywhere"],
  LoadingState: ["new — pending reads"],
  Notice: ["/courses/:courseId/lessons/:lessonId", "/courses/:courseId/quiz", "/settings", "/admin/*"],
  StaleNote: ["/admin", "/progress"],
  DifficultyBadge: ["/challenges", "/daily", "/debug", "/tracks/:trackId"],
  SolvedBadge: ["/challenges", "/tracks/:trackId", "/solutions"],
  ProvenanceChip: ["/mock/:paperId/result", "/company/:companyId/result"],
  StatusText: ["/settings", "/assessments"],
  BadgeDot: ["shell header — inbox unread"],
  IconButton: ["shell header", "/admin/*", "companion"],
  Avatar: ["shell header", "/admin topbar", "/profile"],
  WeekStrip: ["/daily"],
  StreakDial: ["/daily"],

  Button: ["everywhere"],
  Field: ["/settings", "/projects/new", "/requests", "/admin/*"],
  Select: ["/codelab", "/challenges/:challengeId", "/courses/:courseId/video/:videoId"],
  SearchField: ["/courses", "/challenges", "/solutions", "/notifications"],
  Slider: ["/goals"],
  Chip: ["everywhere — filters, tags, counts"],
  ChipGroup: ["/challenges", "/solutions", "/courses"],
  ChipTabBar: ["/courses/:courseId", "/solutions/:solutionId"],
  SegmentedControl: ["/settings"],
  SettingsTabs: ["/settings"],
  FilterBar: ["/challenges", "/solutions", "/assessments/browse", "/notifications"],
  TagCloud: ["/challenges"],
  AcknowledgeGate: ["/mock/:paperId/start", "/company/:companyId/briefing", "/admin/broadcasts"],
  ConfirmByTyping: ["/admin/courses/:content/retirement"],

  ListRow: ["~25 pages — catalogues, histories, pickers"],
  UnreadListRow: ["/notifications"],
  HomeRow: ["/", "checklists on /courses/:courseId/project, /courses/:courseId/changes"],
  InsetPanel: ["/courses/:courseId", "/mock/:paperId (preflight)", "/restricted"],
  KeyValueRow: ["/assessments", "/company/:companyId", "/admin/people/:identity"],
  GridTwo: ["/tracks/:trackId", "/solutions/:solutionId", "/daily"],
  CardGrid: ["/challenges/dashboard", "/debug", "/achievements", "/projects/templates"],
  WorkbenchLayout: ["/codelab", "/challenges/:challengeId", "/debug/:caseId", "/projects/:projectId"],

  Dialog: ["new — replaces confirm/prompt/alert everywhere"],
  Popover: ["generic anchored panels"],
  HeaderMenu: ["shell header — inbox popover"],
  Drawer: ["nav < standard band", "/admin mobile"],
  Sheet: ["notes panel", "panels < tablet"],
  Tooltip: ["spine nav groups", "icon buttons"],
  Menu: ["dropdown actions"],
  CommandPalette: ["Ctrl-K — shell"],
  NotesPanel: ["quick notes — shell"],
  Tabs: ["/courses (family tabs)", "/settings"],
  Breadcrumbs: ["shell header", "/admin topbar"],

  Workbench: ["/codelab", "/challenges/:challengeId", "/debug/:caseId", "/projects/:projectId"],
  CodeEditorChrome: ["/codelab", "workbenches", "/courses/:courseId/lessons/:lessonId"],
  EditorTabs: ["/projects/:projectId", "/codelab"],
  FileExplorer: ["/projects/:projectId", "/codelab"],
  Terminal: ["/codelab", "/challenges/:challengeId", "/projects/:projectId"],
  LanguageSelect: ["/codelab", "/challenges/:challengeId"],
  HintLadder: ["/challenges/:challengeId", "/daily/:dayId"],
  ProblemPanel: ["/challenges/:challengeId", "/debug/:caseId"],
  SandboxCard: ["/courses/:courseId/lessons/:lessonId"],
  CodeBlock: ["/solutions/:solutionId", "/admin editorial fields"],
  VideoStage: ["/courses/:courseId/video/:videoId"],

  ExamChrome: ["/mock/:paperId/sitting", "/company/:companyId/sitting"],
  BriefingRulesList: ["/mock/:paperId", "/company/:companyId/briefing"],
  ScorecardHero: ["/mock/:paperId/result"],
  ProficiencyRow: ["/mock/:paperId/result"],
  ReviewItemCard: ["/mock/:paperId/result"],
  CompletionFactPanel: ["/company/:companyId/result"],
  ExamFlagRow: ["/company/:companyId/briefing"],
  ContinueCard: ["/", "/courses"],
  CourseCard: ["/courses"],
  OutlineRow: ["/courses/:courseId"],
  ChecklistRow: ["/courses/:courseId/project", "/courses/:courseId/changes", "/skills/:skillId"],
  SequenceRow: ["/tracks/:trackId"],
  AchievementTile: ["/achievements"],
  DataTable: ["/admin/* — people, analytics, economy, review"],
  HealthTileGrid: ["/admin", "/admin/analytics/reporting"],
  ToolCluster: ["/admin studios"],
  ActionPanel: ["/admin — destructive confirms"],
  FormGrid: ["/admin — settings forms"],
  MaintenancePreview: ["/admin — retirement sweeps"],
  RequestForm: ["/requests"],
  RequestRow: ["/requests"],
  CertificateCard: ["/profile"],
  CertificateSeal: ["/certificates/verify/:identifier"],
  ErasureFlow: ["/settings — erasure"],
  PreferenceRow: ["/settings", "/notifications/preferences"],
  CompanionNameField: ["/settings"],
  RouteNotFound: ["*"],
  RestrictedNotice: ["/restricted"],

  AppFrame: ["every learner page"],
  NavModel: ["every learner page — rail/spine/command/dock/dual"],
  AdminFrame: ["/admin/*"],
  Companion: ["every learner page — the corner"],
  ActivityHeatmap: ["/"],

  PracticeEditorSpace: ["/admin/challenges/:id", "/admin/daily/:date", "/admin/debug/:id"],
  SchedulingCard: ["/admin/daily/:date"],
  LessonBlockEditor: ["/admin/curriculum/lessons/:id"],
  QuestionEditor: ["/admin/mocks/:paperId/sections/:sectionId/questions/:questionId"],
  RecordedEventTimeline: ["/admin/sittings/:sittingId/events"],
  TemplateFileSet: ["/admin/templates/:id"],
  ActionRail: ["/admin/users/:userId"]
};

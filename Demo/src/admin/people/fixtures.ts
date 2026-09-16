/**
 * fixtures — the person directory's prepared data: the directory rows, the
 * moderation history and the administrative-action trail behind each person.
 * Fixture state only; session writes land in an in-memory overlay so the demo
 * reflects them after navigation (nothing here persists).
 *
 * Vocabulary is the domain's own: standing ("in good standing" is a statement,
 * never the absence of a badge), moderation, the three saved lenses, recorded
 * reads, an audited change. The directory is the main site's mirror — display
 * name, username, email, membership and registration date are externally
 * owned and read-only here.
 */

import { ROLE_LABEL, type AppRole } from "../roles";

/* ── Bounds and constants — named figures, never literals in copy ────────── */

export const ADMIN_SUSPENSION_PRESET_DAYS = [1, 7, 30, 90] as const;
export const ACCESS_SUSPENSION_MIN_DAYS = 1;
export const ACCESS_SUSPENSION_MAX_DAYS = 365;
export const ACCESS_FRESH_HANDOFF_MINUTES = 15;
export const PLATFORM_LIST_PAGE_ITEMS = 20;
export const ECONOMY_CORRECTION_BOUND_XP = 100_000;
export const ECONOMY_CORRECTION_BOUND_CREDITS = 10_000;
export const ECONOMY_LEVEL_CURVE_COEFFICIENT = 250;
export const ECONOMY_LEVEL_CURVE_EXPONENT = 2;
export const ECONOMY_LEVEL_DISPLAY_FLOOR = 1;
export const ECONOMY_LEVEL_DISPLAY_CAP = 100;

/** The one published level curve: level L begins at COEFFICIENT × (L−1)^EXPONENT
 *  XP, floored and capped at the display bounds. No reading page derives its own. */
export function levelForXp(xp: number): number {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / ECONOMY_LEVEL_CURVE_COEFFICIENT)) + 1;
  return Math.min(ECONOMY_LEVEL_DISPLAY_CAP, Math.max(ECONOMY_LEVEL_DISPLAY_FLOOR, level));
}

/* ── Named actions — where a name is not in the documents it is marked
 *   chosen, not stated ────────────────────────────────────────────────────── */

export const ACTION = {
  /** The four recorded reads are stated; their names are chosen, not stated. */
  readDirectory: "access.read_person_directory",
  readDetail: "access.read_person_detail",
  readStanding: "access.read_person_standing",
  readHistory: "access.read_person_history",
  exportPerson: "access.export_person",
  suspend: "access.suspend_person",
  lift: "access.lift_suspension",
  ban: "access.ban_person",
  unban: "access.unban_person",
  writeRole: "access.write_role",
  correctLedger: "economy.apply_correction"
} as const;

/* ── Standing — exactly three mutually exclusive states ───────────────────── */

export type StandingKind = "good" | "suspended" | "banned";

export interface Standing {
  kind: StandingKind;
  /** suspended only — the date access returns, in words. */
  until?: string;
  /** suspended and banned — the reason the record carries. */
  reason?: string;
}

export function standingText(s: Standing): string {
  if (s.kind === "suspended") return `Suspended until ${s.until ?? "an unread date"}`;
  if (s.kind === "banned") return "Banned";
  return "In good standing";
}

/* ── Roles — the filter enumerates whatever the permission rules hold ──────── */

/** The three grantable platform roles (admin/03-rules F25) — super
 *  administrator is granted nowhere inside. */
export type GrantableRole = "content_author" | "moderator" | "support";
export const GRANTABLE_ROLES: readonly GrantableRole[] = ["content_author", "moderator", "support"];
export const GRANTABLE_ROLE_LABEL: Record<GrantableRole, string> = {
  content_author: "Content author",
  moderator: "Moderator",
  support: "Support"
};

export interface ConfiguredRole {
  id: string;
  label: string;
}

/** The role filter's set: the sign-in roles plus the grantable platform
 *  roles — a fifth role is a configuration entry, never a screen change. */
export const CONFIGURED_ROLES: readonly ConfiguredRole[] = [
  { id: "instructor", label: ROLE_LABEL.instructor },
  { id: "admin", label: ROLE_LABEL.admin },
  { id: "superadmin", label: ROLE_LABEL.superadmin },
  { id: "content_author", label: GRANTABLE_ROLE_LABEL.content_author },
  { id: "moderator", label: GRANTABLE_ROLE_LABEL.moderator },
  { id: "support", label: GRANTABLE_ROLE_LABEL.support }
];

export function roleLabel(id: string): string {
  return (
    CONFIGURED_ROLES.find((r) => r.id === id)?.label ??
    ROLE_LABEL[id as AppRole] ??
    id
  );
}

/* ── The directory row ────────────────────────────────────────────────────── */

export interface ModerationEntry {
  id: string;
  at: string;
  /** The one individual super administrator's display name as it stood at the
   *  time — null marks the platform's own transition, attributed to nobody. */
  actor: string | null;
  action: string;
  reason: string | null;
  /** The private note kept with the record, never shown to the person. */
  note: string | null;
  /** Standing before and after, in words. */
  before: string;
  after: string;
}

export interface AdminActionEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
}

export interface PersonFixture {
  id: string;
  /** Main-site owned — read-only mirror fields. */
  name: string;
  username: string;
  email: string;
  registered: string;
  membership: "current" | "lapsed" | "none";
  /** The membership mirror's own health — a stale mirror states its age; a
   *  read failure is a fact about the connection, never about the person. */
  membershipMirror: { state: "fresh" | "stale" | "unreadable"; age?: string };
  lastActiveAt: string;
  lastActiveLabel: string;
  /** Held configured roles; empty = no role held. */
  roles: string[];
  standing: Standing;
  /** A projection owing a verify the main site has not answered. */
  boundaryFault: boolean;
  /** The operator's own account — the viewer is told so. */
  self: boolean;
  /** Headline figures — null means no module publishes a reading for staff,
   *  which renders Unavailable and never a zero. */
  xp: number | null;
  credits: number | null;
  streakDays: number | null;
  solvedCount: number | null;
  enrolled: { id: string; title: string }[];
  progress: { label: string; detail: string }[] | null;
  /** null = the history cannot be read — unavailable, never "no history". */
  moderation: ModerationEntry[] | null;
  adminActions: AdminActionEntry[];
}

const BASE: PersonFixture[] = [
  {
    id: "u-yash", name: "Yash", username: "yash", email: "yash@labs.local",
    registered: "3 Jan 2026", membership: "current",
    membershipMirror: { state: "fresh" },
    lastActiveAt: "2026-08-19T18:04:00Z", lastActiveLabel: "Today",
    roles: ["superadmin"], standing: { kind: "good" }, boundaryFault: false,
    self: true,
    xp: 28450, credits: 42, streakDays: 23, solvedCount: 142,
    enrolled: [
      { id: "python-foundations", title: "Foundations of Python" },
      { id: "dsa-patterns", title: "Patterns in Data Structures" },
      { id: "sql-readiness", title: "SQL for Readiness" }
    ],
    progress: [
      { label: "Foundations of Python", detail: "8 of 12 lessons" },
      { label: "Patterns in Data Structures", detail: "3 of 10 lessons" },
      { label: "SQL for Readiness", detail: "1 of 8 lessons" }
    ],
    moderation: [
      {
        id: "me-y1", at: "2 Mar 2026", actor: null,
        action: "Suspension ended", reason: null,
        note: "The platform's own transition against the human act that set it; it announces nothing.",
        before: "Suspended until 2 Mar 2026", after: "In good standing"
      },
      {
        id: "me-y2", at: "23 Feb 2026", actor: "Meera",
        action: "Suspension set", reason: "Duplicate sign-in dispute under review",
        note: "Cleared once the main site answered.",
        before: "In good standing", after: "Suspended until 2 Mar 2026"
      }
    ],
    adminActions: [
      { id: "aa-y1", at: "2 Mar 2026", actor: "The platform", action: "Suspension ended — standing returned to in good standing" },
      { id: "aa-y2", at: "23 Feb 2026", actor: "Meera", action: "access.suspend_person — reason recorded" }
    ]
  },
  {
    id: "u-meera", name: "Meera", username: "meera", email: "meera@labs.local",
    registered: "19 Feb 2026", membership: "current",
    membershipMirror: { state: "fresh" },
    lastActiveAt: "2026-08-19T09:41:00Z", lastActiveLabel: "Today",
    roles: ["moderator", "support"], standing: { kind: "good" }, boundaryFault: false,
    self: false,
    xp: 12400, credits: 28, streakDays: 9, solvedCount: 61,
    enrolled: [{ id: "dsa-patterns", title: "Patterns in Data Structures" }],
    progress: [{ label: "Patterns in Data Structures", detail: "6 of 10 lessons" }],
    moderation: [],
    adminActions: [
      { id: "aa-m1", at: "14 Aug 2026", actor: "Yash", action: "access.write_role — moderator granted, reason recorded" }
    ]
  },
  {
    id: "u-arun", name: "Arun", username: "arun", email: "arun@labs.local",
    registered: "7 Apr 2026", membership: "none",
    membershipMirror: { state: "fresh" },
    lastActiveAt: "2026-08-11T15:22:00Z", lastActiveLabel: "8 days ago",
    roles: [], standing: { kind: "suspended", until: "12 Sep 2026", reason: "Repeated disruptive conduct" },
    boundaryFault: false, self: false,
    xp: 2100, credits: 0, streakDays: 0, solvedCount: 12,
    enrolled: [],
    progress: null,
    moderation: [
      {
        id: "me-a1", at: "12 Aug 2026", actor: "Yash",
        action: "Suspension set", reason: "Repeated disruptive conduct",
        note: "Two review-queue items resolved against the same pattern.",
        before: "In good standing", after: "Suspended until 12 Sep 2026"
      }
    ],
    adminActions: [
      { id: "aa-a1", at: "12 Aug 2026", actor: "Yash", action: "access.suspend_person — reason recorded" }
    ]
  },
  {
    id: "u-kira", name: "Kira", username: "kira", email: "kira@labs.local",
    registered: "28 May 2026", membership: "lapsed",
    membershipMirror: { state: "stale", age: "2 days" },
    lastActiveAt: "2026-08-02T11:05:00Z", lastActiveLabel: "17 days ago",
    roles: [], standing: { kind: "banned", reason: "Account sharing confirmed by the main site" },
    boundaryFault: false, self: false,
    xp: 5400, credits: 19, streakDays: null, solvedCount: 34,
    enrolled: [
      { id: "sql-readiness", title: "SQL for Readiness" },
      { id: "js-runtime", title: "JavaScript Runtime" }
    ],
    progress: [{ label: "SQL for Readiness", detail: "5 of 8 lessons" }],
    moderation: [
      {
        id: "me-k1", at: "30 Jul 2026", actor: "Yash",
        action: "Ban recorded", reason: "Account sharing confirmed by the main site",
        note: "Sign-ins ended as part of the same act.",
        before: "In good standing", after: "Banned"
      }
    ],
    adminActions: [
      { id: "aa-k1", at: "30 Jul 2026", actor: "Yash", action: "access.ban_person — reason recorded" }
    ]
  },
  {
    id: "u-devan", name: "Devan", username: "devan", email: "devan@labs.local",
    registered: "15 Jun 2026", membership: "current",
    membershipMirror: { state: "unreadable" },
    lastActiveAt: "2026-08-18T20:15:00Z", lastActiveLabel: "Yesterday",
    roles: [], standing: { kind: "good" }, boundaryFault: true, self: false,
    xp: 900, credits: null, streakDays: 4, solvedCount: 8,
    enrolled: [{ id: "react-interfaces", title: "React Interfaces" }],
    progress: [{ label: "React Interfaces", detail: "2 of 9 lessons" }],
    moderation: null,
    adminActions: []
  },
  {
    id: "u-sana", name: "Sana", username: "sana", email: "sana@labs.local",
    registered: "9 Jan 2026", membership: "none",
    membershipMirror: { state: "fresh" },
    lastActiveAt: "2026-08-19T07:30:00Z", lastActiveLabel: "Today",
    roles: ["instructor"], standing: { kind: "good" }, boundaryFault: false,
    self: false,
    xp: 30200, credits: 55, streakDays: 41, solvedCount: 168,
    enrolled: [],
    progress: [{ label: "Authored content", detail: "2 courses in review" }],
    moderation: [],
    adminActions: [
      { id: "aa-s1", at: "1 Jun 2026", actor: "Yash", action: "access.write_role — instructor granted, reason recorded" }
    ]
  },
  {
    id: "u-rhea", name: "Rhea", username: "rhea", email: "rhea@labs.local",
    registered: "22 Jul 2026", membership: "lapsed",
    membershipMirror: { state: "stale", age: "6h" },
    lastActiveAt: "2026-08-05T16:48:00Z", lastActiveLabel: "14 days ago",
    roles: [], standing: { kind: "good" }, boundaryFault: false, self: false,
    xp: 150, credits: 3, streakDays: null, solvedCount: 1,
    enrolled: [],
    progress: null,
    moderation: [],
    adminActions: []
  },
  {
    id: "u-tom", name: "Tom", username: "tom", email: "tom@labs.local",
    registered: "30 Jul 2026", membership: "current",
    membershipMirror: { state: "fresh" },
    lastActiveAt: "2026-08-17T13:12:00Z", lastActiveLabel: "2 days ago",
    roles: [], standing: { kind: "good" }, boundaryFault: true, self: false,
    xp: 4700, credits: 11, streakDays: 6, solvedCount: 19,
    enrolled: [{ id: "python-foundations", title: "Foundations of Python" }],
    progress: [{ label: "Foundations of Python", detail: "4 of 12 lessons" }],
    moderation: [],
    adminActions: []
  }
];

/* ── The session overlay — writes on a person land here, read back on the
 *  next mount. The change and its record commit together or not at all. ──── */

interface PersonOverlay {
  standing?: Standing;
  roles?: string[];
  xp?: number | null;
  credits?: number | null;
  history: ModerationEntry[];
  actions: AdminActionEntry[];
}

const overlays = new Map<string, PersonOverlay>();
let writeSeq = 0;

function overlayFor(id: string): PersonOverlay {
  let o = overlays.get(id);
  if (!o) {
    o = { history: [], actions: [] };
    overlays.set(id, o);
  }
  return o;
}

export function allPeople(): PersonFixture[] {
  return BASE.map((p) => findPerson(p.id) ?? p);
}

export function findPerson(id: string | undefined): PersonFixture | undefined {
  const base = BASE.find((p) => p.id === id);
  if (!base) return undefined;
  const o = overlays.get(base.id);
  if (!o) return base;
  return {
    ...base,
    standing: o.standing ?? base.standing,
    roles: o.roles ?? base.roles,
    xp: o.xp === undefined ? base.xp : o.xp,
    credits: o.credits === undefined ? base.credits : o.credits,
    moderation:
      base.moderation === null ? null : [...o.history, ...base.moderation],
    adminActions: [...o.actions, ...base.adminActions]
  };
}

/** The standing write, its history entry and its trail row — one act. */
export function writeStanding(
  id: string,
  next: Standing,
  entry: Omit<ModerationEntry, "id">,
  action: string
) {
  const o = overlayFor(id);
  o.standing = next;
  o.history.unshift({ id: `me-w${++writeSeq}`, ...entry });
  o.actions.unshift({ id: `aa-w${writeSeq}`, at: "Today", actor: "This session", action });
}

/** Granting or removing a role — an audited change. */
export function writeRoles(id: string, roles: string[], action: string) {
  const o = overlayFor(id);
  o.roles = roles;
  o.actions.unshift({ id: `aa-w${++writeSeq}`, at: "Today", actor: "This session", action });
}

/** A recorded read lands on the person's trail — the record is what answers
 *  who looked at their data. */
export function recordAction(id: string, action: string) {
  overlayFor(id).actions.unshift({ id: `aa-w${++writeSeq}`, at: "Today", actor: "This session", action });
}

/** A compensating entry — the ledger moves, the event it repairs is never
 *  rewritten, and the correction lands in the trail. */
export function writeCorrection(id: string, ledger: "xp" | "credits", delta: number, action: string) {
  const o = overlayFor(id);
  const base = BASE.find((p) => p.id === id);
  if (!base) return;
  if (ledger === "xp") o.xp = (o.xp ?? base.xp ?? 0) + delta;
  else o.credits = (o.credits ?? base.credits ?? 0) + delta;
  o.actions.unshift({ id: `aa-w${++writeSeq}`, at: "Today", actor: "This session", action });
}

/* ── The fresh-handoff fixture (admin.F11 tier 3) ─────────────────────────── */

export const HANDOFF = { fresh: true, ageMinutes: 6 };

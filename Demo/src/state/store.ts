import { COURSES, LESSONS, VIDEO_COURSES, type Course } from "@data/catalog";
import { readPersistedRole, persistRole, type AppRole } from "@admin/roles";
import { createDemoStore } from "./demo";
import type { LessonBlock } from "../extraction/components/LessonBlockEditor/LessonBlockEditor";

const KEY = "wp.store";

/** An administrative void on a finished assessment test — recorded with its
 *  closed reason. Its presence on a result row means invalidated: the row
 *  stays in history flagged, the measured attempt is restored, and open
 *  practice re-locks until a new sitting finalizes. */
export interface ResultInvalidation {
  reason: string;
  at: string;
}

/**
 * The copy of a lesson a publish lands in the live outline. The studio edits
 * a draft on the tree; nothing typed there reaches a learner until a publish
 * writes this row — that is the whole draft/live separation in the demo.
 */
export interface PublishedLessonSnapshot {
  lessonId: string;
  courseId: string;
  title: string;
  type: string;
  minutes?: number;
  blocks?: LessonBlock[];
  publishedAt: string;
}

export interface Store {
  enrolled: string[];
  /** The one Continue definition's persisted half — the last place the learner
   *  was active. `percent` is denormalised for older readers; the live figure
   *  is always derived from the published outline via the adapter selector. */
  continue: { courseId: string; lessonId: string; percent: number; family?: "interactive" | "video" } | null;
  completedLessons: string[];
  /** lessonId → the published copy a learner reads. Written only by a publish. */
  coursePublications: Record<string, PublishedLessonSnapshot>;
  /** videoCourseId → chapter indexes the learner marked covered. */
  videoProgress: Record<string, number[]>;
  notes: { id: string; text: string; at: string }[];
  credits: number;
  creditClaimed: boolean;
  mockResults: { paperId: string; score: number; at: string; answers: number[]; invalidation?: ResultInvalidation | null }[];
  companyResults: {
    companyId: string;
    at: string;
    /** The owned paper this sitting ran — absent only on rows predating the
     *  per-paper model; those read as the company's first paper. */
    paperId?: string;
    paperTitle?: string;
    answered?: number;
    total?: number;
    invalidation?: ResultInvalidation | null;
  }[];
  solved: string[];
  /** Practice slice — challenges / daily / debug learner state. */
  /** Challenges carrying a submission of record that was never a platform fault — "Submitted", whatever its verdict (challenges 03 §4.3). */
  submitted: string[];
  /** Device-local editor drafts, keyed `${challengeId}:${language}` — drafts never cross languages or accounts (challenges §4.3, daily.F30). */
  challengeDrafts: Record<string, string>;
  /** The learner's own finalized submissions — platform faults write no row. */
  submissions: {
    id: string;
    challengeId: string;
    language: string;
    verdict: "accepted" | "wrong_answer" | "runtime_error" | "time_limit";
    casesPassed: number;
    casesTotal: number;
    at: string;
    /** The submitted source — lets "My accepted code" show the real text. */
    code?: string;
  }[];
  /** Product dates (ISO) whose Daily the learner has completed. */
  dailySolved: string[];
  /** Debug cases carrying a submission of record that was never a platform fault. */
  debugSubmitted: string[];
  /** The learner's own finalized debug validations — a platform fault writes
   *  no row, and the kept `code` is what "Restore last submitted" returns. */
  debugSubmissions: {
    id: string;
    caseId: string;
    language: string;
    verdict: "accepted" | "wrong_answer" | "runtime_error" | "time_limit";
    casesPassed: number;
    casesTotal: number;
    at: string;
    code?: string;
  }[];
  /** The one active debug timed window (debug.F33) — null when none runs. */
  debugWindow: { caseId: string; startedAt: string; endsAt: string; minutes: number } | null;
  /** Timed windows spent per case — the allowance is consumed at Start. */
  debugWindowsUsed: Record<string, number>;
  /** Track completion is durable and dated (challenges §4.6). */
  trackCompletions: Record<string, string>;
  session: { signedIn: boolean; name: string; role: AppRole };
  notificationsRead: string[];
  searchQuery: string;
  debugResolved: string[];
  projects: {
    id: string;
    name: string;
    template: string;
    at: string;
    files: { path: string; content: string }[];
    activePath: string;
    output: string;
  }[];
  lessonNotes: Record<string, string>;
  /** CodeLab scratch files per starter language, kept on this device. */
  codelabFiles: Record<string, { path: string; content: string }[]>;
  scratchpad: string;
  userSettings: {
    theme: string;
    reducedMotion: boolean;
    /** Presentation of the one stream (AST-R1): the companion, or plain messages. */
    companion: "companion" | "plain";
    /** Platform-wide volume (AST-R8): present, or quiet. It may only tighten a surface. */
    companionVolume: "present" | "quiet";
    /** The learner's own name for their companion (AST-R34). Empty = the frozen default, WizBit. */
    companionName: string;
    editorTabSize: number;
    lineNumbers: boolean;
    wordWrap: boolean;
    displayName: string;
  };
  notifPrefs: { product: boolean };
  creditLedger: { id: string; at: string; delta: number; reason: string }[];
  profile: {
    level: number;
    xp: number;
    xpToNext: number;
    streak: number;
    solvedCount: number;
    membershipEnd: string;
  };
  certificates: {
    id: string;
    title: string;
    awarded: string;
    valid: boolean;
    visibility: "public" | "hidden";
    hash: string;
    issuer: string;
  }[];
  adminUsers: {
    id: string;
    name: string;
    email: string;
    status: "active" | "disabled";
    enrolled: string[];
    credits: number;
  }[];
  adminCourses: { id: string; title: string; lifecycle: "draft" | "submitted" | "published" | "archived"; revision: number; container: string }[];
  adminChallenges: { id: string; title: string; lifecycle: "draft" | "submitted" | "published" | "archived"; revision: number }[];
  adminReports: {
    id: string;
    target: string;
    domain: "courses" | "challenges" | "projects" | "debug";
    status: "open" | "in_review" | "resolved" | "dismissed";
    note: string;
    editor: string;
  }[];
  adminBroadcasts: {
    id: string;
    body: string;
    status: "held" | "going" | "stopped" | "finished";
    estimated: number | null;
    delivered: number;
    failed: number;
    skipped: number;
    stopped: number;
  }[];
  adminApprovals: { id: string; kind: "course" | "challenge"; title: string; revision: number; status: "pending" | "approved" | "refused" }[];
  adminTickets: { id: string; title: string; status: "open" | "in_review" | "resolved" | "dismissed" }[];
  adminAudit: { id: string; at: string; actor: string; action: string }[];
  adminSuggestion: { item: string; line: string } | null;
  adminDailyGap: string;
  adminEditorial: { id: string; title: string; body: string }[];
  adminTaxonomy: { id: string; label: string; parent: string; archived: boolean }[];
  adminTracks: { id: string; title: string; count: number; outline: string }[];
  adminTemplates: { id: string; title: string; summary: string }[];
  adminPapers: { id: string; title: string; kind: "mock" | "company"; minutes: number; locked: boolean; settings: string }[];
  adminKnowledge: { id: string; title: string; body: string; published: boolean }[];
  adminDebugCases: { id: string; title: string; lifecycle: string }[];
  assistant: { note: string; responses: string; nudges: string; gate: string };
  identityEvents: { id: string; kind: string; age: string; state: "waiting" | "applied" | "failed"; error: string }[];
  failedRewards: { id: string; person: string; amount: number; retried: boolean }[];
  lifecycleHold: boolean;
  maintenanceNote: string;
  searchMisses: { phrase: string }[];
}

function emptyDemo(): Store {
  return createDemoStore(readPersistedRole());
}

function read(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyDemo();
    const parsed = JSON.parse(raw) as Partial<Store>;
    const base = emptyDemo();
    return {
      ...base,
      ...parsed,
      session: {
        ...base.session,
        ...parsed.session,
        role: parsed.session?.role ?? readPersistedRole()
      },
      profile: { ...base.profile, ...parsed.profile },
      projects: (parsed.projects ?? base.projects).map((p) => ({
        files: p.files ?? [{ path: "README.md", content: "# notes\n" }],
        activePath: p.activePath ?? p.files?.[0]?.path ?? "README.md",
        output: p.output ?? "",
        id: p.id,
        name: p.name,
        template: p.template,
        at: p.at
      })),
      certificates: parsed.certificates ?? base.certificates,
      scratchpad: parsed.scratchpad ?? base.scratchpad,
      codelabFiles: parsed.codelabFiles ?? base.codelabFiles,
      coursePublications: parsed.coursePublications ?? base.coursePublications,
      videoProgress: parsed.videoProgress ?? base.videoProgress,
      userSettings: migrateUserSettings({ ...base.userSettings, ...parsed.userSettings }),
      adminUsers: parsed.adminUsers ?? base.adminUsers,
      adminCourses: parsed.adminCourses ?? base.adminCourses,
      adminChallenges: parsed.adminChallenges ?? base.adminChallenges,
      adminReports: parsed.adminReports ?? base.adminReports,
      adminBroadcasts: parsed.adminBroadcasts ?? base.adminBroadcasts,
      adminApprovals: parsed.adminApprovals ?? base.adminApprovals,
      adminTickets: parsed.adminTickets ?? base.adminTickets,
      adminAudit: parsed.adminAudit ?? base.adminAudit,
      adminSuggestion: parsed.adminSuggestion === undefined ? base.adminSuggestion : parsed.adminSuggestion,
      adminDailyGap: parsed.adminDailyGap ?? base.adminDailyGap,
      adminEditorial: parsed.adminEditorial ?? base.adminEditorial,
      adminTaxonomy: parsed.adminTaxonomy ?? base.adminTaxonomy,
      adminTracks: parsed.adminTracks ?? base.adminTracks,
      adminTemplates: parsed.adminTemplates ?? base.adminTemplates,
      adminPapers: parsed.adminPapers ?? base.adminPapers,
      adminKnowledge: parsed.adminKnowledge ?? base.adminKnowledge,
      adminDebugCases: parsed.adminDebugCases ?? base.adminDebugCases,
      assistant: { ...base.assistant, ...parsed.assistant },
      identityEvents: parsed.identityEvents ?? base.identityEvents,
      failedRewards: parsed.failedRewards ?? base.failedRewards,
      searchMisses: parsed.searchMisses ?? base.searchMisses
    };
  } catch {
    return emptyDemo();
  }
}

/** Earlier builds stored the companion as expanded / minimized / muted; canon has two axes. */
function migrateUserSettings(u: Store["userSettings"]): Store["userSettings"] {
  const legacy = u.companion as unknown as string;
  const companion: Store["userSettings"]["companion"] = legacy === "plain" ? "plain" : "companion";
  const volume: Store["userSettings"]["companionVolume"] = u.companionVolume === "quiet" || legacy === "minimized" ? "quiet" : "present";
  return { ...u, companion, companionVolume: volume, companionName: typeof u.companionName === "string" ? u.companionName : "" };
}

function write(next: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* visit-only */
  }
}

let memory = typeof window === "undefined" ? createDemoStore("learner") : read();
const listeners = new Set<() => void>();

function emit() {
  write(memory);
  listeners.forEach((l) => l());
}

export function getStore(): Store {
  return memory;
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function patchStore(partial: Partial<Store>) {
  memory = { ...memory, ...partial };
  emit();
}

export function enroll(courseId: string) {
  if (memory.enrolled.includes(courseId)) return;
  memory = { ...memory, enrolled: [...memory.enrolled, courseId] };
  emit();
}

export function isEnrolled(course: Course): boolean {
  return memory.enrolled.includes(course.id) || Boolean(course.enrolled);
}

export function completeLesson(courseId: string, lessonId: string) {
  const completed = memory.completedLessons.includes(lessonId)
    ? memory.completedLessons
    : [...memory.completedLessons, lessonId];
  const inCourse = LESSONS.filter((l) => l.courseId === courseId);
  const doneCount = inCourse.filter((l) => completed.includes(l.id)).length;
  const percent = inCourse.length ? Math.round((doneCount / inCourse.length) * 100) : 100;
  memory = {
    ...memory,
    completedLessons: completed,
    continue: { courseId, lessonId, percent, family: "interactive" }
  };
  emit();
}

/* ── Courses slice — learner progress and the published-snapshot seam ──────
   Localized additive edits; other slices are untouched. Progress figures are
   derived by the adapter (courses-demo.ts); these mutations only record
   facts: where the learner was, what they completed, what a publish landed. */

/** Record where the learner is — position only. Never completes anything. */
export function noteLessonPosition(courseId: string, lessonId: string) {
  const inCourse = LESSONS.filter((l) => l.courseId === courseId);
  const doneCount = inCourse.filter((l) => memory.completedLessons.includes(l.id)).length;
  const percent = inCourse.length ? Math.round((doneCount / inCourse.length) * 100) : 0;
  memory = {
    ...memory,
    continue: { courseId, lessonId, percent, family: "interactive" }
  };
  emit();
}

/** Record where the learner is in a video course — position only, never coverage. */
export function noteVideoPosition(videoId: string, chapterIndex: number) {
  const video = VIDEO_COURSES.find((v) => v.id === videoId);
  if (!video) return;
  const covered = memory.videoProgress[videoId] ?? [];
  const percent = video.chapters.length ? Math.round((covered.length / video.chapters.length) * 100) : 0;
  memory = {
    ...memory,
    continue: { courseId: videoId, lessonId: `ch:${chapterIndex}`, percent, family: "video" }
  };
  emit();
}

/** Mark one video chapter covered. Idempotent; also lands the Continue place. */
export function completeVideoChapter(videoId: string, chapterIndex: number) {
  const video = VIDEO_COURSES.find((v) => v.id === videoId);
  if (!video) return;
  const covered = (memory.videoProgress[videoId] ?? []).includes(chapterIndex)
    ? memory.videoProgress[videoId] ?? []
    : [...(memory.videoProgress[videoId] ?? []), chapterIndex];
  const percent = video.chapters.length ? Math.round((covered.length / video.chapters.length) * 100) : 0;
  memory = {
    ...memory,
    videoProgress: { ...memory.videoProgress, [videoId]: covered },
    continue: { courseId: videoId, lessonId: `ch:${chapterIndex}`, percent, family: "video" }
  };
  emit();
}

/**
 * Clear the caller's own completions for one subject (courses "Reset
 * progress"). Returns how many records were cleared — clearing zero is a
 * valid outcome, never an error.
 */
export function resetCourseProgress(courseId: string): number {
  const inCourse = new Set(LESSONS.filter((l) => l.courseId === courseId).map((l) => l.id));
  const cleared = memory.completedLessons.filter((id) => inCourse.has(id)).length;
  memory = {
    ...memory,
    completedLessons: memory.completedLessons.filter((id) => !inCourse.has(id)),
    continue: memory.continue?.courseId === courseId ? null : memory.continue
  };
  emit();
  return cleared;
}

/**
 * The publish seam: copy the saved draft content into the live outline.
 * Until this runs, a draft's edits exist only on the studio tree; after it,
 * learners read this snapshot. The courses studio calls this from its
 * publish path; nothing else writes it.
 */
export function publishLessonSnapshot(snapshot: PublishedLessonSnapshot) {
  memory = {
    ...memory,
    coursePublications: {
      ...memory.coursePublications,
      [snapshot.lessonId]: { ...snapshot }
    }
  };
  audit(`Lesson ${snapshot.lessonId} published to the live outline`);
}

/** Withdraw a published snapshot — a retirement lands here, not a delete. */
export function withdrawLessonSnapshot(lessonId: string) {
  if (!(lessonId in memory.coursePublications)) return;
  const next = { ...memory.coursePublications };
  delete next[lessonId];
  memory = { ...memory, coursePublications: next };
  audit(`Lesson ${lessonId} withdrawn from the live outline`);
}

export function saveLessonNote(lessonId: string, text: string) {
  memory = { ...memory, lessonNotes: { ...memory.lessonNotes, [lessonId]: text } };
  emit();
}

export function resolveDebug(id: string, xpAward = 0) {
  if (memory.debugResolved.includes(id)) return;
  memory = {
    ...memory,
    debugResolved: [...memory.debugResolved, id],
    profile: { ...memory.profile, xp: memory.profile.xp + xpAward }
  };
  emit();
}

export function addProject(name: string, template: string) {
  const files =
    template === "bracket-lab"
      ? [
          { path: "solve.py", content: "def is_balanced(text: str) -> bool:\n    return False\n" },
          { path: "README.md", content: "# Bracket lab\nDevice-local. Not a judge.\n" }
        ]
      : [
          { path: "main.py", content: "def main():\n    print('notes')\n\nif __name__ == '__main__':\n    main()\n" },
          { path: "README.md", content: "# Notes CLI\nNo network.\n" }
        ];
  const row = {
    id: `proj-${Date.now()}`,
    name,
    template,
    at: new Date().toISOString(),
    files,
    activePath: files[0]?.path ?? "README.md",
    output: ""
  };
  memory = { ...memory, projects: [row, ...memory.projects] };
  emit();
  return row.id;
}

export function saveProjectFile(projectId: string, path: string, content: string) {
  memory = {
    ...memory,
    projects: memory.projects.map((p) =>
      p.id === projectId
        ? { ...p, files: p.files.map((f) => (f.path === path ? { ...f, content } : f)), activePath: path }
        : p
    )
  };
  emit();
}

export function setProjectActive(projectId: string, path: string) {
  memory = {
    ...memory,
    projects: memory.projects.map((p) => (p.id === projectId ? { ...p, activePath: path } : p))
  };
  emit();
}

/** Record the console output of a simulated project run. */
export function setProjectOutput(projectId: string, output: string) {
  memory = {
    ...memory,
    projects: memory.projects.map((p) => (p.id === projectId ? { ...p, output } : p))
  };
  emit();
}

/** Keep one CodeLab starter language's files; an empty list forgets them. */
export function saveCodelabFiles(language: string, files: { path: string; content: string }[]) {
  const next = { ...memory.codelabFiles };
  if (files.length === 0) delete next[language];
  else next[language] = files.map((f) => ({ path: f.path, content: f.content }));
  memory = { ...memory, codelabFiles: next };
  emit();
}

/** Remove one file — a delete that actually deletes; the last file stays. */
export function deleteProjectFile(projectId: string, path: string) {
  const p = memory.projects.find((x) => x.id === projectId);
  if (!p || p.files.length <= 1) return;
  memory = {
    ...memory,
    projects: memory.projects.map((x) =>
      x.id === projectId
        ? {
            ...x,
            files: x.files.filter((f) => f.path !== path),
            activePath: x.activePath === path ? (x.files.find((f) => f.path !== path)?.path ?? x.activePath) : x.activePath
          }
        : x
    )
  };
  emit();
}

export function setNotifPrefs(product: boolean) {
  memory = { ...memory, notifPrefs: { product } };
  emit();
}

export function appendLedger(delta: number, reason: string) {
  const row = { id: `led-${Date.now()}`, at: new Date().toISOString(), delta, reason };
  memory = { ...memory, creditLedger: [row, ...memory.creditLedger] };
  emit();
}

export function addNote(text: string) {
  const note = { id: `note-${Date.now()}`, text, at: "just now" };
  memory = { ...memory, notes: [note, ...memory.notes] };
  emit();
}

export function markSolved(id: string) {
  if (memory.solved.includes(id)) return;
  memory = {
    ...memory,
    solved: [...memory.solved, id],
    profile: { ...memory.profile, solvedCount: memory.profile.solvedCount + 1, streak: memory.profile.streak + 0 }
  };
  emit();
}

/* ── Practice slice — challenges / daily / debug learner actions ──────────
   Localized additive edits only; nothing above this block was restructured. */

/** Keep or replace a device-local editor draft (`${challengeId}:${language}`). */
export function saveChallengeDraft(key: string, code: string) {
  memory = { ...memory, challengeDrafts: { ...memory.challengeDrafts, [key]: code } };
  emit();
}

export function clearChallengeDraft(key: string) {
  if (!(key in memory.challengeDrafts)) return;
  const drafts = { ...memory.challengeDrafts };
  delete drafts[key];
  memory = { ...memory, challengeDrafts: drafts };
  emit();
}

/**
 * Record one finalized submission. A platform fault never reaches this:
 * it writes no row and leaves the learner's status untouched. A first
 * acceptance stamps the solve and pays the difficulty award once.
 */
export function recordSubmission(entry: {
  challengeId: string;
  language: string;
  verdict: Store["submissions"][number]["verdict"];
  casesPassed: number;
  casesTotal: number;
  xpAward?: number;
  code?: string;
}) {
  const row = {
    id: `sub-${Date.now()}`,
    challengeId: entry.challengeId,
    language: entry.language,
    verdict: entry.verdict,
    casesPassed: entry.casesPassed,
    casesTotal: entry.casesTotal,
    at: new Date().toISOString(),
    code: entry.code
  };
  const accepted = entry.verdict === "accepted";
  const firstAccept = accepted && !memory.solved.includes(entry.challengeId);
  const xp = firstAccept ? entry.xpAward ?? 0 : 0;
  memory = {
    ...memory,
    submissions: [row, ...memory.submissions],
    submitted: memory.submitted.includes(entry.challengeId)
      ? memory.submitted
      : [...memory.submitted, entry.challengeId],
    solved:
      accepted && !memory.solved.includes(entry.challengeId)
        ? [...memory.solved, entry.challengeId]
        : memory.solved,
    profile:
      firstAccept || xp > 0
        ? {
            ...memory.profile,
            solvedCount: memory.profile.solvedCount + (firstAccept ? 1 : 0),
            xp: memory.profile.xp + xp
          }
        : memory.profile
  };
  emit();
}

/**
 * Complete one product date's Daily. The first acceptance pays the stamped
 * award (base + any authored bonus) once; solving today's date takes the
 * streak out of "at risk" and moves it exactly once.
 */
export function markDailySolved(date: string, xpAward: number, isToday: boolean) {
  if (memory.dailySolved.includes(date)) return;
  memory = {
    ...memory,
    dailySolved: [...memory.dailySolved, date],
    profile: {
      ...memory.profile,
      xp: memory.profile.xp + xpAward,
      streak: memory.profile.streak + (isToday ? 1 : 0)
    }
  };
  emit();
}

export function markDebugSubmitted(id: string) {
  if (memory.debugSubmitted.includes(id)) return;
  memory = { ...memory, debugSubmitted: [...memory.debugSubmitted, id] };
  emit();
}

/**
 * Record one finalized debug validation — the case's submission of record,
 * whatever its verdict; a platform fault never reaches this. A first
 * acceptance stamps the fix, pays the difficulty award once and unlocks the
 * debrief; a repeat acceptance is free practice and pays nothing further.
 */
export function recordDebugSubmission(entry: {
  caseId: string;
  language: string;
  verdict: Store["debugSubmissions"][number]["verdict"];
  casesPassed: number;
  casesTotal: number;
  /** Paid once, on the first acceptance only. */
  xpAward?: number;
  /** The validated source — what "Restore last submitted" returns. */
  code?: string;
}) {
  const row = {
    id: `dsub-${Date.now()}`,
    caseId: entry.caseId,
    language: entry.language,
    verdict: entry.verdict,
    casesPassed: entry.casesPassed,
    casesTotal: entry.casesTotal,
    at: new Date().toISOString(),
    code: entry.code
  };
  const accepted = entry.verdict === "accepted";
  const firstFix = accepted && !memory.debugResolved.includes(entry.caseId);
  const xp = firstFix ? entry.xpAward ?? 0 : 0;
  memory = {
    ...memory,
    debugSubmissions: [row, ...memory.debugSubmissions],
    debugSubmitted: memory.debugSubmitted.includes(entry.caseId)
      ? memory.debugSubmitted
      : [...memory.debugSubmitted, entry.caseId],
    debugResolved: firstFix ? [...memory.debugResolved, entry.caseId] : memory.debugResolved,
    profile:
      xp > 0
        ? { ...memory.profile, xp: memory.profile.xp + xp, solvedCount: memory.profile.solvedCount + 1 }
        : memory.profile
  };
  emit();
}

/**
 * Platform-caused ending of a timed window (debug §4.5): the window closes
 * without a verdict and the spent allowance is restored — the platform's
 * failure never costs the learner a window.
 */
export function invalidateDebugWindow(caseId: string) {
  if (!memory.debugWindow || memory.debugWindow.caseId !== caseId) return;
  const used = Math.max(0, (memory.debugWindowsUsed[caseId] ?? 1) - 1);
  memory = {
    ...memory,
    debugWindow: null,
    debugWindowsUsed: { ...memory.debugWindowsUsed, [caseId]: used }
  };
  emit();
}

/** Start the one timed window. Refused — returns false — while another runs.
 *  The window's allowance is spent at Start, not at its end. */
export function startDebugWindow(caseId: string, minutes: number): boolean {
  if (memory.debugWindow) return false;
  const now = Date.now();
  memory = {
    ...memory,
    debugWindow: {
      caseId,
      startedAt: new Date(now).toISOString(),
      endsAt: new Date(now + minutes * 60_000).toISOString(),
      minutes
    },
    debugWindowsUsed: { ...memory.debugWindowsUsed, [caseId]: (memory.debugWindowsUsed[caseId] ?? 0) + 1 }
  };
  emit();
  return true;
}

/** End the active window — Finish now or the clock's end. */
export function endDebugWindow() {
  if (!memory.debugWindow) return;
  memory = { ...memory, debugWindow: null };
  emit();
}

/** Record a track's durable completion once, with its date. */
export function markTrackCompleted(trackId: string, date: string) {
  if (memory.trackCompletions[trackId]) return;
  memory = { ...memory, trackCompletions: { ...memory.trackCompletions, [trackId]: date } };
  emit();
}

/** The learner Report menu — lands in Administration's content-report queue.
 *  `domain`/`editor` default to the challenges workbench that first used it;
 *  the lesson reader files with domain "courses" and its studio route. */
export function fileContentReport(
  target: string,
  reason: string,
  note: string,
  domain: Store["adminReports"][number]["domain"] = "challenges",
  editor = "/challenges"
) {
  const row = {
    id: `r-${Date.now()}`,
    target,
    domain,
    status: "open" as const,
    note: `${reason}${note.trim() ? ` — ${note.trim()}` : ""}`,
    editor
  };
  memory = { ...memory, adminReports: [row, ...memory.adminReports] };
  audit(`Content report filed on ${target}`);
}

export function saveMockResult(paperId: string, score: number, answers: number[]) {
  const row = { paperId, score, at: new Date().toISOString(), answers };
  memory = { ...memory, mockResults: [row, ...memory.mockResults] };
  emit();
}

export function saveCompanyResult(
  companyId: string,
  paper?: { id: string; title: string },
  answered?: number,
  total?: number
) {
  const row: Store["companyResults"][number] = { companyId, at: new Date().toISOString() };
  if (paper) {
    row.paperId = paper.id;
    row.paperTitle = paper.title;
  }
  if (typeof answered === "number") row.answered = answered;
  if (typeof total === "number") row.total = total;
  memory = {
    ...memory,
    companyResults: [row, ...memory.companyResults]
  };
  emit();
}

export function claimCredits() {
  if (memory.creditClaimed) return;
  memory = {
    ...memory,
    credits: memory.credits + 20,
    creditClaimed: true,
    creditLedger: [
      { id: `led-${Date.now()}`, at: new Date().toISOString(), delta: 20, reason: "Cycle grant" },
      ...memory.creditLedger
    ]
  };
  emit();
}

export function spendCredit() {
  if (memory.credits < 1) return false;
  memory = {
    ...memory,
    credits: memory.credits - 1,
    creditLedger: [
      { id: `led-${Date.now()}`, at: new Date().toISOString(), delta: -1, reason: "Hint reserved" },
      ...memory.creditLedger
    ]
  };
  emit();
  return true;
}

export function signIn(name: string, role: AppRole = "learner") {
  persistRole(role);
  memory = { ...memory, session: { signedIn: true, name: name.trim() || "Yash", role } };
  emit();
}

export function signOut() {
  // In demo mode, sign-out resets the visitor to a fresh demo session
  // instead of leaving them at an empty guest prompt.
  persistRole("learner");
  resetDemo();
}

export function setRole(role: AppRole) {
  persistRole(role);
  memory = { ...memory, session: { ...memory.session, role } };
  audit(`Role set to ${role}`);
}

function audit(action: string) {
  const row = { id: `au-${Date.now()}`, at: new Date().toISOString(), actor: memory.session.name, action };
  memory = { ...memory, adminAudit: [row, ...memory.adminAudit] };
  emit();
}

export function setUserStatus(id: string, status: "active" | "disabled") {
  memory = {
    ...memory,
    adminUsers: memory.adminUsers.map((u) => (u.id === id ? { ...u, status } : u))
  };
  audit(`${status === "disabled" ? "Disabled" : "Enabled"} user ${id}`);
}

export function enrollUser(id: string, courseId: string) {
  memory = {
    ...memory,
    adminUsers: memory.adminUsers.map((u) =>
      u.id === id && !u.enrolled.includes(courseId) ? { ...u, enrolled: [...u.enrolled, courseId] } : u
    )
  };
  audit(`Enrolled ${id} on ${courseId}`);
}

export function grantUserCredits(id: string, amount: number) {
  memory = {
    ...memory,
    adminUsers: memory.adminUsers.map((u) => (u.id === id ? { ...u, credits: u.credits + amount } : u))
  };
  audit(`Granted ${amount} Credits to ${id}`);
}

export function setCourseLifecycle(id: string, lifecycle: Store["adminCourses"][number]["lifecycle"]) {
  const course = memory.adminCourses.find((c) => c.id === id);
  memory = {
    ...memory,
    adminCourses: memory.adminCourses.map((c) => (c.id === id ? { ...c, lifecycle } : c)),
    adminApprovals:
      lifecycle === "submitted" && course
        ? [
            {
              id: `a-${Date.now()}`,
              kind: "course" as const,
              title: course.title,
              revision: course.revision,
              status: "pending" as const
            },
            ...memory.adminApprovals
          ]
        : memory.adminApprovals
  };
  audit(`Course ${id} → ${lifecycle}`);
}

export function duplicateCourse(id: string) {
  const src = memory.adminCourses.find((c) => c.id === id);
  if (!src) return;
  const copy = { ...src, id: `${src.id}-copy-${Date.now()}`, title: `${src.title} (draft copy)`, lifecycle: "draft" as const, revision: 1 };
  memory = { ...memory, adminCourses: [copy, ...memory.adminCourses] };
  audit(`Duplicated course ${id} with no learner-facing trace`);
}

export function setChallengeLifecycle(id: string, lifecycle: Store["adminChallenges"][number]["lifecycle"]) {
  const item = memory.adminChallenges.find((c) => c.id === id);
  memory = {
    ...memory,
    adminChallenges: memory.adminChallenges.map((c) => (c.id === id ? { ...c, lifecycle } : c)),
    adminApprovals:
      lifecycle === "submitted" && item
        ? [
            {
              id: `a-${Date.now()}`,
              kind: "challenge" as const,
              title: item.title,
              revision: item.revision,
              status: "pending" as const
            },
            ...memory.adminApprovals
          ]
        : memory.adminApprovals
  };
  audit(`Challenge ${id} → ${lifecycle}`);
}

export function moveReport(id: string, status: Store["adminReports"][number]["status"], note: string) {
  memory = {
    ...memory,
    adminReports: memory.adminReports.map((r) => (r.id === id ? { ...r, status, note } : r))
  };
  audit(`Report ${id} → ${status}`);
}

export function sendBroadcast(body: string) {
  const row: Store["adminBroadcasts"][number] = {
    id: `b-${Date.now()}`,
    body,
    status: "finished",
    estimated: 1200,
    delivered: 1187,
    failed: 4,
    skipped: 9,
    stopped: 0
  };
  memory = { ...memory, adminBroadcasts: [row, ...memory.adminBroadcasts] };
  audit("Broadcast send confirmed to every eligible learner");
}

export function retryBroadcast(id: string) {
  memory = {
    ...memory,
    adminBroadcasts: memory.adminBroadcasts.map((b) =>
      b.id === id ? { ...b, status: "finished", delivered: 1100, failed: 12, skipped: 8 } : b
    )
  };
  audit(`Retry held broadcast ${id}`);
}

export function stopBroadcast(id: string) {
  memory = {
    ...memory,
    adminBroadcasts: memory.adminBroadcasts.map((b) =>
      b.id === id && b.status === "going" ? { ...b, status: "stopped", stopped: 40 } : b
    )
  };
  audit(`Stop broadcast ${id} — not a recall`);
}

export function decideApproval(id: string, status: "approved" | "refused") {
  const row = memory.adminApprovals.find((a) => a.id === id);
  memory = {
    ...memory,
    adminApprovals: memory.adminApprovals.map((a) => (a.id === id ? { ...a, status } : a)),
    adminCourses:
      row?.kind === "course" && status === "approved"
        ? memory.adminCourses.map((c) => (c.title === row.title ? { ...c, lifecycle: "published" } : c))
        : memory.adminCourses,
    adminChallenges:
      row?.kind === "challenge" && status === "approved"
        ? memory.adminChallenges.map((c) => (c.title === row.title ? { ...c, lifecycle: "published" } : c))
        : memory.adminChallenges
  };
  audit(`Publish approval ${id} ${status}`);
}

export function moveTicket(id: string, status: Store["adminTickets"][number]["status"]) {
  memory = {
    ...memory,
    adminTickets: memory.adminTickets.map((t) => (t.id === id ? { ...t, status } : t))
  };
  audit(`Request ${id} → ${status}`);
}

export function setSuggestion(item: string, line: string) {
  memory = { ...memory, adminSuggestion: { item, line } };
  audit("Home suggestion updated");
}

export function clearSuggestion() {
  memory = { ...memory, adminSuggestion: null };
  audit("Home suggestion emptied");
}

export function fillDailyGap() {
  memory = { ...memory, adminDailyGap: "" };
  audit("Nearest daily schedule gap filled");
}

export function markNotificationsRead() {
  memory = { ...memory, notificationsRead: ["n1", "n2", "n3"] };
  emit();
}

export function enrolledCourses(): Course[] {
  return COURSES.filter((c) => memory.enrolled.includes(c.id));
}

export function setSearchQuery(q: string) {
  memory = { ...memory, searchQuery: q };
  emit();
}

export function resetDemo() {
  persistRole(memory.session.role);
  memory = createDemoStore(memory.session.role);
  emit();
}

export function fileTopicRequest(title: string) {
  const row = { id: `t-${Date.now()}`, title: `Request: ${title.trim()}`, status: "open" as const };
  memory = { ...memory, adminTickets: [row, ...memory.adminTickets] };
  audit(`Learner filed ${row.title}`);
}

export function toggleCertVisibility(id: string) {
  memory = {
    ...memory,
    certificates: memory.certificates.map((c) =>
      c.id === id ? { ...c, visibility: c.visibility === "public" ? "hidden" : "public" } : c
    )
  };
  emit();
}

export function updateScratchpad(text: string) {
  memory = { ...memory, scratchpad: text };
  emit();
}

export function updateUserSettings(partial: Partial<Store["userSettings"]>) {
  memory = { ...memory, userSettings: { ...memory.userSettings, ...partial } };
  emit();
}

export function withdrawTopicRequest(id: string) {
  memory = {
    ...memory,
    adminTickets: memory.adminTickets.filter((t) => t.id !== id)
  };
  audit(`Topic request ${id} withdrawn`);
  emit();
}

export function duplicateChallenge(id: string) {
  const src = memory.adminChallenges.find((c) => c.id === id);
  if (!src) return;
  const copy = { ...src, id: `${src.id}-copy-${Date.now()}`, title: `${src.title} (draft copy)`, lifecycle: "draft" as const, revision: 1 };
  memory = { ...memory, adminChallenges: [copy, ...memory.adminChallenges] };
  audit(`Duplicated challenge ${id}`);
}

/** A saved new draft joins the catalogue — the studio's `new` create flow
 *  calls this so the index lists what the author just wrote. */
export function addAdminChallenge(id: string, title: string) {
  if (memory.adminChallenges.some((c) => c.id === id)) return;
  memory = {
    ...memory,
    adminChallenges: [{ id, title, lifecycle: "draft" as const, revision: 1 }, ...memory.adminChallenges]
  };
  audit(`Created challenge ${id}`);
}

export function saveEditorial(id: string, body: string) {
  memory = {
    ...memory,
    adminEditorial: memory.adminEditorial.map((e) => (e.id === id ? { ...e, body } : e))
  };
  audit(`Editorial ${id} saved`);
}

export function saveTaxonomy(id: string, label: string) {
  memory = {
    ...memory,
    adminTaxonomy: memory.adminTaxonomy.map((t) => (t.id === id ? { ...t, label } : t))
  };
  audit(`Taxonomy ${id} saved`);
}

export function archiveTaxonomy(id: string) {
  memory = {
    ...memory,
    adminTaxonomy: memory.adminTaxonomy.map((t) => (t.id === id ? { ...t, archived: true } : t))
  };
  audit(`Taxonomy ${id} archived`);
}

export function saveTrack(id: string, outline: string) {
  memory = {
    ...memory,
    adminTracks: memory.adminTracks.map((t) => (t.id === id ? { ...t, outline } : t))
  };
  audit(`Track ${id} saved`);
}

export function saveTemplate(id: string, summary: string) {
  memory = {
    ...memory,
    adminTemplates: memory.adminTemplates.map((t) => (t.id === id ? { ...t, summary } : t))
  };
  audit(`Template ${id} saved`);
}

export function savePaperSettings(id: string, settings: string) {
  memory = {
    ...memory,
    adminPapers: memory.adminPapers.map((p) => (p.id === id ? { ...p, settings } : p))
  };
  audit(`Paper ${id} settings saved`);
}

export function saveKnowledge(id: string, body: string, published: boolean) {
  memory = {
    ...memory,
    adminKnowledge: memory.adminKnowledge.map((k) => (k.id === id ? { ...k, body, published } : k))
  };
  audit(`Knowledge ${id} saved`);
}

export function setDebugLifecycle(id: string, lifecycle: string) {
  memory = {
    ...memory,
    adminDebugCases: memory.adminDebugCases.map((c) => (c.id === id ? { ...c, lifecycle } : c))
  };
  audit(`Debug case ${id} → ${lifecycle}`);
}

export function saveAssistant(partial: Partial<Store["assistant"]>) {
  memory = { ...memory, assistant: { ...memory.assistant, ...partial } };
  audit("Assistant configuration saved");
}

export function retryIdentity(id: string) {
  memory = {
    ...memory,
    identityEvents: memory.identityEvents.map((e) => (e.id === id ? { ...e, state: "applied", error: "" } : e))
  };
  audit(`Identity event ${id} retried`);
}

export function retryReward(id: string) {
  const row = memory.failedRewards.find((r) => r.id === id);
  memory = {
    ...memory,
    failedRewards: memory.failedRewards.map((r) => (r.id === id ? { ...r, retried: true } : r)),
    adminUsers: row
      ? memory.adminUsers.map((u) => (u.name === row.person ? { ...u, credits: u.credits + row.amount } : u))
      : memory.adminUsers
  };
  audit(`Reward ${id} recovered`);
}

export function revokeCertificate(id: string) {
  memory = {
    ...memory,
    certificates: memory.certificates.map((c) => (c.id === id ? { ...c, valid: false } : c))
  };
  audit(`Certificate ${id} revoked`);
}

export function requeueDeletion() {
  memory = { ...memory, lifecycleHold: false };
  audit("Deletion re-queued after hold check");
}

export function declareMaintenance(note: string) {
  memory = { ...memory, maintenanceNote: note };
  audit("Maintenance window declared");
}

export function endMaintenance() {
  memory = { ...memory, maintenanceNote: "" };
  audit("Maintenance window ended");
}

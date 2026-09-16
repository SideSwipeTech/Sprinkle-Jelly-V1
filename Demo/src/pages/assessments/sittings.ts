/**
 * sittings — the learner-side in-progress test record.
 *
 * A sitting begins only at the explicit Start act (`startDraft`), never by
 * browsing or by acknowledging the rules. The draft is the one supported
 * in-progress state: every cursor move, answer pick, mark and countdown tick
 * persists to localStorage so leaving the page and returning is a real resume
 * — cursor, answers, marks and the remaining clock are all restored.
 *
 * Submitting (or the clock expiring) finalizes into the store's result
 * registers — `mockResults` carries a score, `companyResults` a completion
 * record — and clears the draft. Nothing here invents pass/fail, rewards or
 * grading the paper type does not define.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getStore } from "@state/store";
import type { SittingItem } from "../../extraction/components/ExamChrome/hooks";

export type SittingKind = "mock" | "company";

export interface SittingDraft {
  kind: SittingKind;
  /** The catalogue id — mock paperId or companyId. */
  refId: string;
  index: number;
  /** -1 marks an unanswered item — never coerced to a choice. */
  answers: number[];
  marked: Record<number, boolean>;
  /** The clock's remaining seconds — stamped at Start, decremented in place. */
  remainingSeconds: number;
  /** ISO — set once by the explicit Start act. */
  startedAt: string;
  /** ISO — the last persisted write. */
  updatedAt: string;
}

const KEY = "wp.assess.sittings";

export const draftKey = (kind: SittingKind, refId: string) => `${kind}:${refId}`;

function readAll(): Record<string, SittingDraft> {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SittingDraft>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, SittingDraft>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* visit-only device — the sitting still runs in memory */
  }
}

export function loadDraft(kind: SittingKind, refId: string): SittingDraft | null {
  return readAll()[draftKey(kind, refId)] ?? null;
}

export function allDrafts(): SittingDraft[] {
  return Object.values(readAll()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** The explicit Start act. Stamps the allocation and the start time — the
 *  timer cannot exist before this runs. Re-starting an existing draft is a
 *  resume, not a reset.
 *
 *  `refId` is the mock paper id or the company *paper* id (COMPANY_PAPERS) —
 *  one company owns several papers, and each holds its own in-progress test. */
export function startDraft(kind: SittingKind, refId: string, totalSeconds: number): SittingDraft {
  const existing = loadDraft(kind, refId);
  if (existing) return existing;
  const now = new Date().toISOString();
  const draft: SittingDraft = {
    kind, refId, index: 0, answers: [], marked: {},
    remainingSeconds: Math.max(0, Math.floor(totalSeconds)),
    startedAt: now, updatedAt: now
  };
  const map = readAll();
  map[draftKey(kind, refId)] = draft;
  writeAll(map);
  return draft;
}

export function saveDraft(draft: SittingDraft): SittingDraft {
  const next = { ...draft, updatedAt: new Date().toISOString() };
  const map = readAll();
  map[draftKey(draft.kind, draft.refId)] = next;
  writeAll(map);
  return next;
}

export function clearDraft(kind: SittingKind, refId: string) {
  const map = readAll();
  delete map[draftKey(kind, refId)];
  writeAll(map);
}

/* ── Attempt caps ────────────────────────────────────────────────────────────
   The admin register (`adminPapers`) already records each paper's published
   settings line, e.g. "Attempt cap 2 · time 45m". A cap only exists where the
   register states one — papers with no entry carry no invented limit. */

export function attemptCapFor(refId: string): number | null {
  const row = getStore().adminPapers.find((p) => p.id === refId);
  const match = row?.settings.match(/attempt cap (\d+)/i);
  return match ? Number(match[1]) : null;
}

/* ── The one legitimate next action per paper ──────────────────────────────── */

export type PaperNext =
  | { kind: "start" }
  | { kind: "resume"; draft: SittingDraft }
  | { kind: "result" }
  | { kind: "blocked"; reason: string };

/** The verdict plus two facts surfaces reuse: `result` — a finalized
 *  (non-invalidated) row exists, so a result page can open; `practice` — open
 *  practice is unlocked (a finalized test, re-locked by invalidation). */
export type NextVerdict = PaperNext & { result?: boolean; practice?: boolean };

interface ResultRowLike {
  invalidation?: { reason: string; at: string } | null;
}

/** Exactly one of start / resume / result / blocked — never a stack. An
 *  invalidated sitting restores the measured attempt: it consumes no attempt
 *  and counts as no result. A blocked paper with a finalized result still
 *  offers the scorecard; the reason explains why a new sitting is not. */
export function mockPaperNext(paperId: string, results: readonly ResultRowLike[]): NextVerdict {
  const live = results.filter((r) => !r.invalidation).length;
  const draft = loadDraft("mock", paperId);
  if (draft) return { kind: "resume", draft, result: live > 0, practice: live > 0 };
  const cap = attemptCapFor(paperId);
  if (cap !== null && live >= cap) {
    return {
      kind: "blocked",
      reason: `Attempt cap reached — ${live} of ${cap} used.`,
      result: live > 0,
      practice: live > 0
    };
  }
  if (live > 0) return { kind: "result", result: true, practice: true };
  return { kind: "start", result: false, practice: false };
}

/** The company paper's verdict — same closed set, keyed by the paper's own id
 *  (one company owns several papers). `blockedReason` is the paper's named
 *  refusal — a closed window or an archived paper, never a bare Not found. */
export function companyPaperNext(
  paperId: string,
  results: readonly ResultRowLike[],
  blockedReason?: string
): NextVerdict {
  const live = results.filter((r) => !r.invalidation).length;
  const draft = loadDraft("company", paperId);
  if (draft) return { kind: "resume", draft, result: live > 0, practice: live > 0 };
  if (blockedReason) {
    return { kind: "blocked", reason: blockedReason, result: live > 0, practice: live > 0 };
  }
  if (live > 0) return { kind: "result", result: true, practice: true };
  return { kind: "start", result: false, practice: false };
}

/* ── The sitting session hook ──────────────────────────────────────────────── */

export interface SittingResult {
  answers: number[];
  marked: Readonly<Record<number, boolean>>;
  answeredCount: number;
  /** null where the items carry no answer key — a company sitting never scores. */
  score: number | null;
}

export interface SittingSession {
  i: number;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  isFirst: boolean;
  isLast: boolean;
  answers: number[];
  pick: (choice: number) => void;
  marked: Readonly<Record<number, boolean>>;
  toggleMark: () => void;
  answeredCount: number;
  markedCount: number;
  finish: (ending?: "submitted" | "auto") => void;
}

/**
 * The in-sitting state, hydrated from and persisted to the draft. The page
 * composes the countdown separately (it owns the clock's persistence too).
 * `finish` never navigates — the page decides where the sitting ends up.
 */
export function useSittingSession(
  draft: SittingDraft,
  items: SittingItem[],
  onFinish: (result: SittingResult, ending: "submitted" | "auto") => void
): SittingSession {
  const [i, setI] = useState(() => Math.min(Math.max(0, draft.index), Math.max(0, items.length - 1)));
  const [answers, setAnswers] = useState<number[]>(() =>
    items.map((_, idx) => (typeof draft.answers[idx] === "number" ? draft.answers[idx] : -1))
  );
  const [marked, setMarked] = useState<Record<number, boolean>>(() => ({ ...draft.marked }));
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const answeredCount = useMemo(() => answers.filter((a) => a >= 0).length, [answers]);
  const markedCount = useMemo(() => Object.values(marked).filter(Boolean).length, [marked]);

  const goTo = useCallback(
    (index: number) => setI(Math.max(0, Math.min(items.length - 1, index))),
    [items.length]
  );

  const pick = useCallback(
    (choice: number) => {
      setAnswers((current) => {
        const next = [...current];
        next[i] = choice;
        return next;
      });
    },
    [i]
  );

  const toggleMark = useCallback(() => {
    setMarked((prev) => ({ ...prev, [i]: !prev[i] }));
  }, [i]);

  const finish = useCallback(
    (ending: "submitted" | "auto" = "submitted") => {
      const scored = items.some((item) => typeof item.answer === "number");
      const score = scored
        ? items.reduce((acc, item, idx) => acc + (answers[idx] === item.answer ? 1 : 0), 0)
        : null;
      finishRef.current({ answers, marked, answeredCount, score }, ending);
    },
    [answers, items, marked]
  );

  return {
    i, goTo,
    next: () => goTo(i + 1),
    prev: () => goTo(i - 1),
    isFirst: i === 0,
    isLast: i === items.length - 1,
    answers, pick, marked, toggleMark, answeredCount, markedCount, finish
  };
}

/** Persist the merged draft on every sitting change — answers, marks, cursor
 *  and clock all land in the one in-progress record. Returns the last-saved
 *  timestamp the save indicator shows. */
export function useSittingAutosave(
  draft: SittingDraft,
  session: Pick<SittingSession, "i" | "answers" | "marked">,
  remainingSeconds: number
): string | null {
  const [savedAt, setSavedAt] = useState<string | null>(draft.updatedAt);
  const latest = useRef({ i: session.i, answers: session.answers, marked: session.marked, remainingSeconds });
  latest.current = { i: session.i, answers: session.answers, marked: session.marked, remainingSeconds };

  useEffect(() => {
    const cur = latest.current;
    const next = saveDraft({
      ...draft,
      index: cur.i,
      answers: cur.answers,
      marked: { ...cur.marked },
      remainingSeconds: cur.remainingSeconds
    });
    setSavedAt(next.updatedAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.i, session.answers, session.marked, remainingSeconds]);

  return savedAt;
}

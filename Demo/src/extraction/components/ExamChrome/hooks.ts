/**
 * ExamChrome hooks — the state half of a sealed sitting.
 *
 * `useCountdown` owns the on-device clock; `useSitting` owns cursor, answers, marks
 * and the finish hand-off. The two are deliberately separate: a sitting may run
 * untimed (review mode) and a countdown exists on surfaces that are not sittings.
 *
 * Source: Assess.tsx MockSitting (435-566) and CompanySitting (890-1011), which were
 * ~90% identical. One chrome, two data shapes: a mock paper's items carry `answer`
 * keys and produce a `score`; a company paper's items do not and `score` is null —
 * the hook never fabricates a grade the paper type does not define.
 */

import { useEffect, useMemo, useState } from "react";

/** One item in a sitting. `answer` is present only on scored (mock) papers. */
export interface SittingItem {
  id: string;
  prompt: string;
  choices: string[];
  /** Correct choice index. Absent on ungraded (company) sittings. */
  answer?: number;
  /** Remediation text, surfaced on the result review — never mid-sitting. */
  explanation?: string;
}

export interface SittingResult {
  /** -1 marks an unanswered item — never coerced to 0, which would read as "chose A". */
  answers: number[];
  marked: Readonly<Record<number, boolean>>;
  answeredCount: number;
  /** null when the paper carries no answer key (company sittings produce no score). */
  score: number | null;
}

/** Seconds under which the clock is urgent. The demo used 300 ("under 5 minutes"). */
export const URGENT_THRESHOLD_SECONDS = 300;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export interface Countdown {
  /** Whole seconds remaining. Floored at 0 — never negative. */
  remain: number;
  /** `mm:ss` for the mono clock. */
  mmss: string;
  urgent: boolean;
  expired: boolean;
}

/**
 * useCountdown — the sealed-sitting clock. Declines at one second per second,
 * holds at zero, and never resets itself: an expired clock is a fact the page
 * decides what to do with (`onExpire` fires exactly once).
 */
export function useCountdown(totalSeconds: number, onExpire?: () => void): Countdown {
  const [remain, setRemain] = useState(() => Math.max(0, Math.floor(totalSeconds)));

  useEffect(() => {
    const t = window.setInterval(() => setRemain((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (remain === 0 && onExpire) onExpire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remain === 0]);

  return {
    remain,
    mmss: `${pad2(Math.floor(remain / 60))}:${pad2(remain % 60)}`,
    urgent: remain < URGENT_THRESHOLD_SECONDS,
    expired: remain === 0
  };
}

export interface Sitting {
  /** Cursor — the item currently shown. */
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
  /**
   * Seal and hand off. Computes the result — score only where the items carry
   * answer keys — and invokes the caller's `onFinish`. The hook never navigates;
   * where a sitting ends up is the page's decision.
   */
  finish: () => void;
}

export function useSitting(items: SittingItem[], onFinish: (result: SittingResult) => void): Sitting {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => items.map(() => -1));
  const [marked, setMarked] = useState<Record<number, boolean>>({});

  const answeredCount = useMemo(() => answers.filter((a) => a >= 0).length, [answers]);
  const markedCount = useMemo(() => Object.values(marked).filter(Boolean).length, [marked]);

  function goTo(index: number) {
    setI(Math.max(0, Math.min(items.length - 1, index)));
  }

  function pick(choice: number) {
    setAnswers((current) => {
      const next = [...current];
      next[i] = choice;
      return next;
    });
  }

  function toggleMark() {
    setMarked((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  function finish() {
    const scored = items.some((item) => typeof item.answer === "number");
    const score = scored
      ? items.reduce((acc, item, idx) => acc + (answers[idx] === item.answer ? 1 : 0), 0)
      : null;
    onFinish({ answers, marked, answeredCount, score });
  }

  return {
    i,
    goTo,
    next: () => goTo(i + 1),
    prev: () => goTo(i - 1),
    isFirst: i === 0,
    isLast: i === items.length - 1,
    answers,
    pick,
    marked,
    toggleMark,
    answeredCount,
    markedCount,
    finish
  };
}

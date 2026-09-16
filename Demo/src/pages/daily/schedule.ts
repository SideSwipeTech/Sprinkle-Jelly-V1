/**
 * The learner's Daily schedule — the same product-date scenario the daily
 * studio seeds (`DAILY_TODAY` is the product clock's today, 21 Aug 2026).
 *
 * A Daily is addressed by its product date. Past entries whose challenges
 * are not in this demo's small learner catalogue still carry their record —
 * solved or open — they just do not open into a workbench. The voided date
 * is a recorded neutral day: no item, a stated reason, no error.
 */

import { CHALLENGES, type Challenge } from "@data/catalog";
import { DAILY_TODAY, addDays, formatProductDate } from "../../admin/practice/daily/fixtures";

/** The product clock's today — the one date every learner surface reads. */
export const PRODUCT_TODAY = DAILY_TODAY;

/** The authored bonus on top of the shared difficulty award, per daily item. */
export const DAILY_BONUS_XP = 25;

export interface DailyEntry {
  date: string;
  challengeId: string;
}

/* Occupied product dates, mirroring the studio's August scenario. 9/12/17 Aug
   name challenges this demo's learner catalogue does not carry — the dates'
   records are real, the items simply do not open here. */
export const DAILY_ENTRIES: DailyEntry[] = [
  { date: "2026-08-03", challengeId: "merge-intervals" },
  { date: "2026-08-06", challengeId: "binary-search" },
  { date: "2026-08-09", challengeId: "max-subarray" },
  { date: "2026-08-12", challengeId: "valid-parentheses" },
  { date: "2026-08-14", challengeId: "lru-cache" },
  { date: "2026-08-17", challengeId: "climbing-stairs" },
  { date: "2026-08-19", challengeId: "anagram-groups" },
  { date: "2026-08-20", challengeId: "two-sum" },
  { date: DAILY_TODAY, challengeId: "balanced-brackets" }
];

/** Voided dates carry a recorded reason and count as neutral for everyone. */
export const VOIDED: Record<string, string> = {
  "2026-08-13": "Voided by a test-data correction — the date counts as neutral for every learner."
};

export function formatProductDay(iso: string): string {
  return formatProductDate(iso, true);
}

/** The challenge a date's Daily names — null when it is not in this catalogue. */
export function dailyChallengeForDate(date: string): Challenge | null {
  const entry = DAILY_ENTRIES.find((e) => e.date === date);
  if (!entry) return null;
  return CHALLENGES.find((c) => c.id === entry.challengeId) ?? null;
}

export type DayState =
  | { kind: "scheduled"; date: string; challenge: Challenge | null }
  | { kind: "voided"; date: string; reason: string }
  | { kind: "neutral"; date: string }
  | { kind: "future"; date: string };

export function stateForDate(date: string): DayState {
  if (date > PRODUCT_TODAY) return { kind: "future", date };
  const voided = VOIDED[date];
  if (voided) return { kind: "voided", date, reason: voided };
  const entry = DAILY_ENTRIES.find((e) => e.date === date);
  if (!entry) return { kind: "neutral", date };
  return { kind: "scheduled", date, challenge: CHALLENGES.find((c) => c.id === entry.challengeId) ?? null };
}

/** Occupied dates at or before today, newest first — the past-challenges list. */
export function pastEntries(): DailyEntry[] {
  return DAILY_ENTRIES.filter((e) => e.date <= PRODUCT_TODAY).sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** The nearest past date still open for this learner — the neutral-day offer
 *  and the catch-up row both read it. Prefers an openable challenge. */
export function openCatchUp(dailySolved: string[]): DailyEntry | null {
  const open = pastEntries().filter((e) => !dailySolved.includes(e.date) && e.date !== PRODUCT_TODAY);
  return open.find((e) => CHALLENGES.some((c) => c.id === e.challengeId)) ?? open[0] ?? null;
}

/** The last `days` product dates ending today, each with its state. */
export function weekStrip(days = 7): { date: string; state: DayState }[] {
  const out: { date: string; state: DayState }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(PRODUCT_TODAY, -i);
    out.push({ date, state: stateForDate(date) });
  }
  return out;
}

/** Resolve a /daily/:dayId param to a product date: an ISO date passes
 *  through, a challenge id finds its scheduled date, and the old "voided"
 *  demo hook still lands on the voided date. */
export function resolveDayParam(param: string | undefined): string | null {
  if (!param || param === "solve") return PRODUCT_TODAY;
  if (/^\d{4}-\d{2}-\d{2}$/.test(param)) return param;
  if (param === "voided") return Object.keys(VOIDED)[0] ?? null;
  const byChallenge = DAILY_ENTRIES.find((e) => e.challengeId === param);
  return byChallenge?.date ?? null;
}

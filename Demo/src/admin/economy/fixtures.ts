/**
 * fixtures — the economy domain's admin fixture state.
 *
 * Every record a screen here reads is local: no store writes, no network.
 *
 * Sources:
 *   economy/04-credits.md §"The sixteen settings and the audited edit" — the
 *     sixteen seeded, bounded numeric settings; five of them are Analytics'
 *     own meaning and bound, stored and audited here and enforced there.
 *   economy/03-rules.md §"Exactly-once delivery, and parked rewards" — the
 *     parked-failed reward event and its four facts.
 *   economy/01-pages.md §"Economy operations in full" — the seven aggregate
 *     keys, each with its window and its as-of stamp, recomputed whole into
 *     `economy_aggregate_figures`.
 *   economy/README.md §Figures + docs/product/DEFERRED.md — bounds and
 *     launch defaults, read by name.
 */

/* ── The sixteen settings ─────────────────────────────────────────────────── */

export interface EconomySetting {
  /** The stored key — a registered figure name or the seeded key beside the
   *  bound it sets. */
  key: string;
  /** What it is, in the document's own words. */
  what: string;
  unit: "Credits" | "XP" | "minutes" | "points";
  value: number;
  bound: [number, number];
  /** The rule that owns its meaning — the setting stores and edits, never
   *  decides. */
  owner: string;
  /** False on the five Analytics-owned values: stored and audited here,
   *  enforced there — the control says so. */
  enforcedHere: boolean;
  /** Whether an edit touches future cycles, future reservations or future
   *  reward events — previewed as three stated facts. */
  touches: { cycles: boolean; reservations: boolean; rewardEvents: boolean };
  /** An allowance or action-price edit previews the approximate count of
   *  default-priced actions the value represents — absent elsewhere. */
  actionPriced: boolean;
}

export const ECONOMY_SETTINGS: EconomySetting[] = [
  {
    key: "ECONOMY_BASE_TRANCHE_CREDITS",
    what: "The base allowance granted per cycle, snapshotted at cycle start",
    unit: "Credits",
    value: 5000,
    bound: [0, 5000],
    owner: "the allowance cycle",
    enforcedHere: true,
    touches: { cycles: true, reservations: false, rewardEvents: false },
    actionPriced: true
  },
  {
    key: "ECONOMY_CONTINUATION_TRANCHE_CREDITS",
    what: "The continuation tranche's amount, snapshotted at cycle start",
    unit: "Credits",
    value: 5000,
    bound: [0, 5000],
    owner: "the allowance cycle",
    enforcedHere: true,
    touches: { cycles: true, reservations: false, rewardEvents: false },
    actionPriced: true
  },
  {
    key: "ECONOMY_SOLVE_AWARD_EASY",
    what: "First accepted solve of an easy challenge-shaped item",
    unit: "XP",
    value: 30,
    bound: [0, 500],
    owner: "the award table",
    enforcedHere: true,
    touches: { cycles: false, reservations: false, rewardEvents: true },
    actionPriced: false
  },
  {
    key: "ECONOMY_SOLVE_AWARD_MEDIUM",
    what: "First accepted solve of a medium challenge-shaped item",
    unit: "XP",
    value: 60,
    bound: [0, 500],
    owner: "the award table",
    enforcedHere: true,
    touches: { cycles: false, reservations: false, rewardEvents: true },
    actionPriced: false
  },
  {
    key: "ECONOMY_SOLVE_AWARD_HARD",
    what: "First accepted solve of a hard challenge-shaped item",
    unit: "XP",
    value: 100,
    bound: [0, 500],
    owner: "the award table",
    enforcedHere: true,
    touches: { cycles: false, reservations: false, rewardEvents: true },
    actionPriced: false
  },
  {
    key: "ECONOMY_SOLVE_AWARD_EXTREME",
    what: "First accepted solve of an extreme challenge-shaped item",
    unit: "XP",
    value: 150,
    bound: [0, 500],
    owner: "the award table",
    enforcedHere: true,
    touches: { cycles: false, reservations: false, rewardEvents: true },
    actionPriced: false
  },
  {
    key: "DAILY_BONUS_DEFAULT",
    what: "The authored bonus a new daily challenge carries unless the author changes it",
    unit: "XP",
    value: 40,
    bound: [0, 200],
    owner: "the award table",
    enforcedHere: true,
    touches: { cycles: false, reservations: false, rewardEvents: true },
    actionPriced: false
  },
  {
    key: "ECONOMY_SUBJECT_COMPLETION_AWARD",
    what: "Completing every published lesson of a subject, once",
    unit: "XP",
    value: 250,
    bound: [0, 1000],
    owner: "the award table",
    enforcedHere: true,
    touches: { cycles: false, reservations: false, rewardEvents: true },
    actionPriced: false
  },
  {
    key: "ECONOMY_PRICE_EXPLAIN_PASSAGE",
    what: "Price of explaining a lesson passage",
    unit: "Credits",
    value: 150,
    bound: [100, 300],
    owner: "the three AI action prices",
    enforcedHere: true,
    touches: { cycles: false, reservations: true, rewardEvents: false },
    actionPriced: true
  },
  {
    key: "ECONOMY_PRICE_ANALYSE_CODE",
    what: "Price of analysing the learner's own code",
    unit: "Credits",
    value: 250,
    bound: [200, 500],
    owner: "the three AI action prices",
    enforcedHere: true,
    touches: { cycles: false, reservations: true, rewardEvents: false },
    actionPriced: true
  },
  {
    key: "ECONOMY_PRICE_EXPLAIN_ERROR",
    what: "Price of explaining a safe execution error",
    unit: "Credits",
    value: 100,
    bound: [50, 200],
    owner: "the three AI action prices",
    enforcedHere: true,
    touches: { cycles: false, reservations: true, rewardEvents: false },
    actionPriced: true
  },
  {
    key: "ANALYTICS_ITEM_DAY_ACTIVE_MINUTES_CEILING",
    what: "Per-learner per-item per-day active-time ceiling",
    unit: "minutes",
    value: 120,
    bound: [15, 480],
    owner: "the Analytics engine",
    enforcedHere: false,
    touches: { cycles: false, reservations: false, rewardEvents: false },
    actionPriced: false
  },
  {
    key: "ANALYTICS_PRACTICE_VALUE_EASY",
    what: "What a first accepted solve of an easy item contributes",
    unit: "points",
    value: 55,
    bound: [0, 100],
    owner: "the Analytics engine",
    enforcedHere: false,
    touches: { cycles: false, reservations: false, rewardEvents: false },
    actionPriced: false
  },
  {
    key: "ANALYTICS_PRACTICE_VALUE_MEDIUM",
    what: "What a first accepted solve of a medium item contributes",
    unit: "points",
    value: 70,
    bound: [0, 100],
    owner: "the Analytics engine",
    enforcedHere: false,
    touches: { cycles: false, reservations: false, rewardEvents: false },
    actionPriced: false
  },
  {
    key: "ANALYTICS_PRACTICE_VALUE_HARD",
    what: "What a first accepted solve of a hard item contributes",
    unit: "points",
    value: 85,
    bound: [0, 100],
    owner: "the Analytics engine",
    enforcedHere: false,
    touches: { cycles: false, reservations: false, rewardEvents: false },
    actionPriced: false
  },
  {
    key: "ANALYTICS_PRACTICE_VALUE_EXTREME",
    what: "What a first accepted solve of an extreme item contributes",
    unit: "points",
    value: 100,
    bound: [0, 100],
    owner: "the Analytics engine",
    enforcedHere: false,
    touches: { cycles: false, reservations: false, rewardEvents: false },
    actionPriced: false
  }
];

/** The cheapest current action price — the "default-priced action" the
 *  preview counts an allowance or a price against. */
export function defaultPricedAction(settings: EconomySetting[]): number {
  return Math.min(
    ...settings
      .filter((s) => s.owner === "the three AI action prices")
      .map((s) => s.value)
  );
}

/* ── Parked rewards — the failed_rewards attention condition ──────────────── */

export interface ParkedReward {
  id: string;
  /** learner:reward-kind:causal-key — the identity a retry reuses. */
  rewardIdentity: string;
  /** What it was, as the reward event recorded it. */
  what: string;
  /** Who it was for. */
  who: string;
  /** When the event was recorded. */
  when: string;
  /** The last error it parked with, after ECONOMY_REWARD_DELIVERY_TRIES tries. */
  lastError: string;
  /** Fixture flag: this row's retry fails again — it stays parked. */
  retryFails?: boolean;
}

export const PARKED_REWARDS: ParkedReward[] = [
  {
    id: "rw-2481",
    rewardIdentity: "learner:yr-sharma:first-solve-hard:ch-1142",
    what: "First accepted solve · hard · +100 XP (base 100, no bonus)",
    who: "Yash R. Sharma",
    when: "24 Aug 2026, 18:42 IST",
    lastError: "Ledger write timed out on try 3 of 3"
  },
  {
    id: "rw-2477",
    rewardIdentity: "learner:m-iyer:subject-completion:sub-ml-foundations",
    what: "Subject completion · +250 XP (every published lesson)",
    who: "Meera Iyer",
    when: "24 Aug 2026, 11:05 IST",
    lastError: "Unique violation on reward identity during retry window",
    retryFails: true
  },
  {
    id: "rw-2466",
    rewardIdentity: "learner:a-das:first-solve-easy:ch-0987",
    what: "First accepted solve · easy · +30 XP",
    who: "Arjun Das",
    when: "23 Aug 2026, 21:17 IST",
    lastError: "Connection dropped before the ledger confirmed"
  }
];

/* ── The seven aggregate keys ─────────────────────────────────────────────── */

export interface AggregateReading {
  /** The aggregate key — one row of `economy_aggregate_figures`. */
  key: string;
  /** The figure's name, from the spec table. */
  figure: string;
  /** The window the figure reads over — stated, never inferred. */
  window: string;
  /** The as-of stamp every figure carries. */
  asOf: string;
  /** The reading: count, optional amount, optional split or oldest age.
   *  null = the figure could not be read — it says so, never a zero. */
  count: number | null;
  amount?: number | null;
  amountUnit?: string;
  /** Credits captured splits by the registered AI action. */
  split?: { action: string; count: number; amount: number }[] | null;
  /** The parked-reward figure carries one age beside its count. */
  oldestAge?: string | null;
  /** An empty sample yields no figure rather than a zero. */
  emptySample?: boolean;
  /** The figure could not be read at all. */
  unreadable?: boolean;
}

export const AGGREGATE_FIGURES: AggregateReading[] = [
  {
    key: "credits_granted",
    figure: "Credits granted",
    window: "the current cycle — each learner's in-progress allowance cycle",
    asOf: "25 Aug 2026, 09:12 IST",
    count: 41208,
    amount: 412080,
    amountUnit: "Credits"
  },
  {
    key: "credits_captured",
    figure: "Credits captured, by AI action type",
    window: "the current cycle",
    asOf: "25 Aug 2026, 09:12 IST",
    count: 9314,
    amount: 189300,
    amountUnit: "Credits",
    split: [
      { action: "explain a lesson passage", count: 3118, amount: 46770 },
      { action: "analyse code the learner owns", count: 2980, amount: 74500 },
      { action: "explain a safe execution error", count: 3216, amount: 68030 }
    ]
  },
  {
    key: "credits_released_or_refunded",
    figure: "Credits released or refunded",
    window: "the current cycle",
    asOf: "25 Aug 2026, 09:12 IST",
    count: null,
    unreadable: true
  },
  {
    key: "credits_cleared_unused",
    figure: "Credits cleared unused",
    window: "the most recently completed cycle — a clearing exists only at a cycle's end",
    asOf: "25 Aug 2026, 09:12 IST",
    count: 10244,
    amount: 156070,
    amountUnit: "Credits"
  },
  {
    key: "continuation_tranches_granted",
    figure: "Continuation tranches granted",
    window: "the current cycle",
    asOf: "25 Aug 2026, 09:12 IST",
    count: 5810
  },
  {
    key: "failed_allowance_grants",
    figure: "Failed allowance grants",
    window: "the current cycle",
    asOf: "25 Aug 2026, 09:12 IST",
    count: null,
    emptySample: true
  },
  {
    key: "parked_rewards_oldest_age",
    figure: "Parked rewards with the oldest age",
    window: "a present stock, read as of the read",
    asOf: "25 Aug 2026, 09:12 IST",
    count: 3,
    oldestAge: "1 day 12 hours"
  }
];

/* ── The audited edit record — the record inside every change ─────────────── */

export interface SettingsEdit {
  id: string;
  at: string;
  actor: string;
  /** The audit-trail row the edit commits with. */
  auditRef: string;
  /** Before-and-after of the settings that moved. */
  changes: { key: string; before: number; after: number; unit: string }[];
}

export const SETTINGS_EDITS: SettingsEdit[] = [
  {
    id: "edit-0012",
    at: "12 Aug 2026, 15:40 IST",
    actor: "V. Krishnan",
    auditRef: "AUD-2026-0881",
    changes: [
      { key: "ECONOMY_PRICE_EXPLAIN_PASSAGE", before: 120, after: 150, unit: "Credits" }
    ]
  },
  {
    id: "edit-0011",
    at: "30 Jul 2026, 10:02 IST",
    actor: "V. Krishnan",
    auditRef: "AUD-2026-0714",
    changes: [
      { key: "ANALYTICS_PRACTICE_VALUE_HARD", before: 80, after: 85, unit: "points" },
      { key: "ANALYTICS_PRACTICE_VALUE_EXTREME", before: 95, after: 100, unit: "points" }
    ]
  }
];

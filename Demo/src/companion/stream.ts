/**
 * The one message stream — AST-R1, AST-R2, AST-R3 (with AST-DR-10).
 *
 * Surfaces raise a kind and its values, never a sentence. Exactly one message
 * shows at a time; up to five wait behind it; a repeat of the same kind on the
 * same surface coalesces; beyond the line the oldest non-sticky drops, and where
 * every waiting item is sticky the newest copy is rejected. Nothing here is a
 * delivery guarantee: with nobody listening a message drops silently, and the
 * originating surface stays the authoritative state.
 *
 * Both presentations (the companion, plain messages) subscribe to this same
 * stream — it is the stream's one consumer that decides how to draw it.
 */

import { MOMENT_KINDS, GENERIC_FACT, compose, DURATIONS, MIN_VISIBLE_MS, QUEUE_LIMIT, type MomentKind } from "./moments";

export interface Moment {
  id: number;
  kind: string;
  surface: string;
  def: MomentKind;
  fact: string;
  flourish: string | null;
  raisedAt: number;
  shownAt: number | null;
  values: Record<string, string | number>;
}

export type DropReason = "suppressed" | "nobody listening" | "more than can be held" | "sticky line full" | "quiet";

interface StreamState {
  current: Moment | null;
  queue: Moment[];
  counters: Record<DropReason, number> & { raised: number; shown: number; coalesced: number };
}

type Listener = (state: StreamState) => void;

const listeners = new Set<Listener>();
let seq = 0;
let timer: number | null = null;
let paused = false;
let pausedRemaining = 0;
let suppressed = false;
let pendingRaise: number | null = null;
const heldRaises: { kind: string; values: Record<string, string | number>; surface: string }[] = [];
let quiet = false;

const state: StreamState = {
  current: null,
  queue: [],
  counters: { suppressed: 0, "nobody listening": 0, "more than can be held": 0, "sticky line full": 0, quiet: 0, raised: 0, shown: 0, coalesced: 0 }
};

function emit() { for (const fn of listeners) fn(state); }

export function subscribe(fn: Listener) {
  listeners.add(fn);
  fn(state);
  return () => { listeners.delete(fn); };
}

/** The surface declares suppression (a sealed sitting, a suppressed presence level). Raised messages drop permanently. */
export function setSuppressed(v: boolean) {
  suppressed = v;
  if (v && state.current) { clearTimer(); state.current = null; state.queue = []; emit(); }
}

/** Quiet presence or a quiet preference: celebrations and the nudge are withheld; verdicts, errors and help still deliver. */
export function setQuiet(v: boolean) { quiet = v; }

export function getStreamState() { return state; }

/** A surface raises a moment kind with its values. Returns the attribution if it did not show. */
export function raise(kind: string, values: Record<string, string | number> = {}, surface: string = window.location.pathname): DropReason | "queued" | "shown" | "coalesced" {
  state.counters.raised += 1;
  let def = MOMENT_KINDS[kind];
  if (!def) {
    // Unrecognised kind: one generic informational fact in a non-critical place, and an operational defect.
    console.warn(`[companion] unrecognised moment kind "${kind}" — rendering the generic fact (operational defect)`);
    def = { family: "Unknown", tone: "informational", expression: "informational", cls: "informational", sticks: false, celebrates: false, fact: null };
  }
  if (suppressed) { state.counters.suppressed += 1; return "suppressed"; }
  if (listeners.size === 0) {
    // Nobody listening. A surface mounting in the same frame as the corner is not "nobody" yet —
    // give the frame one tick to subscribe; if still nobody, the message drops silently (AST-R2).
    if (!pendingRaise) {
      pendingRaise = window.setTimeout(() => {
        pendingRaise = null;
        const held = heldRaises.splice(0);
        if (listeners.size === 0) { state.counters["nobody listening"] += held.length; return; }
        for (const h of held) raise(h.kind, h.values, h.surface);
      }, 0);
    }
    heldRaises.push({ kind, values, surface });
    return "nobody listening";
  }
  if (quiet && (def.celebrates || kind === "skills next action")) { state.counters.quiet += 1; return "quiet"; }

  const fact = compose(def.fact ?? GENERIC_FACT, values);
  const flourish = def.flourish ? compose(def.flourish, values) : null;
  const moment: Moment = { id: ++seq, kind, surface, def, fact, flourish, raisedAt: Date.now(), shownAt: null, values };

  // Coalesce: same kind on the same surface already waiting → replace its values, take no place.
  const waiting = state.queue.find((m) => m.kind === kind && m.surface === surface);
  if (waiting) { waiting.fact = fact; waiting.flourish = flourish; waiting.values = values; state.counters.coalesced += 1; emit(); return "coalesced"; }

  if (!state.current) { show(moment); return "shown"; }

  if (state.queue.length >= QUEUE_LIMIT) {
    const idx = state.queue.findIndex((m) => !m.def.sticks);
    if (idx === -1) { state.counters["sticky line full"] += 1; return "sticky line full"; }   // every waiting item is sticky: reject the newest
    state.queue.splice(idx, 1);                                                                // drop the oldest non-sticky
    state.counters["more than can be held"] += 1;
  }
  state.queue.push(moment);
  emit();
  return "queued";
}

function show(m: Moment) {
  clearTimer();
  m.shownAt = Date.now();
  state.current = m;
  state.counters.shown += 1;
  const dur = DURATIONS[m.def.cls];
  if (dur !== null && !m.def.sticks) arm(dur);
  emit();
}

function arm(ms: number) {
  clearTimer();
  pausedRemaining = ms;
  if (paused) return;
  const startedAt = Date.now();
  timer = window.setTimeout(() => { timer = null; advance(); }, ms);
  (state as { _armedAt?: number })._armedAt = startedAt;
}

function clearTimer() { if (timer !== null) { window.clearTimeout(timer); timer = null; } }

/** Auto-dismiss pauses while anything inside the message holds keyboard focus (AST-R3). */
export function pause() {
  if (paused) return;
  paused = true;
  if (timer !== null) {
    const armedAt = (state as { _armedAt?: number })._armedAt ?? Date.now();
    pausedRemaining = Math.max(500, pausedRemaining - (Date.now() - armedAt));
    clearTimer();
  }
}
export function resume() {
  if (!paused) return;
  paused = false;
  if (state.current && !state.current.def.sticks && DURATIONS[state.current.def.cls] !== null) arm(pausedRemaining);
}

/** Dismiss the visible message by hand — allowed only after the minimum visible time. */
export function dismiss(): boolean {
  const m = state.current;
  if (!m) return false;
  if (m.shownAt !== null && Date.now() - m.shownAt < MIN_VISIBLE_MS) return false;
  advance();
  return true;
}

export function canDismiss(): boolean {
  const m = state.current;
  return !!m && m.shownAt !== null && Date.now() - m.shownAt >= MIN_VISIBLE_MS;
}

function advance() {
  clearTimer();
  const next = state.queue.shift() ?? null;
  state.current = null;
  if (next) show(next); else emit();
}

/** Prototype reset: clears the stream. */
export function clearStream() { clearTimer(); state.current = null; state.queue = []; emit(); }

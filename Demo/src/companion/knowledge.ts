/**
 * The knowledge base's two-condition gate — AST-R19 (AST-DR-04), presented at
 * the door. Lexical matching only, no outside service: the words of the
 * question against the entry's question and answer text. An answer returns only
 * when the best match clears its own score AND its margin over the runner-up;
 * a missing runner-up scores zero; a tie fails the margin.
 *
 * Three results and nothing else: answer · no-match (safe clarification, at
 * most three topics, never a guess) · unavailable (the platform could not look —
 * a retry, no clarification, no count).
 *
 * The scoring function is specification-phase mechanism; this prototype uses a
 * normalised word-overlap so the gate's behaviour can be exercised honestly.
 */

export interface KnowledgeEntry { id: string; title: string; body: string; published: boolean; }

export type KnowledgeResult =
  | { kind: "answer"; entry: KnowledgeEntry }
  | { kind: "no-match"; topics: string[] }
  | { kind: "unavailable" };

const STOP = new Set(["the", "a", "an", "is", "are", "do", "does", "what", "how", "why", "my", "i", "it", "to", "of", "in", "on", "and", "or", "this", "that", "me", "can", "be", "for", "with", "will", "you"]);

function tokens(s: string): Set<string> {
  return new Set(
    s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter((w) => w && !STOP.has(w))
      .map((w) => w.replace(/(ies|es|s|ed|ing)$/, "").slice(0, 5))
      .filter((w) => w.length >= 3)
  );
}

/** Normalised 0–1: the share of the question's content words the entry covers. */
function score(question: Set<string>, entry: KnowledgeEntry): number {
  if (question.size === 0) return 0;
  const corpus = tokens(`${entry.title} ${entry.body}`);
  let hit = 0;
  for (const w of question) if (corpus.has(w)) hit += 1;
  return hit / question.size;
}

export interface GateSettings { minScore: number; minMargin: number; }
export const GATE_DEFAULTS: GateSettings = { minScore: 0.6, minMargin: 0.15 };

/** Read the operated settings from the prototype's admin gate string ("score 0.62 · margin 0.08 · version 3"). */
export function parseGate(text: string | undefined): GateSettings {
  const s = /score\s+([\d.]+)/.exec(text ?? "")?.[1];
  const m = /margin\s+([\d.]+)/.exec(text ?? "")?.[1];
  const minScore = s ? Number(s) : GATE_DEFAULTS.minScore;
  const minMargin = m ? Number(m) : GATE_DEFAULTS.minMargin;
  return {
    minScore: Number.isFinite(minScore) ? Math.min(0.8, Math.max(0.5, minScore)) : GATE_DEFAULTS.minScore,
    minMargin: Number.isFinite(minMargin) ? Math.min(0.3, Math.max(0.05, minMargin)) : GATE_DEFAULTS.minMargin
  };
}

export function ask(question: string, corpus: KnowledgeEntry[] | null | undefined, gate: GateSettings = GATE_DEFAULTS): KnowledgeResult {
  if (!Array.isArray(corpus)) return { kind: "unavailable" };          // the platform could not look
  const published = corpus.filter((e) => e.published);
  const q = tokens(question);
  const ranked = published.map((entry) => ({ entry, s: score(q, entry) })).sort((a, b) => b.s - a.s);
  const best = ranked[0];
  const runnerUp = ranked[1]?.s ?? 0;                                   // a missing runner-up scores zero
  if (best && best.s >= gate.minScore && best.s - runnerUp >= gate.minMargin) return { kind: "answer", entry: best.entry };
  // Genuine no-match: a safe clarification naming at most three likely topics — the titles, never a guess at an answer.
  const topics = ranked.filter((r) => r.s > 0).slice(0, 3).map((r) => r.entry.title);
  return { kind: "no-match", topics };
}

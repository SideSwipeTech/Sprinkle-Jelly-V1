/**
 * The companion corner — one companion, one stream, two presentations.
 *
 * Extracted from src/companion/Companion.tsx:40-254 + companion.css, presentational
 * only: the stream, the guide registry and the knowledge gate stay with the caller —
 * this file draws what it is handed. `CompanionCorner` (fixed host + presence),
 * `CompanionMoment` (the one passing message), `CompanionPanel` (guide + the door),
 * `CompanionTrigger` (character host or plain pill), `DoorResult` (three answer
 * states, converged onto kit StateBlock).
 *
 * The character rig (sparky) is an OPAQUE adapter — see README for the contract. This
 * file never imports it; it mounts whatever CompanionRigAdapter the caller supplies.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../../icons/Icon";
import type { IconName } from "../../../icons/keyline";
import { StateBlock } from "../../../components/Card";
import { VALUES } from "../../../tokens/values";
import "./Companion.css";

/* ── Types ───────────────────────────────────────────────────────────────── */

export type CompanionTone = "neutral" | "informational" | "encouraging" | "warning" | "serious";
/** AST-R3's display classes — the timing axis. `success` here is a class, never a tone. */
export type CompanionDisplayClass = "informational" | "success" | "warning" | "error" | "ack";
export type CompanionPresence = "present" | "quiet" | "suppressed";
export type CompanionPresentation = "companion" | "plain";
export type GuideItemKind = "greeting" | "tip" | "hint";

/**
 * The opaque character adapter — the seam sparky satisfies. The trigger calls
 * mount/setSize/setReducedMotion/destroy; the composing layer drives expression,
 * reaction and gesture off the stream (see README).
 */
export interface CompanionRigAdapter {
  mount(host: HTMLElement): void;
  destroy(): void;
  setSize(px: number): void;
  setReducedMotion(v: boolean | null): void;
  setExpression(name: string): void;
  react(kind: string): void;
  play(gesture: string): void;
}

const TONE_ICON: Record<CompanionTone, IconName> = {
  neutral: "message",
  informational: "info",
  encouraging: "sparkles",
  warning: "alert",
  serious: "shield"
};

/** The compact band edge, read from the package's band table — never restated. */
const COMPACT_MAX = VALUES.bands.find((b) => b.key === "compact")?.max ?? 0;
const COMPACT_QUERY = `(max-width: ${COMPACT_MAX}px)`;

/** Rig canvas sizes (px fed to the opaque rig factory — not layout spacing). */
export const COMPANION_RIG_SIZE = { full: 96, compact: 72 } as const;

/* ── Corner ──────────────────────────────────────────────────────────────── */

export function CompanionCorner({
  presence = "present",
  name,
  presentation = "plain",
  children
}: {
  presence?: CompanionPresence;
  name: string;
  presentation?: CompanionPresentation;
  children?: ReactNode;
}) {
  // Suppressed renders nothing at all (AST-R9 — plain messages are not a bypass).
  if (presence === "suppressed") return null;
  return (
    <div
      className="x-companion"
      data-presence={presence}
      data-presentation={presentation}
      data-companion-name={name}
    >
      {children}
    </div>
  );
}

/* ── Trigger — character host or plain pill ──────────────────────────────── */

export function CompanionTrigger({
  presentation = "plain",
  name,
  open,
  onToggle,
  rig = null,
  reducedMotion
}: {
  presentation?: CompanionPresentation;
  name: string;
  open?: boolean;
  onToggle?: () => void;
  rig?: CompanionRigAdapter | null;
  reducedMotion?: boolean | null;
}) {
  const host = useRef<HTMLSpanElement>(null);
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches
  );
  const size = compact ? COMPANION_RIG_SIZE.compact : COMPANION_RIG_SIZE.full;

  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const on = () => setCompact(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // The rig is rebuilt only when the adapter instance or the presentation changes;
  // size and motion update live on the mounted rig below.
  useEffect(() => {
    if (presentation !== "companion" || !rig || !host.current) return;
    rig.mount(host.current);
    rig.setSize(size);
    rig.setReducedMotion(reducedMotion ?? null);
    return () => rig.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentation, rig]);

  useEffect(() => {
    rig?.setSize(size);
  }, [rig, size]);
  useEffect(() => {
    rig?.setReducedMotion(reducedMotion ?? null);
  }, [rig, reducedMotion]);

  const label = `${name}: open the page guide`;

  if (presentation === "companion") {
    return (
      <button
        className="x-companion__trigger"
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span ref={host} className="x-companion__character" />
      </button>
    );
  }
  return (
    <button
      className="x-companion__button"
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={onToggle}
    >
      <Icon name="message" size={16} />
      <span>{name}</span>
    </button>
  );
}

/* ── Moment — the one passing message ────────────────────────────────────── */

export function CompanionMoment({
  tone = "neutral",
  cls = "informational",
  fact,
  flourish,
  waiting = 0,
  sticks = false,
  dismissable = true,
  onDismiss,
  onPause,
  onResume
}: {
  tone?: CompanionTone;
  cls?: CompanionDisplayClass;
  fact: string;
  flourish?: string | null;
  waiting?: number;
  /** Sticky messages alert; transient ones are status. */
  sticks?: boolean;
  dismissable?: boolean;
  onDismiss?: () => void;
  /** Focus inside pauses the stream's auto-dismiss; leaving resumes (AST-R3). */
  onPause?: () => void;
  onResume?: () => void;
}) {
  return (
    <section
      className="x-companion__moment"
      data-tone={tone}
      data-cls={cls}
      role={sticks ? "alert" : "status"}
      aria-live={sticks ? "assertive" : "polite"}
      aria-atomic="true"
      onFocusCapture={onPause}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onResume?.();
      }}
    >
      <span className="x-companion__tone" aria-hidden="true">
        <Icon name={TONE_ICON[tone]} size={16} />
      </span>
      <div className="x-companion__words">
        <p className="x-companion__fact">{fact}</p>
        {flourish ? <p className="x-companion__flourish">{flourish}</p> : null}
        {waiting > 0 ? <p className="micro x-companion__waiting">{waiting} more waiting</p> : null}
      </div>
      <button
        className="x-icon-btn x-companion__dismiss"
        type="button"
        aria-label="Dismiss message"
        disabled={!dismissable}
        onClick={onDismiss}
      >
        <Icon name="x" size={14} />
      </button>
    </section>
  );
}

/* ── The door's three answer states ──────────────────────────────────────── */

export type DoorResultData =
  | { kind: "guidance"; text: string; to?: string; toLabel?: string }
  | { kind: "answer"; title: string; body: string }
  | { kind: "no-match"; topics: string[]; requestTo?: string }
  | { kind: "unavailable" };

export function DoorResult({
  result,
  onRetry
}: {
  result: DoorResultData;
  onRetry?: () => void;
}) {
  if (result.kind === "guidance") {
    return (
      <div className="x-companion__answer" role="status">
        <p>{result.text}</p>
        {result.to ? (
          <Link className="x-btn x-btn--quiet" to={result.to}>
            {result.toLabel ?? "Open"}
          </Link>
        ) : null}
      </div>
    );
  }
  if (result.kind === "answer") {
    return (
      <div className="x-companion__answer" role="status">
        <p className="micro">{result.title}</p>
        <p>{result.body}</p>
      </div>
    );
  }
  if (result.kind === "no-match") {
    const topics = result.topics.length ? ` Did you mean: ${result.topics.join(" · ")}` : "";
    return (
      <StateBlock
        state="empty"
        compact
        message={`I searched and found nothing good enough for that.${topics}`}
        action={
          result.requestTo ? (
            <Link className="x-btn x-btn--quiet" to={result.requestTo}>
              Request this topic
            </Link>
          ) : undefined
        }
      />
    );
  }
  return (
    <StateBlock
      state="unavailable"
      compact
      message="The platform could not look just now. Guidance still answers what it can."
      action={
        onRetry ? (
          <button className="x-btn x-btn--quiet" type="button" onClick={onRetry}>
            Retry
          </button>
        ) : undefined
      }
    />
  );
}

/* ── Panel — page guide + the door ───────────────────────────────────────── */

export function CompanionPanel({
  name,
  item = null,
  index = 0,
  total = 0,
  onNext,
  chips = [],
  onAsk,
  result = null,
  onRetryResult,
  onClose
}: {
  name: string;
  item?: { kind: GuideItemKind; text: string } | null;
  /** 1-based position in the guide sequence. */
  index?: number;
  total?: number;
  onNext?: () => void;
  chips?: string[];
  onAsk?: (question: string) => void;
  result?: DoorResultData | null;
  onRetryResult?: () => void;
  onClose?: () => void;
}) {
  const [question, setQuestion] = useState("");

  return (
    <section className="x-companion__panel" aria-label={`${name} guide`}>
      <header className="x-companion__head">
        <p className="micro">{name} · page guide</p>
        <button className="x-icon-btn" type="button" aria-label="Close guide" onClick={onClose}>
          <Icon name="x" size={14} />
        </button>
      </header>

      {item ? (
        <p className="x-companion__guide" data-kind={item.kind}>
          {item.kind === "hint" ? <Icon name="sparkles" size={14} /> : null}
          {item.text}
        </p>
      ) : null}

      <div className="x-companion__actions">
        <button className="x-btn x-btn--quiet" type="button" onClick={onNext}>
          Next tip
        </button>
        {total > 0 ? (
          <span className="micro x-companion__count">
            {Math.min(index, total)}/{total}
          </span>
        ) : null}
      </div>

      <div className="x-companion__door">
        <p className="micro">Ask — guidance first, then how the product works</p>
        {chips.length ? (
          <div className="x-companion__chips">
            {chips.map((c) => (
              <button key={c} className="x-chip" type="button" onClick={() => onAsk?.(c)}>
                {c}
              </button>
            ))}
          </div>
        ) : null}
        <form
          className="x-companion__ask"
          onSubmit={(e) => {
            e.preventDefault();
            const text = question.trim();
            if (!text) return;
            onAsk?.(text);
            setQuestion("");
          }}
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type a question"
            aria-label={`Ask ${name}`}
          />
          <button className="x-btn x-btn--secondary" type="submit" disabled={!question.trim()}>
            Ask
          </button>
        </form>
        {result ? <DoorResult result={result} onRetry={onRetryResult} /> : null}
      </div>
    </section>
  );
}

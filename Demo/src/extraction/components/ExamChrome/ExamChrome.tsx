/**
 * ExamChrome — the sealed-sitting chrome. One anatomy, two data shapes.
 *
 * Extracted from Assess.tsx MockSitting (435-566) and CompanySitting (890-1011),
 * which differed only in strings, data source, and what `finish` persisted. The
 * differences are now props; the chrome is shared.
 *
 * Parts:
 *   IntegrityBanner  posture strip — status tell + label + answered count
 *   TimerStrip       clock bar — mono numeral + urgent state under 300s
 *   QuestionPalette  the .q-rail index — current / answered / marked, each with a
 *                    non-colour tell (weight+ring, fill+underline, star+marker)
 *   QuestionCard     ITEM n OF m + mark toggle + prompt + AnswerChoice list
 *   AnswerChoice     one lettered option — role=radio inside a radiogroup
 *   SittingNav       Previous / Next / Submit paper
 *
 * Everything below reads tokens; the demo's hex literals (#2dd4bf, #fbbf24,
 * #fb7185, rgba(99,102,241,.12), "white") are dead here.
 */

import { useId, type ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./ExamChrome.css";

/* ── IntegrityBanner ─────────────────────────────────────────────────────── */

export interface IntegrityBannerProps {
  /** The posture claim, e.g. "SEALED POSTURE ACTIVE · DEVICE FIXED RECORD". */
  label: string;
  answered: number;
  total: number;
  /** Live/degraded — the dot follows, and the icon gives it a non-colour tell. */
  tone?: "active" | "warning";
}

export function IntegrityBanner({ label, answered, total, tone = "active" }: IntegrityBannerProps) {
  const icon: IconName = tone === "warning" ? "alert" : "shield";
  return (
    <div className="x-integrity-banner" data-tone={tone}>
      <div className="x-integrity-banner__state">
        <span className="x-integrity-banner__dot" aria-hidden="true" />
        <Icon name={icon} size={14} />
        <span className="micro x-integrity-banner__label">{label}</span>
      </div>
      <span className="x-integrity-banner__count" role="status">
        {answered} of {total} answered
      </span>
    </div>
  );
}

/* ── TimerStrip ──────────────────────────────────────────────────────────── */

export interface TimerStripProps {
  /** `mm:ss` from useCountdown. */
  clock: string;
  /** True under the urgent threshold — paints the error tone AND swaps the icon. */
  urgent?: boolean;
  /** e.g. "12 items · 45m allocation · Auto-saving on this device". */
  meta?: string;
  /** Trailing actions — the demo's "Submit paper" lives here. */
  actions?: ReactNode;
  label?: string;
}

export function TimerStrip({ clock, urgent, meta, actions, label = "Time remaining" }: TimerStripProps) {
  return (
    <div className="x-timer-strip" data-urgent={urgent || undefined}>
      <div className="x-timer-strip__clock">
        <Icon name={urgent ? "alert" : "clock"} size={16} />
        <span className="micro x-timer-strip__label">
          {label}:{urgent ? " (under five minutes)" : ""}
        </span>
        {/* role=timer with live-off: a per-second live region is announcement spam.
            The exact figure is always present as text — the non-colour carrier. */}
        <strong className="x-timer-strip__value numeral" role="timer" aria-live="off" aria-label={label}>
          {clock}
        </strong>
      </div>
      {meta ? <p className="x-timer-strip__meta">{meta}</p> : null}
      {actions ? <div className="x-timer-strip__actions">{actions}</div> : null}
    </div>
  );
}

/* ── QuestionPalette ─────────────────────────────────────────────────────── */

export interface PaletteItem {
  /** 1-based display number. */
  n: number;
  answered: boolean;
  marked: boolean;
}

export interface QuestionPaletteProps {
  items: PaletteItem[];
  /** 0-based cursor. */
  current: number;
  onSelect: (index: number) => void;
  label?: string;
}

/**
 * The question index. Three states, three tells that survive greyscale:
 *   current  — aria-current + accent fill + heavier ring
 *   answered — filled tint + a check drawn under the numeral
 *   marked   — a star marker after the numeral (and in the aria-label)
 */
export function QuestionPalette({ items, current, onSelect, label = "Question index" }: QuestionPaletteProps) {
  return (
    <div className="x-question-palette" role="group" aria-label={label}>
      {items.map((item, idx) => {
        const isCurrent = idx === current;
        const state = [
          `Question ${item.n}`,
          item.answered ? "answered" : "unanswered",
          item.marked ? "marked for review" : null
        ].filter(Boolean).join(", ");
        return (
          <button
            key={item.n}
            type="button"
            className="x-question-palette__item"
            data-on={isCurrent || undefined}
            data-done={item.answered || undefined}
            data-marked={item.marked || undefined}
            aria-current={isCurrent ? "true" : undefined}
            aria-label={state}
            onClick={() => onSelect(idx)}
          >
            <span className="x-question-palette__n">{item.n}</span>
            {item.marked ? (
              <span className="x-question-palette__mark" aria-hidden="true">★</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ── AnswerChoice ────────────────────────────────────────────────────────── */

export interface AnswerChoiceProps {
  /** 0-based index; rendered as A., B., C. … */
  index: number;
  text: ReactNode;
  selected: boolean;
  onSelect: () => void;
}

export function AnswerChoice({ index, text, selected, onSelect }: AnswerChoiceProps) {
  return (
    <button
      type="button"
      className="x-answer-choice"
      role="radio"
      aria-checked={selected}
      data-on={selected || undefined}
      onClick={onSelect}
    >
      <span className="x-answer-choice__letter" aria-hidden="true">
        {String.fromCharCode(65 + index)}.
      </span>
      <span className="x-answer-choice__text">{text}</span>
      <span className="x-answer-choice__tick" aria-hidden="true">
        <Icon name="check" size={14} />
      </span>
    </button>
  );
}

/* ── QuestionCard ────────────────────────────────────────────────────────── */

export interface QuestionCardProps {
  index: number;
  total: number;
  prompt: ReactNode;
  choices: string[];
  /** -1 when unanswered. */
  answer: number;
  marked: boolean;
  onPick: (choice: number) => void;
  onToggleMark: () => void;
}

export function QuestionCard({ index, total, prompt, choices, answer, marked, onPick, onToggleMark }: QuestionCardProps) {
  const labelId = useId();
  return (
    <section className="x-question-card" aria-labelledby={labelId}>
      <div className="x-question-card__head">
        <span className="micro x-question-card__item" id={labelId}>
          Item {index + 1} of {total}
        </span>
        <button
          type="button"
          className="x-question-card__mark"
          aria-pressed={marked}
          data-on={marked || undefined}
          onClick={onToggleMark}
        >
          <Icon name="star" size={14} />
          <span>{marked ? "Marked for review" : "Mark for review"}</span>
        </button>
      </div>

      <p className="x-question-card__prompt">{prompt}</p>

      <div className="x-question-card__choices" role="radiogroup" aria-label={`Item ${index + 1} answer choices`}>
        {choices.map((choice, idx) => (
          <AnswerChoice
            key={idx}
            index={idx}
            text={choice}
            selected={answer === idx}
            onSelect={() => onPick(idx)}
          />
        ))}
      </div>
    </section>
  );
}

/* ── SittingNav ──────────────────────────────────────────────────────────── */

export interface SittingNavProps {
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitLabel?: string;
}

export function SittingNav({ isFirst, isLast, onPrev, onNext, onSubmit, submitLabel = "Submit paper" }: SittingNavProps) {
  return (
    <div className="x-sitting-nav">
      <button type="button" className="x-btn x-btn--secondary" disabled={isFirst} onClick={onPrev}>
        <Icon name="arrow-left" size={14} />
        Previous
      </button>
      {isLast ? (
        <button type="button" className="x-btn x-btn--primary" onClick={onSubmit}>
          {submitLabel}
        </button>
      ) : (
        <button type="button" className="x-btn x-btn--primary" onClick={onNext}>
          Next
          <Icon name="arrow-right" size={14} />
        </button>
      )}
    </div>
  );
}

/* ── The assembled chrome ────────────────────────────────────────────────── */

export interface ExamChromeProps {
  banner: IntegrityBannerProps;
  timer: TimerStripProps;
  /** aria-label on the palette group. */
  paletteLabel?: string;
  /** The sitting state from useSitting — ExamChrome never owns it. */
  sitting: {
    i: number;
    answers: number[];
    marked: Readonly<Record<number, boolean>>;
    isFirst: boolean;
    isLast: boolean;
  };
  items: { id: string; prompt: string; choices: string[] }[];
  onSelect: (index: number) => void;
  onPick: (choice: number) => void;
  onToggleMark: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitLabel?: string;
}

/**
 * The full sitting frame. `useSitting` + `useCountdown` feed it; the page maps
 * its data (mock items with answer keys, or company items without) into `items`.
 */
export function ExamChrome({ banner, timer, paletteLabel, sitting, items, onSelect, onPick, onToggleMark, onPrev, onNext, onSubmit, submitLabel }: ExamChromeProps) {
  const q = items[sitting.i];
  if (!q) return null;
  return (
    <div className="x-exam-chrome">
      <IntegrityBanner {...banner} />
      <TimerStrip {...timer} />
      <QuestionPalette
        label={paletteLabel}
        current={sitting.i}
        onSelect={onSelect}
        items={items.map((_item, idx) => ({
          n: idx + 1,
          answered: (sitting.answers[idx] ?? -1) >= 0,
          marked: Boolean(sitting.marked[idx])
        }))}
      />
      <div className="x-exam-chrome__card">
        <QuestionCard
          index={sitting.i}
          total={items.length}
          prompt={q.prompt}
          choices={q.choices}
          answer={sitting.answers[sitting.i] ?? -1}
          marked={Boolean(sitting.marked[sitting.i])}
          onPick={onPick}
          onToggleMark={onToggleMark}
        />
        <SittingNav
          isFirst={sitting.isFirst}
          isLast={sitting.isLast}
          onPrev={onPrev}
          onNext={onNext}
          onSubmit={onSubmit}
          submitLabel={submitLabel}
        />
      </div>
    </div>
  );
}

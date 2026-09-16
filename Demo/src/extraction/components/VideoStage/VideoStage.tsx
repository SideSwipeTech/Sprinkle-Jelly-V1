/**
 * VideoStage — the video chrome: idle/playing stage, chapter badge, transport,
 * speed select, captions toggle, scrubber — plus the transcript pane and
 * chapter list that travel with it (Learn.tsx:653-756).
 *
 * Fixes vs the inline original:
 *  - `#080B16` stage → `var(--editor-shell, var(--c-bg))` — the deep canvas;
 *    Atlas's editor-shell makes it graphite, elsewhere it is the scheme's own
 *    deepest surface (honest theming, not a stated hex);
 *  - indigo chip `rgba(99,102,241,.9/.55)` → `color-mix(--c-accent-primary)`;
 *  - `rgba(255,255,255,*)` chrome → `color-mix(--c-text-primary)` on the dark
 *    stage (the stage's text colour, mixed — a token, not a literal);
 *  - `#2dd4bf` "streaming" marker → `--c-success`;
 *  - dead `animation: "pulse 2s infinite"` (the keyframes were never defined —
 *    the beacon literally could not animate) → the icon system's real
 *    `motion="pulse"`, which honours prefers-reduced-motion;
 *  - `menu` misused as pause → `x-video__pause`, a currentColor bars glyph —
 *    keyline has no `pause` icon (flagged in the report);
 *  - icon-only transport → labelled controls; CC toggle `aria-pressed`;
 *    chapters `aria-current`; scrubber `role="progressbar"`.
 */

import { useId } from "react";
import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import "./VideoStage.css";

export interface VideoStageProps {
  /** e.g. "03 · Nested loops & matrices" — the badge + toggle labels. */
  chapter: string;
  playing: boolean;
  onToggle: () => void;
  /** 0..1 — chapter progress. */
  progress: number;
  /** e.g. "14:20 / 42:00". */
  timeLabel?: string;
  statusText?: string;
  speed: string;
  onSpeedChange: (speed: string) => void;
  speedOptions?: (string | { value: string; label: string })[];
  captionsOn: boolean;
  onCaptionsChange: (on: boolean) => void;
}

/** Two currentColor bars — the pause glyph keyline doesn't ship (flagged). */
function PauseGlyph() {
  return (
    <span className="x-video__pause" aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

export function VideoStage({
  chapter,
  playing,
  onToggle,
  progress,
  timeLabel,
  statusText = "Streaming in-browser — buffered locally, no upload.",
  speed,
  onSpeedChange,
  speedOptions = ["0.75×", "1×", "1.5×", "2×"],
  captionsOn,
  onCaptionsChange
}: VideoStageProps) {
  const speedId = useId();
  const pct = Math.min(1, Math.max(0, progress));

  return (
    <section className="x-video" data-live={playing || undefined} aria-label={`Video: ${chapter}`}>
      <div className="x-video__stage">
        {!playing ? (
          <button
            type="button"
            className="x-video__play"
            onClick={onToggle}
            aria-label={`Play chapter ${chapter}`}
          >
            <Icon name="play" size={22} />
          </button>
        ) : (
          <div className="x-video__live" role="status">
            <Icon name="radio" size={18} motion="pulse" />
            <span className="x-video__live-text">Streaming — {chapter}</span>
          </div>
        )}

        <div className="x-video__meta">
          <span className="x-video__badge">{chapter}</span>
          <div className="x-video__controls">
            <button
              type="button"
              className="x-video__control"
              onClick={onToggle}
              aria-pressed={playing}
              aria-label={playing ? `Pause chapter ${chapter}` : `Play chapter ${chapter}`}
            >
              {playing ? <PauseGlyph /> : <Icon name="play" size={13} />}
              <span className="x-video__control-label">{playing ? "Pause" : "Play"}</span>
            </button>

            {/* Select hooks (sibling class reference, contract §6) — the one
                styled select, re-skinned for the stage by x-video.css. */}
            <span className="x-select x-select--sm x-video__speed">
              <select
                id={speedId}
                className="x-select__input"
                value={speed}
                onChange={(e) => onSpeedChange(e.target.value)}
                aria-label="Playback speed"
              >
                {speedOptions.map((o) => {
                  const { value, label } = typeof o === "string" ? { value: o, label: o } : o;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <Icon name="chevron-down" size={12} />
            </span>

            <button
              type="button"
              className="x-video__control x-video__cc"
              data-on={captionsOn || undefined}
              aria-pressed={captionsOn}
              onClick={() => onCaptionsChange(!captionsOn)}
              aria-label={captionsOn ? "Captions on" : "Captions off"}
            >
              CC
            </button>
          </div>
        </div>
      </div>

      <div className="x-video__scrub">
        <div
          className="x-video__track"
          role="progressbar"
          aria-label="Chapter progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct * 100)}
        >
          {/* progress is runtime data — the fill width IS the value */}
          <div className="x-video__fill" style={{ width: `${pct * 100}%` }} />
        </div>
        <div className="x-video__scrub-row">
          <span className="x-video__time">{timeLabel}</span>
          <span className="x-video__status">{statusText}</span>
        </div>
      </div>
    </section>
  );
}

/* ── Transcript pane ─────────────────────────────────────────────────────── */

export interface TranscriptLine {
  time: string;
  speaker?: string;
  text: string;
}

export function TranscriptPane({
  lines,
  label = "Transcript",
  heading,
  actions
}: {
  lines: TranscriptLine[];
  label?: string;
  /** Heading copy above the scroller. */
  heading?: ReactNode;
  /** Action slot — the mark-covered CTA lives here (Learn.tsx:746-752). */
  actions?: ReactNode;
}) {
  return (
    <section className="x-video__transcript" aria-label={label}>
      {heading || actions ? (
        <div className="x-video__transcript-head">
          {heading ? <h3 className="x-video__transcript-title">{heading}</h3> : null}
          {actions ? <div className="x-video__transcript-actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="x-video__transcript-scroll">
        {lines.map((line, i) => (
          <p key={i} className="x-video__transcript-line">
            <span className="x-video__transcript-time">{line.time}</span>
            {line.speaker ? <span className="x-video__transcript-speaker">{line.speaker}</span> : null}
            <span className="x-video__transcript-text">{line.text}</span>
          </p>
        ))}
      </div>
    </section>
  );
}

/* ── Chapter list ────────────────────────────────────────────────────────── */

export interface Chapter {
  title: string;
  /** e.g. "12:40" — rendered as a chip. */
  length: string;
  /** Marked covered — shows a check + data-covered. */
  covered?: boolean;
}

export function ChapterList({
  chapters,
  active,
  onSelect,
  label = "Chapters"
}: {
  chapters: Chapter[];
  /** Index of the currently playing chapter. */
  active: number;
  onSelect?: (index: number) => void;
  label?: string;
}) {
  /* x-list / x-list-row are the containers family's row hooks (§6 sibling
     reference) — the chapter list is exactly that row. Interactive rows are
     real buttons; static rows are divs (no fake-disabled controls). */
  return (
    <div className="x-list x-video__chapters" role="group" aria-label={label}>
      {chapters.map((c, i) => {
        const isCurrent = i === active;
        const inner = (
          <>
            <span className="x-chip x-chip--quiet">{c.length}</span>
            <span className="x-video__chapter-title">{c.title}</span>
            {c.covered ? (
              <span className="x-video__chapter-done">
                <Icon name="check" size={12} />
                <span className="x-video__sr">covered</span>
              </span>
            ) : null}
          </>
        );
        const attrs = {
          "data-on": isCurrent || undefined,
          "data-done": c.covered || undefined,
          "aria-current": isCurrent || undefined
        };
        return onSelect ? (
          <button
            key={i}
            type="button"
            className="x-list-row x-video__chapter"
            onClick={() => onSelect(i)}
            {...attrs}
          >
            {inner}
          </button>
        ) : (
          <div key={i} className="x-list-row x-video__chapter" {...attrs}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

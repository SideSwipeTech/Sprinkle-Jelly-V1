/**
 * reader-bodies.tsx — the per-type lesson bodies the reader mounts in its
 * content pane. Each kind owns its completion shape:
 *
 *   text / video           prose + runnable sample / simulated playback
 *   quiz                   the authored questions and their single submit —
 *                          a completed quiz reads back as its review
 *   course-project         the brief plus the starter-template route; the
 *                          mark-complete action lives in the footer and says
 *                          it is the learner's own assessment
 *   integration-reference  the authored pointer to the platform item; the
 *                          lesson stands covered when the target does
 *
 * Bodies render only the published copy the adapter resolved — a missing
 * body is the reader's unavailable state, never a fabricated stub.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import type { LessonContent } from "@data/courses-demo";
import { SandboxCard } from "../../extraction/components/SandboxCard/SandboxCard";
import { CodeEditorChrome, type SupportedLanguage } from "../../extraction/components/CodeEditorChrome/CodeEditorChrome";
import type { LessonBlock } from "../../extraction/components/LessonBlockEditor/LessonBlockEditor";
import { isRunnableSupported } from "../../extraction/components/LessonBlockEditor/blocks";

/* ── Runnable sample — simulated, and it says so ─────────────────────────── */

export function RunnableSample({ code, language, filename }: { code: string; language: string; filename: string }) {
  const [draft, setDraft] = useState(code);
  const [running, setRunning] = useState(false);
  const [out, setOut] = useState<string | null>(null);
  return (
    <SandboxCard
      language={language}
      running={running}
      output={out}
      onReset={() => {
        setDraft(code);
        setOut(null);
      }}
      onRun={() => {
        if (running) return;
        setRunning(true);
        setOut(null);
        window.setTimeout(() => {
          setRunning(false);
          setOut(
            `${filename} · ${language}\n` +
              "Simulated run — this demo executes nothing. In the product the snippet's\n" +
              "stdout streams here; the run records nothing and marks nothing complete."
          );
        }, 450);
      }}
    >
      <CodeEditorChrome
        value={draft}
        onChange={setDraft}
        language={(language as SupportedLanguage) ?? "python"}
        filename={filename}
        engine="custom"
        hideHeader
        hideFooter
      />
    </SandboxCard>
  );
}

/* ── Published blocks — the snapshot/draft-published body ────────────────── */

function ReaderBlock({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "heading": {
      const Tag = block.level === 3 ? "h4" : "h3";
      return <Tag className="reader__block-heading">{block.text?.trim() || "Untitled heading"}</Tag>;
    }
    case "rich-text":
      return (
        <div className="prose">
          {(block.text ?? "").split(/\n\s*\n/).map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : null
          )}
        </div>
      );
    case "callout":
      return (
        <div className="reader__callout" data-kind={block.kind ?? "note"}>
          <p className="micro reader__callout-label">
            {block.kind === "key-takeaway" ? "Key takeaway" : "Note"}
          </p>
          <p>{block.text}</p>
        </div>
      );
    case "image":
      return block.src ? (
        <figure className="reader__figure">
          <img src={block.src} alt={block.alt ?? ""} />
          {block.caption ? <figcaption className="meta">{block.caption}</figcaption> : null}
        </figure>
      ) : (
        <p className="meta" role="status">
          <Icon name="alert" size={14} /> Image unavailable
        </p>
      );
    case "display-code":
      return (
        <CodeEditorChrome
          value={block.code ?? ""}
          language={(block.language ?? "python") as SupportedLanguage}
          filename={block.filename || "untitled"}
          height="12rem"
          showMinimap={false}
          readOnly
        />
      );
    case "runnable-code":
      return isRunnableSupported(block.language) ? (
        <RunnableSample
          code={block.code ?? ""}
          language={block.language ?? "python"}
          filename={block.filename || "try-it"}
        />
      ) : (
        <p className="meta" role="status">
          <Icon name="clock" size={14} /> {block.language || "This language"} — runnable examples in
          this language are coming soon
        </p>
      );
  }
}

/* ── Per-type bodies ─────────────────────────────────────────────────────── */

export function TextLikeBody({ content }: { content: LessonContent }) {
  return (
    <>
      {content.blocks && content.blocks.length > 0 ? (
        content.blocks.map((b) => <ReaderBlock key={b.id} block={b} />)
      ) : (
        <div className="prose">
          {content.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      {content.codeSample ? (
        <RunnableSample
          code={content.codeSample}
          language={content.codeLang ?? "python"}
          filename={`snippet.${content.codeLang === "javascript" ? "js" : content.codeLang === "typescript" ? "ts" : content.codeLang === "go" ? "go" : "py"}`}
        />
      ) : null}
    </>
  );
}

export function QuizBody({
  content,
  done,
  onComplete
}: {
  content: LessonContent;
  done: boolean;
  onComplete: () => void;
}) {
  const questions = content.quiz ?? [];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  /** Submitted in THIS session — a previously completed quiz has no stored
   *  answers to score against, so the review reads without a number. */
  const [submitted, setSubmitted] = useState(false);
  /** courses.F52 — taking it again is always available; a practice re-run
   *  re-enables the fieldset without touching the recorded completion. */
  const [practising, setPractising] = useState(false);
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const score = questions.filter((q) => answers[q.id] === q.answer).length;

  if (questions.length === 0) {
    return (
      <StateBlock
        state="unavailable"
        compact
        message="This quiz carries no authored questions — nothing to submit."
      />
    );
  }

  // A completed quiz reads back as its review; a practice re-run is the one
  // way back into the fieldset.
  const reviewing = !practising && (submitted || done);

  return (
    <div className="reader__quiz">
      {content.body.length > 0 ? (
        <div className="prose">
          {content.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
      {questions.map((q, qi) => {
        const picked = answers[q.id];
        return (
          <fieldset key={q.id} className="reader__question" disabled={reviewing}>
            <legend className="reader__question-prompt">
              {qi + 1}. {q.prompt}
            </legend>
            {q.choices.map((choice, ci) => {
              const isPicked = reviewing ? ci === q.answer : picked === ci;
              const wrongPick = reviewing && picked !== undefined && picked === ci && ci !== q.answer;
              return (
                <button
                  key={ci}
                  type="button"
                  className="choice"
                  data-on={isPicked || undefined}
                  data-wrong={wrongPick || undefined}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: ci }))}
                >
                  <span className="reader__choice-letter">{String.fromCharCode(65 + ci)}.</span>
                  <span>{choice}</span>
                </button>
              );
            })}
            {reviewing && q.explanation ? <p className="meta reader__why">{q.explanation}</p> : null}
          </fieldset>
        );
      })}
      {reviewing ? (
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p className="meta" style={{ margin: 0 }}>
            {submitted
              ? `Submitted — ${score} of ${questions.length} correct.`
              : "Submitted — this quiz is complete. The review shows the authored answers."}
          </p>
          {/* courses.F52: taking it again is always available — the recorded
              completion stands either way, so a re-run is practice only. */}
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
              setPractising(true);
            }}
          >
            Practice again — the record stands
          </button>
        </div>
      ) : (
        <div className="row">
          <button
            type="button"
            className="btn btn--primary"
            disabled={!allAnswered}
            onClick={() => {
              setSubmitted(true);
              setPractising(false);
              onComplete();
            }}
          >
            Submit answers
          </button>
          <span className="meta">
            {Object.keys(answers).length} of {questions.length} answered — the submit completes the lesson
          </span>
        </div>
      )}
    </div>
  );
}

export function ProjectBody({ content }: { content: LessonContent }) {
  return (
    <>
      <div className="prose">
        {content.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {content.projectTemplateId ? (
        <p>
          <Link className="btn btn--secondary" to={`/projects/new?template=${content.projectTemplateId}`}>
            <Icon name="projects" size={14} /> Open the starter in the project workspace
          </Link>
        </p>
      ) : null}
      <p className="meta">
        There is no external grading — you judge the work against the brief, then mark the lesson.
      </p>
    </>
  );
}

export function ReferenceBody({ content, covered }: { content: LessonContent; covered: boolean }) {
  const target = content.referenceTarget;
  return (
    <>
      <div className="prose">
        {content.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {target ? (
        <div className="reader__reference">
          <Link className="btn btn--primary" to={`/challenges/${target.id}`}>
            <Icon name="challenges" size={14} /> Open {target.title}
          </Link>
          <p className="meta">
            {covered
              ? `Covered — ${target.title} stands solved on this device.`
              : `This lesson stands covered when ${target.title} does — it marks itself, nothing to press here.`}
          </p>
        </div>
      ) : (
        <StateBlock
          state="unavailable"
          compact
          message="The authored reference target is missing — the pointer was published without a destination."
        />
      )}
    </>
  );
}

export function VideoTypeBody({ content }: { content: LessonContent }) {
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <div className="reader__video" data-on={playing || undefined}>
        <button
          type="button"
          className="reader__video-toggle"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          data-on={playing || undefined}
        >
          <Icon name="play" size={20} />
          <span>{playing ? "Playing — simulated stream" : "Play this video lesson"}</span>
        </button>
        <p className="meta">Playback is simulated in this demo; marking watched is the real record.</p>
      </div>
      {content.body.length > 0 ? (
        <div className="prose">
          {content.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
    </>
  );
}

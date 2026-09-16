/**
 * reader.tsx — `/courses/:courseId/lessons/:lessonId`. The focused reader
 * (courses W06): the authored chapter→lesson outline rides beside the content
 * with the current chapter expanded and the current lesson selected; on
 * compact widths the same outline opens as a Contents drawer instead.
 *
 * Completion belongs to the lesson type, never to Next:
 *
 *   text / video           an explicit mark-complete action
 *   quiz                   the single authored submit — the submission IS the
 *                          completion; there is no retake and no Next-marking
 *   course-project         the learner's own assessment of their own work
 *   integration-reference  derives from the target's own standing — no button
 *
 * Previous and Next only move. Notes stay the shell's floating Quick Notes —
 * no second notes pane eats a column here.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, StateBlock } from "@components/Card";
import { Back, CoverageTag, Page } from "@components/Page";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { useStore } from "@state/useStore";
import { completeLesson, enroll, noteLessonPosition, type Store } from "@state/store";
import { raise } from "@companion/stream";
import {
  courseProgress,
  isLessonComplete,
  learnerSubject,
  lessonContent,
  type CourseLessonType,
  type LearnerSubject,
  type LessonContent,
  type OutlineLesson
} from "@data/courses-demo";
import { Drawer } from "../../extraction/components/Drawer/Drawer";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { ProjectBody, QuizBody, ReferenceBody, TextLikeBody, VideoTypeBody } from "./reader-bodies";
import { usePageEntry } from "./navigation";

const TYPE_ICON: Record<CourseLessonType, IconName> = {
  text: "lessons",
  video: "play",
  quiz: "flask",
  "course-project": "projects",
  "integration-reference": "external-link"
};

const TYPE_LABEL: Record<CourseLessonType, string> = {
  text: "lesson",
  video: "video",
  quiz: "quiz",
  "course-project": "project",
  "integration-reference": "reference"
};

/* ── The outline — one structure feeds the rail and the drawer ───────────── */

function OutlineTree({
  subject,
  currentId,
  store,
  onNavigate
}: {
  subject: LearnerSubject;
  currentId: string;
  store: Store;
  onNavigate?: () => void;
}) {
  const currentChapterId =
    subject.chapters.find((c) => c.lessons.some((l) => l.id === currentId))?.id ?? null;
  const [open, setOpen] = useState<Set<string>>(() =>
    currentChapterId ? new Set([currentChapterId]) : new Set()
  );

  // The chapter holding the current lesson is always expanded; others stay as
  // the learner left them.
  useEffect(() => {
    if (!currentChapterId) return;
    setOpen((prev) => (prev.has(currentChapterId) ? prev : new Set(prev).add(currentChapterId)));
  }, [currentChapterId]);

  let n = 0;
  return (
    <nav aria-label={`${subject.title} contents`} className="reader__outline">
      {subject.chapters.map((ch) => {
        const isOpen = open.has(ch.id);
        const holdsCurrent = ch.id === currentChapterId;
        return (
          <section key={ch.id} className="reader__chapter" data-current={holdsCurrent || undefined}>
            {ch.title ? (
              <button
                type="button"
                className="reader__chapter-head"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpen((prev) => {
                    const next = new Set(prev);
                    if (next.has(ch.id)) next.delete(ch.id);
                    else next.add(ch.id);
                    return next;
                  })
                }
              >
                <Icon name={isOpen ? "chevron-down" : "chevron-right"} size={14} />
                <span>{ch.title}</span>
              </button>
            ) : null}
            {isOpen || !ch.title ? (
              <ol className="reader__lessons">
                {ch.lessons.map((l) => {
                  n += 1;
                  const done = isLessonComplete(l, store);
                  const current = l.id === currentId;
                  return (
                    <li key={l.id}>
                      <Link
                        className="reader__lesson"
                        to={`/courses/${subject.id}/lessons/${l.id}`}
                        aria-current={current ? "page" : undefined}
                        data-done={done || undefined}
                        onClick={onNavigate}
                      >
                        <span className="reader__lesson-n">{String(n).padStart(2, "0")}</span>
                        <span className="reader__lesson-main">
                          <span className="reader__lesson-title">
                            <Icon name={TYPE_ICON[l.type]} size={13} />
                            {l.title}
                          </span>
                          <span className="reader__lesson-meta">
                            {TYPE_LABEL[l.type]}
                            {l.minutes ? ` · ${l.minutes} min` : ""}
                            {l.required ? "" : " · optional"}
                          </span>
                        </span>
                        <Icon name={done ? "check" : "chevron-right"} size={14} />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </section>
        );
      })}
    </nav>
  );
}

/* ── The completion row ──────────────────────────────────────────────────── */

function CompletionAction({
  content,
  done,
  onComplete,
  onRequestConfirm
}: {
  content: LessonContent;
  done: boolean;
  onComplete: () => void;
  /** course.F30 — a project completes on a confirmed own-assessment; the
   *  page owns the confirm dialog so the control stays a plain press. */
  onRequestConfirm: () => void;
}) {
  if (done) {
    return (
      <span className="chip chip--quiet">
        <Icon name="check" size={12} /> Completed
      </span>
    );
  }
  switch (content.type) {
    case "quiz":
      // The quiz body owns its submit — it is the completion.
      return <span className="meta">Complete by submitting the quiz above.</span>;
    case "course-project":
      return (
        <button type="button" className="btn btn--primary" onClick={onRequestConfirm}>
          Mark complete
        </button>
      );
    case "integration-reference":
      return <span className="meta">Covered when the referenced challenge stands solved.</span>;
    case "video":
      return (
        <button type="button" className="btn btn--primary" onClick={onComplete}>
          Mark watched
        </button>
      );
    default:
      return (
        <button type="button" className="btn btn--primary" onClick={onComplete}>
          Mark lesson complete
        </button>
      );
  }
}

/* ── The page ────────────────────────────────────────────────────────────── */

export function LessonReader() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const [contentsOpen, setContentsOpen] = useState(false);
  /** The lesson the completion confirmation was opened for — navigating away
   *  closes it rather than letting a stale confirm mark the wrong lesson. */
  const [confirmingFor, setConfirmingFor] = useState<string | null>(null);
  usePageEntry();

  const subject = learnerSubject(courseId, store);
  const flat = subject?.chapters.flatMap((c) => c.lessons) ?? [];
  const outlineLesson = flat.find((l) => l.id === lessonId) ?? null;
  const idx = outlineLesson ? flat.findIndex((l) => l.id === outlineLesson.id) : -1;
  const prev = idx > 0 ? flat[idx - 1]! : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1]! : null;
  const content = subject && outlineLesson ? lessonContent(subject.id, outlineLesson.id, store) : null;

  // Opening a lesson enrols the subject (a first lesson is the start action)
  // and records the Continue place — it never completes anything.
  useEffect(() => {
    if (!subject || !outlineLesson) return;
    enroll(subject.id);
    noteLessonPosition(subject.id, outlineLesson.id);
    // The ids are the real dependency — the objects are rebuilt per read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject?.id, outlineLesson?.id]);

  if (!subject) {
    return (
      <Page kind="sink" kicker="Courses" title="Subject unavailable" actions={<Back to="/courses">Courses</Back>}>
        <Card>
          <StateBlock
            state="unavailable"
            message="This subject isn't published here — it may have been withdrawn, or the link points at something that was never live."
            action={<Link className="btn btn--primary" to="/courses">Back to courses</Link>}
          />
        </Card>
      </Page>
    );
  }

  if (!outlineLesson) {
    return (
      <Page
        kind="sink"
        kicker={subject.title}
        title="Lesson unavailable"
        actions={<Back to={`/courses/${subject.id}`}>{subject.title}</Back>}
      >
        <Card>
          <StateBlock
            state="unavailable"
            message="This lesson isn't in the published outline — it may be an unpublished draft or a retired address. Drafts never reach this reader."
            action={<Link className="btn btn--primary" to={`/courses/${subject.id}`}>Open the outline</Link>}
          />
        </Card>
      </Page>
    );
  }

  const prog = courseProgress(subject, store);
  const done = isLessonComplete(outlineLesson, store);
  const chapter = subject.chapters.find((c) => c.lessons.some((l) => l.id === outlineLesson.id));

  const markComplete = () => {
    completeLesson(subject.id, outlineLesson.id);
    // `store` is the pre-completion snapshot — if every other lesson already
    // stood complete, this mark finishes the subject.
    const finishesCourse = flat.every((l) => l.id === outlineLesson.id || isLessonComplete(l, store));
    raise(finishesCourse ? "course completed" : "completed",
      finishesCourse ? { course: subject.title } : { what: outlineLesson.title });
  };

  const openLesson = (l: OutlineLesson) => navigate(`/courses/${subject.id}/lessons/${l.id}`);

  return (
    <Page
      kind="sink"
      kicker={`${subject.title}${chapter?.title ? ` · ${chapter.title}` : ""}`}
      title={outlineLesson.title}
      lead={`${TYPE_LABEL[outlineLesson.type]} ${idx + 1} of ${flat.length}${outlineLesson.minutes ? ` · ${outlineLesson.minutes} min` : ""}${outlineLesson.required ? "" : " · optional"}`}
      actions={<Back to={`/courses/${subject.id}`}>Outline</Back>}
    >
      <button
        type="button"
        className="btn btn--secondary reader__contents-btn"
        onClick={() => setContentsOpen(true)}
      >
        <Icon name="list" size={16} /> Contents
      </button>

      <div className="reader">
        <aside className="reader__rail" aria-label="Course contents">
          <div className="reader__rail-head">
            <CoverageTag coverage={prog.status} />
            <span className="meta">
              {prog.completed} of {prog.total} · {prog.percent}%
            </span>
          </div>
          <OutlineTree subject={subject} currentId={outlineLesson.id} store={store} />
        </aside>

        <div className="reader__content">
          <Card>
            {content ? (
              <div className="reader__body" key={content.id}>
                {content.keyTakeaway ? (
                  <div className="reader__callout" data-kind="key-takeaway">
                    <p className="micro reader__callout-label">Key takeaway</p>
                    <p>{content.keyTakeaway}</p>
                  </div>
                ) : null}
                {content.type === "quiz" ? (
                  <QuizBody content={content} done={done} onComplete={markComplete} />
                ) : content.type === "course-project" ? (
                  <ProjectBody content={content} />
                ) : content.type === "integration-reference" ? (
                  <ReferenceBody content={content} covered={done} />
                ) : content.type === "video" ? (
                  <VideoTypeBody content={content} />
                ) : (
                  <TextLikeBody content={content} />
                )}
                {content.outcomes.length > 0 ? (
                  <div className="reader__outcomes">
                    <p className="micro reader__callout-label">This lesson covers</p>
                    <ul className="list">
                      {content.outcomes.map((o) => (
                        <li key={o} className="meta">
                          <Icon name="check" size={13} /> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <StateBlock
                state="unavailable"
                message="The published copy of this lesson could not be read — its content is unavailable, not missing work of yours."
              />
            )}
          </Card>

          <nav className="reader__nav" aria-label="Lesson">
            {prev ? (
              <button type="button" className="btn btn--quiet" onClick={() => openLesson(prev)}>
                <Icon name="chevron-left" size={14} /> {prev.title}
              </button>
            ) : (
              <span />
            )}
            {/* No readable published body means no completion control — a
                learner cannot complete a lesson the platform failed to serve. */}
            {content ? (
              <CompletionAction
                content={content}
                done={done}
                onComplete={markComplete}
                onRequestConfirm={() => setConfirmingFor(outlineLesson.id)}
              />
            ) : (
              <span />
            )}
            {next ? (
              <button type="button" className="btn btn--secondary" onClick={() => openLesson(next)}>
                Next — {next.title} <Icon name="chevron-right" size={14} />
              </button>
            ) : prog.status === "completed" ? (
              <Link className="btn btn--primary" to={`/courses/${subject.id}/complete`}>
                Finish — the completion record
              </Link>
            ) : (
              <Link className="btn btn--secondary" to={`/courses/${subject.id}`}>
                Last published lesson — back to the outline
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* course.F30 — a course project completes on the learner's confirmed
          own assessment of their own work; nothing inspects or grades it. */}
      <Dialog
        open={confirmingFor === outlineLesson.id}
        onClose={() => setConfirmingFor(null)}
        title="Your own assessment"
        actions={
          <>
            <button
              type="button"
              className="btn btn--primary"
              data-autofocus
              onClick={() => {
                setConfirmingFor(null);
                markComplete();
              }}
            >
              Confirm — the work meets the brief
            </button>
            <button type="button" className="btn btn--quiet" onClick={() => setConfirmingFor(null)}>
              Not yet
            </button>
          </>
        }
      >
        <p>
          This records the lesson complete on your own assessment of your own work — nothing
          inspects or grades it, now or later.
        </p>
      </Dialog>

      <Drawer
        open={contentsOpen}
        onClose={() => setContentsOpen(false)}
        label="Course contents"
        heading={
          <div>
            <p className="micro page__kicker">{subject.title}</p>
            <h2 style={{ margin: 0, fontSize: "var(--text-lg)" }}>Contents</h2>
          </div>
        }
      >
        <OutlineTree
          subject={subject}
          currentId={outlineLesson.id}
          store={store}
          onNavigate={() => setContentsOpen(false)}
        />
      </Drawer>
    </Page>
  );
}

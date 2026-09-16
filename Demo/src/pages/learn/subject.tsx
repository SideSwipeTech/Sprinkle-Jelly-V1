/**
 * subject.tsx — `/courses/:courseId`. The orientation (courses.F56): the
 * platform assembles the authored sections — overview, outcomes, audience and
 * prior knowledge, the real outline, estimated time, languages and tools,
 * required and optional work, navigation and completion behaviour, project
 * and certificate. Looking enrols nothing and completes nothing.
 *
 * The outline is the authored chapters→lessons structure; there are no
 * generic tabs pretending every subject carries video, quizzes and projects.
 * The change record appears only for a returning enrolled learner on a
 * subject that has one — dismissible, and only the three authored kinds.
 */

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Charge } from "@components/Charge";
import { Back, CoverageTag, Page } from "@components/Page";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { useStore } from "@state/useStore";
import { enroll, noteLessonPosition } from "@state/store";
import { PROJECT_TEMPLATES } from "@data/catalog";
import {
  courseProgress,
  isLessonComplete,
  learnerSubject,
  learnerSubjects,
  type CourseLessonType,
  type LearnerSubject,
  type OutlineLesson
} from "@data/courses-demo";
import { OutlineList, OutlineRow } from "../../extraction/components/OutlineRow/OutlineRow";
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

function lessonMeta(l: OutlineLesson): string {
  const bits = [TYPE_LABEL[l.type]];
  if (l.minutes) bits.push(`${l.minutes} min`);
  if (!l.required) bits.push("optional");
  return bits.join(" · ");
}

/* ── Change brief — returning learners only, authored record only ────────── */

function ChangeBrief({ subject, onDismiss }: { subject: LearnerSubject; onDismiss: () => void }) {
  const brief = subject.changeBrief!;
  const groups = ([
    ["Added", brief.added],
    ["Updated", brief.updated],
    ["Removed", brief.removed]
  ] as const).filter(([, items]) => items.length > 0);
  return (
    <Card className="change-brief">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 className="outline-label" style={{ margin: 0 }}>What changed since your last visit</h3>
        <button type="button" className="btn btn--quiet" onClick={onDismiss} style={{ padding: "2px 8px" }}>
          Dismiss
        </button>
      </div>
      <ul className="list" style={{ marginTop: "var(--space-3)" }}>
        {groups.map(([kind, items]) =>
          items.map((item) => (
            <li key={`${kind}:${item}`} className="meta">
              <strong>{kind}</strong> — {item}
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const [briefDismissed, setBriefDismissed] = useState(false);
  usePageEntry();

  const subject = learnerSubject(courseId, store);
  if (!subject) {
    return (
      <Page kind="courses" kicker="Courses" title="Subject unavailable" actions={<Back to="/courses">Courses</Back>}>
        <Card>
          <StateBlock
            state="unavailable"
            message="This subject isn't published here — it may have been withdrawn, or the link points at something that was never live. The catalogue lists only what is published."
            action={<Link className="btn btn--primary" to="/courses">Back to courses</Link>}
          />
        </Card>
      </Page>
    );
  }

  const prog = courseProgress(subject, store);
  const enrolled = store.enrolled.includes(subject.id);
  const flat = subject.chapters.flatMap((c) => c.lessons);
  const nextLesson = flat.find((l) => l.id === prog.nextLessonId) ?? null;
  const hasProject = flat.some((l) => l.type === "course-project");
  const projectTemplate = flat.find((l) => l.type === "course-project")?.projectTemplateId
    ? PROJECT_TEMPLATES.find((t) => t.id === flat.find((l) => l.type === "course-project")!.projectTemplateId)
    : null;
  const hasRunnable = flat.some((l) => l.type === "text");
  const totalMinutes = flat.reduce((sum, l) => sum + (l.minutes ?? 0), 0);
  const optionalCount = flat.filter((l) => !l.required).length;
  const certificate = store.certificates.find((c) => c.title === subject.title);
  const videoSibling = subject.videoCourseId;
  const showBrief = Boolean(subject.changeBrief) && !briefDismissed && enrolled && prog.completed > 0;

  // Prerequisites: resolve the ones that name a known subject so each shows
  // the learner's own status and a route to it; others read as expected.
  const subjects = learnerSubjects(store);
  const prereqs = subject.prerequisites.filter(
    (p) => !/^none\b/i.test(p.trim())
  );

  const firstLesson = flat[0] ?? null;
  const openFirst = () => {
    if (!firstLesson) return;
    enroll(subject.id);
    noteLessonPosition(subject.id, firstLesson.id);
    navigate(`/courses/${subject.id}/lessons/${firstLesson.id}`);
  };

  return (
    <Page
      kind="courses"
      kicker={subject.track ? `Courses · ${subject.track}` : "Courses"}
      title={subject.title}
      lead={subject.summary || undefined}
      actions={<Back to="/courses">Courses</Back>}
    >
      {showBrief ? <ChangeBrief subject={subject} onDismiss={() => setBriefDismissed(true)} /> : null}

      <div className="grid-2">
        <div className="col">
          <Card>
            <CardHeader eyebrow="Orientation" title="The outline" icon="list" />
            {subject.chapters.map((ch, ci) => {
              const offset = subject.chapters.slice(0, ci).reduce((s, c) => s + c.lessons.length, 0);
              return (
                <section key={ch.id}>
                  {ch.title ? (
                    <p className="outline-label">
                      {ci + 1}. {ch.title}
                    </p>
                  ) : null}
                  <OutlineList label={ch.title ?? "Course outline"}>
                    {ch.lessons.map((l, li) => {
                      const done = isLessonComplete(l, store);
                      return (
                        <OutlineRow
                          key={l.id}
                          n={offset + li + 1}
                          to={`/courses/${subject.id}/lessons/${l.id}`}
                          done={done}
                          title={
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                              <Icon name={TYPE_ICON[l.type]} size={13} />
                              {l.title}
                            </span>
                          }
                          meta={lessonMeta(l)}
                        />
                      );
                    })}
                  </OutlineList>
                </section>
              );
            })}
            {flat.length === 0 ? (
              <StateBlock state="empty" compact message="No lessons are published for this subject yet." />
            ) : null}
          </Card>

          {subject.outcomes.length > 0 ? (
            <Card>
              <CardHeader title="What you'll learn" icon="target" />
              <ul className="list">
                {subject.outcomes.map((o) => (
                  <li key={o}>
                    <Icon name="check" size={14} /> {o}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="col">
          <Card>
            <CardHeader eyebrow="Your standing" title="Coverage" icon="achievements" />
            <div className="stat">
              <CoverageTag coverage={prog.status} />
            </div>
            <Charge value={prog.total > 0 ? prog.percent : null} label={`${prog.completed} of ${prog.total} lessons`} asOf="this device" />
            <ul className="list" style={{ marginTop: "var(--space-3)" }}>
              <li className="meta"><strong>{subject.duration}</strong> estimated · about {totalMinutes} min across {flat.length} published lesson{flat.length === 1 ? "" : "s"}</li>
              {subject.language ? <li className="meta">Language: {subject.language}{hasRunnable ? " — in-page sandbox, simulated run" : ""}</li> : null}
              {subject.level ? <li className="meta">Level: {subject.level}</li> : null}
              <li className="meta">
                {optionalCount > 0
                  ? `${subject.requiredCount} required · ${optionalCount} optional — optionals add coverage, never block completion`
                  : `All ${subject.requiredCount} lessons required`}
              </li>
            </ul>
            <div className="col" style={{ marginTop: "var(--space-4)" }}>
              {!enrolled && firstLesson ? (
                <button type="button" className="btn btn--primary" onClick={openFirst}>
                  Open first lesson
                </button>
              ) : null}
              {enrolled && nextLesson ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    noteLessonPosition(subject.id, nextLesson.id);
                    navigate(`/courses/${subject.id}/lessons/${nextLesson.id}`);
                  }}
                >
                  {prog.completed > 0 ? `Continue — ${nextLesson.title}` : "Open first lesson"}
                </button>
              ) : null}
              {enrolled && prog.status === "completed" ? (
                <Link className="btn btn--secondary" to={`/courses/${subject.id}/complete`}>Completion record</Link>
              ) : null}
              {firstLesson && enrolled && prog.completed > 0 ? (
                <Link className="btn btn--quiet" to={`/courses/${subject.id}/lessons/${firstLesson.id}`}>
                  Review from the first lesson
                </Link>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Before you begin" icon="info" />
            {prereqs.length === 0 ? (
              <p className="meta">Prior knowledge: none — first principles.</p>
            ) : (
              <ul className="list">
                {prereqs.map((p) => {
                  const target = subjects.find((s) => s.title.toLowerCase() === p.toLowerCase());
                  if (!target) return <li key={p} className="meta">Expected: {p}.</li>;
                  const pprog = courseProgress(target, store);
                  return (
                    <li key={p} className="meta">
                      {pprog.status === "completed" ? (
                        <>Covered — <Link to={`/courses/${target.id}`}>{p}</Link> stands complete.</>
                      ) : (
                        <>Expected: <Link to={`/courses/${target.id}`}>{p}</Link> — {pprog.completed} of {pprog.total} covered. Open it first if the ground is new.</>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="meta" style={{ marginTop: "var(--space-3)" }}>
              Lessons mark complete only through their own action — Next moves, it never marks.
              Quizzes submit once; a course project completes on your own assessment.
            </p>
            {videoSibling ? (
              <p className="meta">
                The same ground is also published as a video course —{" "}
                <Link to={`/courses/video/${videoSibling}`}>open the course</Link>.
              </p>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="Project and certificate" icon="trophy" />
            <ul className="list">
              <li className="meta">
                {hasProject && projectTemplate
                  ? <>Course project: <Link to={`/projects/new?template=${projectTemplate.id}`}>{projectTemplate.title}</Link> — marked complete on your own assessment of your own work.</>
                  : hasProject
                    ? "A course project is assigned — open the project lesson for the starter."
                    : "No course project is assigned for this subject."}
              </li>
              <li className="meta">
                {certificate
                  ? `A completion certificate for this subject is recorded on this device (awarded ${certificate.awarded}).`
                  : prog.status === "completed"
                    ? "No certificate is attached to this subject."
                    : `Complete all ${subject.requiredCount} required lessons to record a completion on this device.`}
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Page>
  );
}

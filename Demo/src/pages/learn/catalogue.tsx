/**
 * catalogue.tsx — `/courses`. One destination, two families (courses.F01):
 * Interactive Lessons and Video Courses in visibly separate tabs that never
 * share records, progress or completion. A compact Continue strip resumes
 * exactly one valid target — or hides itself when none stands.
 *
 * Card anatomy: the title is the link into the subject/course, one primary
 * action matches the learner's state (Open subject / Continue / Open course),
 * and a labelled three-dot menu carries the secondary places. Progress on
 * every card is the same figure the reader and orientation show — the
 * adapter's single selector.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, StateBlock } from "@components/Card";
import { CoverageTag, Page } from "@components/Page";
import { Icon } from "@icons/Icon";
import { useStore } from "@state/useStore";
import { resetCourseProgress } from "@state/store";
import {
  continueTarget,
  courseProgress,
  learnerSubjects,
  learnerVideoCourses,
  videoCourseProgress,
  type LearnerSubject
} from "@data/courses-demo";
import type { VideoCourse } from "@data/catalog";
import { ContinueCard } from "../../extraction/components/ContinueCard/ContinueCard";
import { Menu } from "../../extraction/components/Menu/Menu";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { usePageEntry } from "./navigation";

type Family = "lessons" | "video";

/* Tab selection is remembered for the visit (courses.F01) — a module-level
   memory, so leaving for a lesson and coming back keeps the family. */
let familyMemory: Family = "lessons";

/* ── Cards ───────────────────────────────────────────────────────────────── */

function SubjectCard({
  subject,
  index,
  onReset
}: {
  subject: LearnerSubject;
  index: number;
  onReset: (subject: LearnerSubject) => void;
}) {
  const store = useStore();
  const navigate = useNavigate();
  const prog = courseProgress(subject, store);
  const enrolled = store.enrolled.includes(subject.id);
  const chapterCount = subject.chapters.length;

  const firstLessonId = subject.chapters[0]?.lessons[0]?.id;
  const primary =
    prog.status === "completed" ? (
      <Link className="btn btn--secondary" to={`/courses/${subject.id}`}>Review subject</Link>
    ) : prog.completed > 0 && prog.nextLessonId ? (
      <Link className="btn btn--primary" to={`/courses/${subject.id}/lessons/${prog.nextLessonId}`}>
        Continue · {prog.percent}%
      </Link>
    ) : firstLessonId ? (
      <Link className="btn btn--primary" to={`/courses/${subject.id}/lessons/${firstLessonId}`}>
        Open first lesson
      </Link>
    ) : (
      <Link className="btn btn--secondary" to={`/courses/${subject.id}`}>Open subject</Link>
    );

  const menuItems = [
    { id: "outline", label: "Open the outline", icon: "list" as const },
    ...(subject.videoCourseId
      ? [{ id: "video", label: "Open the video course", icon: "play" as const }]
      : []),
    ...(prog.completed > 0
      ? [{ id: "reset", label: "Reset progress", icon: "reset" as const, destructive: true }]
      : [])
  ];

  return (
    <Card index={index} className="course-card">
      <div className="course-card__cover" aria-hidden="true" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
        <span className="micro" style={{ color: "var(--c-accent-primary)" }}>
          {subject.track ? `${subject.track} · ` : ""}{subject.language ? subject.language.toUpperCase() : "SUBJECT"}
        </span>
        <Menu
          trigger={<Icon name="more" size={16} />}
          triggerLabel={`Actions for ${subject.title}`}
          items={menuItems}
          align="end"
          onSelect={(id) => {
            if (id === "outline") navigate(`/courses/${subject.id}`);
            if (id === "video" && subject.videoCourseId) navigate(`/courses/video/${subject.videoCourseId}`);
            if (id === "reset") onReset(subject);
          }}
        />
      </div>
      <h3 className="course-card__title">
        <Link to={`/courses/${subject.id}`}>{subject.title}</Link>
      </h3>
      {subject.summary ? <p className="course-card__summary">{subject.summary}</p> : null}
      <div className="course-card__meta">
        <span className="chip">{subject.totalLessons} lesson{subject.totalLessons === 1 ? "" : "s"}</span>
        {chapterCount > 1 ? <span className="chip chip--quiet">{chapterCount} chapters</span> : null}
        <span className="chip chip--quiet">{subject.duration}</span>
        {subject.level ? <span className="chip chip--quiet">{subject.level}</span> : null}
        {enrolled ? (
          <span className="chip chip--quiet">
            <Icon name="check" size={11} /> Enrolled
          </span>
        ) : null}
      </div>
      <div className="course-card__progress">
        <CoverageTag coverage={prog.status} />
        {prog.total > 0 ? (
          <span className="meta">
            {prog.completed} of {prog.total} lessons · {prog.percent}%
          </span>
        ) : (
          <span className="meta">No lessons published yet</span>
        )}
      </div>
      <div className="row" style={{ marginTop: "var(--space-3)" }}>{primary}</div>
    </Card>
  );
}

function VideoCourseCard({ video, index }: { video: VideoCourse; index: number }) {
  const store = useStore();
  const navigate = useNavigate();
  const prog = videoCourseProgress(video.id, store);
  const started = prog.completed > 0;

  const primary =
    prog.status === "completed" ? (
      <Link className="btn btn--secondary" to={`/courses/video/${video.id}`}>Review course</Link>
    ) : started ? (
      <Link className="btn btn--primary" to={`/courses/video/${video.id}`}>Continue · {prog.percent}%</Link>
    ) : (
      <Link className="btn btn--primary" to={`/courses/video/${video.id}`}>Open course</Link>
    );

  return (
    <Card index={index}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
        <span className="micro" style={{ color: "var(--c-accent-primary)" }}>VIDEO COURSE</span>
        <Menu
          trigger={<Icon name="more" size={16} />}
          triggerLabel={`Actions for ${video.title}`}
          align="end"
          items={[
            { id: "open", label: "Open the course", icon: "play" },
            ...(video.subjectId
              ? [{ id: "subject", label: "Open the matching subject", icon: "lessons" as const }]
              : [])
          ]}
          onSelect={(id) => {
            if (id === "open") navigate(`/courses/video/${video.id}`);
            if (id === "subject" && video.subjectId) navigate(`/courses/${video.subjectId}`);
          }}
        />
      </div>
      <h3 className="course-card__title">
        <Link to={`/courses/video/${video.id}`}>{video.title}</Link>
      </h3>
      <p className="course-card__summary">{video.summary}</p>
      <div className="course-card__meta">
        <span className="chip">{video.minutes} min total</span>
        <span className="chip chip--quiet">{video.modules} modules</span>
        <span className="chip chip--quiet">{video.chapters.length} chapters</span>
      </div>
      <div className="course-card__progress">
        <CoverageTag coverage={prog.status} />
        <span className="meta">
          {prog.completed} of {prog.total} chapters · {prog.percent}%
        </span>
      </div>
      <div className="row" style={{ marginTop: "var(--space-3)" }}>{primary}</div>
    </Card>
  );
}

/* ── The catalogue ───────────────────────────────────────────────────────── */

export function Courses() {
  const store = useStore();
  const [family, setFamilyState] = useState<Family>(familyMemory);
  const [q, setQ] = useState("");
  const [vq, setVq] = useState("");
  const [track, setTrack] = useState("All");
  const [level, setLevel] = useState("All");
  const [resetTarget, setResetTarget] = useState<LearnerSubject | null>(null);
  usePageEntry();

  const setFamily = (f: Family) => {
    familyMemory = f;
    setFamilyState(f);
  };

  const subjects = learnerSubjects(store);
  const videos = learnerVideoCourses(store);
  const resume = continueTarget(store);

  const tracks = ["All", ...Array.from(new Set(subjects.map((s) => s.track).filter(Boolean)))];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const list = subjects.filter((s) => {
    if (track !== "All" && s.track !== track && s.language.toLowerCase() !== track.toLowerCase()) return false;
    if (level !== "All" && s.level !== level) return false;
    if (q && !`${s.title} ${s.summary} ${s.language} ${s.track}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const vlist = videos.filter((v) =>
    !vq || `${v.title} ${v.summary}`.toLowerCase().includes(vq.toLowerCase())
  );

  return (
    <Page
      kind="courses"
      kicker="Learn"
      title="Courses"
      lead={`${subjects.length} interactive subjects and ${videos.length} video courses published. Coverage records what you have covered on this device.`}
    >
      {resume ? (
        <ContinueCard
          layout="rail"
          chargeLabel="Coverage"
          item={{
            title: resume.title,
            context: resume.context,
            percent: resume.percent,
            to: resume.to
          }}
        />
      ) : null}

      <div className="tabs" role="tablist" aria-label="Course families">
        <button type="button" role="tab" className="tabs__tab" aria-selected={family === "lessons"} onClick={() => setFamily("lessons")}>
          <Icon name="lessons" size={18} />
          <span><strong>Interactive Lessons</strong><small>Read, run in sandbox, and complete</small></span>
          <span className="tabs__count">{subjects.length}</span>
        </button>
        <button type="button" role="tab" className="tabs__tab" aria-selected={family === "video"} onClick={() => setFamily("video")}>
          <Icon name="play" size={18} />
          <span><strong>Video Courses</strong><small>Watch chapters and transcripts</small></span>
          <span className="tabs__count">{videos.length}</span>
        </button>
      </div>

      {family === "lessons" ? (
        <div className="panel">
          <div className="filters">
            <label className="filters__search">
              <Icon name="search" size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subjects, keywords, frameworks…" />
            </label>
            {levels.map((l) => (
              <button key={l} type="button" className="chip" data-on={level === l || undefined} onClick={() => setLevel(l)}>{l}</button>
            ))}
            <p className="filters__count">{list.length} subject{list.length === 1 ? "" : "s"}</p>
          </div>
          <div className="filters">
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>TRACK:</span>
            {tracks.map((t) => (
              <button key={t} type="button" className="chip" data-on={track === t || undefined} onClick={() => setTrack(t)}>{t}</button>
            ))}
          </div>

          {subjects.length === 0 ? (
            <StateBlock state="empty" message="Nothing published yet. Published subjects land here — nothing is invented to fill the grid." />
          ) : list.length === 0 ? (
            <StateBlock
              state="empty"
              message={`Nothing matches this filter${q ? ` — “${q}”` : ""}.`}
              action={
                <button type="button" className="btn btn--secondary" onClick={() => { setQ(""); setTrack("All"); setLevel("All"); }}>
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="courses__grid">
              {list.map((s, i) => (
                <SubjectCard key={s.id} subject={s} index={i} onReset={setResetTarget} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="panel">
          <div className="filters">
            <label className="filters__search">
              <Icon name="search" size={16} />
              <input value={vq} onChange={(e) => setVq(e.target.value)} placeholder="Search video courses…" />
            </label>
            <p className="filters__count">{vlist.length} course{vlist.length === 1 ? "" : "s"}</p>
          </div>
          {videos.length === 0 ? (
            <StateBlock state="empty" message="No published video courses. Nothing is invented to fill the grid." />
          ) : vlist.length === 0 ? (
            <StateBlock
              state="empty"
              message={`No video course matches “${vq}”.`}
              action={<button type="button" className="btn btn--secondary" onClick={() => setVq("")}>Clear search</button>}
            />
          ) : (
            <div className="courses__grid">
              {vlist.map((v, i) => (
                <VideoCourseCard key={v.id} video={v} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog
        open={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        title={`Reset progress — ${resetTarget?.title ?? ""}`}
        tone="destructive"
        actions={
          <>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                if (resetTarget) resetCourseProgress(resetTarget.id);
                setResetTarget(null);
              }}
            >
              Clear my records
            </button>
            <button type="button" className="btn btn--quiet" onClick={() => setResetTarget(null)}>
              Keep them
            </button>
          </>
        }
      >
        <p>
          This clears your own completion records for this subject on this device. The content itself stays published.
        </p>
      </Dialog>
    </Page>
  );
}

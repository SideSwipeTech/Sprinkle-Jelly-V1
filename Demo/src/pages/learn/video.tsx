/**
 * video.tsx — `/courses/video/:videoId`. The video-course surface (the second
 * family of courses.F01): a simulated player beside the module's chapter list
 * — the course's own outline rail — with a synchronized transcript.
 *
 * Coverage is the same figure everywhere: `videoCourseProgress` from the
 * adapter drives the header, the chapter rows and the catalogue card that
 * linked here. "Mark chapter covered" writes the real record through
 * `completeVideoChapter`; merely opening or switching a chapter only records
 * the place (`noteVideoPosition`), and an item authored Sequential holds the
 * list to outline order — the chapter after the first uncovered one stays
 * locked until its turn.
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Back, CoverageTag, Page } from "@components/Page";
import { Icon } from "@icons/Icon";
import { useStore } from "@state/useStore";
import { completeVideoChapter, noteVideoPosition } from "@state/store";
import { learnerVideoCourse, videoCourseProgress } from "@data/courses-demo";
import { usePageEntry } from "./navigation";

export function VideoLesson() {
  const { videoId } = useParams();
  const store = useStore();
  const entry = learnerVideoCourse(videoId, store);
  usePageEntry();

  const video = entry?.course ?? null;
  const sequential = entry?.navigation === "sequential";
  const prog = video ? videoCourseProgress(video.id, store) : null;
  const covered = store.videoProgress[video?.id ?? ""] ?? [];
  // The first chapter not yet covered — the sequential gate sits behind it.
  const firstUncovered = video ? video.chapters.findIndex((_, i) => !covered.includes(i)) : -1;

  // Open at the recorded place when Continue sent one for this course, else
  // at the first uncovered chapter.
  const [current, setCurrent] = useState(() => {
    if (!video) return 0;
    const c = store.continue;
    if (c?.family === "video" && c.courseId === video.id) {
      const idx = Number(c.lessonId.replace("ch:", ""));
      if (Number.isInteger(idx) && idx >= 0 && idx < video.chapters.length) return idx;
    }
    return firstUncovered >= 0 ? firstUncovered : 0;
  });
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [gateNote, setGateNote] = useState<string | null>(null);

  // Landing on the course records the Continue place — position only, no coverage.
  useEffect(() => {
    if (video) noteVideoPosition(video.id, current);
    // The landing chapter is the record; chapter switches note their own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id]);

  if (!video || !entry || !prog) {
    return (
      <Page kind="sink" kicker="Courses" title="Course unavailable" actions={<Back to="/courses">Courses</Back>}>
        <Card>
          <StateBlock
            state="unavailable"
            message="This video course isn't published here — it may have been withdrawn, or the link points at something that was never live."
            action={<Link className="btn btn--primary" to="/courses">Back to courses</Link>}
          />
        </Card>
      </Page>
    );
  }

  const chapter = video.chapters[current] ?? video.chapters[0];
  const chapterCovered = covered.includes(current);
  // Sequential gating (courses.F18): a chapter past the first uncovered one is
  // unreachable — decided when the learner tries, told in words, never a
  // silently disabled control.
  const beyondGate = (i: number) =>
    sequential && !covered.includes(i) && firstUncovered >= 0 && i > firstUncovered;
  const nextIdx = current + 1 < video.chapters.length ? current + 1 : null;

  const selectChapter = (i: number) => {
    if (beyondGate(i)) {
      setGateNote(
        `This course plays in order — “${video.chapters[i]!.title}” opens once chapter ${firstUncovered + 1} (“${video.chapters[firstUncovered]!.title}”) stands covered.`
      );
      return;
    }
    setGateNote(null);
    setCurrent(i);
    setPlaying(true);
    noteVideoPosition(video.id, i);
  };

  return (
    <Page
      kind="sink"
      kicker="Video course"
      title={video.title}
      lead={video.summary}
      actions={<Back to="/courses">Courses</Back>}
    >
      <div className="grid-2">
        <Card live>
          <div className="reader__video-stage">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="chip chip--quiet">{chapter?.title ?? "Chapter"}</span>
              <div className="row" style={{ gap: "var(--space-2)" }}>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="reader__video-speed"
                  aria-label="Playback speed"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2.0}>2.0x</option>
                </select>
                <button
                  type="button"
                  className="chip"
                  data-on={captionsOn || undefined}
                  onClick={() => setCaptionsOn((c) => !c)}
                >
                  CC
                </button>
              </div>
            </div>

            <div className="reader__video-screen">
              {playing ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 600, color: "var(--c-text-primary)", margin: 0 }}>
                    Playing — simulated stream ({playbackSpeed}x)
                  </p>
                  <p className="meta">Chapter {current + 1} · {chapter?.time ?? "0:00"}</p>
                </div>
              ) : (
                <button className="btn btn--primary" type="button" onClick={() => setPlaying(true)}>
                  <Icon name="play" size={16} /> Play chapter {current + 1}
                </button>
              )}
            </div>
            <p className="meta" style={{ margin: 0 }}>
              Simulated player — no media streams in this demo; the coverage record below is real.
            </p>
          </div>

          <div className="row">
            {chapterCovered ? (
              <span className="chip chip--quiet">
                <Icon name="check" size={12} /> Chapter covered
              </span>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => completeVideoChapter(video.id, current)}
              >
                <Icon name="check" size={14} /> Mark chapter covered
              </button>
            )}
            {nextIdx !== null ? (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => selectChapter(nextIdx)}
              >
                Next — {video.chapters[nextIdx]!.title}
              </button>
            ) : prog.status === "completed" ? (
              <span className="chip chip--quiet">
                <Icon name="check" size={12} /> Course covered — {prog.completed} of {prog.total} chapters
              </span>
            ) : (
              <span className="meta">Last chapter</span>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Chapters & transcript"
            icon="list"
            action={<CoverageTag coverage={prog.status} />}
          />
          <ol className="reader__lessons">
            {video.chapters.map((ch, i) => {
              const locked = beyondGate(i);
              const done = covered.includes(i);
              return (
                <li key={ch.title}>
                  <button
                    type="button"
                    className="reader__lesson"
                    data-done={done || undefined}
                    data-locked={locked || undefined}
                    aria-current={current === i ? "page" : undefined}
                    onClick={() => selectChapter(i)}
                  >
                    <span className="reader__lesson-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="reader__lesson-main">
                      <span className="reader__lesson-title">{ch.title}</span>
                      <span className="reader__lesson-meta">
                        {ch.time}
                        {locked ? " · sequential — covers in order" : ""}
                      </span>
                    </span>
                    <Icon name={done ? "check" : locked ? "lock" : "chevron-right"} size={14} />
                  </button>
                </li>
              );
            })}
          </ol>
          {gateNote ? (
            <p className="meta" role="status">
              {gateNote}
            </p>
          ) : null}
          <p className="meta">
            {prog.completed} of {prog.total} chapters covered on this device
            {sequential ? " · this course plays in order" : ""}.
          </p>

          {captionsOn && video.transcript.length > 0 ? (
            <>
              <p className="micro" style={{ color: "var(--c-text-faint)", margin: "var(--space-3) 0 var(--space-2)" }}>
                SYNCHRONIZED TRANSCRIPT
              </p>
              <div className="reader__transcript">
                {video.transcript.map((tr) => (
                  <p key={tr.time} className="meta" style={{ margin: 0 }}>
                    <strong style={{ color: "var(--c-accent-primary)" }}>
                      [{tr.time}] {tr.speaker}:
                    </strong>{" "}
                    {tr.text}
                  </p>
                ))}
              </div>
            </>
          ) : captionsOn ? (
            <p className="meta">No transcript is published for this course.</p>
          ) : null}
        </Card>
      </div>
    </Page>
  );
}

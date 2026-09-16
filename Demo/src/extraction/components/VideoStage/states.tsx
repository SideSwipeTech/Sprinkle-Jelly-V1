/**
 * VideoStage state matrix — idle / playing / with transcript + chapters.
 */
import type { ReactNode } from "react";
import { VideoStage, TranscriptPane, ChapterList } from "./VideoStage";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "idle",
    label: "idle — before play",
    render: () => (
      <VideoStage
        chapter="03 · Nested loops & matrices"
        playing={false}
        onToggle={() => {}}
        progress={0}
        timeLabel="0:00 / 12:40"
        speed="1×"
        onSpeedChange={() => {}}
        captionsOn={false}
        onCaptionsChange={() => {}}
      />
    )
  },
  {
    key: "playing",
    label: "playing — live stage, scrubber mid-way",
    render: () => (
      <VideoStage
        chapter="03 · Nested loops & matrices"
        playing={true}
        onToggle={() => {}}
        progress={0.34}
        timeLabel="4:18 / 12:40"
        speed="1.5×"
        onSpeedChange={() => {}}
        captionsOn={true}
        onCaptionsChange={() => {}}
      />
    )
  },
  {
    key: "transcript",
    label: "transcript pane — timestamped lines",
    render: () => (
      <TranscriptPane
        heading="Transcript"
        lines={[
          { time: "0:00", speaker: "Maya", text: "Nested loops are where most first programs slow down — let's see why." },
          { time: "2:14", speaker: "Maya", text: "The inner loop runs fully for every outer iteration." },
          { time: "4:18", speaker: "Maya", text: "Watch the counter on the right — note when it resets." }
        ]}
      />
    )
  },
  {
    key: "chapters",
    label: "chapter list — current + covered",
    render: () => (
      <ChapterList
        active={1}
        chapters={[
          { title: "Why loops nest", length: "4:02", covered: true },
          { title: "Nested loops & matrices", length: "12:40" },
          { title: "Early exits", length: "6:15" }
        ]}
        onSelect={() => {}}
      />
    )
  }
];

/**
 * courses-demo.ts — the one learner-facing read path for course data.
 *
 * Three sources meet here under one set of rules, so the catalogue, the
 * orientation, the reader, the cards and the Continue strip never disagree:
 *
 *   catalog.ts            the published snapshot — the catalogue, each
 *                         subject's authored chapters, and every live
 *                         lesson's body. Studio drafts never touch it.
 *   studio tree           the admin's editable draft (readStudioTree). Its
 *                         only say in this file is lifecycle: an archived
 *                         item or lesson is withdrawn, and a lesson the
 *                         studio shows published-and-saved that the snapshot
 *                         does not carry joins the outline — a simulated
 *                         publish landing.
 *   coursePublications    the store slice a publish writes. The snapshot it
 *                         holds is the live copy; it wins over the seeded
 *                         body when both exist.
 *
 * Progress is computed exactly once — courseProgress() / videoCourseProgress()
 * — and Continue, cards, orientation and reader all consume that figure.
 */

import {
  COURSES,
  COURSE_CHAPTERS,
  LESSONS,
  PROJECT_TEMPLATES,
  VIDEO_COURSES,
  type Course,
  type CourseLessonType,
  type LessonQuizQuestion,
  type VideoCourse
} from "./catalog";
import { readStudioTree, type StudioItem, type StudioLesson } from "../admin/courses/fixtures";
import type { LessonBlock } from "../extraction/components/LessonBlockEditor/LessonBlockEditor";
import type { Store } from "../state/store";

/* The lesson-type union is the catalogue's; the pages import it from here so
   this file stays the single surface they read course data through. */
export type { CourseLessonType };

/* ── Outline model ───────────────────────────────────────────────────────── */

export interface OutlineLesson {
  id: string;
  title: string;
  type: CourseLessonType;
  minutes: number | null;
  required: boolean;
  /** Course-project lessons: the assigned starter template, when one is authored. */
  projectTemplateId?: string;
  /** Where the live copy comes from — see the header comment. */
  source: "catalog" | "snapshot" | "studio";
}

export interface OutlineChapter {
  id: string;
  /** null is an unlabelled section — the single-group outline renders no heading. */
  title: string | null;
  lessons: OutlineLesson[];
}

/** The subject as the learner meets it: catalogue fields plus the live outline. */
export interface LearnerSubject {
  id: string;
  title: string;
  track: string;
  language: string;
  level: string;
  duration: string;
  summary: string;
  prerequisites: string[];
  outcomes: string[];
  videoCourseId?: string;
  changeBrief?: Course["changeBrief"];
  chapters: OutlineChapter[];
  totalLessons: number;
  requiredCount: number;
}

export type Coverage = "not-started" | "learning" | "covered" | "completed";

export interface CourseProgress {
  status: Coverage;
  completed: number;
  total: number;
  percent: number;
  /** The first lesson in outline order the learner has not completed. */
  nextLessonId: string | null;
}

/* ── Studio reads — the tree is read once per query and threaded through ─── */

function studioItem(tree: StudioItem[], itemId: string): StudioItem | null {
  return tree.find((i) => i.id === itemId) ?? null;
}

function studioLesson(item: StudioItem | null, lessonId: string): StudioLesson | null {
  if (!item) return null;
  for (const group of item.groups) {
    const found = group.lessons.find((l) => l.id === lessonId);
    if (found) return found;
  }
  return null;
}

/** The catalogue keys templates by id; the studio records the title. Either
 *  resolves to the id — an unmatched reference stays absent rather than
 *  pointing the project workspace at a template that does not exist. */
function templateId(ref: string | undefined): string | undefined {
  if (!ref) return undefined;
  return PROJECT_TEMPLATES.find((t) => t.id === ref || t.title === ref)?.id;
}

/** An item leaves the learner catalogue only by archive — a draft revision
 *  of a live item does not unpublish it. */
function itemWithdrawn(tree: StudioItem[], itemId: string, store: Store): boolean {
  if (studioItem(tree, itemId)?.lifecycle === "archived") return true;
  return store.adminCourses.some((c) => c.id === itemId && c.lifecycle === "archived");
}

function lessonWithdrawn(item: StudioItem | null, lessonId: string): boolean {
  return studioLesson(item, lessonId)?.lifecycle === "archived";
}

/* ── Outline construction ────────────────────────────────────────────────── */

function toOutlineLesson(
  item: StudioItem | null,
  courseId: string,
  lessonId: string,
  store: Store
): OutlineLesson | null {
  if (lessonWithdrawn(item, lessonId)) return null;
  const catalog = LESSONS.find((l) => l.id === lessonId && l.courseId === courseId);
  const snapshot = store.coursePublications[lessonId];
  const studio = studioLesson(item, lessonId);
  const liveViaStudio = studio?.lifecycle === "published" && studio.saved;
  if (!catalog && !snapshot && !liveViaStudio) return null;
  const source = snapshot ? "snapshot" : catalog ? "catalog" : "studio";
  return {
    id: lessonId,
    title: snapshot?.title ?? catalog?.title ?? studio?.title ?? lessonId,
    type: (snapshot?.type as CourseLessonType | undefined) ?? catalog?.type ?? studio?.type ?? "text",
    minutes: catalog?.minutes ?? snapshot?.minutes ?? studio?.minutes ?? null,
    required: studio?.required ?? true,
    projectTemplateId: templateId(catalog?.projectTemplateId ?? studio?.projectTemplate),
    source
  };
}

function buildChapters(tree: StudioItem[], course: Course, store: Store): OutlineChapter[] {
  const item = studioItem(tree, course.id);
  const placed = new Set<string>();
  const chapters: OutlineChapter[] = [];

  for (const ch of COURSE_CHAPTERS.filter((c) => c.courseId === course.id)) {
    const lessons = ch.lessonIds
      .map((id) => toOutlineLesson(item, course.id, id, store))
      .filter((l): l is OutlineLesson => l !== null);
    lessons.forEach((l) => placed.add(l.id));
    if (lessons.length > 0) chapters.push({ id: ch.id, title: ch.title, lessons });
  }

  // Published lessons with no authored chapter home — catalog lessons outside
  // the chapter map, plus lessons the studio shows live that the snapshot
  // does not carry. They land in one honestly-labelled trailing section.
  const extras: OutlineLesson[] = [];
  for (const l of LESSONS.filter((x) => x.courseId === course.id && !placed.has(x.id))) {
    const row = toOutlineLesson(item, course.id, l.id, store);
    if (row) {
      extras.push(row);
      placed.add(row.id);
    }
  }
  if (item) {
    for (const group of item.groups) {
      for (const l of group.lessons) {
        if (placed.has(l.id)) continue;
        const row = toOutlineLesson(item, course.id, l.id, store);
        if (row) {
          extras.push(row);
          placed.add(row.id);
        }
      }
    }
  }
  if (extras.length > 0) {
    chapters.push({ id: `${course.id}-live-extras`, title: "Recently published", lessons: extras });
  }

  if (chapters.length === 0) {
    // No authored structure at all — the lesson list is the outline, unlabelled.
    const lessons = LESSONS.filter((l) => l.courseId === course.id)
      .map((l) => toOutlineLesson(item, course.id, l.id, store))
      .filter((l): l is OutlineLesson => l !== null);
    if (lessons.length > 0) chapters.push({ id: `${course.id}-all`, title: null, lessons });
  }
  return chapters;
}

function synthesizeSubject(item: StudioItem, store: Store): LearnerSubject | null {
  // A studio item with no catalogue entry reaches learners only when it is
  // live: published lessons with saved content, in tree order.
  if (item.lifecycle !== "published") return null;
  const tree = [item];
  const chapters: OutlineChapter[] = [];
  for (const group of item.groups) {
    const lessons = group.lessons
      .map((l) => toOutlineLesson(studioItem(tree, item.id), item.id, l.id, store))
      .filter((l): l is OutlineLesson => l !== null);
    if (lessons.length > 0) chapters.push({ id: group.id, title: group.title, lessons });
  }
  const flat = chapters.flatMap((c) => c.lessons);
  if (flat.length === 0) return null;
  return {
    id: item.id,
    title: item.title,
    track: "",
    language: "",
    level: "",
    duration: "—",
    summary: "",
    prerequisites: [],
    outcomes: [],
    chapters,
    totalLessons: flat.length,
    requiredCount: flat.filter((l) => l.required).length
  };
}

/* ── The catalogue ───────────────────────────────────────────────────────── */

/** Every subject a learner may open — the published catalogue only. */
export function learnerSubjects(store: Store): LearnerSubject[] {
  const tree = readStudioTree();
  const out: LearnerSubject[] = [];
  for (const course of COURSES) {
    if (itemWithdrawn(tree, course.id, store)) continue;
    const chapters = buildChapters(tree, course, store);
    const flat = chapters.flatMap((c) => c.lessons);
    out.push({
      id: course.id,
      title: course.title,
      track: course.track,
      language: course.language,
      level: course.level,
      duration: course.duration,
      summary: course.summary,
      prerequisites: course.prerequisites ?? [],
      outcomes: course.outcomes ?? [],
      videoCourseId: course.videoCourseId,
      changeBrief: course.changeBrief,
      chapters,
      totalLessons: flat.length,
      requiredCount: flat.filter((l) => l.required).length
    });
  }
  for (const item of tree) {
    if (item.family !== "interactive" || COURSES.some((c) => c.id === item.id)) continue;
    const synthesized = synthesizeSubject(item, store);
    if (synthesized) out.push(synthesized);
  }
  return out;
}

export function learnerSubject(id: string | undefined, store: Store): LearnerSubject | null {
  if (!id) return null;
  return learnerSubjects(store).find((s) => s.id === id) ?? null;
}

/** Video courses a learner may open — the catalogue rows minus the withdrawn. */
export function learnerVideoCourses(store: Store): VideoCourse[] {
  const tree = readStudioTree();
  return VIDEO_COURSES.filter((v) => !itemWithdrawn(tree, v.id, store));
}

/**
 * One video course as the learner meets it. The published chapter list and
 * transcript come from the catalogue snapshot; the studio item's only say is
 * lifecycle (above) and the authored navigation mode — open lets a learner
 * jump chapters freely, sequential holds them to the outline order.
 */
export function learnerVideoCourse(
  id: string | undefined,
  store: Store
): { course: VideoCourse; navigation: "open" | "sequential" } | null {
  if (!id) return null;
  const course = learnerVideoCourses(store).find((v) => v.id === id);
  if (!course) return null;
  const item = studioItem(readStudioTree(), id);
  return { course, navigation: item?.navigation ?? "open" };
}

/* ── Progress — computed once ────────────────────────────────────────────── */

export function isLessonComplete(lesson: OutlineLesson, store: Store): boolean {
  // An integration-reference lesson stands covered by its target's own
  // standing — this domain neither re-derives nor overrides it.
  if (lesson.type === "integration-reference") {
    const target = LESSONS.find((l) => l.id === lesson.id)?.referenceTarget;
    if (target) return store.solved.includes(target.id);
  }
  return store.completedLessons.includes(lesson.id);
}

export function courseProgress(subject: LearnerSubject, store: Store): CourseProgress {
  const flat = subject.chapters.flatMap((c) => c.lessons);
  const total = flat.length;
  const required = flat.filter((l) => l.required);
  const completed = flat.filter((l) => isLessonComplete(l, store)).length;
  // The figure covers every published lesson (courses.F12); completion lands
  // when the last required lesson does — optional work never blocks (F22).
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const requiredDone = required.every((l) => isLessonComplete(l, store));
  const finished = required.length === 0 ? completed === total : requiredDone;
  const next = flat.find((l) => !isLessonComplete(l, store)) ?? null;
  const status: Coverage = !store.enrolled.includes(subject.id)
    ? "not-started"
    : total === 0 || completed === 0
      ? "learning"
      : finished
        ? "completed"
        : "covered";
  return { status, completed, total, percent, nextLessonId: next?.id ?? null };
}

export function videoCourseProgress(videoId: string, store: Store): CourseProgress {
  const video = VIDEO_COURSES.find((v) => v.id === videoId);
  // The catalogue's chapter list carries no required/optional flag — the flag
  // lives on the studio's working lessons, a different id space — so every
  // published chapter counts toward the figure (courses.F12's required-only
  // rule is already satisfied when all chapters are required).
  const total = video?.chapters.length ?? 0;
  const covered = store.videoProgress[videoId] ?? [];
  const completed = covered.filter((i) => i >= 0 && i < total).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const status: Coverage =
    completed === 0 ? "not-started" : completed < total ? "covered" : "completed";
  const nextIdx = video?.chapters.findIndex((_, i) => !covered.includes(i)) ?? -1;
  return {
    status,
    completed,
    total,
    percent,
    nextLessonId: nextIdx >= 0 ? `ch:${nextIdx}` : null
  };
}

/* ── Continue — the single definition ────────────────────────────────────── */

export interface ContinueTarget {
  family: "interactive" | "video";
  courseId: string;
  /** For video targets: `ch:<index>`. */
  lessonId: string;
  title: string;
  context: string;
  percent: number;
  to: string;
}

function interactiveTarget(subject: LearnerSubject, fromLessonId: string | null, store: Store): ContinueTarget | null {
  const prog = courseProgress(subject, store);
  if (prog.status === "completed" || prog.total === 0) return null;
  const flat = subject.chapters.flatMap((c) => c.lessons);
  const pos = fromLessonId ? flat.findIndex((l) => l.id === fromLessonId) : -1;
  const target =
    flat.slice(pos < 0 ? 0 : pos).find((l) => !isLessonComplete(l, store)) ??
    flat.find((l) => !isLessonComplete(l, store));
  if (!target) return null;
  return {
    family: "interactive",
    courseId: subject.id,
    lessonId: target.id,
    title: target.title,
    context: subject.title,
    percent: prog.percent,
    to: `/courses/${subject.id}/lessons/${target.id}`
  };
}

/**
 * Resolve the one Continue target: the recorded place if it still stands
 * unfinished, else another started item; a finished item never resurfaces
 * and no valid target returns null — the region hides rather than inventing.
 */
export function continueTarget(store: Store): ContinueTarget | null {
  const c = store.continue;
  if (c?.family === "video") {
    const video = learnerVideoCourses(store).find((v) => v.id === c.courseId);
    if (video) {
      const prog = videoCourseProgress(video.id, store);
      if (prog.status !== "completed") {
        const idx = Number(c.lessonId.replace("ch:", ""));
        const chapter = video.chapters[Number.isInteger(idx) ? idx : 0];
        return {
          family: "video",
          courseId: video.id,
          lessonId: c.lessonId,
          title: chapter?.title ?? video.title,
          context: video.title,
          percent: prog.percent,
          to: `/courses/video/${video.id}`
        };
      }
    }
  }
  if (c) {
    const subject = learnerSubject(c.courseId, store);
    const target = subject ? interactiveTarget(subject, c.lessonId, store) : null;
    if (target) return target;
  }
  // The recorded place is finished or gone — offer another started item,
  // never a finished one.
  for (const subject of learnerSubjects(store)) {
    if (subject.id === c?.courseId) continue;
    if (!store.enrolled.includes(subject.id)) continue;
    const prog = courseProgress(subject, store);
    if (prog.completed === 0 || prog.status === "completed") continue;
    const target = interactiveTarget(subject, null, store);
    if (target) return target;
  }
  for (const video of learnerVideoCourses(store)) {
    const prog = videoCourseProgress(video.id, store);
    if (prog.status === "covered") {
      const idx = Number(prog.nextLessonId?.replace("ch:", "") ?? 0);
      return {
        family: "video",
        courseId: video.id,
        lessonId: prog.nextLessonId ?? "ch:0",
        title: video.chapters[idx]?.title ?? video.title,
        context: video.title,
        percent: prog.percent,
        to: `/courses/video/${video.id}`
      };
    }
  }
  return null;
}

/* ── Lesson content resolution ───────────────────────────────────────────── */

export interface LessonContent {
  id: string;
  title: string;
  type: CourseLessonType;
  minutes: number | null;
  body: string[];
  blocks?: LessonBlock[];
  codeSample?: string;
  codeLang?: string;
  keyTakeaway?: string;
  outcomes: string[];
  quiz?: LessonQuizQuestion[];
  projectTemplateId?: string;
  referenceTarget?: { kind: "challenge"; id: string; title: string };
}

/**
 * The published body of a lesson. A snapshot wins over the seeded copy; a
 * studio-live lesson renders its saved blocks. Anything else returns null —
 * the reader shows the honest content-unavailable state rather than a stub.
 */
export function lessonContent(courseId: string, lessonId: string, store: Store): LessonContent | null {
  const item = studioItem(readStudioTree(), courseId);
  if (lessonWithdrawn(item, lessonId)) return null;
  const catalog = LESSONS.find((l) => l.id === lessonId && l.courseId === courseId);
  const snapshot = store.coursePublications[lessonId];
  const studio = studioLesson(item, lessonId);
  const liveViaStudio = studio?.lifecycle === "published" && studio.saved;
  if (!catalog && !snapshot && !liveViaStudio) return null;
  return {
    id: lessonId,
    title: snapshot?.title ?? catalog?.title ?? studio?.title ?? lessonId,
    type: (snapshot?.type as CourseLessonType | undefined) ?? catalog?.type ?? studio?.type ?? "text",
    minutes: catalog?.minutes ?? snapshot?.minutes ?? studio?.minutes ?? null,
    body: catalog?.body ?? [],
    blocks: snapshot?.blocks ?? (!catalog ? studio?.blocks : undefined),
    codeSample: catalog?.codeSample,
    codeLang: catalog?.codeLang,
    keyTakeaway: catalog?.keyTakeaway,
    outcomes: studio?.outcomes ?? [],
    quiz:
      catalog?.quiz ??
      studio?.quiz?.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices ?? [],
        answer: typeof q.answer === "number" ? q.answer : 0
      })),
    projectTemplateId: templateId(catalog?.projectTemplateId ?? studio?.projectTemplate),
    referenceTarget: catalog?.referenceTarget
  };
}

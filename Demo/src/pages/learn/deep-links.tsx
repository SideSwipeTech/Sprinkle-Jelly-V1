/**
 * deep-links.tsx — the pre-split course URLs keep resolving, but they land on
 * the real authored thing rather than a stand-in page:
 *
 *   /courses/:id/quiz     → the subject's authored quiz lesson in the reader,
 *                           or the subject page when the outline has none
 *   /courses/:id/project  → the same for the authored course-project lesson
 *   /courses/:id/changes  → the subject page, where the change record lives
 *
 * The reader owns quiz/project completion now — these routes only route.
 */

import { Navigate, useParams } from "react-router-dom";
import { useStore } from "@state/useStore";
import { learnerSubject, type CourseLessonType, type LearnerSubject } from "@data/courses-demo";

function lessonOfType(subject: LearnerSubject | null, type: CourseLessonType): string {
  const target = subject?.chapters.flatMap((c) => c.lessons).find((l) => l.type === type);
  if (subject && target) return `/courses/${subject.id}/lessons/${target.id}`;
  return subject ? `/courses/${subject.id}` : "/courses";
}

export function CourseQuiz() {
  const { courseId } = useParams();
  const subject = learnerSubject(courseId, useStore());
  return <Navigate to={lessonOfType(subject, "quiz")} replace />;
}

export function CourseProject() {
  const { courseId } = useParams();
  const subject = learnerSubject(courseId, useStore());
  return <Navigate to={lessonOfType(subject, "course-project")} replace />;
}

export function CourseChanges() {
  const { courseId } = useParams();
  const subject = learnerSubject(courseId, useStore());
  return <Navigate to={subject ? `/courses/${subject.id}` : "/courses"} replace />;
}

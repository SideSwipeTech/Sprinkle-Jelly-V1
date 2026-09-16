/**
 * OrderPreview — `curriculum/:id/preview`. Reads the draft and shows the
 * course exactly as a learner will meet it: modules (chapters) in their
 * order, lessons within each, marking required and optional and, for a
 * Sequential course, where the frontier falls for someone who has completed
 * nothing. It writes nothing, and a preview that cannot be produced never
 * blocks a save or a publish.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { Breadcrumbs } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { itemTo } from "./hierarchy";
import {
  GROUP_LABEL,
  LESSON_TYPE_LABEL,
  findItem,
  loadedNote,
  readStudioTree
} from "./fixtures";
import "./courses.css";

export function OrderPreview() {
  const { id = "" } = useParams();
  const [items] = useState(readStudioTree);
  /* The preview is scoped to the item it was opened on — no picker. */
  const item = findItem(items, id);

  if (!item) {
    return (
      <AdminPage kicker="Content / Curriculum" title="Learner order preview">
        <StateBlock
          state="unavailable"
          message="The preview could not be produced — the item could not be read. Nothing was written, and no save or publish is blocked."
          action={<Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>}
        />
      </AdminPage>
    );
  }

  /* The frontier for a Sequential course: the first required lesson — a
     learner who has completed nothing reaches up to it and no further. */
  const sequential = item.family === "video" && item.navigation === "sequential";
  let frontierPlaced = false;

  const lessonTotal = item.groups.reduce((n, g) => n + g.lessons.length, 0);

  return (
    <AdminPage
      kicker={`Content / Curriculum / ${item.title}`}
      title="Learner order preview"
      lead="The draft as a learner will meet it. This page writes nothing — a preview that cannot be produced never blocks a save or a publish."
      actions={<Link className="btn btn--secondary" to={itemTo(item.id)}>Back to {item.title}</Link>}
    >
      <Breadcrumbs
        label="Studio tree"
        items={[
          { label: "Courses", to: "/admin/curriculum" },
          { label: item.title, to: itemTo(item.id) },
          { label: "Preview learner order" }
        ]}
      />

      <Card>
        <CardHeader
          title={item.title}
          icon="courses"
          action={<span className="meta">{item.lifecycle}{sequential ? " · Sequential" : item.navigation === "open" ? " · Open" : ""}</span>}
        />
        <p className="meta">{loadedNote(lessonTotal, lessonTotal)}</p>
        {sequential ? (
          <p className="cs-note" role="note">
            <Icon name="info" size={14} /> A Sequential walk to the first incomplete required
            lesson — the frontier below is where it falls for someone who has completed nothing.
          </p>
        ) : null}
        {item.groups.length === 0 ? (
          <StateBlock state="empty" message="Nothing authored yet — a draft may be incomplete." compact />
        ) : (
          item.groups.map((group) => (
            <section className="cs-group" key={group.id}>
              <h3 className="cs-label">
                {GROUP_LABEL[item.family]} — {group.title}
              </h3>
              <div className="cs-lines">
                {group.lessons.length === 0 ? (
                  <p className="meta">No lessons — an empty {GROUP_LABEL[item.family]}.</p>
                ) : (
                  group.lessons.map((lesson, li) => {
                    const pastFrontier = sequential && frontierPlaced;
                    const isFrontier = sequential && !frontierPlaced && lesson.required;
                    if (isFrontier) frontierPlaced = true;
                    return (
                      <div key={lesson.id}>
                        {isFrontier ? (
                          <p className="cs-frontier" role="note">
                            <Icon name="target" size={14} /> The frontier — a learner who has
                            completed nothing reaches this lesson and no further.
                          </p>
                        ) : null}
                        <div className="cs-preview-row" data-past-frontier={pastFrontier || undefined}>
                          <span className="cs-preview-row__idx">{li + 1}</span>
                          <span className="cs-preview-row__title">
                            <strong>{lesson.title}</strong>
                            <p className="meta">
                              {LESSON_TYPE_LABEL[lesson.type]} · {lesson.lifecycle}
                              {!lesson.saved ? " · no saved content — a learner never sees it" : ""}
                            </p>
                          </span>
                          <span className="cs-preview-row__end">
                            <span className="cs-badge" data-tone={lesson.required ? "required" : undefined}>
                              {lesson.required ? "required" : "optional"}
                            </span>
                            {pastFrontier ? <span className="cs-badge">beyond the frontier</span> : null}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          ))
        )}
        {sequential && !frontierPlaced ? (
          <p className="cs-note" data-tone="warn">
            <Icon name="alert" size={14} /> No required lesson is authored — a Sequential course
            needs at least one required lesson for the frontier to fall anywhere.
          </p>
        ) : null}
      </Card>
    </AdminPage>
  );
}

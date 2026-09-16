/**
 * CourseSettings — `curriculum/:id/settings`. Everything outside the freeze
 * boundary, edited in place with no republish, no changelog and no approval:
 * title, address name, description, difficulty, tags, icon, catalogue
 * position, estimated duration, the certificate-bearing setting and the
 * certificate presentation policy, and the skill and topic — which stay
 * correctable because misclassification is the commonest authoring mistake.
 *
 * A changed address name redirects the old one. An unresolvable presentation
 * reference is refused when it is set. Every classification change is
 * audited — the audit note renders on this page.
 */

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { Breadcrumbs } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { itemTo } from "./hierarchy";
import {
  CERT_TEMPLATES,
  SETTINGS,
  SETTINGS_AUDIT,
  defaultSettings,
  findItem,
  loadedNote,
  readStudioTree,
  type AuditRow,
  type SettingsFixture
} from "./fixtures";
import "./courses.css";

const FROZEN = [
  "Lesson content blocks",
  "Learning outcomes",
  "Lesson order within a chapter or module",
  "Module order",
  "Which chapters, modules and lessons exist"
];

export function CourseSettings() {
  const { id = "" } = useParams();
  const store = useStore();
  const [items] = useState(readStudioTree);
  /* Scoped to the item it was opened on — no picker. */
  const item = findItem(items, id);

  const [drafts, setDrafts] = useState<Record<string, SettingsFixture>>(() => ({ ...SETTINGS }));
  const [redirects, setRedirects] = useState<Record<string, string>>({});
  const [audit, setAudit] = useState<AuditRow[]>(SETTINGS_AUDIT);
  const [note, setNote] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const draft = useMemo(
    () => (item ? (drafts[item.id] ?? defaultSettings(item)) : undefined),
    [drafts, item]
  );

  if (!item || !draft) {
    return (
      <AdminPage kicker="Content / Curriculum" title="Settings and classification">
        <StateBlock
          state="unavailable"
          message="That item is not in the studio tree."
          action={<Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>}
        />
      </AdminPage>
    );
  }

  const patch = (p: Partial<SettingsFixture>) => {
    setDrafts((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] ?? draft), ...p } }));
  };

  const auditChange = (field: string, from: string, to: string) => {
    if (from === to) return;
    setAudit((prev) => [
      {
        id: `aud-${Date.now()}`,
        at: "just now",
        actor: store.session.name,
        field,
        from,
        to
      },
      ...prev
    ]);
  };

  const save = () => {
    const old = SETTINGS[item.id]?.address ?? item.address;
    if (draft.address !== old && /^[a-z0-9-]+$/.test(draft.address)) {
      setRedirects((prev) => ({ ...prev, [old]: draft.address }));
    }
    if (draft.certPolicy === "course-specific" && !CERT_TEMPLATES.includes(draft.certTemplate as never)) {
      setNote({
        tone: "err",
        text: `The presentation reference “${draft.certTemplate}” cannot be resolved — the change was not written.`
      });
      return;
    }
    auditChange("skill", SETTINGS[item.id]?.skill ?? "", draft.skill);
    auditChange("topic", SETTINGS[item.id]?.topic ?? "", draft.topic);
    setNote({
      tone: "ok",
      text: "Saved in place — no republish, no changelog, no approval."
    });
  };

  return (
    <AdminPage
      kicker={`Content / Curriculum / ${item.title}`}
      title="Settings and classification"
      lead="Everything outside the freeze boundary, edited in place. Teaching content freezes at publish and changes only through the full publish, approval and change-record workflow."
      actions={<Link className="btn btn--secondary" to={itemTo(item.id)}>Back to {item.title}</Link>}
    >
      <Breadcrumbs
        label="Studio tree"
        items={[
          { label: "Courses", to: "/admin/curriculum" },
          { label: item.title, to: itemTo(item.id) },
          { label: "Settings" }
        ]}
      />

      {note ? (
        <p className="cs-note" data-tone={note.tone} role={note.tone === "err" ? "alert" : "status"}>
          <Icon name={note.tone === "err" ? "alert" : "check"} size={14} /> {note.text}
        </p>
      ) : null}

      <Card>
        <CardHeader title="Catalogue fields" icon="edit" />
        <div className="admin-form-grid">
          <label className="field">
            <span className="meta">Title</span>
            <input value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
          </label>
          <label className="field">
            <span className="meta">Address name</span>
            <input value={draft.address} onChange={(e) => patch({ address: e.target.value })} />
          </label>
          <label className="field admin-form-grid__wide">
            <span className="meta">Description</span>
            <textarea value={draft.description} onChange={(e) => patch({ description: e.target.value })} />
          </label>
          <label className="field">
            <span className="meta">Difficulty</span>
            <input value={draft.difficulty} onChange={(e) => patch({ difficulty: e.target.value })} />
          </label>
          <label className="field">
            <span className="meta">Tags</span>
            <input value={draft.tags} onChange={(e) => patch({ tags: e.target.value })} />
          </label>
          <label className="field">
            <span className="meta">Icon</span>
            <input value={draft.icon} onChange={(e) => patch({ icon: e.target.value })} />
          </label>
          <label className="field">
            <span className="meta">Catalogue position</span>
            <input value={draft.position} onChange={(e) => patch({ position: e.target.value })} />
          </label>
          <label className="field">
            <span className="meta">Estimated duration</span>
            <input value={draft.duration} onChange={(e) => patch({ duration: e.target.value })} />
          </label>
        </div>
        {Object.entries(redirects).map(([from, to]) => (
          <p className="cs-note" key={from} role="status">
            <Icon name="arrow-right" size={14} /> A changed address name redirects the old one —{" "}
            <code>{from}</code> now redirects to <code>{to}</code>.
          </p>
        ))}
      </Card>

      <Card>
        <CardHeader title="Certificates" icon="shield" />
        <label className="cs-check">
          <input
            type="checkbox"
            checked={draft.certificateBearing}
            onChange={(e) => patch({ certificateBearing: e.target.checked })}
          />
          Certificate-bearing — completing this item issues a certificate
        </label>
        <div className="admin-form-grid">
          <label className="field">
            <span className="meta">Certificate presentation policy</span>
            <select
              value={draft.certPolicy}
              onChange={(e) => patch({ certPolicy: e.target.value as SettingsFixture["certPolicy"] })}
            >
              <option value="platform-style">platform-style</option>
              <option value="course-specific">course-specific</option>
            </select>
          </label>
          <label className="field">
            <span className="meta">Template reference — never edited in place</span>
            <input
              value={draft.certTemplate}
              disabled={draft.certPolicy === "platform-style"}
              onChange={(e) => patch({ certTemplate: e.target.value })}
            />
          </label>
        </div>
        <p className="meta">
          A policy never set resolves to platform-style. A change affects future issuance only — no
          certificate already issued can be rewritten. Registered references:{" "}
          {CERT_TEMPLATES.join(", ")}.
        </p>
      </Card>

      <Card>
        <CardHeader title="Classification" icon="skills" />
        <div className="admin-form-grid">
          <label className="field">
            <span className="meta">Skill</span>
            <input value={draft.skill} onChange={(e) => patch({ skill: e.target.value })} />
          </label>
          <label className="field">
            <span className="meta">Topic</span>
            <input value={draft.topic} onChange={(e) => patch({ topic: e.target.value })} />
          </label>
        </div>
        <p className="meta">
          Every classification change is audited, and evidence already captured keeps the
          classification it had.
        </p>
      </Card>

      <div className="row">
        <button type="button" className="btn btn--primary" onClick={save}>
          Save in place
        </button>
      </div>

      <Card>
        <CardHeader title="Frozen at publish" icon="lock" />
        <p className="meta">Changed only through the full publish, approval and change-record workflow:</p>
        <ul className="meta cs-plainlist">
          {FROZEN.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Classification audit" icon="clock" />
        <p className="meta">{loadedNote(audit.length, audit.length)}</p>
        <div className="cs-lines">
          {audit.map((row) => (
            <div className="cs-preview-row" key={row.id}>
              <span className="cs-preview-row__title">
                <strong>{row.field}: {row.from} → {row.to}</strong>
                <p className="meta">{row.actor} · {row.at}</p>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </AdminPage>
  );
}

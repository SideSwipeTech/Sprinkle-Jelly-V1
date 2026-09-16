/**
 * ChallengeEditor — `/admin/challenges/:id`. The challenge studio: the shared
 * practice editing space plus the challenge-specific facts (interface lives
 * inside the space). `:id = "new"` is the create flow — a fresh draft opens
 * here directly, never back at the list; an unknown id is an honest
 * unavailable, never a blank editor.
 *
 * The space's own sections fold under three page-level group tabs — Content
 * (metadata, statement, editorial), Code & cases (per-language code, cases,
 * comparison & limits) and Review & publish (the gate's checklist). The
 * sections stay mounted, so switching groups never loses typed work; the
 * head — lifecycle, readiness, Save, Publish — stays visible on every group.
 *
 * The unsaved-work guard: the space's dirty Notice plus a confirm Dialog on
 * the leave attempt — a background refresh never overwrites unsaved work.
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { setChallengeLifecycle, addAdminChallenge } from "@state/store";
import { PracticeEditorSpace } from "../../extraction/components/PracticeEditorSpace/PracticeEditorSpace";
import { Button } from "../../extraction/components/Button/Button";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Tabs } from "../../extraction/components/Tabs/Tabs";
import { resolveChallenge } from "./fixtures";
import { readTracks } from "./challenges/fixtures";
import "./challenges/challenges-admin.css";

type EditorGroup = "content" | "code" | "review";

const EDITOR_GROUPS: { key: EditorGroup; title: string; subtitle: string; icon: "edit" | "code" | "check-mark" }[] = [
  { key: "content", title: "Content", subtitle: "metadata · statement · editorial", icon: "edit" },
  { key: "code", title: "Code & cases", subtitle: "starters · reference · cases · judging", icon: "code" },
  { key: "review", title: "Review & publish", subtitle: "the gate's checklist", icon: "check-mark" }
];

export function ChallengeEditor() {
  const { id = "" } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const fixture = resolveChallenge(id, store, readTracks().flatMap((t) => t.entries));
  const [draft, setDraft] = useState(fixture?.draft);
  const [dirty, setDirty] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [group, setGroup] = useState<EditorGroup>("content");

  if (!fixture || !draft) {
    return (
      <AdminPage kicker="Content · Challenge studio" title="Challenge unavailable">
        <StateBlock
          state="unavailable"
          message="This challenge could not be read — nothing was loaded."
          action={
            <Button variant="secondary" onClick={() => navigate("/admin/challenges")}>
              Back to the challenge list
            </Button>
          }
        />
      </AdminPage>
    );
  }

  const isNew = id === "new";
  // A published item still edits — the gate holds on every save of it; only
  // the archived surface locks.
  const readOnly = fixture.lifecycle === "archived";

  const leave = () => (dirty ? setLeaveOpen(true) : navigate("/admin/challenges"));

  return (
    <AdminPage
      kicker="Content · Challenge studio"
      title={isNew ? "New challenge" : draft.title || fixture.id}
      lead="The shared practice editing space, folded into three groups — Content, Code & cases, Review & publish. Save and Publish stay on the head of every group."
      actions={
        <Button variant="quiet" icon="arrow-left" onClick={leave}>
          Challenge list
        </Button>
      }
    >
      <Tabs
        label="Challenge editor sections"
        tabs={EDITOR_GROUPS}
        value={group}
        onChange={(key) => setGroup(key as EditorGroup)}
        /* All three tabs control the one region — its section set changes
           with the group. */
        panelIds={["ch-ed-panel", "ch-ed-panel", "ch-ed-panel"]}
      />
      {/* data-group selects which of the space's sections render — all stay
          mounted, so a group switch never discards typed work. */}
      <div
        id="ch-ed-panel"
        className="ch-edgroup"
        data-group={group}
        role="region"
        aria-label={`${EDITOR_GROUPS.find((g) => g.key === group)?.title ?? ""} sections`}
      >
        <PracticeEditorSpace
          label="Challenge studio"
          lifecycle={fixture.lifecycle}
          revision={fixture.revision}
          readOnly={readOnly}
          dirty={dirty}
          draft={draft}
          onDraftChange={(p) => {
            setDraft((d) => ({ ...d!, ...p }));
            setDirty(true);
          }}
          xpAward={fixture.xp}
          checklist={fixture.checklist}
          onSave={
            readOnly
              ? undefined
              : () => {
                  setDirty(false);
                  // A saved new draft becomes a real catalogue row and the
                  // route gains its id — Back never bounces through `new`.
                  if (isNew) {
                    const nid = `ch-${Date.now().toString(36)}`;
                    addAdminChallenge(nid, draft.title.trim() || "Untitled draft");
                    navigate(`/admin/challenges/${nid}`, { replace: true });
                  }
                }
          }
          onPublish={
            readOnly || fixture.lifecycle === "published"
              ? undefined
              : () => {
                  if (!isNew) setChallengeLifecycle(id, "published");
                  setDirty(false);
                }
          }
        />
      </div>

      <Dialog
        open={leaveOpen}
        title="Leave with unsaved work?"
        icon="alert"
        onClose={() => setLeaveOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setLeaveOpen(false)}>Stay</Button>
            <Button variant="destructive" onClick={() => navigate("/admin/challenges")}>Leave without saving</Button>
          </>
        }
      >
        <p>Unsaved edits to this draft are lost if you leave. Save first, or leave anyway.</p>
      </Dialog>
    </AdminPage>
  );
}

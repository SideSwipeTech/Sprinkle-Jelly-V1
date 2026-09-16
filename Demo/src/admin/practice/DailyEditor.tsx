/**
 * DailyEditor — `/admin/daily/:date`. The daily studio: the shared practice
 * editing space plus this domain's one addition, the scheduling card, and the
 * authored bonus — the two authorable fields this domain adds.
 *
 * `:date = "new"` is the create flow (a draft carries no date); a date with
 * nothing authored renders the empty slot — an affordance to fill it, never
 * an error. A studio with nothing yet authored says so in its own words.
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { useStore } from "@state/useStore";
import { PracticeEditorSpace } from "../../extraction/components/PracticeEditorSpace/PracticeEditorSpace";
import { Field } from "../../extraction/components/Field/Field";
import { SchedulingCard } from "../../extraction/components/SchedulingCard/SchedulingCard";
import type { ScheduleStatus } from "../../extraction/components/SchedulingCard/SchedulingCard";
import { Button } from "../../extraction/components/Button/Button";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Notice } from "../../extraction/components/Notice/Notice";
import { resolveDaily, XP_BY_DIFFICULTY } from "./fixtures";
import { occupantsOf, seedSchedule } from "./daily/fixtures";

export function DailyEditor() {
  const { date = "" } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const fixture = resolveDaily(date, store, occupantsOf(seedSchedule(), date));
  const [draft, setDraft] = useState(fixture?.draft);
  const [scheduleDate, setScheduleDate] = useState(fixture?.date ?? "");
  const [status, setStatus] = useState<ScheduleStatus>(fixture?.status ?? "unscheduled");
  const [bonus, setBonus] = useState(fixture?.bonus ?? "");
  const [dirty, setDirty] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  if (!fixture || !draft) {
    return (
      <AdminPage kicker="Content · Daily studio" title="Daily unavailable">
        <StateBlock
          state="unavailable"
          message={`Nothing could be read for ${date || "this date"}.`}
          action={
            <Button variant="secondary" onClick={() => navigate("/admin/daily")}>
              Back to the daily studio
            </Button>
          }
        />
      </AdminPage>
    );
  }

  const isNew = date === "new";
  const authored = Boolean(draft.title);
  const leave = () => (dirty ? setLeaveOpen(true) : navigate("/admin/daily"));

  return (
    <AdminPage
      kicker="Content · Daily studio"
      title={isNew ? "New daily" : scheduleDate || date}
      lead="The shared practice editing space — plus the scheduling card and the authored bonus."
      actions={
        <Button variant="quiet" icon="arrow-left" onClick={leave}>
          Daily studio
        </Button>
      }
    >
      {!authored ? (
        <Notice tone="neutral" title="Nothing authored yet">
          A studio with nothing yet authored says so — save a draft whenever it is ready; a draft may be
          incomplete and unclassified.
        </Notice>
      ) : null}

      <PracticeEditorSpace
        label="Daily studio"
        lifecycle={status === "scheduled" ? "published" : "draft"}
        dirty={dirty}
        draft={draft}
        onDraftChange={(p) => {
          setDraft((d) => ({ ...d!, ...p }));
          setDirty(true);
        }}
        xpAward={authored ? XP_BY_DIFFICULTY[draft.difficulty] : null}
        checklist={fixture.checklist}
        domainFields={
          <Field label="Bonus" hint="The authored bonus — inside the platform's bonus range.">
            <input
              value={bonus}
              inputMode="numeric"
              onChange={(e) => {
                setBonus(e.target.value);
                setDirty(true);
              }}
            />
          </Field>
        }
        onSave={() => setDirty(false)}
        onPublish={() => setDirty(false)}
        publishLabel={scheduleDate ? "Publish to date" : "Publish"}
      >
        <SchedulingCard
          date={scheduleDate || undefined}
          status={status}
          isGap={fixture.isGap}
          occupyingTitle={fixture.occupyingTitle}
          occupyingDate={fixture.occupyingDate}
          onDateChange={(iso) => {
            setScheduleDate(iso);
            setStatus(iso ? "scheduled" : "unscheduled");
            setDirty(true);
          }}
          onUnschedule={() => {
            setScheduleDate("");
            setStatus("unscheduled");
            setDirty(true);
          }}
        />
      </PracticeEditorSpace>

      <Dialog
        open={leaveOpen}
        title="Leave with unsaved work?"
        icon="alert"
        onClose={() => setLeaveOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setLeaveOpen(false)}>Stay</Button>
            <Button variant="destructive" onClick={() => navigate("/admin/daily")}>Leave without saving</Button>
          </>
        }
      >
        <p>Unsaved edits to this draft are lost if you leave. Save first, or leave anyway.</p>
      </Dialog>
    </AdminPage>
  );
}

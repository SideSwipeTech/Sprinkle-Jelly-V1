/**
 * FailedRewards — the parked-rewards view (economy/01-pages.md §"The
 * failed-rewards view in full"; admin/01-pages.md §"What the hub shows" —
 * the `failed_rewards` attention condition lands here).
 *
 * Every parked award carries four facts: what it was as the reward event
 * recorded it, who for, when, and the last error it parked with. One action
 * exists and one only — retry, one at a time. A retry reuses the original
 * reward identity and cannot double-pay, and the operator is told that
 * plainly. A failed retry stays parked: the row is not cleared, not marked
 * resolved and never written off. Pending is never shown as failed.
 *
 * Fixture state only — no store writes, no network.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Notice } from "../../extraction/components/Notice/Notice";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import {
  CapabilityRefusal,
  LoadedLine,
  StudioLoading
} from "../assessments/shared";
import { PARKED_REWARDS, type ParkedReward } from "./fixtures";

type View = "loaded" | "loading" | "refused" | "empty" | "unreadable";

const VIEW_LABEL: Record<View, string> = {
  loaded: "Loaded",
  loading: "Loading",
  refused: "Refused — named action",
  empty: "No parked rewards",
  unreadable: "List unreadable"
};

const VIEWS = Object.keys(VIEW_LABEL) as View[];

export function FailedRewards() {
  const [view, setView] = useState<View>("loaded");
  const [rows, setRows] = useState<ParkedReward[]>(PARKED_REWARDS);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  function retry(row: ParkedReward) {
    /* One at a time — while a retry is in flight no second row offers one. */
    setBusy(row.id);
    window.setTimeout(() => {
      setBusy(null);
      if (row.retryFails) {
        setFlash({
          tone: "error",
          text: `Retry of ${row.rewardIdentity} failed — the award stays parked. The row was not cleared, not marked resolved and not written off.`
        });
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      setFlash({
        tone: "success",
        text: `Delivered — the retry reused the original reward identity (${row.rewardIdentity}) and cannot double-pay.`
      });
    }, 600);
  }

  const body = (() => {
    if (view === "loading") return <StudioLoading />;
    if (view === "refused") return <CapabilityRefusal action="economy.retry_reward" />;
    if (view === "unreadable") {
      return (
        <StateBlock
          state="unavailable"
          message="The parked-rewards list could not be read — it is never rendered as an empty list."
          action={<Button variant="secondary" onClick={() => setView("loaded")}>Retry</Button>}
        />
      );
    }
    const list = view === "empty" ? [] : rows;
    return (
      <>
        {flash ? <Notice tone={flash.tone} live="polite">{flash.text}</Notice> : null}
        {list.length === 0 ? (
          <StateBlock
            state="empty"
            message="No parked rewards — the good state. Every recorded award has either landed or is still spending its automatic tries."
          />
        ) : (
          <Card>
            <CardHeader
              title="Parked awards"
              icon="reset"
              eyebrow="economy_reward_events · parked failed"
            />
            <p className="meta">
              A parked award has stopped trying: its automatic tries are spent and the last error is
              kept with it. A recorded reward still spending those tries is pending, not parked —
              pending never shows as failed and does not appear here.
            </p>
            <List>
              {list.map((row) => (
                <ListRow key={row.id} as="article">
                  <div>
                    <strong>{row.what}</strong>
                    <p className="meta">
                      {row.who} · {row.when}
                    </p>
                    <p className="meta">
                      Parked with: {row.lastError} · reward identity <code>{row.rewardIdentity}</code>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="reset"
                    loading={busy === row.id}
                    disabled={busy !== null}
                    onClick={() => retry(row)}
                  >
                    Retry
                  </Button>
                </ListRow>
              ))}
            </List>
            <LoadedLine loaded={list.length} total={list.length} />
            <p className="meta">
              The view reaches every parked award on record — ageing a row out of readability
              neither applies nor resolves it. There is no alerting here: whether an operator is
              told about a growing parked backlog is owner-only alerting on the shared operational
              terms, and this view is not a substitute for one.
            </p>
          </Card>
        )}
      </>
    );
  })();

  return (
    <AdminPage
      kicker="Operations / Economy"
      title="Failed rewards"
      lead="The hub's failed_rewards attention condition lands here — every parked award the platform still owes, retried one at a time, and nothing else."
    >
      <details className="a-demotools">
        <summary>Demo tools</summary>
        <div className="a-preview" role="group" aria-label="Preview a page state">
          <span className="a-preview__label">Preview a state</span>
          {VIEWS.map((key) => (
            <Chip key={key} size="sm" selected={view === key} onClick={() => setView(key)}>
              {VIEW_LABEL[key]}
            </Chip>
          ))}
        </div>
      </details>
      {body}
    </AdminPage>
  );
}

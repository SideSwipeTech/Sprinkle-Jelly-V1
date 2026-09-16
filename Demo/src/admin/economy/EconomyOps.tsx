/**
 * EconomyOps — the operational view over the seven aggregate keys
 * (economy/01-pages.md §"Economy operations in full"; the keys are what
 * `economy_aggregate_figures` holds — recomputed whole, in one transaction,
 * at the staff read and again after an erasure step).
 *
 * The view answers two questions: what this is costing, and what is not
 * arriving. Seven figures, bounded — an eighth would be a change to the
 * product. Five of the six flow figures read over the current cycle; the
 * cleared-unused figure reads over the most recently completed cycle; the
 * parked-reward figure is a present stock. All seven carry an as-of stamp:
 * no period selector, no cycle attribution beyond the window each figure
 * reads over. An empty sample yields no figure rather than a zero; a figure
 * that cannot be read says so beside the figures that could.
 *
 * Read-only. No per-learner row, no ranking, no top-user panel, nothing
 * public. Fixture state only — no store writes, no network.
 */

import { Card, CardHeader, StateBlock, Stat } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { StaleNote } from "../../extraction/components/StaleNote/StaleNote";
import { KeyValueRow, KeyValueTable } from "../../extraction/components/KeyValueRow/KeyValueRow";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import { AGGREGATE_FIGURES, type AggregateReading } from "./fixtures";

function FigureCard({ reading }: { reading: AggregateReading }) {
  return (
    <Card>
      <CardHeader title={reading.figure} eyebrow={reading.key} icon="credits" />
      {reading.unreadable ? (
        <StateBlock
          state="unavailable"
          compact
          message="This figure could not be read — the others still serve. Recomputed whole at the next staff read."
        />
      ) : reading.emptySample || reading.count === null ? (
        <StateBlock
          state="empty"
          compact
          message="No figure — the sample behind this key is empty. An empty sample yields no figure rather than a zero."
        />
      ) : (
        <>
          <Stat
            label="count"
            value={reading.count.toLocaleString("en-IN")}
            asOf={reading.asOf}
          />
          {reading.amount !== undefined && reading.amount !== null ? (
            <Stat
              label="amount"
              value={reading.amount.toLocaleString("en-IN")}
              unit={reading.amountUnit}
            />
          ) : null}
          {reading.oldestAge ? (
            <KeyValueTable label="Oldest parked">
              <KeyValueRow
                as="definition"
                term="Oldest age"
                value={`${reading.oldestAge} — the age is what says whether anyone is waiting`}
              />
            </KeyValueTable>
          ) : null}
          {reading.split ? (
            <KeyValueTable label="By the registered action">
              {reading.split.map((row) => (
                <KeyValueRow
                  key={row.action}
                  as="definition"
                  term={row.action}
                  value={`${row.count.toLocaleString("en-IN")} · ${row.amount.toLocaleString("en-IN")} Credits`}
                />
              ))}
            </KeyValueTable>
          ) : null}
        </>
      )}
      <StaleNote asOf={reading.asOf}>{reading.window}</StaleNote>
    </Card>
  );
}

export function EconomyOps() {
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS.slice(0, 3));

  return (
    <AdminPage
      kicker="Operations / Economy"
      title="Economy operations"
      lead="The operational view over the seven aggregate keys — what this is costing, and what is not arriving. Each figure carries its window and its as-of stamp; there is no period selector and no per-learner row."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action="economy.view_aggregates" /> : null}
      {preview !== "loading" && preview !== "refused" ? (
        <>
          <div className="grid-2">
            {AGGREGATE_FIGURES.map((reading) => (
              <FigureCard key={reading.key} reading={reading} />
            ))}
          </div>
          <p className="meta">
            The seven are recomputed whole, in one transaction, at the staff read and again after an
            erasure step — the answer is what <code>economy_aggregate_figures</code> then holds.
            Staff activity moves none of them. This domain declares no metric family of its own, no
            health signal and no alert reading.
          </p>
        </>
      ) : null}
    </AdminPage>
  );
}

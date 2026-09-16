/**
 * Certificates — `certificates`. The studio's index: a bounded search and
 * filter by awarding item, learner, status and date range, paged at
 * PLATFORM_LIST_PAGE_ITEMS on the shared staff work list — which owns none of
 * the statuses it shows and states a total only where it counted one; it
 * counts none here, so none is stated. Newest first, ordered by the
 * certificate's creation instant and then its row identifier, both
 * descending, so the order is stable.
 *
 * States: a result set matching nothing gets its own sentence; a source that
 * could not be read gets a different sentence and a retry; an unauthorized
 * open is refused at the named action, the page absent rather than disabled.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { SearchField } from "../../extraction/components/SearchField/SearchField";
import { Select } from "../../extraction/components/Select/Select";
import { Field } from "../../extraction/components/Field/Field";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import {
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import {
  ACTION,
  PENDING_READING_LABEL,
  PLATFORM_LIST_PAGE_ITEMS,
  STATUS_LABEL,
  allCertificates,
  type CertStatus
} from "./fixtures";
import "./credentials.css";

export function CertificatesIndex() {
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);
  const [query, setQuery] = useState("");
  const [item, setItem] = useState("all");
  const [status, setStatus] = useState<"all" | CertStatus>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);

  const certificates = useMemo(() => allCertificates(), []);
  const items = useMemo(
    () => Array.from(new Set(certificates.map((c) => c.awardingItem))).sort(),
    [certificates]
  );

  const filtered = certificates
    .filter((c) => {
      const needle = query.trim().toLowerCase();
      if (
        needle &&
        !c.learner.toLowerCase().includes(needle) &&
        !c.awardingItem.toLowerCase().includes(needle) &&
        !c.identifier.toLowerCase().includes(needle)
      )
        return false;
      if (item !== "all" && c.awardingItem !== item) return false;
      if (status !== "all" && c.status !== status) return false;
      if (from && c.createdOn < from) return false;
      if (to && c.createdOn > to) return false;
      return true;
    })
    /* Newest first — the creation instant, then the row identifier, both
       descending, so the order is stable. */
    .sort((a, b) => b.createdOn.localeCompare(a.createdOn) || b.seq - a.seq);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PLATFORM_LIST_PAGE_ITEMS));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(
    safePage * PLATFORM_LIST_PAGE_ITEMS,
    safePage * PLATFORM_LIST_PAGE_ITEMS + PLATFORM_LIST_PAGE_ITEMS
  );

  const filtersActive = query.trim() !== "" || item !== "all" || status !== "all" || from !== "" || to !== "";

  function clearAll() {
    setQuery("");
    setItem("all");
    setStatus("all");
    setFrom("");
    setTo("");
    setPage(0);
  }

  return (
    <AdminPage
      kicker="Credentials"
      title="Certificates"
      lead="The staff work list — search, filter, open one certificate. Four acts are kept apart on the certificate itself and on parked generations."
      actions={<Link className="btn btn--secondary" to="/admin/certificates/parked">Parked generations</Link>}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.openStudio} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          message="The certificate source could not be read — this is not an empty list. Retry the read."
          action={<Button variant="secondary" onClick={() => setPreview("loaded")}>Retry</Button>}
        />
      ) : null}
      {preview === "loaded" ? (
        <>
          <div className="cr-filters" role="group" aria-label="Certificate search and filters">
            <SearchField
              value={query}
              onChange={(v) => { setQuery(v); setPage(0); }}
              placeholder="Search learner, awarding item or identifier…"
              label="Search certificates"
            />
            <Select
              aria-label="Filter by awarding item"
              value={item}
              onChange={(v) => { setItem(v); setPage(0); }}
              options={[
                { value: "all", label: "Every awarding item" },
                ...items.map((i) => ({ value: i, label: i }))
              ]}
            />
            <Select
              aria-label="Filter by status"
              value={status}
              onChange={(v) => { setStatus(v as "all" | CertStatus); setPage(0); }}
              options={[
                { value: "all", label: "Every status" },
                { value: "issued", label: "Issued" },
                { value: "pending", label: "Pending" },
                { value: "revoked", label: "Revoked" }
              ]}
            />
            <Field label="Created from">
              <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} />
            </Field>
            <Field label="Created to">
              <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} />
            </Field>
          </div>

          {filtered.length === 0 ? (
            <StateBlock
              state="empty"
              message="No certificate matches this search and filter set."
              action={filtersActive ? <Button variant="secondary" onClick={clearAll}>Clear the filters</Button> : undefined}
            />
          ) : (
            <>
              <List>
                {pageRows.map((c) => (
                  <ListRow key={c.id} to={`/admin/certificates/${c.id}`}>
                    <div>
                      <strong>{c.awardingItem}</strong>
                      <p className="meta">
                        {c.learner} · {c.awardingKind} · created {c.createdLabel}
                        {c.issuedAt ? ` · issued ${c.issuedAt}` : ""}
                      </p>
                      {c.status === "pending" && c.pendingReading ? (
                        <span className="cr-reading" data-reading={c.pendingReading}>
                          {PENDING_READING_LABEL[c.pendingReading]}
                        </span>
                      ) : null}
                    </div>
                    <span className="row" style={{ gap: "var(--space-2)", alignItems: "center" }}>
                      <code className="cr-id">{c.identifier}</code>
                      <Chip variant="quiet" size="sm">{STATUS_LABEL[c.status]}</Chip>
                    </span>
                  </ListRow>
                ))}
              </List>
              <div className="cr-pager">
                <Button variant="quiet" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                  Newer
                </Button>
                <span>
                  Page {safePage + 1} of {pageCount} · {pageRows.length} on this page — no total is
                  counted here
                </span>
                <Button
                  variant="quiet"
                  size="sm"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage(safePage + 1)}
                >
                  Older
                </Button>
              </div>
            </>
          )}
        </>
      ) : null}
    </AdminPage>
  );
}

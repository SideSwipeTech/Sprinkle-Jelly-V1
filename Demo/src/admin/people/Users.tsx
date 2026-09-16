/**
 * Users — `users`. The person directory: search over names and email,
 * independent filters on role, standing and membership, a live count of
 * matches counted under the same filters, the three saved lenses, and the
 * entry point to role assignment (which lives on the person's own detail).
 * No mutation starts from this list, and a ban is never a quick action on a
 * row.
 *
 * admin/05-work-and-people §Finding a person:
 *   - defaults to most-recently-active
 *   - lenses: all users · suspended or banned · accounts with a genuine
 *     main-site boundary fault (a projection owing a verify the main site has
 *     not answered)
 *   - no behavioral "needs attention" lens exists
 *   - "no users at all" and "nothing matched" are distinct states
 *   - the role filter enumerates whatever the permission rules currently hold;
 *     unreadable rules leave the filter unavailable and the list unfiltered
 *     by role rather than guessing a set
 */

import { useMemo, useState } from "react";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { SearchField } from "../../extraction/components/SearchField/SearchField";
import { Select } from "../../extraction/components/Select/Select";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Button } from "../../extraction/components/Button/Button";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import {
  CapabilityRefusal,
  LoadedLine,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import {
  ACTION,
  CONFIGURED_ROLES,
  PLATFORM_LIST_PAGE_ITEMS,
  allPeople,
  roleLabel,
  standingText,
  type PersonFixture,
  type StandingKind
} from "./fixtures";
import "./people.css";

type Lens = "all" | "moderated" | "boundary";

const LENSES: { id: Lens; label: string; hint: string }[] = [
  { id: "all", label: "All users", hint: "the whole directory" },
  { id: "moderated", label: "Suspended or banned", hint: "either restrictive standing" },
  { id: "boundary", label: "Boundary faults", hint: "a projection owing a verify the main site has not answered" }
];

const STANDING_OPTIONS = [
  { value: "all", label: "Any standing" },
  { value: "good", label: "In good standing" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" }
];

const MEMBERSHIP_OPTIONS = [
  { value: "all", label: "Any membership" },
  { value: "current", label: "Current" },
  { value: "lapsed", label: "Lapsed" },
  { value: "none", label: "None" }
];

function matches(p: PersonFixture, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return p.name.toLowerCase().includes(needle) || p.email.toLowerCase().includes(needle);
}

export function Users() {
  const { preview, setPreview, allowed } = usePreview(["loaded", "loading", "refused", "unverifiable"]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [standing, setStanding] = useState<"all" | StandingKind>("all");
  const [membership, setMembership] = useState("all");
  const [lens, setLens] = useState<Lens>("all");
  const [page, setPage] = useState(0);

  /* Unreadable rules leave the role filter unavailable and the list
     unfiltered by role — the set is never guessed. */
  const rulesReadable = preview !== "unverifiable";
  const people = useMemo(() => allPeople(), []);
  const sorted = useMemo(
    () => [...people].sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt)),
    [people]
  );

  const filtered = sorted.filter((p) => {
    if (lens === "moderated" && p.standing.kind === "good") return false;
    if (lens === "boundary" && !p.boundaryFault) return false;
    if (!matches(p, query)) return false;
    if (rulesReadable && role !== "all") {
      if (role === "learner") {
        if (p.roles.length > 0) return false;
      } else if (!p.roles.includes(role)) return false;
    }
    if (standing !== "all" && p.standing.kind !== standing) return false;
    if (membership !== "all" && p.membership !== membership) return false;
    return true;
  });

  /* The list is paged at PLATFORM_LIST_PAGE_ITEMS; the match count above it
     is counted live under the same filters, so it may be stated. */
  const pageCount = Math.max(1, Math.ceil(filtered.length / PLATFORM_LIST_PAGE_ITEMS));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(
    safePage * PLATFORM_LIST_PAGE_ITEMS,
    safePage * PLATFORM_LIST_PAGE_ITEMS + PLATFORM_LIST_PAGE_ITEMS
  );

  const filtersActive =
    query.trim() !== "" ||
    (rulesReadable && role !== "all") ||
    standing !== "all" ||
    membership !== "all" ||
    lens !== "all";

  function clearAll() {
    setQuery("");
    setRole("all");
    setStanding("all");
    setMembership("all");
    setLens("all");
  }

  const roleOptions = [
    { value: "all", label: "Any role" },
    { value: "learner", label: "No role — learner" },
    ...CONFIGURED_ROLES.map((r) => ({ value: r.id, label: r.label }))
  ];

  return (
    <AdminPage
      kicker="People"
      title="Users"
      lead="Find the person, read their picture, act from their own detail page. No mutation starts from this list — role assignment and every write live on the person."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.readDirectory} /> : null}
      {preview === "unverifiable" ? (
        <StateBlock
          state="unavailable"
          compact
          message="The permission rules could not be read — the role filter is unavailable and the list is unfiltered by role rather than guessing a set."
        />
      ) : null}
      {preview === "loaded" || preview === "unverifiable" ? (
        <>
          <div className="pp-filters" role="group" aria-label="Person filters">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search names and email…"
              label="Search names and email"
            />
            <Select
              aria-label="Filter by role"
              value={role}
              onChange={setRole}
              options={roleOptions}
              disabled={!rulesReadable}
            />
            <Select
              aria-label="Filter by standing"
              value={standing}
              onChange={(v) => setStanding(v as "all" | StandingKind)}
              options={STANDING_OPTIONS}
            />
            <Select
              aria-label="Filter by membership"
              value={membership}
              onChange={setMembership}
              options={MEMBERSHIP_OPTIONS}
            />
          </div>

          <div className="row" role="group" aria-label="Saved lenses">
            <span className="meta">Saved lenses</span>
            {LENSES.map((l) => (
              <Chip
                key={l.id}
                size="sm"
                selected={lens === l.id}
                onClick={() => setLens(l.id)}
                label={`${l.label} — ${l.hint}`}
              >
                {l.label}
              </Chip>
            ))}
          </div>

          <p className="pp-count" role="status">
            <strong>{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "person matches" : "people match"}
            {lens !== "all" ? (
              <span className="pp-count__lens">
                {" "}· lens: {LENSES.find((l) => l.id === lens)?.label}
              </span>
            ) : null}
          </p>

          {people.length === 0 ? (
            <StateBlock state="empty" message="No users at all — the directory itself is empty." />
          ) : filtered.length === 0 ? (
            <StateBlock
              state="empty"
              message="Nothing matched this search and filter set."
              action={filtersActive ? <Button variant="secondary" onClick={clearAll}>Clear the filters</Button> : undefined}
            />
          ) : (
            <>
              <List>
                {pageRows.map((p) => (
                  <ListRow key={p.id} to={`/admin/users/${p.id}`}>
                    <div>
                      <strong>{p.name}</strong>
                      <p className="meta">
                        {p.email} · {standingText(p.standing)}
                        {p.standing.reason ? ` — ${p.standing.reason}` : ""}
                        {" · membership "}
                        {p.membershipMirror.state === "unreadable" ? "unreadable" : p.membership}
                        {p.roles.length > 0 ? ` · ${p.roles.map(roleLabel).join(", ")}` : " · no role"}
                        {p.boundaryFault ? " · boundary fault" : ""}
                      </p>
                    </div>
                    <span className="meta">active {p.lastActiveLabel.toLowerCase()}</span>
                  </ListRow>
                ))}
              </List>
              <div className="pp-pager">
                <Button variant="quiet" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                  Newer
                </Button>
                <span className="meta">
                  Page {safePage + 1} of {pageCount} · {pageRows.length} on this page
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
              <LoadedLine loaded={filtered.length} total={filtered.length} />
              <p className="meta">
                Ordered most-recently-active. Banning is reachable only from the person's own detail,
                never as a quick action on a row.
              </p>
            </>
          )}
        </>
      ) : null}
    </AdminPage>
  );
}
